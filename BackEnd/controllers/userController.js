const db = require('../config/db');

// Ensure preferred_language, cash_points, bank details, and withdrawal_requests table exist
let isLangColumnChecked = false;
const ensureLanguageColumn = async () => {
  if (isLangColumnChecked) return;
  try {
    await db.execute(`ALTER TABLE users_details ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en'`);
  } catch (e) {}
  try {
    await db.execute(`ALTER TABLE users_details ADD COLUMN cash_points DECIMAL(12,2) DEFAULT 0.00`);
  } catch (e) {}
  try {
    await db.execute(`ALTER TABLE users_details ADD COLUMN bank_name VARCHAR(100) DEFAULT NULL`);
  } catch (e) {}
  try {
    await db.execute(`ALTER TABLE users_details ADD COLUMN bank_branch VARCHAR(100) DEFAULT NULL`);
  } catch (e) {}
  try {
    await db.execute(`ALTER TABLE users_details ADD COLUMN bank_account_no VARCHAR(100) DEFAULT NULL`);
  } catch (e) {}
  try {
    await db.execute(`ALTER TABLE users_details ADD COLUMN bank_account_name VARCHAR(150) DEFAULT NULL`);
  } catch (e) {}
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seller_id INT NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        bank_branch VARCHAR(100),
        bank_account_no VARCHAR(100) NOT NULL,
        bank_account_name VARCHAR(150) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {}
  isLangColumnChecked = true;
};

