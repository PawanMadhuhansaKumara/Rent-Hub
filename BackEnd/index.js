const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const multer = require('multer');
const path = require('path');

// Upload කරනු ලබන Images 'uploads/' folder එකේ store කිරීමට සැකසීම
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Multi-file upload middleware setup
const cpUpload = upload.fields([
  { name: 'profile_pic', maxCount: 1 },
  { name: 'nic_photo_front', maxCount: 1 },
  { name: 'nic_photo_back', maxCount: 1 }
]);

// Uploads folder එක public static folder එකක් ලෙස සැකසීම (Images ලබා ගැනීමට)
app.use('/uploads', express.static('uploads'));

// REGISTER ROUTE WITH IMAGES
app.post('/api/register', cpUpload, async (req, res) => {
  const {
    full_name,
    phone_no,
    email,
    password,
    nic_no,
    address,
    nearest_city,
    user_role
  } = req.body;

  // Files ලැබී ඇත්දැයි පරීක්ෂාව
  const profile_pic_url = req.files['profile_pic'] ? `/uploads/${req.files['profile_pic'][0].filename}` : null;
  const nic_photo_front_url = req.files['nic_photo_front'] ? `/uploads/${req.files['nic_photo_front'][0].filename}` : null;
  const nic_photo_back_url = req.files['nic_photo_back'] ? `/uploads/${req.files['nic_photo_back'][0].filename}` : null;

  if (!profile_pic_url || !nic_photo_front_url || !nic_photo_back_url) {
    return res.status(400).json({
      success: false,
      message: 'Profile picture and both NIC photos are required.'
    });
  }

  try {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users_details 
      (full_name, phone_no, email, password_hash, nic_no, address, nearest_city, profile_pic_url, nic_photo_front_url, nic_photo_back_url, user_role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      full_name,
      phone_no,
      email || null,
      password_hash,
      nic_no,
      address,
      nearest_city,
      profile_pic_url,
      nic_photo_front_url,
      nic_photo_back_url,
      user_role || 'both'
    ];

    const [result] = await db.execute(query, values);

    res.status(201).json({
      success: true,
      message: 'Registration Successful!',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Registration Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'This Phone Number, NIC, or Email is already registered.'
      });
    }
    res.status(500).json({ success: false, message: 'Server error occurred.' });
  }
});

// Middlewares (Moved to top)

// Aiven Cloud MySQL Database Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false 
  }
});

// Database Connection Test
db.getConnection()
  .then(connection => {
    console.log('✅ Aiven MySQL Database is Conecting successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database Connection Error:', err.message);
  });

// ------------------- ROUTES -------------------

// Test Route
app.get('/', (req, res) => {
  res.send('Rent Hub Backend API is work Successfully!');
});

// Register User API
app.post('/api/register', async (req, res) => {
  const {
    full_name,
    phone_no,
    email,
    password,
    nic_no,
    address,
    nearest_city,
    user_role
  } = req.body;

  try {
    // 1. Password එක Hash කිරීම
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 2. MySQL Query එක
    const query = `
      INSERT INTO users_details 
      (full_name, phone_no, email, password_hash, nic_no, address, nearest_city, user_role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      full_name,
      phone_no,
      email || null,
      password_hash,
      nic_no,
      address,
      nearest_city,
      user_role || 'both'
    ];

    const [result] = await db.execute(query, values);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Registration Error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'This phone number, NIC number, or email is already registered.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error occurred. Please try again.'
    });
  }
});

// Server එක Run කිරීම
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}...`);
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key_12345'; // Process env එකකට දා ගැනීම වඩාත් සුදුසුයි

// 1. STANDARD LOGIN ROUTE (Phone Number + Password)
app.post('/api/login', async (req, res) => {
  const { phone_no, password } = req.body;

  if (!phone_no || !password) {
    return res.status(400).json({ success: false, message: 'Phone number and password are required.' });
  }

  try {
    // Database එකෙන් User සොයා ගැනීම
    const [rows] = await db.execute('SELECT * FROM users_details WHERE phone_no = ?', [phone_no]);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid Phone Number or Password!' });
    }

    const user = rows[0];

    // Password Check කිරීම
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid Phone Number or Password!' });
    }

    // JWT Token සෑදීම
    const token = jwt.sign(
      { userId: user.user_id, role: user.user_role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Password Hash එක ඉවත් කර User details යැවීම
    const { password_hash, ...userData } = user;

    res.status(200).json({
      success: true,
      message: 'Login Successful!',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error occurred during login.' });
  }
});

// 2. GOOGLE LOGIN / AUTO-FILL ROUTE
// Google Identity Services (Client ID) හරහා ලැබෙන ID Token එක verification කිරීම
app.post('/api/google-login', async (req, res) => {
  const { email } = req.body; // Google Sign-in එකෙන් ලැබෙන Google Email එක

  try {
    // Email එකෙන් user කෙනෙක් ඉන්නවාද පරීක්ෂා කිරීම
    const [rows] = await db.execute('SELECT * FROM users_details WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this Google email. Please register first.'
      });
    }

    const user = rows[0];

    // Password එක නොමැතිව Auto-Fill වී Direct Log වීමට Token එක ලබාදීම
    const token = jwt.sign(
      { userId: user.user_id, role: user.user_role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userData } = user;

    res.status(200).json({
      success: true,
      message: 'Google Login Successful!',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google Login.' });
  }
});

// ==========================================
// RENT HUB - ITEMS API ROUTES (Newly Added)
// ==========================================

// 1. GET ALL ITEMS (Database එකෙන් සියලුම items ලබා ගැනීම)
app.get('/api/items', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM items ORDER BY created_at DESC');
    
    // Frontend එකට ගැළපෙන පරිදි Key names format කිරීම
    const formattedItems = rows.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      condition: item.condition,
      price: item.price,
      priceType: item.price_type,
      description: item.description,
      image: item.image_url,
      available: item.available_qty
    }));

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error('Fetch Items Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch items from database.' });
  }
});

