const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize database connection
require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const cartRoutes = require('./routes/cartRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');

// Root Health Check Route
app.get('/', (req, res) => {
  res.send('Rent Hub Backend API is work Successfully!');
});

// API Routes Mounting
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);

// Server Listening
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}...`);
});

module.exports = app;
