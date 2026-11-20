const db = require('../config/db');

// Ensure preferred_language column exists in users_details
let isLangColumnChecked = false;
const ensureLanguageColumn = async () => {
  if (isLangColumnChecked) return;
  try {
    await db.execute(`ALTER TABLE users_details ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en'`);
  } catch (e) {
    // Column already exists or error ignored
  }
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
