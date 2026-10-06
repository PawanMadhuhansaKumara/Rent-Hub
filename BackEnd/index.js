const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();

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

// Middlewares
app.use(cors());
app.use(express.json());

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}...`);
});