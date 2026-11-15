const db = require("../config/db");

// GET ALL ITEMS (Home page & Item Details)
exports.getAllItems = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        items.*,
        u.full_name AS user_name,
        u.phone_no AS user_phone,
        u.profile_pic_url AS user_profile_pic,
        u.nearest_city AS nearest_city,
        u.address AS seller_address,
        u.map_latitude AS seller_map_latitude,
        u.map_longitude AS seller_map_longitude,
        u.map_location_name AS seller_map_location_name,
        (SELECT COUNT(*) FROM rent_requests WHERE rent_requests.item_id = items.id AND LOWER(rent_requests.status) = 'rented') AS is_rented_count,
        (SELECT COUNT(*) FROM rent_requests WHERE rent_requests.item_id = items.id) AS bookings_count
      FROM items
      LEFT JOIN users_details u ON items.user_id = u.user_id
      ORDER BY items.created_at DESC
    `);

    const formattedItems = rows.map((item) => {
      const stock = item.available_quantity !== undefined && item.available_quantity !== null
        ? Number(item.available_quantity)
        : null;

      // Available ද Rented Out ද යන්න තීරණය වන්නේ stock එක 0 ද නැද්ද යන්න මත පමණි!
      const isRented = stock !== null
        ? stock <= 0
        : item.available_qty === "Rented Out" || item.available_qty === 0 || item.available_qty === "0";

      return {
        id: item.id,
        title: item.title,
        category: item.category,
        condition: item.condition,
        price: item.price,
        priceType: item.price_type,
        description: item.description,
        image: item.image_url,
        available: isRented ? "Rented Out" : "Available",
        available_quantity: Number(item.available_quantity ?? 1),
        bookings: Number(item.bookings_count || 0),
        views: Number(item.views || 0),
        userId: item.user_id,
        user_id: item.user_id,
        userName: item.user_name || null,
        user_name: item.user_name || null,
        userPhone: item.user_phone || null,
        user_phone: item.user_phone || null,
        sellerPhone: item.user_phone || null,
        seller_phone: item.user_phone || null,
        phone_no: item.user_phone || null,
        userProfilePic: item.user_profile_pic || null,
        user_profile_pic: item.user_profile_pic || null,
        nearestCity: item.nearest_city || null,
        nearest_city: item.nearest_city || null,
        sellerAddress: item.seller_address || null,
        seller_address: item.seller_address || null,
        sellerMapLatitude: item.seller_map_latitude ? parseFloat(item.seller_map_latitude) : null,
        seller_map_latitude: item.seller_map_latitude ? parseFloat(item.seller_map_latitude) : null,
        sellerMapLongitude: item.seller_map_longitude ? parseFloat(item.seller_map_longitude) : null,
        seller_map_longitude: item.seller_map_longitude ? parseFloat(item.seller_map_longitude) : null,
        sellerMapLocationName: item.seller_map_location_name || null,
        seller_map_location_name: item.seller_map_location_name || null,
        createdAt: item.created_at,
      };
    });

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Fetch Items Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch items from database.",
    });
  }
};

// GET USER'S ITEMS BY USER ID (Profile page)
exports.getUserItems = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.execute(`
      SELECT 
        items.*,
        (SELECT COUNT(*) FROM rent_requests WHERE rent_requests.item_id = items.id AND LOWER(rent_requests.status) = 'rented') AS is_rented_count,
        (SELECT COUNT(*) FROM rent_requests WHERE rent_requests.item_id = items.id) AS bookings_count
      FROM items 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [userId]);

    const formattedItems = rows.map((item) => {
      const stock = item.available_quantity !== undefined && item.available_quantity !== null
        ? Number(item.available_quantity)
        : null;

      const isRented = stock !== null
        ? stock <= 0
        : item.available_qty === "Rented Out" || item.available_qty === 0 || item.available_qty === "0";

      return {
        id: item.id,
        title: item.title,
        category: item.category,
        condition: item.condition,
        price: item.price,
        priceType: item.price_type,
        description: item.description,
        image: item.image_url,
        available: isRented ? "Rented Out" : "Available",
        available_quantity: Number(item.available_quantity ?? 1),
        bookings: Number(item.bookings_count || 0),
        views: Number(item.views || 0),
      };
    });

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Fetch User Items Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch items." });
  }
};

