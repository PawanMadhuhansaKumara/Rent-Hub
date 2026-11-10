const db = require("../config/db");

let isTableInitialized = false;
// Ensure table exists
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
        status VARCHAR(30) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.execute(query);
    isTableInitialized = true;
  } catch (err) {
    // If DB is offline or cloud credentials block table creation, log and continue
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

initRentRequestsTable();
initRentalVerificationsTable();

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
    // Check if the item is already rented out
    try {
      // 1. Check item availability in items table
      const [items] = await db.execute(
        "SELECT id, available_qty FROM items WHERE id = ?",
        [item_id]
      );
      if (items.length > 0) {
        const it = items[0];
        const isRented =
          it.available_qty === "Rented Out" ||
          String(it.available_qty).toLowerCase() === "rented out" ||
          String(it.available_qty).toLowerCase() === "rented" ||
          it.available_qty === 0 ||
          it.available_qty === "0" ||
          (it.available_qty !== null &&
            !isNaN(Number(it.available_qty)) &&
            Number(it.available_qty) < 1);

        if (isRented) {
          return res.status(400).json({
            success: false,
            message: "This item is currently rented out and cannot be rented.",
          });
        }
      }

      // 2. Check if there are active rental requests for this item marked as 'rented'
      const [activeRentals] = await db.execute(
        "SELECT id FROM rent_requests WHERE item_id = ? AND LOWER(status) = 'rented'",
        [item_id]
      );
      if (activeRentals.length > 0) {
        return res.status(400).json({
          success: false,
          message: "This item is currently rented out and cannot be rented.",
        });
      }
    } catch (checkErr) {
      console.warn("Item availability check error:", checkErr.message);
    }

    await initRentRequestsTable();
    let insertId = null;

    try {
      const query = `
        INSERT INTO rent_requests (item_id, buyer_id, seller_id, start_date, end_date, quantity, total_days, total_price, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
        status,
      ]);
      insertId = result.insertId;
    } catch (insertErr) {
      // Fallback in case total_days is not in the table
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

    // Send real notification to seller
    try {
      let itemTitle = "an item";
      let itemImage = null;
      try {
        const [itRows] = await db.execute("SELECT title, image_url FROM items WHERE id = ?", [item_id]);
        if (itRows && itRows.length > 0) {
          itemTitle = itRows[0].title || "an item";
          itemImage = itRows[0].image_url || null;
        }
      } catch {}

      await sendNotification({
        userId: seller_id,
        title: "New Rental Request",
        message: `You have received a new rental request for "${itemTitle}".`,
        type: "rental_request",
        itemId: item_id,
        requestId: insertId,
        imageUrl: itemImage,
        linkUrl: "/rents?tab=requests",
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
  };
};

// GET BUYER'S SENT RENT REQUESTS (Rents page -> Rent Requests tab)
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
          r.status,
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
          u.nearest_city AS sellerCity
        FROM rent_requests r
        LEFT JOIN rental_verifications v ON r.id = v.request_id
        LEFT JOIN items i ON r.item_id = i.id
        LEFT JOIN users_details u ON r.seller_id = u.user_id
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
          r.status,
          r.created_at AS createdAt,
          i.title AS itemTitle,
          i.image_url AS itemImage,
          i.price AS itemPrice,
          i.price_type AS priceType,
          u.full_name AS sellerName,
          u.phone_no AS sellerPhone,
          u.profile_pic_url AS sellerPic,
          u.nearest_city AS sellerCity
        FROM rent_requests r
        LEFT JOIN items i ON r.item_id = i.id
        LEFT JOIN users_details u ON r.seller_id = u.user_id
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

// GET SELLER'S RECEIVED RENT REQUESTS (Business Hub -> Rental Requests)
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
          r.status,
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
          r.status,
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

// UPDATE RENT REQUEST STATUS (Approve / Decline / Mark Picked Up as rented)
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

    // Fetch request details for notifications
    let requestDetails = null;
    try {
      const [rRows] = await db.execute(
        `SELECT r.id, r.buyer_id, r.seller_id, r.item_id, i.title AS item_title, i.image_url AS item_image
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
          linkUrl: "/rents?tab=requests",
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
        linkUrl: "/rents?tab=requests",
      });
    }

    // Find the item associated with this request
    const [reqRows] = await db.execute(
      `SELECT item_id FROM rent_requests WHERE id = ?`,
      [requestId]
    );

    if (reqRows && reqRows.length > 0) {
      const itemId = reqRows[0].item_id;

      // If status is marked "rented", update the item in items table to "Rented Out"
      if (status?.toLowerCase() === "rented") {
        try {
          await db.execute(
            `UPDATE items SET available_qty = 'Rented Out' WHERE id = ?`,
            [itemId]
          );
        } catch (err) {
          await db.execute(
            `UPDATE items SET available_qty = 0 WHERE id = ?`,
            [itemId]
          ).catch(() => null);
        }
      } else if (
        status?.toLowerCase() === "completed" ||
        status?.toLowerCase() === "available" ||
        status?.toLowerCase() === "returned"
      ) {
        // If rental completed/returned, mark item available again
        try {
          await db.execute(
            `UPDATE items SET available_qty = 'Available' WHERE id = ?`,
            [itemId]
          );
        } catch (err) {
          await db.execute(
            `UPDATE items SET available_qty = 1 WHERE id = ?`,
            [itemId]
          ).catch(() => null);
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

    // 4. Update rent_requests status to 'rented'
    try {
      await db.execute(
        `UPDATE rent_requests SET status = 'rented' WHERE id = ?`,
        [requestId]
      );
    } catch (statusErr) {
      try {
        await db.execute(
          `ALTER TABLE rent_requests MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending'`
        );
        await db.execute(
          `UPDATE rent_requests SET status = 'rented' WHERE id = ?`,
          [requestId]
        );
      } catch (e2) {
        console.warn("Status update fallback:", e2.message);
      }
    }

    // 5. Update items table available_qty to 'Rented Out' (0)
    if (itemId) {
      try {
        await db.execute(
          `UPDATE items SET available_qty = 'Rented Out' WHERE id = ?`,
          [itemId]
        );
      } catch (itemErr) {
        await db.execute(
          `UPDATE items SET available_qty = 0 WHERE id = ?`,
          [itemId]
        ).catch(() => null);
      }
    }

    // Send real notification to buyer
    try {
      let itemTitle = "Item";
      let itemImage = null;
      try {
        const [itRows] = await db.execute("SELECT title, image_url FROM items WHERE id = ?", [itemId]);
        if (itRows && itRows.length > 0) {
          itemTitle = itRows[0].title || "Item";
          itemImage = itRows[0].image_url || null;
        }
      } catch {}

      await sendNotification({
        userId: buyerId,
        title: "Item Picked Up",
        message: `Handover has been confirmed for "${itemTitle}". Enjoy your rental!`,
        type: "item_picked_up",
        itemId,
        requestId,
        imageUrl: itemImage,
        linkUrl: "/rents?tab=rented",
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
