const db = require("../config/db");

let isTableInitialized = false;
// Ensure tables exist
const initRentRequestsTable = async () => {
  if (isTableInitialized) return;
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS rent_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        buyer_id INT NOT NULL,
        seller_id INT NOT NULL,
        start_date VARCHAR(50) NULL,
        end_date VARCHAR(50) NULL,
        quantity INT DEFAULT 1,
        total_days INT DEFAULT 1,
        total_price DECIMAL(10,2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'Pending',
        customer_picked TINYINT(1) DEFAULT 0,
        customer_picked_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.execute(query);

    try {
      await db.execute(`ALTER TABLE rent_requests MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'`);
    } catch (e) {}
    try {
      await db.execute(`ALTER TABLE rent_requests ADD COLUMN customer_picked TINYINT(1) DEFAULT 0`);
    } catch (e) {}
    try {
      await db.execute(`ALTER TABLE rent_requests ADD COLUMN customer_picked_at TIMESTAMP NULL`);
    } catch (e) {}
    try {
      await db.execute(`ALTER TABLE rent_requests ADD COLUMN trust_rating INT DEFAULT 10`);
    } catch (e) {}
    try {
      await db.execute(`ALTER TABLE rent_requests ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash'`);
    } catch (e) {}
    try {
      await db.execute(`ALTER TABLE rent_requests ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'`);
    } catch (e) {}

    isTableInitialized = true;
  } catch (err) {
    console.warn("rent_requests table init warning:", err.message);
  }
};

const initRentalVerificationsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS rental_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        item_id INT NOT NULL,
        buyer_id INT NOT NULL,
        seller_id INT NOT NULL,
        id_card_checked TINYINT(1) DEFAULT 0,
        customer_details_verified TINYINT(1) DEFAULT 0,
        rental_payment_status VARCHAR(50) DEFAULT 'Paid',
        security_deposit VARCHAR(50) DEFAULT 'Not Required',
        item_condition VARCHAR(50) DEFAULT 'Good',
        accessories_included TINYINT(1) DEFAULT 0,
        additional_notes TEXT NULL,
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_request_handover (request_id)
      )
    `;
    await db.execute(query);
  } catch (err) {
    console.warn("rental_verifications table init warning:", err.message);
  }
};

const initPaymentsTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        item_id INT NOT NULL,
        buyer_id INT NOT NULL,
        seller_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        transaction_ref VARCHAR(100) NULL,
        payment_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_request_id (request_id),
        INDEX idx_buyer_id (buyer_id),
        INDEX idx_seller_id (seller_id)
      )
    `;
    await db.execute(query);
  } catch (err) {
    console.warn("payments table init warning:", err.message);
  }
};

initRentRequestsTable();
initRentalVerificationsTable();
initPaymentsTable();

// Real notifications helper
const sendNotification = async ({
  userId,
  title,
  message,
  type = "rental_request",
  itemId = null,
  requestId = null,
  imageUrl = null,
  linkUrl = null,
}) => {
  if (!userId || !title || !message) return;
  try {
    const query = `
      INSERT INTO notifications (user_id, title, message, type, item_id, request_id, image_url, link_url, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
    `;
    await db.execute(query, [
      userId,
      title,
      message,
      type,
      itemId,
      requestId,
      imageUrl,
      linkUrl,
    ]);
  } catch (err) {
    console.warn("Could not send notification:", err.message);
  }
};

// =========================================================================
// HELPER FUNCTIONS: QUANTITY DEDUCT & RESTORE
// =========================================================================

// 1. Item එකක් rent වූ විට quantity අඩු කර, 0 වුවහොත් 'Rented Out' කිරීම
async function deductItemQuantity(itemId, rentQty = 1) {
  try {
    const [rows] = await db.execute(
      "SELECT id, available_quantity, available_qty FROM items WHERE id = ?",
      [itemId]
    );
    if (!rows || rows.length === 0) return;

    const currentStock = Number(rows[0].available_quantity ?? 1);
    const deductCount = Number(rentQty || 1);
    const newStock = Math.max(0, currentStock - deductCount);
    const newAvailability = newStock > 0 ? "Available" : "Rented Out";

    await db.execute(
      "UPDATE items SET available_quantity = ?, available_qty = ? WHERE id = ?",
      [newStock, newAvailability, itemId]
    );
  } catch (err) {
    console.error("Error deducting item quantity:", err);
  }
}

// 2. Item එකක් ආපසු භාරගත් විට quantity වැඩි කර 'Available' කිරීම
async function restoreItemQuantity(itemId, returnQty = 1) {
  try {
    const [rows] = await db.execute(
      "SELECT id, available_quantity, available_qty FROM items WHERE id = ?",
      [itemId]
    );
    if (!rows || rows.length === 0) return;

    const currentStock = Number(rows[0].available_quantity ?? 0);
    const addCount = Number(returnQty || 1);
    const newStock = currentStock + addCount;
    const newAvailability = "Available";

    await db.execute(
      "UPDATE items SET available_quantity = ?, available_qty = ? WHERE id = ?",
      [newStock, newAvailability, itemId]
    );
  } catch (err) {
    console.error("Error restoring item quantity:", err);
  }
}

