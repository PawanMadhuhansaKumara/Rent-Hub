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

initRentRequestsTable();

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
  const start_date = startDate || req.body.start_date || null;
  const end_date = endDate || req.body.end_date || null;
  const qty = Number(quantity || req.body.quantity) || 1;
  const total = Number(totalPrice || req.body.total_price) || 0;

  if (!item_id || !buyer_id || !seller_id) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: itemId, buyerId, and sellerId are required.",
    });
  }

  try {
    await initRentRequestsTable();
    const query = `
      INSERT INTO rent_requests (item_id, buyer_id, seller_id, start_date, end_date, quantity, total_price, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.execute(query, [
      item_id,
      buyer_id,
      seller_id,
      start_date,
      end_date,
      qty,
      total,
      status,
    ]);

    res.status(201).json({
      success: true,
      message: "Rental request created successfully.",
      requestId: result.insertId,
      request: {
        id: result.insertId,
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

// GET BUYER'S SENT RENT REQUESTS (Rents page -> Rent Requests tab)
exports.getBuyerRequests = async (req, res) => {
  const buyerId = req.params.buyerId;

  try {
    await initRentRequestsTable();
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
      WHERE r.buyer_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute(query, [buyerId]);
    res.status(200).json(rows);
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
      WHERE r.seller_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute(query, [sellerId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Fetch Seller Rent Requests Error:", error);
    res.status(200).json([]);
  }
};

// UPDATE RENT REQUEST STATUS (Approve / Decline)
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
    const query = `UPDATE rent_requests SET status = ? WHERE id = ?`;
    await db.execute(query, [status, requestId]);

    res.status(200).json({
      success: true,
      message: `Rent request status updated to ${status}.`,
    });
  } catch (error) {
    console.error("Update Request Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update request status: " + error.message,
    });
  }
};