// INCREMENT ITEM VIEWS COUNT
exports.incrementViews = async (req, res) => {
  const itemId = req.params.id;
  try {
    try {
      await db.execute(
        "UPDATE items SET views = COALESCE(views, 0) + 1 WHERE id = ?",
        [itemId]
      );
    } catch (sqlErr) {
      if (
        sqlErr.code === "ER_BAD_FIELD_ERROR" ||
        sqlErr.errno === 1054 ||
        String(sqlErr.message).includes("views")
      ) {
        await db.execute("ALTER TABLE items ADD COLUMN views INT DEFAULT 0");
        await db.execute("UPDATE items SET views = 1 WHERE id = ?", [itemId]);
      } else {
        throw sqlErr;
      }
    }
    res.status(200).json({ success: true, message: "View recorded" });
  } catch (error) {
    console.error("Increment Views Error:", error);
    res.status(500).json({ success: false, message: "Failed to record view." });
  }
};

// ADD NEW ITEM WITH IMAGE FILE UPLOAD
exports.addItem = async (req, res) => {
  const {
    title,
    category,
    condition,
    price,
    priceType,
    description,
    userId,
    available_quantity,
  } = req.body;

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
      INSERT INTO items (title, category, \`condition\`, price, price_type, description, image_url, user_id, available_quantity) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      available_quantity ? Number(available_quantity) : 1,
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
    const isAvail = available === "Available" || available === 1 || available === "1";
    if (isAvail) {
      await db.execute(
        "UPDATE items SET available_qty = 'Available', available_quantity = GREATEST(COALESCE(available_quantity, 0), 1) WHERE id = ?",
        [itemId]
      );
    } else {
      await db.execute(
        "UPDATE items SET available_qty = 'Rented Out', available_quantity = 0 WHERE id = ?",
        [itemId]
      );
    }

    res.status(200).json({ success: true, message: "Status updated successfully!" });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update status." });
  }
};

// UPDATE ITEM DETAILS
exports.updateItem = async (req, res) => {
  const itemId = req.params.id;
  const {
    title,
    category,
    condition,
    price,
    priceType,
    description,
    available_quantity,
    available,
  } = req.body;

  try {
    const [existing] = await db.execute("SELECT * FROM items WHERE id = ?", [itemId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    const currentItem = existing[0];
    const newImageUrl = req.file ? `/uploads/${req.file.filename}` : currentItem.image_url;

    const updatedTitle = title !== undefined ? title.trim() : currentItem.title;
    const updatedCategory = category !== undefined ? category : currentItem.category;
    const updatedCondition = condition !== undefined ? condition : currentItem.condition;
    const updatedPrice = price !== undefined ? parseFloat(price) : currentItem.price;
    const updatedPriceType = priceType !== undefined ? priceType : currentItem.price_type;
    const updatedDescription = description !== undefined ? description.trim() : currentItem.description;
    const updatedQty = available_quantity !== undefined ? parseInt(available_quantity, 10) : currentItem.available_quantity;
    
    let updatedAvail = currentItem.available_qty;
    if (available !== undefined) {
      updatedAvail = available;
    } else if (updatedQty <= 0) {
      updatedAvail = "Rented Out";
    }

    const query = `
      UPDATE items 
      SET title = ?, category = ?, \`condition\` = ?, price = ?, price_type = ?, description = ?, available_quantity = ?, available_qty = ?, image_url = ?
      WHERE id = ?
    `;

    const values = [
      updatedTitle,
      updatedCategory,
      updatedCondition,
      updatedPrice,
      updatedPriceType,
      updatedDescription,
      updatedQty,
      updatedAvail,
      newImageUrl,
      itemId,
    ];

    await db.execute(query, values);

    const [rows] = await db.execute("SELECT * FROM items WHERE id = ?", [itemId]);
    const updated = rows[0];

    res.status(200).json({
      success: true,
      message: "Item updated successfully!",
      item: {
        id: updated.id,
        title: updated.title,
        category: updated.category,
        condition: updated.condition,
        price: updated.price,
        priceType: updated.price_type,
        price_type: updated.price_type,
        description: updated.description,
        image: updated.image_url,
        image_url: updated.image_url,
        available: updated.available_qty,
        available_quantity: updated.available_quantity,
      },
    });
  } catch (error) {
    console.error("Update Item Error:", error);
    res.status(500).json({ success: false, message: "Server error while updating the item." });
  }
};

// DELETE ITEM
exports.deleteItem = async (req, res) => {
  const itemId = req.params.id;
  try {
    await db.execute("DELETE FROM items WHERE id = ?", [itemId]);
    res.status(200).json({ success: true, message: "Item deleted successfully!" });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete item." });
  }
};