// =========================================================================
// API CONTROLLERS
// =========================================================================

// CREATE RENT REQUEST
exports.createRentRequest = async (req, res) => {
  const {
    itemId,
    buyerId,
    sellerId,
    startDate,
    endDate,
    quantity,
    totalPrice,
    status = "Pending",
    paymentMethod,
    paymentStatus,
  } = req.body;

  const item_id = itemId || req.body.item_id;
  const buyer_id = buyerId || req.body.buyer_id;
  const seller_id = sellerId || req.body.seller_id;
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const start_date =
    startDate || req.body.start_date || now.toISOString().split("T")[0];
  const end_date =
    endDate || req.body.end_date || tomorrow.toISOString().split("T")[0];
  const qty = Number(quantity || req.body.quantity) || 1;
  const total = Number(totalPrice || req.body.total_price) || 0;

  const rawPaymentMethod = (
    paymentMethod ||
    req.body.payment_method ||
    req.body.payment_type ||
    "cash"
  ).toString().toLowerCase();
  const payment_method = rawPaymentMethod === "card" ? "card" : "cash";

  const payment_status =
    paymentStatus ||
    req.body.payment_status ||
    (payment_method === "card" && req.body.isPaid ? "paid" : "pending");

  let total_days = 1;
  try {
    const s = new Date(start_date);
    const e = new Date(end_date);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    total_days = diff > 0 ? diff : 1;
  } catch {}

  if (!item_id || !buyer_id || !seller_id) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: itemId, buyerId, and sellerId are required.",
    });
  }

  try {
    // Check if the item is already rented out (stock <= 0 or status is Rented Out)
    try {
      const [items] = await db.execute(
        "SELECT id, available_qty, available_quantity FROM items WHERE id = ?",
        [item_id]
      );
      if (items.length > 0) {
        const it = items[0];
        const stock = Number(it.available_quantity ?? 1);
        const isRented =
          stock <= 0 ||
          it.available_qty === "Rented Out" ||
          String(it.available_qty).toLowerCase() === "rented out" ||
          it.available_qty === 0 ||
          it.available_qty === "0";

        if (isRented) {
          return res.status(400).json({
            success: false,
            message: "This item is currently rented out and cannot be rented.",
          });
        }
      }
    } catch (checkErr) {
      console.warn("Item availability check error:", checkErr.message);
    }

    await initRentRequestsTable();
    let insertId = null;

    try {
      const query = `
        INSERT INTO rent_requests (item_id, buyer_id, seller_id, start_date, end_date, quantity, total_days, total_price, payment_method, payment_status, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      const [result] = await db.execute(query, [
        item_id,
        buyer_id,
        seller_id,
        start_date,
        end_date,
        qty,
        total_days,
        total,
        payment_method,
        payment_status,
        status,
      ]);
      insertId = result.insertId;
    } catch (insertErr) {
      try {
        const queryWithPayment = `
          INSERT INTO rent_requests (item_id, buyer_id, seller_id, start_date, end_date, quantity, total_price, payment_method, payment_status, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const [result] = await db.execute(queryWithPayment, [
          item_id,
          buyer_id,
          seller_id,
          start_date,
          end_date,
          qty,
          total,
          payment_method,
          payment_status,
          status,
        ]);
        insertId = result.insertId;
      } catch (err2) {
        const fallbackQuery = `
          INSERT INTO rent_requests (item_id, buyer_id, seller_id, start_date, end_date, quantity, total_price, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const [result] = await db.execute(fallbackQuery, [
          item_id,
          buyer_id,
          seller_id,
          start_date,
          end_date,
          qty,
          total,
          status,
        ]);
        insertId = result.insertId;
      }
    }

    // Record initial payment entry in payments table
    try {
      await initPaymentsTable();
      await db.execute(
        `INSERT INTO payments (request_id, item_id, buyer_id, seller_id, amount, payment_method, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [insertId, item_id, buyer_id, seller_id, total, payment_method, payment_status]
      );
    } catch (payInitErr) {
      console.warn("Could not record payment entry:", payInitErr.message);
    }

    // Send real notification to seller with payment method
    try {
      let itemTitle = "an item";
      let itemImage = null;
      try {
        const [itRows] = await db.execute(
          "SELECT title, image_url FROM items WHERE id = ?",
          [item_id]
        );
        if (itRows && itRows.length > 0) {
          itemTitle = itRows[0].title || "an item";
          itemImage = itRows[0].image_url || null;
        }
      } catch {}

      const paymentMethodBadge = payment_method === "card" ? "💳 Card Payment" : "💵 Cash on Pickup";
      await sendNotification({
        userId: seller_id,
        title: "New Rental Request",
        message: `You have received a new rental request for "${itemTitle}". Payment Method: ${paymentMethodBadge} (Total: LKR ${total.toLocaleString()}).`,
        type: "rental_request",
        itemId: item_id,
        requestId: insertId,
        imageUrl: itemImage,
        linkUrl: "/my-items?tab=rent-requests&filter=received",
      });
    } catch (notifErr) {
      console.warn("Could not dispatch notification for new rent request:", notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Rental request created successfully.",
      requestId: insertId,
      request: {
        id: insertId,
        itemId: item_id,
        buyerId: buyer_id,
        sellerId: seller_id,
        startDate: start_date,
        endDate: end_date,
        quantity: qty,
        totalPrice: total,
        paymentMethod: payment_method,
        paymentStatus: payment_status,
        status,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Create Rent Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create rent request in database: " + error.message,
    });
  }
};

const sanitizeRequestRow = (r) => {
  if (!r) return r;
  let sDate = r.startDate || r.start_date;
  let eDate = r.endDate || r.end_date;
  if (sDate) {
    if (sDate instanceof Date) {
      sDate = sDate.toISOString().split("T")[0];
    } else if (typeof sDate === "string" && sDate.includes("T")) {
      sDate = sDate.split("T")[0];
    }
  }
  if (eDate) {
    if (eDate instanceof Date) {
      eDate = eDate.toISOString().split("T")[0];
    } else if (typeof eDate === "string" && eDate.includes("T")) {
      eDate = eDate.split("T")[0];
    }
  }
  return {
    ...r,
    startDate: sDate,
    endDate: eDate,
    paymentMethod: r.paymentMethod || r.payment_method || "cash",
    paymentStatus: r.paymentStatus || r.payment_status || "pending",
  };
};

// GET BUYER'S SENT RENT REQUESTS
exports.getBuyerRequests = async (req, res) => {
  const buyerId = req.params.buyerId;

  try {
    await initRentRequestsTable();
    await initRentalVerificationsTable();
    try {
      const query = `
        SELECT 
          r.id,
          r.item_id AS itemId,
          r.buyer_id AS buyerId,
          r.seller_id AS sellerId,
          r.start_date AS startDate,
          r.end_date AS endDate,
          r.quantity,
          r.total_price AS totalPrice,
          r.payment_method AS paymentMethod,
          r.payment_status AS paymentStatus,
          r.status,
          r.customer_picked AS customerPicked,
          r.customer_picked_at AS customerPickedAt,
          r.created_at AS createdAt,
          v.id_card_checked AS idCardChecked,
          v.customer_details_verified AS customerDetailsVerified,
          v.rental_payment_status AS rentalPaymentStatus,
          v.security_deposit AS securityDeposit,
          v.item_condition AS itemCondition,
          v.accessories_included AS accessoriesIncluded,
          v.additional_notes AS additionalNotes,
          v.verified_at AS verifiedAt,
          i.title AS itemTitle,
          i.image_url AS itemImage,
          i.price AS itemPrice,
          i.price_type AS priceType,
          u.full_name AS sellerName,
          u.phone_no AS sellerPhone,
          u.profile_pic_url AS sellerPic,
          u.nearest_city AS sellerCity,
          rev.id AS reviewId,
          rev.rating AS reviewRating,
          rev.comment AS reviewComment
        FROM rent_requests r
        LEFT JOIN rental_verifications v ON r.id = v.request_id
        LEFT JOIN items i ON r.item_id = i.id
        LEFT JOIN users_details u ON r.seller_id = u.user_id
        LEFT JOIN reviews rev ON r.id = rev.request_id
        WHERE r.buyer_id = ? AND LOWER(r.status) NOT IN ('declined', 'cancelled')
        ORDER BY r.id DESC, r.created_at DESC
      `;
      const [rows] = await db.execute(query, [buyerId]);
      return res.status(200).json(rows.map(sanitizeRequestRow));
    } catch (jErr) {
      const fallbackQuery = `
        SELECT 
          r.id,
          r.item_id AS itemId,
          r.buyer_id AS buyerId,
          r.seller_id AS sellerId,
          r.start_date AS startDate,
          r.end_date AS endDate,
          r.quantity,
          r.total_price AS totalPrice,
          r.payment_method AS paymentMethod,
          r.payment_status AS paymentStatus,
          r.status,
          r.customer_picked AS customerPicked,
          r.customer_picked_at AS customerPickedAt,
          r.created_at AS createdAt,
          i.title AS itemTitle,
          i.image_url AS itemImage,
          i.price AS itemPrice,
          i.price_type AS priceType,
          u.full_name AS sellerName,
          u.phone_no AS sellerPhone,
          u.profile_pic_url AS sellerPic,
          u.nearest_city AS sellerCity,
          rev.id AS reviewId,
          rev.rating AS reviewRating,
          rev.comment AS reviewComment
        FROM rent_requests r
        LEFT JOIN items i ON r.item_id = i.id
        LEFT JOIN users_details u ON r.seller_id = u.user_id
        LEFT JOIN reviews rev ON r.id = rev.request_id
        WHERE r.buyer_id = ? AND LOWER(r.status) NOT IN ('declined', 'cancelled')
        ORDER BY r.id DESC, r.created_at DESC
      `;
      const [rows] = await db.execute(fallbackQuery, [buyerId]);
      return res.status(200).json(rows.map(sanitizeRequestRow));
    }
  } catch (error) {
    console.error("Fetch Buyer Rent Requests Error:", error);
    res.status(200).json([]);
  }
};

// GET SELLER'S RECEIVED RENT REQUESTS
exports.getSellerRequests = async (req, res) => {
  const sellerId = req.params.sellerId;

  try {
    await initRentRequestsTable();
    await initRentalVerificationsTable();
    try {
      const query = `
        SELECT 
          r.id,
          r.item_id AS itemId,
          r.buyer_id AS buyerId,
          r.seller_id AS sellerId,
          r.start_date AS startDate,
          r.end_date AS endDate,
          r.quantity,
          r.total_price AS totalPrice,
          r.payment_method AS paymentMethod,
          r.payment_status AS paymentStatus,
          r.status,
          r.customer_picked AS customerPicked,
          r.customer_picked_at AS customerPickedAt,
          r.created_at AS createdAt,
          v.id_card_checked AS idCardChecked,
          v.customer_details_verified AS customerDetailsVerified,
          v.rental_payment_status AS rentalPaymentStatus,
          v.security_deposit AS securityDeposit,
          v.item_condition AS itemCondition,
          v.accessories_included AS accessoriesIncluded,
          v.additional_notes AS additionalNotes,
          v.verified_at AS verifiedAt,
          i.title AS itemTitle,
          i.image_url AS itemImage,
          i.price AS itemPrice,
          i.price_type AS priceType,
          u.full_name AS requesterName,
          u.phone_no AS requesterPhone,
          u.profile_pic_url AS requesterPic,
          u.nearest_city AS requesterCity
        FROM rent_requests r
        LEFT JOIN rental_verifications v ON r.id = v.request_id
        LEFT JOIN items i ON r.item_id = i.id
        LEFT JOIN users_details u ON r.buyer_id = u.user_id
        WHERE r.seller_id = ? AND LOWER(r.status) NOT IN ('declined', 'cancelled')
        ORDER BY r.id DESC, r.created_at DESC
      `;
      const [rows] = await db.execute(query, [sellerId]);
      return res.status(200).json(rows.map(sanitizeRequestRow));
    } catch (jErr) {
      const fallbackQuery = `
        SELECT 
          r.id,
          r.item_id AS itemId,
          r.buyer_id AS buyerId,
          r.seller_id AS sellerId,
          r.start_date AS startDate,
          r.end_date AS endDate,
          r.quantity,
          r.total_price AS totalPrice,
          r.payment_method AS paymentMethod,
          r.payment_status AS paymentStatus,
          r.status,
          r.customer_picked AS customerPicked,
          r.customer_picked_at AS customerPickedAt,
          r.created_at AS createdAt,
          i.title AS itemTitle,
          i.image_url AS itemImage,
          i.price AS itemPrice,
          i.price_type AS priceType,
          u.full_name AS requesterName,
          u.phone_no AS requesterPhone,
          u.profile_pic_url AS requesterPic,
          u.nearest_city AS requesterCity
        FROM rent_requests r
        LEFT JOIN items i ON r.item_id = i.id
        LEFT JOIN users_details u ON r.buyer_id = u.user_id
        WHERE r.seller_id = ? AND LOWER(r.status) NOT IN ('declined', 'cancelled')
        ORDER BY r.id DESC, r.created_at DESC
      `;
      const [rows] = await db.execute(fallbackQuery, [sellerId]);
      return res.status(200).json(rows.map(sanitizeRequestRow));
    }
  } catch (error) {
    console.error("Fetch Seller Rent Requests Error:", error);
    res.status(200).json([]);
  }
};

// UPDATE RENT REQUEST STATUS
exports.updateRequestStatus = async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res
      .status(400)
      .json({ success: false, message: "Status is required." });
  }

  try {
    await initRentRequestsTable();

    // Fetch request details for notifications & item stock update
    let requestDetails = null;
    try {
      const [rRows] = await db.execute(
        `SELECT r.id, r.buyer_id, r.seller_id, r.item_id, r.quantity, i.title AS item_title, i.image_url AS item_image
         FROM rent_requests r
         LEFT JOIN items i ON r.item_id = i.id
         WHERE r.id = ?`,
        [requestId]
      );
      if (rRows && rRows.length > 0) {
        requestDetails = rRows[0];
      }
    } catch {}

    // If declined or cancelled, remove request completely
    if (
      status?.toLowerCase() === "declined" ||
      status?.toLowerCase() === "cancelled"
    ) {
      if (requestDetails && status?.toLowerCase() === "declined") {
        await sendNotification({
          userId: requestDetails.buyer_id,
          title: "Rental Request Declined",
          message: `Your rental request for "${requestDetails.item_title || 'Item'}" was declined.`,
          type: "request_declined",
          itemId: requestDetails.item_id,
          requestId,
          imageUrl: requestDetails.item_image,
          linkUrl: "/my-items?tab=rent-requests&filter=sent",
        });
      }

      await db.execute(`DELETE FROM rent_requests WHERE id = ?`, [requestId]);
      return res.status(200).json({
        success: true,
        message: `Rent request ${status} and removed successfully.`,
        status,
        requestId,
      });
    }

    const query = `UPDATE rent_requests SET status = ? WHERE id = ?`;
    await db.execute(query, [status, requestId]);

    // Send real notification to buyer when approved
    if (requestDetails && status?.toLowerCase() === "approved") {
      await sendNotification({
        userId: requestDetails.buyer_id,
        title: "Rental Request Approved",
        message: `Your rental request for "${requestDetails.item_title || 'Item'}" was approved! You can now proceed to pick it up.`,
        type: "request_approved",
        itemId: requestDetails.item_id,
        requestId,
        imageUrl: requestDetails.item_image,
        linkUrl: "/my-items?tab=rent-requests&filter=sent",
      });
    }

    // Update item stock quantity & availability status
    if (requestDetails?.item_id) {
      const itemId = requestDetails.item_id;
      const reqQty = Number(requestDetails.quantity || 1);

      if (status?.toLowerCase() === "rented") {
        // Deduct quantity from database and set to Rented Out only if 0
        await deductItemQuantity(itemId, reqQty);
      } else if (
        status?.toLowerCase() === "completed" ||
        status?.toLowerCase() === "available" ||
        status?.toLowerCase() === "returned"
      ) {
        // Add quantity back to database and set to Available
        await restoreItemQuantity(itemId, reqQty);

        // Send review prompt notification to buyer
        try {
          await sendNotification({
            userId: requestDetails.buyer_id,
            title: "Rental Completed ⭐",
            message: `Your rental for "${requestDetails.item_title || 'Item'}" has ended! Please rate your experience.`,
            type: "review_request",
            itemId: requestDetails.item_id,
            requestId: requestId,
            imageUrl: requestDetails.item_image,
            linkUrl: "/my-items?tab=rented-items&subtab=rented-in",
          });
        } catch (notifErr) {
          console.warn("Could not dispatch review prompt notification:", notifErr.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Rent request status updated to ${status}.`,
      status,
      requestId,
    });
  } catch (error) {
    console.error("Update Request Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update request status: " + error.message,
    });
  }
};

// MARK AS PICKED BY CUSTOMER
exports.markCustomerPicked = async (req, res) => {
  const requestId = req.params.id;

  try {
    await initRentRequestsTable();

    const [rRows] = await db.execute(
      `SELECT r.*, i.title AS item_title, i.image_url AS item_image, b.full_name AS buyer_name
       FROM rent_requests r
       LEFT JOIN items i ON r.item_id = i.id
       LEFT JOIN users_details b ON r.buyer_id = b.user_id
       WHERE r.id = ?`,
      [requestId]
    );

    if (!rRows || rRows.length === 0) {
      return res.status(404).json({ success: false, message: "Rental request not found." });
    }

    const rental = rRows[0];

    await db.execute(
      `UPDATE rent_requests SET customer_picked = 1, customer_picked_at = NOW() WHERE id = ?`,
      [requestId]
    );

    // Send real notification to seller
    try {
      const buyerName = rental.buyer_name || "Customer";
      const itemTitle = rental.item_title || "your item";
      await sendNotification({
        userId: rental.seller_id,
        title: "Customer Confirmed Pickup 📦",
        message: `${buyerName} confirmed they have picked up "${itemTitle}".`,
        type: "customer_picked",
        itemId: rental.item_id,
        requestId: requestId,
        imageUrl: rental.item_image,
        linkUrl: "/my-items?tab=rent-requests&filter=received",
      });
    } catch (notifErr) {
      console.warn("Could not dispatch customer picked notification:", notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Item marked as picked by customer successfully.",
      requestId: Number(requestId),
      customerPicked: 1,
      customerPickedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Mark Customer Picked Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as picked: " + error.message,
    });
  }
};

// CONFIRM HANDOVER & SAVE VERIFICATION DETAILS
exports.confirmHandover = async (req, res) => {
  const requestId = req.params.id || req.body.requestId;
  const {
    idCardChecked,
    customerDetailsVerified,
    rentalPaymentStatus = "Paid",
    securityDeposit = "Not Required",
    itemCondition = "Good",
    accessoriesIncluded = false,
    additionalNotes = "",
  } = req.body;

  if (!requestId) {
    return res.status(400).json({
      success: false,
      message: "Request ID is required to confirm handover.",
    });
  }

  // Validate required verification checkboxes
  if (!idCardChecked || !customerDetailsVerified) {
    return res.status(400).json({
      success: false,
      message:
        "ID Card and Customer Details verification must be checked before confirming handover.",
    });
  }

  try {
    await initRentRequestsTable();
    await initRentalVerificationsTable();

    // 1. Fetch current request to verify existence and get item & buyer/seller info
    const [reqRows] = await db.execute(
      `SELECT * FROM rent_requests WHERE id = ?`,
      [requestId]
    );

    if (!reqRows || reqRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rental request not found.",
      });
    }

    const currentReq = reqRows[0];
    const itemId = currentReq.item_id;
    const buyerId = currentReq.buyer_id;
    const sellerId = currentReq.seller_id;
    const reqQty = Number(currentReq.quantity || 1);

    // 2. Prevent duplicate handover if already rented
    if (String(currentReq.status).toLowerCase() === "rented") {
      let existingVerif = null;
      try {
        const [vRows] = await db.execute(
          `SELECT * FROM rental_verifications WHERE request_id = ?`,
          [requestId]
        );
        if (vRows.length > 0) existingVerif = vRows[0];
      } catch {}

      return res.status(200).json({
        success: true,
        message: "Handover has already been confirmed.",
        requestId,
        status: "rented",
        verification: existingVerif,
      });
    }

    // 3. Save verification record permanently into rental_verifications
    try {
      const verifQuery = `
        INSERT INTO rental_verifications 
          (request_id, item_id, buyer_id, seller_id, id_card_checked, customer_details_verified, rental_payment_status, security_deposit, item_condition, accessories_included, additional_notes, verified_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          id_card_checked = VALUES(id_card_checked),
          customer_details_verified = VALUES(customer_details_verified),
          rental_payment_status = VALUES(rental_payment_status),
          security_deposit = VALUES(security_deposit),
          item_condition = VALUES(item_condition),
          accessories_included = VALUES(accessories_included),
          additional_notes = VALUES(additional_notes),
          verified_at = NOW()
      `;
      await db.execute(verifQuery, [
        requestId,
        itemId,
        buyerId,
        sellerId,
        idCardChecked ? 1 : 0,
        customerDetailsVerified ? 1 : 0,
        rentalPaymentStatus,
        securityDeposit,
        itemCondition,
        accessoriesIncluded ? 1 : 0,
        additionalNotes || "",
      ]);
    } catch (vErr) {
      console.warn("Could not write to rental_verifications table:", vErr.message);
    }

    // 4. Update rent_requests status to 'rented' and payment_status
    const updatedPaymentStatus =
      rentalPaymentStatus?.toLowerCase() === "paid" ? "paid" : "pending";
    try {
      await db.execute(
        `UPDATE rent_requests SET status = 'rented', payment_status = ? WHERE id = ?`,
        [updatedPaymentStatus, requestId]
      );
    } catch (statusErr) {
      try {
        await db.execute(
          `ALTER TABLE rent_requests MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'`
        );
        await db.execute(
          `UPDATE rent_requests SET status = 'rented' WHERE id = ?`,
          [requestId]
        );
      } catch (e2) {
        console.warn("Status update fallback:", e2.message);
      }
    }

    // 4.1 Update payments table
    try {
      await initPaymentsTable();
      const txRef =
        req.body.cardAuthCode ||
        req.body.transactionRef ||
        (rentalPaymentStatus?.toLowerCase() === "paid"
          ? `TXN-${Date.now().toString().slice(-6)}`
          : null);
      await db.execute(
        `UPDATE payments 
         SET payment_status = ?, transaction_ref = COALESCE(?, transaction_ref), payment_date = NOW() 
         WHERE request_id = ?`,
        [updatedPaymentStatus, txRef, requestId]
      );
    } catch (payUpErr) {
      console.warn("Payments update warning:", payUpErr.message);
    }

    // 5. Deduct item stock quantity and set available_qty to 'Rented Out' ONLY if quantity reaches 0
    if (itemId) {
      await deductItemQuantity(itemId, reqQty);
    }

    // Send real notification to buyer
    try {
      let itemTitle = "Item";
      let itemImage = null;
      try {
        const [itRows] = await db.execute(
          "SELECT title, image_url FROM items WHERE id = ?",
          [itemId]
        );
        if (itRows && itRows.length > 0) {
          itemTitle = itRows[0].title || "Item";
          itemImage = itRows[0].image_url || null;
        }
      } catch {}

      await sendNotification({
        userId: buyerId,
        title: "Item Handed Over 📦",
        message: `Shop has handed over "${itemTitle}" to you. Enjoy your rental! When you return the item to the shop, click "Mark as Returned".`,
        type: "item_picked_up",
        itemId,
        requestId,
        imageUrl: itemImage,
        linkUrl: "/my-items?tab=rented-items&subtab=rented-in",
      });
    } catch (notifErr) {
      console.warn("Notification error in confirmHandover:", notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Rental handover verified and confirmed successfully!",
      requestId,
      status: "rented",
      verification: {
        requestId,
        itemId,
        buyerId,
        sellerId,
        idCardChecked: !!idCardChecked,
        customerDetailsVerified: !!customerDetailsVerified,
        rentalPaymentStatus,
        securityDeposit,
        itemCondition,
        accessoriesIncluded: !!accessoriesIncluded,
        additionalNotes: additionalNotes || "",
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Confirm Handover Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm handover in database: " + error.message,
    });
  }
};

// CUSTOMER MARKS ITEM AS RETURNED
exports.markCustomerReturned = async (req, res) => {
  const requestId = req.params.id;
  try {
    const [rRows] = await db.execute(
      `SELECT r.*, i.title AS item_title, i.image_url AS item_image, b.full_name AS buyer_name
       FROM rent_requests r
       LEFT JOIN items i ON r.item_id = i.id
       LEFT JOIN users_details b ON r.buyer_id = b.user_id
       WHERE r.id = ?`,
      [requestId]
    );

    if (!rRows || rRows.length === 0) {
      return res.status(404).json({ success: false, message: "Rental request not found." });
    }

    const rental = rRows[0];
    await db.execute(
      `UPDATE rent_requests SET status = 'return_pending' WHERE id = ?`,
      [requestId]
    );

    // Send notification to seller (shop owner)
    try {
      const buyerName = rental.buyer_name || "Customer";
      const itemTitle = rental.item_title || "item";
      await sendNotification({
        userId: rental.seller_id,
        title: "Item Returned by Customer 📦",
        message: `${buyerName} marked "${itemTitle}" as returned. Please inspect for defects and accept return.`,
        type: "customer_returned",
        itemId: rental.item_id,
        requestId: requestId,
        imageUrl: rental.item_image,
        linkUrl: "/my-items?tab=rented-items&subtab=sented-out",
      });
    } catch (notifErr) {
      console.warn("Could not dispatch return notification:", notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Item marked as returned. Waiting for shop owner verification.",
      requestId: Number(requestId),
      status: "return_pending",
    });
  } catch (error) {
    console.error("Mark Customer Returned Error:", error);
    res.status(500).json({ success: false, message: "Failed: " + error.message });
  }
};

// SHOP OWNER INSPECTS & ACCEPTS RETURN (Restores Stock Quantity & Records Trust Rating)
exports.acceptReturnedItem = async (req, res) => {
  const requestId = req.params.id;
  const { trust_rating } = req.body || {};

  // Normalize trust_rating (0-10, default 10)
  let numericRating = 10;
  if (trust_rating !== undefined && trust_rating !== null && !isNaN(Number(trust_rating))) {
    numericRating = Math.max(0, Math.min(10, Math.round(Number(trust_rating))));
  }

  try {
    const [rRows] = await db.execute(
      `SELECT r.*, i.title AS item_title, i.image_url AS item_image
       FROM rent_requests r
       LEFT JOIN items i ON r.item_id = i.id
       WHERE r.id = ?`,
      [requestId]
    );

    if (!rRows || rRows.length === 0) {
      return res.status(404).json({ success: false, message: "Rental request not found." });
    }

    const rental = rRows[0];
    const itemId = rental.item_id;
    const returnQty = Number(rental.quantity || 1);

    // 1. Mark request as Completed & Save Trust Rating
    try {
      await db.execute(
        `UPDATE rent_requests SET status = 'Completed', trust_rating = ? WHERE id = ?`,
        [numericRating, requestId]
      );
    } catch (uErr) {
      // If column doesn't exist yet, add it
      await db.execute(`ALTER TABLE rent_requests ADD COLUMN trust_rating INT DEFAULT 10`).catch(() => {});
      await db.execute(
        `UPDATE rent_requests SET status = 'Completed', trust_rating = ? WHERE id = ?`,
        [numericRating, requestId]
      );
    }

    // 2. Restore quantity in items table & set available_qty = 'Available'
    if (itemId) {
      await restoreItemQuantity(itemId, returnQty);
    }

    // 3. Send review prompt notification to buyer with the trust rating feedback
    try {
      await sendNotification({
        userId: rental.buyer_id,
        title: "Rental Completed ⭐",
        message: `Your return for "${rental.item_title || 'Item'}" was accepted! Owner rated return trust: ${numericRating}/10. Please rate your experience.`,
        type: "review_request",
        itemId: rental.item_id,
        requestId: requestId,
        imageUrl: rental.item_image,
        linkUrl: "/my-items?tab=rented-items&subtab=rented-in",
      });
    } catch (notifErr) {
      console.warn("Could not dispatch review prompt:", notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Return accepted, trust rating saved, and quantity restored successfully!",
      requestId: Number(requestId),
      status: "Completed",
      trust_rating: numericRating,
    });
  } catch (error) {
    console.error("Accept Returned Item Error:", error);
    res.status(500).json({ success: false, message: "Failed: " + error.message });
  }
};

// DELETE RENT REQUEST
exports.deleteRentRequest = async (req, res) => {
  const requestId = req.params.id;
  try {
    await initRentRequestsTable();
    await db.execute("DELETE FROM rent_requests WHERE id = ?", [requestId]);
    res.status(200).json({
      success: true,
      message: "Rent request removed successfully.",
    });
  } catch (error) {
    console.error("Delete Rent Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete request: " + error.message,
    });
  }
};


// UPDATE PAYMENT STATUS / METHOD
exports.updatePaymentStatus = async (req, res) => {
  const requestId = req.params.id;
  const { paymentStatus = "paid", paymentMethod } = req.body;
  try {
    await initRentRequestsTable();
    let query = `UPDATE rent_requests SET payment_status = ?`;
    const params = [paymentStatus];
    if (paymentMethod) {
      query += `, payment_method = ?`;
      params.push(paymentMethod);
    }
    query += ` WHERE id = ?`;
    params.push(requestId);
    await db.execute(query, params);
    res.status(200).json({
      success: true,
      message: "Payment updated successfully.",
      requestId,
      paymentStatus,
      paymentMethod,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET LOGGED-IN USER'S RENTAL HISTORY
exports.getRentalHistory = async (req, res) => {
  const userId = req.user.userId;
  const { role } = req.params;

  if (!["buyer", "seller"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid history role.",
    });
  }

  try {
    await initRentRequestsTable();

    const userColumn =
      role === "buyer" ? "r.buyer_id" : "r.seller_id";

    const otherUserColumn =
      role === "buyer" ? "r.seller_id" : "r.buyer_id";

    const otherUserAlias =
      role === "buyer" ? "renter" : "customer";

    const query = `
      SELECT
        r.id AS transactionId,
        r.item_id AS itemId,
        r.buyer_id AS buyerId,
        r.seller_id AS sellerId,
        r.start_date AS startDate,
        r.end_date AS endDate,
        r.quantity,
        r.total_days AS totalDays,
        r.total_price AS totalPrice,
        r.payment_method AS paymentMethod,
        r.payment_status AS paymentStatus,
        r.trust_rating AS trustRating,
        r.status,
        r.created_at AS createdAt,
        r.updated_at AS completedAt,

        i.title AS itemTitle,
        i.image_url AS itemImage,

        u.full_name AS otherUserName,
        u.phone_no AS otherUserPhone,
        u.profile_pic_url AS otherUserPic,
        u.nearest_city AS otherUserCity

      FROM rent_requests r

      LEFT JOIN items i
        ON r.item_id = i.id

      LEFT JOIN users_details u
        ON ${otherUserColumn} = u.user_id

      WHERE ${userColumn} = ?
        AND LOWER(r.status) = 'completed'

      ORDER BY r.updated_at DESC
    `;

    const [rows] = await db.execute(query, [userId]);

    return res.status(200).json({
      success: true,
      role,
      history: rows,
    });

  } catch (error) {
    console.error("Get Rental History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load rental history.",
    });
  }
};

// ---------------------------------------------------------------------------
// PROCESS PAYMENT (QR or Card) – mock implementation
// ---------------------------------------------------------------------------
/**
 * POST /api/rent-requests/:id/pay
 * Expected body: { payment_method: 'qr' | 'card', transaction_ref?: string }
 * Updates the payments table and rent_requests.payment_status to 'paid'.
 */
exports.processPayment = async (req, res) => {
  const requestId = req.params.id;
  const { payment_method, transaction_ref } = req.body;

  if (!requestId) {
    return res.status(400).json({ success: false, message: 'Missing request id' });
  }
  const method = (payment_method || '').toString().toLowerCase();
  if (!['qr', 'card'].includes(method)) {
    return res.status(400).json({ success: false, message: 'Invalid payment_method' });
  }

  try {
    // Ensure a payment record exists (created during request creation)
    const [payRows] = await db.execute(
      `SELECT id FROM payments WHERE request_id = ?`,
      [requestId]
    );
    if (payRows.length === 0) {
      // Insert a placeholder payment record if missing
      await db.execute(
        `INSERT INTO payments (request_id, item_id, buyer_id, seller_id, amount, payment_method, payment_status, transaction_ref, payment_date) VALUES (?, 0, 0, 0, 0, ?, 'paid', ?, NOW())`,
        [requestId, method, transaction_ref || null]
      );
    } else {
      await db.execute(
        `UPDATE payments SET payment_method = ?, payment_status = 'paid', transaction_ref = ?, payment_date = NOW() WHERE request_id = ?`,
        [method, transaction_ref || null, requestId]
      );
    }
    // Update rent_requests status and payment_status
    await db.execute(
      `UPDATE rent_requests SET payment_status = 'paid', status = 'Rented' WHERE id = ?`,
      [requestId]
    );
    // Notify buyer about successful payment
    const [buyerRes] = await db.execute(`SELECT buyer_id FROM rent_requests WHERE id = ?`, [requestId]);
    const buyerId = buyerRes[0]?.buyer_id;
    if (buyerId) {
      await sendNotification({
        userId: buyerId,
        title: 'Payment Received',
        message: `Your ${method.toUpperCase()} payment for request #${requestId} was successful.`,
        type: 'payment',
        requestId,
      });
    }
    return res.status(200).json({ success: true, message: 'Payment recorded' });
  } catch (err) {
    console.error('Process Payment Error:', err);
    return res.status(500).json({ success: false, message: 'Server error processing payment' });
  }
};
