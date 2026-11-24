const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/', cartController.addToCart);
router.get('/:userId', cartController.getCart);
router.delete('/:id', cartController.deleteCartItem);
router.put('/:id/move', cartController.moveCartItem);

// Multi-cart management routes
router.get('/:userId/carts', cartController.getUserCarts);
router.post('/:userId/carts', cartController.createUserCart);
router.delete('/:userId/carts/:cartName', cartController.deleteUserCart);
router.put('/:userId/carts/:cartName', cartController.renameUserCart);

module.exports = router;
