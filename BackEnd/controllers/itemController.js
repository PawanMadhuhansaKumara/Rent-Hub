const db = require("../config/db");

// GET ALL ITEMS (Home page & Item Details)
exports.getAllItems = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        items.*,
        u.full_name AS user_name,
        u.profile_pic_url AS user_profile_pic,
        u.nearest_city AS nearest_city
      FROM items
      LEFT JOIN users_details u ON items.user_id = u.user_id
      ORDER BY items.created_at DESC
    `);

    const formattedItems = rows.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      condition: item.condition,
      price: item.price,
      priceType: item.price_type,
      description: item.description,
      image: item.image_url,
      available: item.available_qty,
      userId: item.user_id,
      user_id: item.user_id,
      userName: item.user_name || null,
      user_name: item.user_name || null,
      userProfilePic: item.user_profile_pic || null,
      user_profile_pic: item.user_profile_pic || null,
      nearestCity: item.nearest_city || null,
      nearest_city: item.nearest_city || null,
      createdAt: item.created_at,
    }));

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Fetch Items Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch items from database.",
    });
  }
};

// GET USER'S ITEMS BY USER ID
exports.getUserItems = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );

    const formattedItems = rows.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      condition: item.condition,
      price: item.price,
      priceType: item.price_type,
      description: item.description,
      image: item.image_url,
      available: item.available_qty,
    }));

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Fetch User Items Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch items." });
  }
};

// ADD NEW ITEM WITH IMAGE FILE UPLOAD
exports.addItem = async (req, res) => {
  const { title, category, condition, price, priceType, description, userId } =
    req.body;

  if (!title || !price || !category) {
    return res.status(400).json({
      success: false,
      message: "Title, category, and price are required.",
    });
  }

  try {
    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : "/uploads/default-item.png";

    const query = `
      INSERT INTO items (title, category, \`condition\`, price, price_type, description, image_url, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title,
      category,
      condition || "Good",
      price,
      priceType || "day",
      description || "",
      image_url,
      userId || null,
    ];

    const [result] = await db.execute(query, values);

    res.status(201).json({
      success: true,
      message: "Item added successfully!",
      itemId: result.insertId,
    });
  } catch (error) {
    console.error("Add Item Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while saving the item." });
  }
};

// UPDATE ITEM STATUS / AVAILABILITY
exports.updateStatus = async (req, res) => {
  const itemId = req.params.id;
  const { available } = req.body;

  try {
    await db.execute("UPDATE items SET available_qty = ? WHERE id = ?", [
      available,
      itemId,
    ]);
    res
      .status(200)
      .json({ success: true, message: "Status updated successfully!" });
  } catch (error) {
    console.error("Update Status Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update status." });
  }
};

// DELETE ITEM
exports.deleteItem = async (req, res) => {
  const itemId = req.params.id;
  try {
    await db.execute("DELETE FROM items WHERE id = ?", [itemId]);
    res
      .status(200)
      .json({ success: true, message: "Item deleted successfully!" });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete item." });
  }
};
