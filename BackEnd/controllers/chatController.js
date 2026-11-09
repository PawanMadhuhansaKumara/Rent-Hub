const db = require('../config/db');

// START OR GET CHAT CONVERSATION
exports.startChat = async (req, res) => {
  const { item_id, buyer_id, seller_id } = req.body;

  if (!item_id || !buyer_id || !seller_id) {
    return res.status(400).json({ success: false, message: 'item_id, buyer_id, and seller_id are required.' });
  }

  if (Number(buyer_id) === Number(seller_id)) {
    return res.status(400).json({ success: false, message: 'You cannot chat with yourself.' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM conversations WHERE item_id = ? AND buyer_id = ? AND seller_id = ?',
      [item_id, buyer_id, seller_id]
    );

    if (existing.length > 0) {
      return res.status(200).json({ success: true, conversationId: existing[0].id });
    }

    const [result] = await db.execute(
      'INSERT INTO conversations (item_id, buyer_id, seller_id) VALUES (?, ?, ?)',
      [item_id, buyer_id, seller_id]
    );

    res.status(201).json({ success: true, conversationId: result.insertId });
  } catch (error) {
    console.error('Chat Start Error:', error);
    res.status(500).json({ success: false, message: 'Failed to start conversation.' });
  }
};

// GET MESSAGES FOR A CONVERSATION
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
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
};

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  const { conversation_id, sender_id, message_text } = req.body;

  if (!conversation_id || !sender_id || !message_text || !message_text.trim()) {
    return res.status(400).json({ success: false, message: 'conversation_id, sender_id, and message_text are required.' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)',
      [conversation_id, sender_id, message_text.trim()]
    );

    await db.execute(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversation_id]
    );

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
};

// GET ALL CONVERSATIONS FOR A USER
exports.getUserConversations = async (req, res) => {
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
};

// GET UNREAD NOTIFICATIONS COUNT
exports.getUnreadCount = async (req, res) => {
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
      unreadCount: rows[0]?.total_unread || 0
    });
  } catch (error) {
    console.error('Get Unread Count Error:', error.message);
    res.status(200).json({ success: true, unreadCount: 0 });
  }
};

// MARK MESSAGES AS READ
exports.markRead = async (req, res) => {
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
};

// DELETE SINGLE MESSAGE
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.body?.userId || req.query?.userId;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required.' });
  }

  try {
    const [msgRows] = await db.execute(`
      SELECT m.id, m.conversation_id, m.sender_id, c.buyer_id, c.seller_id
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.id = ?
    `, [messageId]);

    if (msgRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    const msg = msgRows[0];
    const isSender = Number(msg.sender_id) === Number(userId);
    const isParticipant = Number(msg.buyer_id) === Number(userId) || Number(msg.seller_id) === Number(userId);

    if (!isSender && !isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message.' });
    }

    await db.execute('DELETE FROM messages WHERE id = ?', [messageId]);

    res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Delete Message Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
};

// DELETE ENTIRE CONVERSATION
exports.deleteConversation = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.body?.userId || req.query?.userId;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required.' });
  }

  try {
    const [convRows] = await db.execute(
      'SELECT id, buyer_id, seller_id FROM conversations WHERE id = ? AND (buyer_id = ? OR seller_id = ?)',
      [conversationId, userId, userId]
    );

    if (convRows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized or conversation not found.' });
    }

    await db.execute('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
    await db.execute('DELETE FROM conversations WHERE id = ?', [conversationId]);

    res.status(200).json({ success: true, message: 'Conversation deleted successfully.' });
  } catch (error) {
    console.error('Delete Conversation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete conversation.' });
  }
};
