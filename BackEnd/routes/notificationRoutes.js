const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// GET user's notifications
router.get('/:userId', notificationController.getUserNotifications);

// POST create notification
router.post('/', notificationController.createNotification);

// PUT mark single notification as read
router.put('/:id/read', notificationController.markAsRead);

// PUT mark all user's notifications as read
router.put('/user/:userId/read-all', notificationController.markAllAsRead);

// DELETE all user notifications (clear all)
router.delete('/user/:userId/clear-all', notificationController.clearAllNotifications);

// DELETE single notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
