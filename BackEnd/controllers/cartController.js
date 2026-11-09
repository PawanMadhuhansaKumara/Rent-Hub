const db = require('../config/db');

// ADD ITEM TO CART
exports.addToCart = async (req, res) => {
  const { userId, itemId, quantity, startDate, endDate } = req.body;
  const user_id = userId || req.body.user_id;
  const item_id = itemId || req.body.item_id;
  const qty = quantity || req.body.quantity || 1;

  if (!user_id || !item_id) {
    return res.status(400).json({ success: false, message: 'Missing user_id or item_id.' });
  }

  try {
    try {
      const query = `INSERT INTO cart (user_id, item_id, quantity, start_date, end_date, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
      const values = [user_id, item_id, qty, startDate || null, endDate || null];
      const [result] = await db.execute(query, values);
      return res.status(201).json({ success: true, message: 'Item added to cart.', cartId: result.insertId });
    } catch (insertErr) {
      // Fallback if start_date / end_date columns don't exist in cart table
      const fallbackQuery = `INSERT INTO cart (user_id, item_id, quantity, created_at) VALUES (?, ?, ?, NOW())`;
      const fallbackValues = [user_id, item_id, qty];
      const [result] = await db.execute(fallbackQuery, fallbackValues);
      return res.status(201).json({ success: true, message: 'Item added to cart.', cartId: result.insertId });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error while adding to cart: ' + error.message });
  }
};

// GET CART ITEMS BY USER ID
exports.getCart = async (req, res) => {
  const userId = req.params.userId;
  try {
    const query = `
      SELECT 
        c.id,
        c.user_id,
        c.item_id,
        c.quantity,
        c.created_at,
        i.title,
        i.price,
        i.price_type,
        i.image_url,
        i.category,
        u.full_name AS seller_name,
        u.profile_pic_url AS seller_pic
      FROM cart c
      JOIN items i ON c.item_id = i.id
      LEFT JOIN users_details u ON i.user_id = u.user_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `;
    const [rows] = await db.execute(query, [userId]);

    const formattedCart = rows.map(item => ({
      id: item.id,
      itemId: item.item_id,
      item_id: item.item_id,
      title: item.title,
      price: item.price,
      priceType: item.price_type || 'day',
      image: item.image_url,
      quantity: item.quantity,
      startDate: item.start_date || null,
      endDate: item.end_date || null,
      sellerName: item.seller_name || 'Owner',
      sellerPic: item.seller_pic || null,
      category: item.category,
      createdAt: item.created_at
    }));

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error('Fetch Cart Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart items: ' + error.message });
  }
};

// DELETE CART ITEM
exports.deleteCartItem = async (req, res) => {
  const cartId = req.params.id;
  try {
    await db.execute('DELETE FROM cart WHERE id = ?', [cartId]);
    res.status(200).json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Delete Cart Error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item from cart.' });
  }
};