// GET SINGLE USER PROFILE BY ID (Public view)
exports.getUser = async (req, res) => {
  await ensureLanguageColumn();
  const userId = req.params.id;
  try {
    const [rows] = await db.execute('SELECT * FROM users_details WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password_hash, nic_photo_front_url, nic_photo_back_url, ...publicUser } = rows[0];
    publicUser.cash_points = parseFloat(rows[0].cash_points || 0);

    // Compute live review stats directly from reviews table
    try {
      const [reviewStats] = await db.execute(
        `SELECT 
          COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating,
          COUNT(*) AS total_reviews
         FROM reviews 
         WHERE seller_id = ?`,
        [userId]
      );
      if (reviewStats.length > 0 && reviewStats[0].total_reviews > 0) {
        publicUser.user_rating = parseFloat(reviewStats[0].avg_rating);
        publicUser.reviews_count = parseInt(reviewStats[0].total_reviews);
      } else {
        publicUser.user_rating = 0;
        publicUser.reviews_count = 0;
      }
    } catch (rErr) {
      publicUser.user_rating = publicUser.user_rating || 0;
      publicUser.reviews_count = publicUser.reviews_count || 0;
    }

    // Compute live Trust Score and Max Rental Limit (with Owner 0-10 Trust Ratings)
    try {
      const createdAt = rows[0].created_at ? new Date(rows[0].created_at) : new Date();
      const now = new Date();
      const accountDays = Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
      const weeksActive = Math.floor(accountDays / 7);

      const [reqRows] = await db.execute(
        `SELECT trust_rating FROM rent_requests 
         WHERE buyer_id = ? AND LOWER(status) = 'completed'`,
        [userId]
      );
      const completedCount = reqRows.length;
      let avgTrustRating = 10;
      let ratingsBonus = 0;
      let rentalBonus = 0;

      if (completedCount > 0) {
        let sumRatings = 0;
        reqRows.forEach((r) => {
          const val = (r.trust_rating !== null && r.trust_rating !== undefined && !isNaN(Number(r.trust_rating)))
            ? Number(r.trust_rating)
            : 10;
          sumRatings += Math.max(0, Math.min(10, val));
        });
        avgTrustRating = Number((sumRatings / completedCount).toFixed(1));
        const ratingMultiplier = avgTrustRating / 10;
        ratingsBonus = Math.min(35, Math.round(completedCount * 8 * ratingMultiplier));
        rentalBonus = Math.round(completedCount * 1500 * ratingMultiplier);
      }

      const baseLimit = 1000;
      const tenureBonus = Math.min(3000, weeksActive * 250);
      const maxRentalLimit = Math.max(500, baseLimit + rentalBonus + tenureBonus);

      const tenureScore = Math.min(15, weeksActive * 2);
      const trustScore = Math.min(100, Math.max(10, 50 + ratingsBonus + tenureScore));

      publicUser.trust_score = trustScore;
      publicUser.max_rental_limit = maxRentalLimit;
      publicUser.rental_limit = maxRentalLimit;
      publicUser.completed_rentals = completedCount;
      publicUser.avg_trust_rating = avgTrustRating;
    } catch (tErr) {
      publicUser.trust_score = 50;
      publicUser.max_rental_limit = 1000;
      publicUser.rental_limit = 1000;
      publicUser.completed_rentals = 0;
      publicUser.avg_trust_rating = 10;
    }

    res.status(200).json({ success: true, user: publicUser });
  } catch (error) {
    console.error('Fetch User Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// UPDATE USER PROFILE WITH IMAGES
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { full_name, phone_no, email, address, nearest_city, map_latitude, map_longitude, map_location_name } = req.body;

  try {
    const profile_pic_url = req.files && req.files['profile_pic'] ? `/uploads/${req.files['profile_pic'][0].filename}` : null;
    const coverphoto = req.files && req.files['cover_pic'] ? `/uploads/${req.files['cover_pic'][0].filename}` : null;

    let query = `
      UPDATE users_details 
      SET full_name = ?, phone_no = ?, email = ?, address = ?, nearest_city = ?
    `;
    let values = [full_name, phone_no, email || null, address || null, nearest_city || null];

    if (map_latitude !== undefined) {
      query += `, map_latitude = ?`;
      values.push(map_latitude !== null && map_latitude !== '' ? parseFloat(map_latitude) : null);
    }
    if (map_longitude !== undefined) {
      query += `, map_longitude = ?`;
      values.push(map_longitude !== null && map_longitude !== '' ? parseFloat(map_longitude) : null);
    }
    if (map_location_name !== undefined) {
      query += `, map_location_name = ?`;
      values.push(map_location_name || null);
    }

    if (req.body.preferred_language) {
      query += `, preferred_language = ?`;
      values.push(req.body.preferred_language);
    }

    if (profile_pic_url) {
      query += `, profile_pic_url = ?`;
      values.push(profile_pic_url);
    }
    if (coverphoto) {
      query += `, coverphoto = ?`;
      values.push(coverphoto);
    }

    query += ` WHERE user_id = ?`;
    values.push(userId);

    await db.execute(query, values);

    const [rows] = await db.execute('SELECT * FROM users_details WHERE user_id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password_hash, ...updatedUser } = rows[0];

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile update.' });
  }
};

// UPDATE SPECIFICALLY MAP LOCATION
exports.updateMapLocation = async (req, res) => {
  const userId = req.params.id;
  const { map_latitude, map_longitude, map_location_name } = req.body;

  try {
    const lat = map_latitude !== null && map_latitude !== undefined && map_latitude !== '' ? parseFloat(map_latitude) : null;
    const lng = map_longitude !== null && map_longitude !== undefined && map_longitude !== '' ? parseFloat(map_longitude) : null;
    const locName = map_location_name || null;

    await db.execute(
      `UPDATE users_details 
       SET map_latitude = ?, map_longitude = ?, map_location_name = ?
       WHERE user_id = ?`,
      [lat, lng, locName, userId]
    );

    const [rows] = await db.execute('SELECT * FROM users_details WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password_hash, ...updatedUser } = rows[0];

    res.status(200).json({
      success: true,
      message: 'Map location updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Map Location Update Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating map location.' });
  }
};

// UPDATE SPECIFICALLY PREFERRED LANGUAGE
exports.updateLanguage = async (req, res) => {
  await ensureLanguageColumn();
  const userId = req.params.id;
  const { language } = req.body;

  if (!language) {
    return res.status(400).json({ success: false, message: 'Language is required.' });
  }

  try {
    await db.execute(
      'UPDATE users_details SET preferred_language = ? WHERE user_id = ?',
      [language, userId]
    );

    const [rows] = await db.execute('SELECT * FROM users_details WHERE user_id = ?', [userId]);
    const updatedUser = rows.length > 0 ? rows[0] : null;

    res.status(200).json({
      success: true,
      message: 'Language updated successfully!',
      language,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update Language Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating language.' });
  }
};

// DELETE USER PROFILE (Cascade delete related user data)
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // 1. Cart එකේ ඇති දත්ත ඉවත් කිරීම
    await db.execute('DELETE FROM cart WHERE user_id = ?', [userId]);

    // 2. Rent requests ඉවත් කිරීම (Buyer හෝ Seller ලෙස)
    await db.execute('DELETE FROM rent_requests WHERE buyer_id = ? OR seller_id = ?', [userId, userId]);

    // 3. Conversations සහ Messages ඉවත් කිරීම
    const [convs] = await db.execute('SELECT id FROM conversations WHERE buyer_id = ? OR seller_id = ?', [userId, userId]);
    for (let conv of convs) {
      await db.execute('DELETE FROM messages WHERE conversation_id = ?', [conv.id]);
    }
    await db.execute('DELETE FROM conversations WHERE buyer_id = ? OR seller_id = ?', [userId, userId]);

    // 4. Posts සහ Items ඉවත් කිරීම
    await db.execute('DELETE FROM posts WHERE user_id = ?', [userId]);
    await db.execute('DELETE FROM items WHERE user_id = ?', [userId]);
    
    // 5. අවසානයේ පරිශීලකයාගේ ගිණුම (User Details) ඉවත් කිරීම
    const [result] = await db.execute('DELETE FROM users_details WHERE user_id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'Profile deleted successfully!' });
  } catch (error) {
    console.error('Delete Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting profile: ' + error.message });
  }
};

// GET USER TRUST SCORE & RENTAL LIMIT
exports.getUserTrustScore = async (req, res) => {
  const userId = req.params.id;
  try {
    const [userRows] = await db.execute(
      'SELECT user_id, created_at, full_name FROM users_details WHERE user_id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRows[0];
    const createdAt = user.created_at ? new Date(user.created_at) : new Date();
    const now = new Date();
    const accountDays = Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
    const weeksActive = Math.floor(accountDays / 7);

    // Completed rentals as buyer & Owner Trust Ratings
    let completedCount = 0;
    let avgTrustRating = 10;
    let ratingsBonus = 0;
    let rentalBonus = 0;

    try {
      const [reqRows] = await db.execute(
        `SELECT trust_rating FROM rent_requests 
         WHERE buyer_id = ? AND LOWER(status) = 'completed'`,
        [userId]
      );
      completedCount = reqRows.length;
      if (completedCount > 0) {
        let sumRatings = 0;
        reqRows.forEach((r) => {
          const val = (r.trust_rating !== null && r.trust_rating !== undefined && !isNaN(Number(r.trust_rating)))
            ? Number(r.trust_rating)
            : 10;
          sumRatings += Math.max(0, Math.min(10, val));
        });
        avgTrustRating = Number((sumRatings / completedCount).toFixed(1));
        const ratingMultiplier = avgTrustRating / 10;
        ratingsBonus = Math.min(35, Math.round(completedCount * 8 * ratingMultiplier));
        rentalBonus = Math.round(completedCount * 1500 * ratingMultiplier);
      }
    } catch (e) {
      console.error('Error fetching completed rent requests for trust score:', e);
    }

    // Formula calculation
    const baseLimit = 1000;
    const tenureBonus = Math.min(3000, weeksActive * 250);
    const maxRentalLimit = Math.max(500, baseLimit + rentalBonus + tenureBonus);

    const tenureScore = Math.min(15, weeksActive * 2);
    const trustScore = Math.min(100, Math.max(10, 50 + ratingsBonus + tenureScore));

    res.status(200).json({
      success: true,
      trustScore,
      maxRentalLimit,
      completedRentals: completedCount,
      avgTrustRating,
      accountDays,
      baseLimit,
      weeksActive,
    });
  } catch (error) {
    console.error('Trust Score Calculation Error:', error);
    res.status(500).json({ success: false, message: 'Server error calculating trust score' });
  }
};

// TOP UP CASH POINTS VIA PAYMENT GATEWAY
exports.topupCashPoints = async (req, res) => {
  await ensureLanguageColumn();
  const userId = req.params.id;
  const { amount, transactionRef } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid top-up amount is required.' });
  }

  try {
    await db.execute(
      'UPDATE users_details SET cash_points = COALESCE(cash_points, 0) + ? WHERE user_id = ?',
      [numAmount, userId]
    );

    const [rows] = await db.execute('SELECT user_id, cash_points FROM users_details WHERE user_id = ?', [userId]);
    const updatedPoints = rows.length > 0 ? parseFloat(rows[0].cash_points || 0) : numAmount;

    res.status(200).json({
      success: true,
      message: `Successfully topped up ${numAmount.toLocaleString()} Cash Points!`,
      cashPoints: updatedPoints,
      transactionRef: transactionRef || `TOPUP-${Date.now()}`
    });
  } catch (error) {
    console.error('Topup Cash Points Error:', error);
    res.status(500).json({ success: false, message: 'Server error while topping up Cash Points.' });
  }
};

// GET SELLER TOTAL EARNINGS (90% NET AFTER 10% PLATFORM FEE), BANK INFO, AND BREAKDOWN
exports.getSellerEarnings = async (req, res) => {
  await ensureLanguageColumn();
  const sellerId = req.params.id;

  try {
    // 1. Fetch user & bank info
    const [userRows] = await db.execute(
      'SELECT user_id, cash_points, bank_name, bank_branch, bank_account_no, bank_account_name FROM users_details WHERE user_id = ?',
      [sellerId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData = userRows[0];
    const cashPoints = parseFloat(userData.cash_points || 0);

    // 2. Fetch all rentals where this user is seller
    const [requests] = await db.execute(`
      SELECT 
        r.id,
        r.item_id AS itemId,
        r.buyer_id AS buyerId,
        r.seller_id AS sellerId,
        r.total_price AS totalPrice,
        r.payment_method AS paymentMethod,
        r.payment_status AS paymentStatus,
        r.status,
        r.customer_picked AS customerPicked,
        r.customer_picked_at AS customerPickedAt,
        r.commission_fee AS commissionFee,
        r.commission_deducted AS commissionDeducted,
        r.created_at AS createdAt,
        i.title AS itemTitle,
        i.image_url AS itemImage,
        u.full_name AS renterName,
        u.phone_no AS renterPhone
      FROM rent_requests r
      LEFT JOIN items i ON r.item_id = i.id
      LEFT JOIN users_details u ON r.buyer_id = u.user_id
      WHERE r.seller_id = ? AND LOWER(r.status) NOT IN ('declined', 'cancelled')
      ORDER BY r.created_at DESC, r.id DESC
    `, [sellerId]);

    // 3. Compute earnings:
    // - Online (Card / Cash Points): Platform collects 100%, keeps 10% fee, credits +90% to shop's balance.
    // - Cash on Pickup: Customer hands 100% cash to shop directly. When pickup is confirmed, 10% platform fee is DEDUCTED from shop's earnings.
    let grossEarnings = 0;
    let platformFeeTotal = 0;
    let totalOnlineNetCredits = 0;
    let totalCashPickupDeductions = 0;
    let totalNetStoreEarnings = 0;

    const earningsHistory = requests.map(reqItem => {
      const gross = parseFloat(reqItem.totalPrice || 0);
      const commission = parseFloat((gross * 0.10).toFixed(2));
      const isCash = (reqItem.paymentMethod || "").toLowerCase().includes("cash");
      const isPickedOrRented = reqItem.customerPicked === 1 || 
                               ["rented", "completed"].includes(String(reqItem.status).toLowerCase()) ||
                               reqItem.commissionDeducted === 1;

      grossEarnings += gross;
      platformFeeTotal += commission;

      let netEarned = 0;
      let balanceImpact = 0;
      let feeDeducted = false;

      if (isCash) {
        // Cash on Pickup: Shop collected 100% in cash directly from customer
        if (isPickedOrRented) {
          // Handover/pickup confirmed -> 10% fee deducted from shop's earnings!
          feeDeducted = true;
          balanceImpact = -commission; // -10% deducted from online balance
          totalCashPickupDeductions += commission;
          totalNetStoreEarnings += (gross - commission); // Shop made 90% net (100% in cash - 10% fee)
        } else {
          // Pickup not confirmed yet
          feeDeducted = false;
          balanceImpact = 0;
        }
        netEarned = gross; // Full cash amount received by shop
      } else {
        // Online Card / Cash Points
        netEarned = parseFloat((gross - commission).toFixed(2)); // +90%
        balanceImpact = netEarned; // +90% added to online balance
        totalOnlineNetCredits += netEarned;
        totalNetStoreEarnings += netEarned;
      }

      return {
        id: reqItem.id,
        itemId: reqItem.itemId,
        itemTitle: reqItem.itemTitle || "Rental Item",
        itemImage: reqItem.itemImage || null,
        renterName: reqItem.renterName || "Customer",
        renterPhone: reqItem.renterPhone || "",
        grossAmount: gross,
        platformCommission: commission, // 10%
        netEarned: isCash ? gross : netEarned,
        balanceImpact,                 // e.g. +4,500 or -500
        isCashOnPickup: isCash,
        isConfirmed: isPickedOrRented,
        feeDeducted,
        paymentMethod: isCash ? "cash" : (reqItem.paymentMethod || "card"),
        paymentStatus: reqItem.paymentStatus || "pending",
        status: reqItem.status || "Pending",
        date: reqItem.createdAt
      };
    });

    grossEarnings = parseFloat(grossEarnings.toFixed(2));
    platformFeeTotal = parseFloat(platformFeeTotal.toFixed(2));
    totalNetStoreEarnings = parseFloat(totalNetStoreEarnings.toFixed(2));
    totalOnlineNetCredits = parseFloat(totalOnlineNetCredits.toFixed(2));
    totalCashPickupDeductions = parseFloat(totalCashPickupDeductions.toFixed(2));

    // 4. Fetch withdrawal requests
    const [withdrawals] = await db.execute(`
      SELECT id, seller_id, amount, bank_name, bank_branch, bank_account_no, bank_account_name, status, notes, created_at
      FROM withdrawal_requests
      WHERE seller_id = ?
      ORDER BY created_at DESC
    `, [sellerId]);

    let totalWithdrawn = 0;
    withdrawals.forEach(w => {
      if (w.status !== 'rejected') {
        totalWithdrawn += parseFloat(w.amount || 0);
      }
    });
    totalWithdrawn = parseFloat(totalWithdrawn.toFixed(2));

    // Available Payout Balance = Online Credits - Cash Pickup 10% Deductions - Total Withdrawn
    const availableBalance = Math.max(0, parseFloat((totalOnlineNetCredits - totalCashPickupDeductions - totalWithdrawn).toFixed(2)));

    res.status(200).json({
      success: true,
      totalNetEarnings: totalNetStoreEarnings,
      totalGross: grossEarnings,
      totalCommission: platformFeeTotal,
      totalOnlineNetCredits,
      totalCashPickupDeductions,
      totalWithdrawn,
      availableBalance,
      cashPoints,
      bankDetails: {
        bankName: userData.bank_name || "",
        branch: userData.bank_branch || "",
        accountNo: userData.bank_account_no || "",
        accountName: userData.bank_account_name || ""
      },
      history: earningsHistory,
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        amount: parseFloat(w.amount),
        bankName: w.bank_name,
        branch: w.bank_branch,
        accountNo: w.bank_account_no,
        accountName: w.bank_account_name,
        status: w.status,
        date: w.created_at
      }))
    });
  } catch (error) {
    console.error('getSellerEarnings Error:', error);
    res.status(500).json({ success: false, message: 'Server error loading earnings.' });
  }
};

// UPDATE STORE OWNER BANK ACCOUNT DETAILS
exports.updateBankDetails = async (req, res) => {
  await ensureLanguageColumn();
  const userId = req.params.id;
  const { bankName, branch, accountNo, accountName } = req.body;

  if (!bankName || !accountNo || !accountName) {
    return res.status(400).json({
      success: false,
      message: 'Bank Name, Account Number, and Account Holder Name are required.'
    });
  }

  try {
    await db.execute(`
      UPDATE users_details 
      SET bank_name = ?, bank_branch = ?, bank_account_no = ?, bank_account_name = ?
      WHERE user_id = ?
    `, [bankName.trim(), (branch || '').trim(), accountNo.trim(), accountName.trim(), userId]);

    res.status(200).json({
      success: true,
      message: 'Bank account details saved successfully to database!',
      bankDetails: {
        bankName: bankName.trim(),
        branch: (branch || '').trim(),
        accountNo: accountNo.trim(),
        accountName: accountName.trim()
      }
    });
  } catch (error) {
    console.error('updateBankDetails Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update bank details.' });
  }
};

// SUBMIT WITHDRAWAL REQUEST FOR AVAILABLE EARNINGS
exports.requestWithdrawal = async (req, res) => {
  await ensureLanguageColumn();
  const userId = req.params.id;
  const { amount, bankName, branch, accountNo, accountName } = req.body;
  const numAmount = parseFloat(amount);

  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Please enter a valid withdrawal amount.' });
  }

  if (!bankName || !accountNo || !accountName) {
    return res.status(400).json({ success: false, message: 'Complete bank account details are required for withdrawal.' });
  }

  try {
    // 1. Recalculate earnings & available balance
    const [requests] = await db.execute(`
      SELECT total_price, payment_method, status, customer_picked, commission_deducted 
      FROM rent_requests 
      WHERE seller_id = ? AND LOWER(status) NOT IN ('declined', 'cancelled')
    `, [userId]);

    let totalOnlineNetCredits = 0;
    let totalCashPickupDeductions = 0;

    requests.forEach(r => {
      const gross = parseFloat(r.total_price || 0);
      const commission = parseFloat((gross * 0.10).toFixed(2));
      const isCash = (r.payment_method || "").toLowerCase().includes("cash");
      const isConfirmed = r.customer_picked === 1 || 
                          ["rented", "completed"].includes(String(r.status).toLowerCase()) ||
                          r.commission_deducted === 1;

      if (isCash) {
        if (isConfirmed) {
          totalCashPickupDeductions += commission;
        }
      } else {
        totalOnlineNetCredits += parseFloat((gross - commission).toFixed(2));
      }
    });

    const [withdrawals] = await db.execute(`
      SELECT amount FROM withdrawal_requests 
      WHERE seller_id = ? AND status != 'rejected'
    `, [userId]);

    let totalWithdrawn = 0;
    withdrawals.forEach(w => {
      totalWithdrawn += parseFloat(w.amount || 0);
    });

    const availableBalance = Math.max(0, parseFloat((totalOnlineNetCredits - totalCashPickupDeductions - totalWithdrawn).toFixed(2)));

    if (numAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Requested amount LKR ${numAmount.toLocaleString()} exceeds your available balance of LKR ${availableBalance.toLocaleString()}.`
      });
    }

    // 2. Save bank details to user profile
    await db.execute(`
      UPDATE users_details 
      SET bank_name = ?, bank_branch = ?, bank_account_no = ?, bank_account_name = ?
      WHERE user_id = ?
    `, [bankName.trim(), (branch || '').trim(), accountNo.trim(), accountName.trim(), userId]);

    // 3. Insert withdrawal request
    const [result] = await db.execute(`
      INSERT INTO withdrawal_requests 
      (seller_id, amount, bank_name, bank_branch, bank_account_no, bank_account_name, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [userId, numAmount, bankName.trim(), (branch || '').trim(), accountNo.trim(), accountName.trim()]);

    const newAvailableBalance = Math.max(0, parseFloat((availableBalance - numAmount).toFixed(2)));

    res.status(201).json({
      success: true,
      message: `Withdrawal request for LKR ${numAmount.toLocaleString()} submitted successfully!`,
      withdrawalId: result.insertId,
      amount: numAmount,
      availableBalance: newAvailableBalance
    });
  } catch (error) {
    console.error('requestWithdrawal Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing withdrawal request.' });
  }
};
