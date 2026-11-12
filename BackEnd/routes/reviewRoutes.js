const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Submit review
router.post('/', reviewController.createReview);

// Update review (buyer edits rating and comment)
router.put('/:id', reviewController.updateReview);

// Delete review (buyer deletes their review)
router.delete('/:id', reviewController.deleteReview);

// Get reviews for seller/shop
router.get('/seller/:sellerId', reviewController.getSellerReviews);

// Get reviews for item
router.get('/item/:itemId', reviewController.getItemReviews);

// Check if a specific request has been reviewed
router.get('/check/:requestId', reviewController.checkRentalReviewed);

// Seller reply to a review
router.post('/:reviewId/reply', reviewController.replyReview);
router.delete('/:reviewId/reply', reviewController.deleteReply);

module.exports = router;