// 2. ADD NEW ITEM (Profile එකේ Add Item form එක හරහා අලුත් item එකක් save කිරීම)
app.post('/api/items', async (req, res) => {
  const { title, category, condition, price, priceType, description, image } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ success: false, message: 'Title, category, and price are required.' });
  }

  try {
    const query = `
      INSERT INTO items (title, category, \`condition\`, price, price_type, description, image_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title,
      category,
      condition || 'Good',
      price,
      priceType || 'day',
      description || '',
      image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300'
    ];

    const [result] = await db.execute(query, values);

    res.status(201).json({
      success: true,
      message: 'Item added successfully!',
      itemId: result.insertId
    });

  } catch (error) {
    console.error('Add Item Error:', error);
    res.status(500).json({ success: false, message: 'Server error while saving the item.' });
  }
});

// ==========================================
// RENT HUB - CHAT API ROUTES
// ==========================================

// 1. START OR GET CHAT (Item එකකට අදාළව conversation එකක් ඇත්දැයි බලා ලබාගැනීම හෝ අලුතෙන් සෑදීම)
app.post('/api/chat/start', async (req, res) => {
  const { item_id, buyer_id, seller_id } = req.body;

  if (!item_id || !buyer_id || !seller_id) {
    return res.status(400).json({ success: false, message: 'item_id, buyer_id, and seller_id are required.' });
  }

  if (Number(buyer_id) === Number(seller_id)) {
    return res.status(400).json({ success: false, message: 'You cannot chat with yourself.' });
  }

  try {
    // 1. දැනටමත් conversation එකක් තිබේදැයි පරීක්ෂාව
    const [existing] = await db.execute(
      'SELECT id FROM conversations WHERE item_id = ? AND buyer_id = ? AND seller_id = ?',
      [item_id, buyer_id, seller_id]
    );

    if (existing.length > 0) {
      return res.status(200).json({ success: true, conversationId: existing[0].id });
    }

    // 2. නැත්නම් අලුත් conversation එකක් insert කිරීම
    const [result] = await db.execute(
      'INSERT INTO conversations (item_id, buyer_id, seller_id) VALUES (?, ?, ?)',
      [item_id, buyer_id, seller_id]
    );

    res.status(201).json({ success: true, conversationId: result.insertId });
  } catch (error) {
    console.error('Chat Start Error:', error);
    res.status(500).json({ success: false, message: 'Failed to start conversation.' });
  }
});

// 2. GET MESSAGES (Conversation එකේ සියලුම messages සහ විස්තර ලබා ගැනීම)
app.get('/api/chat/messages/:conversationId', async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Conversation සහ Item විස්තර
    const [convDetails] = await db.execute(`
      SELECT 
        c.*, 
        i.title AS item_title, 
        i.image_url AS item_image, 
        i.price AS item_price, 
        i.price_type AS item_price_type,
        buyer.full_name AS buyer_name, 
        buyer.profile_pic_url AS buyer_pic,
        seller.full_name AS seller_name,
        seller.profile_pic_url AS seller_pic
      FROM conversations c
      LEFT JOIN items i ON c.item_id = i.id
      LEFT JOIN users_details buyer ON c.buyer_id = buyer.user_id
      LEFT JOIN users_details seller ON c.seller_id = seller.user_id
      WHERE c.id = ?
    `, [conversationId]);

    if (convDetails.length === 0) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    // Messages ලබා ගැනීම
    const [messages] = await db.execute(`
      SELECT 
        m.*, 
        u.full_name AS sender_name, 
        u.profile_pic_url AS sender_pic 
      FROM messages m 
      LEFT JOIN users_details u ON m.sender_id = u.user_id 
      WHERE m.conversation_id = ? 
      ORDER BY m.created_at ASC
    `, [conversationId]);

    res.status(200).json({
      success: true,
      conversation: convDetails[0],
      messages
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

// 3. SEND MESSAGE (අලුත් message එකක් යැවීම)
app.post('/api/chat/send', async (req, res) => {
  const { conversation_id, sender_id, message_text } = req.body;

  if (!conversation_id || !sender_id || !message_text || !message_text.trim()) {
    return res.status(400).json({ success: false, message: 'conversation_id, sender_id, and message_text are required.' });
  }

  try {
    // 1. Message එක insert කිරීම
    const [result] = await db.execute(
      'INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)',
      [conversation_id, sender_id, message_text.trim()]
    );

    // 2. Conversation එකේ updated_at අලුත් කිරීම (අලුත්ම chat උඩින් පෙන්වීමට)
    await db.execute(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversation_id]
    );

    // 3. Insert වූ message එක sender විස්තර සහිතව ලබා ගැනීම
    const [newMessage] = await db.execute(`
      SELECT 
        m.*, 
        u.full_name AS sender_name, 
        u.profile_pic_url AS sender_pic 
      FROM messages m 
      LEFT JOIN users_details u ON m.sender_id = u.user_id 
      WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: newMessage[0]
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// 4. GET USER CONVERSATIONS (Navbar dropdown / Inbox එක සඳහා user ගේ සියලුම chats)
app.get('/api/chat/user-conversations/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.execute(`
      SELECT 
        c.id AS conversation_id,
        c.item_id,
        c.buyer_id,
        c.seller_id,
        c.updated_at,
        i.title AS item_title,
        i.image_url AS item_image,
        i.price AS item_price,
        i.price_type AS item_price_type,
        buyer.full_name AS buyer_name,
        buyer.profile_pic_url AS buyer_pic,
        seller.full_name AS seller_name,
        seller.profile_pic_url AS seller_pic,
        (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE) AS unread_count
      FROM conversations c
      LEFT JOIN items i ON c.item_id = i.id
      LEFT JOIN users_details buyer ON c.buyer_id = buyer.user_id
      LEFT JOIN users_details seller ON c.seller_id = seller.user_id
      WHERE c.buyer_id = ? OR c.seller_id = ?
      ORDER BY c.updated_at DESC
    `, [userId, userId, userId]);

    res.status(200).json({
      success: true,
      conversations: rows
    });
  } catch (error) {
    console.error('Get User Conversations Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations.' });
  }
});

// 5. GET UNREAD NOTIFICATIONS COUNT (Navbar chat icon එකේ රතු badge එක සඳහා)
app.get('/api/chat/unread-count/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.execute(`
      SELECT COUNT(*) AS total_unread
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE (c.buyer_id = ? OR c.seller_id = ?)
        AND m.sender_id != ?
        AND m.is_read = FALSE
    `, [userId, userId, userId]);

    res.status(200).json({
      success: true,
      unreadCount: rows[0].total_unread || 0
    });
  } catch (error) {
    console.error('Get Unread Count Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count.' });
  }
});

// 6. MARK MESSAGES AS READ (Chat එක open කළ විට messages read වූ බව සටහන් කිරීම)
app.put('/api/chat/mark-read/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required.' });
  }

  try {
    await db.execute(
      'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE',
      [conversationId, userId]
    );

    res.status(200).json({ success: true, message: 'Messages marked as read.' });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark messages as read.' });
  }
});
