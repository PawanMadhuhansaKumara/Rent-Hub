const db = require('../config/db');

// GET USER COMMUNITY POSTS
exports.getPosts = async (req, res) => {
  const { userId } = req.params;
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await db.execute(
      `SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const formattedPosts = rows.map((post) => ({
      id: post.id,
      userId: post.user_id,
      content: post.content,
      image: post.image_url
        ? post.image_url.startsWith('http')
          ? post.image_url
          : `http://localhost:5001${post.image_url.startsWith('/') ? '' : '/'}${post.image_url}`
        : null,
      createdAt: post.created_at
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Fetch Posts Error:', error);
    res.status(200).json([]);
  }
};

// CREATE COMMUNITY POST
exports.createPost = async (req, res) => {
  const { user_id, content } = req.body;
  if (!user_id) {
    return res.status(400).json({ success: false, message: 'user_id is required' });
  }

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const image_url = req.file ? (req.file.path || `/uploads/${req.file.filename}`) : null;
    const [result] = await db.execute(
      `INSERT INTO posts (user_id, content, image_url, created_at) VALUES (?, ?, ?, NOW())`,
      [user_id, content || '', image_url]
    );

    res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      postId: result.insertId
    });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating post' });
  }
};
