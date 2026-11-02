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

// Multi-file upload middleware setup for Registration
const cpUpload = upload.fields([
  { name: 'profile_pic', maxCount: 1 },
  { name: 'nic_photo_front', maxCount: 1 },
  { name: 'nic_photo_back', maxCount: 1 }
]);

// Uploads folder එක public static folder එකක් ලෙස සැකසීම (Images ලබා ගැනීමට)
app.use('/uploads', express.static('uploads'));

// Aiven Cloud MySQL Database Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: 'Z',
  ssl: {
    rejectUnauthorized: false 
  }
});

// Database Connection Test
db.getConnection()
  .then(connection => {
    console.log('✅ Aiven MySQL Database is Connecting successfully!');
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

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key_12345'; 

// 1. STANDARD LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  const { phone_no, password } = req.body;

  if (!phone_no || !password) {
    return res.status(400).json({ success: false, message: 'Phone number and password are required.' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users_details WHERE phone_no = ?', [phone_no]);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid Phone Number or Password!' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid Phone Number or Password!' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.user_role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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

// 2. GOOGLE LOGIN ROUTE
app.post('/api/google-login', async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users_details WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this Google email. Please register first.'
      });
    }

    const user = rows[0];

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

// 3. UPDATE USER PROFILE ROUTE WITH IMAGES (FormData support)
const userUpdateUpload = upload.fields([
  { name: 'profile_pic', maxCount: 1 },
  { name: 'cover_pic', maxCount: 1 }
]);

app.put('/api/users/:id', userUpdateUpload, async (req, res) => {
  const userId = req.params.id;
  const { full_name, phone_no, email, address, nearest_city } = req.body;

  try {
    const profile_pic_url = req.files && req.files['profile_pic'] ? `/uploads/${req.files['profile_pic'][0].filename}` : null;
    const coverphoto = req.files && req.files['cover_pic'] ? `/uploads/${req.files['cover_pic'][0].filename}` : null;

    let query = `
      UPDATE users_details 
      SET full_name = ?, phone_no = ?, email = ?, address = ?, nearest_city = ?
    `;
    let values = [full_name, phone_no, email || null, address || null, nearest_city || null];

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
});

// 4. GET SINGLE USER PROFILE BY ID (Public view)
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.execute('SELECT * FROM users_details WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password_hash, nic_photo_front_url, nic_photo_back_url, ...publicUser } = rows[0];
    res.status(200).json({ success: true, user: publicUser });
  } catch (error) {
    console.error('Fetch User Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ==========================================
// RENT HUB - ITEMS API ROUTES (User-Specific)
// ==========================================

// 1. GET ALL ITEMS (Home page සහ Item Details සඳහා සියලුම items ලබා ගැනීම)
app.get('/api/items', async (req, res) => {
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
    
    const formattedItems = rows.map(item => ({
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
      createdAt: item.created_at
    }));

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error('Fetch Items Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch items from database.' });
  }
});

// 2. අදාළ User ගේ ID එකට අදාළ items පමණක් ලබා ගැනීම (Profile එක සඳහා)
app.get('/api/items/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.execute('SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    
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
    console.error('Fetch User Items Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch items.' });
  }
});

// ADD NEW ITEM WITH IMAGE FILE UPLOAD
app.post('/api/items', upload.single('image'), async (req, res) => {
  const { title, category, condition, price, priceType, description, userId } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ success: false, message: 'Title, category, and price are required.' });
  }

  try {
    // ෆයිල් එකක් ලැබී ඇත්නම් uploads/ folder එකේ URL එක යෙදීම, නැතහොත් default image එක
    const image_url = req.file ? `/uploads/${req.file.filename}` : '/uploads/default-item.png';

    const query = `
      INSERT INTO items (title, category, \`condition\`, price, price_type, description, image_url, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title,
      category,
      condition || 'Good',
      price,
      priceType || 'day',
      description || '',
      image_url,
      userId || null
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
        m.id,
        m.conversation_id,
        m.sender_id,
        m.message_text,
        m.is_read,
        DATE_FORMAT(m.created_at, '%Y-%m-%dT%H:%i:%s.000Z') AS created_at,
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
        m.id,
        m.conversation_id,
        m.sender_id,
        m.message_text,
        m.is_read,
        DATE_FORMAT(m.created_at, '%Y-%m-%dT%H:%i:%s.000Z') AS created_at,
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
        (SELECT DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.000Z') FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE) AS unread_count
      FROM conversations c
      LEFT JOIN items i ON c.item_id = i.id
      LEFT JOIN users_details buyer ON c.buyer_id = buyer.user_id
      LEFT JOIN users_details seller ON c.seller_id = seller.user_id
      WHERE (c.buyer_id = ? OR c.seller_id = ?)
        AND EXISTS (SELECT 1 FROM messages WHERE conversation_id = c.id)
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


// ==========================================
// RENT HUB - FORGOT PASSWORD & SMS / WHATSAPP OTP
// ==========================================

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio Client initialized successfully.');
  } catch (e) {
    console.warn('⚠️ Twilio initialization warning:', e.message);
  }
}

// Phone number formatters
function formatE164Number(phone) {
  let clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('0')) {
    clean = '+94' + clean.substring(1);
  } else if (!clean.startsWith('+')) {
    clean = '+94' + clean;
  }
  return clean;
}

function formatWhatsAppNumber(phone) {
  return `whatsapp:${formatE164Number(phone)}`;
}

// 1. SEND OTP TO PHONE (SMS & WHATSAPP)
app.post('/api/forgot-password/send-otp', async (req, res) => {
  const { phone_no } = req.body;

  if (!phone_no || !phone_no.trim()) {
    return res.status(400).json({ success: false, message: 'Phone number is required.' });
  }

  const cleanPhone = phone_no.trim();

  try {
    // 1. Verify user exists with this phone number
    const [userRows] = await db.execute(
      'SELECT user_id, full_name, phone_no FROM users_details WHERE phone_no = ?',
      [cleanPhone]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this phone number.'
      });
    }

    // 2. Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Expiration time: 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Invalidate any previous unused OTPs for this phone number
    await db.execute(
      'UPDATE password_resets SET is_used = TRUE WHERE phone_no = ? AND is_used = FALSE',
      [cleanPhone]
    );

    // 5. Save OTP to database
    await db.execute(
      'INSERT INTO password_resets (phone_no, otp_code, expires_at) VALUES (?, ?, ?)',
      [cleanPhone, otpCode, expiresAt]
    );

    let sentViaSms = false;
    let sentViaWhatsApp = false;
    const formattedPhone = formatE164Number(cleanPhone);

    // 6. Send standard SMS text message directly to the phone number if TWILIO_PHONE_NUMBER is configured
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
          body: `Rent-Hub Verification Code: ${otpCode}. Valid for 10 minutes. Do not share this code.`
        });
        sentViaSms = true;
        console.log(`📩 SMS OTP sent successfully to ${formattedPhone}`);
      } catch (smsErr) {
        console.error('❌ Twilio SMS Error:', smsErr.message);
      }
    }

    // 7. Also send via WhatsApp if TWILIO_WHATSAPP_NUMBER is configured
    if (twilioClient && process.env.TWILIO_WHATSAPP_NUMBER) {
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: formatWhatsAppNumber(cleanPhone),
          body: `Rent-Hub Verification Code: *${otpCode}*\n\nThis code is valid for 10 minutes. Do not share this code with anyone.`
        });
        sentViaWhatsApp = true;
        console.log(`📲 WhatsApp OTP sent successfully to ${cleanPhone}`);
      } catch (twErr) {
        console.error('❌ Twilio WhatsApp Error:', twErr.message);
      }
    }

    // Always log OTP to server console for testing/development
    console.log(`🔑 [DEV CONSOLE OTP] For Phone ${cleanPhone} (${formattedPhone}) -> OTP: ${otpCode}`);

    let userNotice = 'Verification code generated! (Dev Mode: Check backend console)';
    if (sentViaSms && sentViaWhatsApp) {
      userNotice = 'Verification code sent to your Phone (SMS) and WhatsApp.';
    } else if (sentViaSms) {
      userNotice = 'Verification code sent via SMS to your phone.';
    } else if (sentViaWhatsApp) {
      userNotice = 'Verification code sent to your WhatsApp number.';
    }

    res.status(200).json({
      success: true,
      sentViaSms,
      sentViaWhatsApp,
      message: userNotice
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error while sending OTP.' });
  }
});

// 2. VERIFY OTP
app.post('/api/forgot-password/verify-otp', async (req, res) => {
  const { phone_no, otp_code } = req.body;

  if (!phone_no || !otp_code) {
    return res.status(400).json({ success: false, message: 'Phone number and OTP code are required.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, expires_at, is_used FROM password_resets WHERE phone_no = ? AND otp_code = ? AND is_used = FALSE ORDER BY id DESC LIMIT 1',
      [phone_no.trim(), otp_code.trim()]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    if (new Date(rows[0].expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This code has expired. Please request a new one.' });
    }

    res.status(200).json({ success: true, message: 'Code verified successfully.' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
});

// 3. RESET PASSWORD
app.post('/api/forgot-password/reset-password', async (req, res) => {
  const { phone_no, otp_code, new_password } = req.body;

  if (!phone_no || !otp_code || !new_password) {
    return res.status(400).json({ success: false, message: 'Phone number, OTP code, and new password are required.' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  try {
    // 1. Verify the OTP is valid and unused
    const [otpRows] = await db.execute(
      'SELECT id, expires_at, is_used FROM password_resets WHERE phone_no = ? AND otp_code = ? AND is_used = FALSE ORDER BY id DESC LIMIT 1',
      [phone_no.trim(), otp_code.trim()]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    if (new Date(otpRows[0].expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This code has expired. Please request a new one.' });
    }

    // 2. Hash the new password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(new_password, saltRounds);

    // 3. Update the user password in users_details
    await db.execute(
      'UPDATE users_details SET password_hash = ? WHERE phone_no = ?',
      [password_hash, phone_no.trim()]
    );

    // 4. Mark OTP as used
    await db.execute(
      'UPDATE password_resets SET is_used = TRUE WHERE id = ?',
      [otpRows[0].id]
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error while resetting password.' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}...`);
});

// UPDATE ITEM DETAILS & AVAILABILITY
app.put('/api/items/status/:id', async (req, res) => {
  const itemId = req.params.id;
  const { available } = req.body;

  try {
    await db.execute('UPDATE items SET available_qty = ? WHERE id = ?', [available, itemId]);
    res.status(200).json({ success: true, message: 'Status updated successfully!' });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});