const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/start', chatController.startChat);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/send', chatController.sendMessage);
router.get('/user-conversations/:userId', chatController.getUserConversations);
router.get('/unread-count/:userId', chatController.getUnreadCount);
router.put('/mark-read/:conversationId', chatController.markRead);
router.delete('/messages/:messageId', chatController.deleteMessage);
router.delete('/conversations/:conversationId', chatController.deleteConversation);

module.exports = router;
