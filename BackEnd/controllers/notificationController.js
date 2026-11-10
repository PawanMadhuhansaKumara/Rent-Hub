const db = require('../config/db');

// Ensure notifications table exists
const initNotificationsTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'rental_request',
        item_id INT NULL,
        request_id INT NULL,
        image_url VARCHAR(255) NULL,
        link_url VARCHAR(255) NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await db.execute(createTableQuery);
  } catch (err) {
    console.warn("Notifications table init warning:", err.message);
  }
};

// GET USER NOTIFICATIONS (Real notifications only - no dummy/synthesized data)
exports.getUserNotifications = async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
    await initNotificationsTable();

    // Fetch ONLY real saved notifications for this user
    let notifications = [];
    try {
      const [rows] = await db.execute(
        `SELECT id, user_id AS userId, title, message, type, item_id AS itemId,
                request_id AS requestId, image_url AS imageUrl, link_url AS linkUrl,
                is_read AS isRead, created_at AS createdAt
         FROM notifications
         WHERE user_id = ?
         ORDER BY id DESC, created_at DESC
         LIMIT 50`,
        [userId]
      );

      notifications = (rows || []).map((n) => ({
        ...n,
        isRead: Number(n.isRead) === 1,
      }));
    } catch (e) {
      console.warn("Error reading notifications table:", e.message);
    }

    res.status(200).json({
      success: true,
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications: " + error.message,
    });
  }
};

// MARK SINGLE NOTIFICATION AS READ
exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    await initNotificationsTable();
    await db.execute(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);

    res.status(200).json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    console.error("Mark As Read Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// MARK ALL AS READ
exports.markAllAsRead = async (req, res) => {
  const { userId } = req.params;

  try {
    await initNotificationsTable();
    await db.execute(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);

    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("Mark All As Read Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE SINGLE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    await initNotificationsTable();
    await db.execute(`DELETE FROM notifications WHERE id = ?`, [id]);

    res.status(200).json({ success: true, message: "Notification deleted." });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// CLEAR ALL NOTIFICATIONS FOR USER
exports.clearAllNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    await initNotificationsTable();
    await db.execute(`DELETE FROM notifications WHERE user_id = ?`, [userId]);

    res.status(200).json({ success: true, message: "All notifications cleared." });
  } catch (error) {
    console.error("Clear All Notifications Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE REAL NOTIFICATION
exports.createNotification = async (req, res) => {
  const {
    userId,
    title,
    message,
    type = "system",
    itemId = null,
    requestId = null,
    imageUrl = null,
    linkUrl = null,
  } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ success: false, message: "userId, title, and message are required." });
  }

  try {
    await initNotificationsTable();
    const query = `
      INSERT INTO notifications (user_id, title, message, type, item_id, request_id, image_url, link_url, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
    `;
    const [result] = await db.execute(query, [
      userId,
      title,
      message,
      type,
      itemId,
      requestId,
      imageUrl,
      linkUrl,
    ]);

    res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      notificationId: result.insertId,
    });
  } catch (error) {
    console.error("Create Notification Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
