const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { upload } = require('../middleware/upload');

router.get('/', itemController.getAllItems);
router.get('/:userId', itemController.getUserItems);
router.post('/', upload.single('image'), itemController.addItem);
router.put('/status/:id', itemController.updateStatus);
router.delete('/:id', itemController.deleteItem);

module.exports = router;
