const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { userUpdateUpload } = require('../middleware/upload');

router.get('/:id', userController.getUser);
router.get('/:id/trust-score', userController.getUserTrustScore);
router.put('/:id', userUpdateUpload, userController.updateUser);
router.put('/:id/map-location', userController.updateMapLocation);
router.put('/:id/language', userController.updateLanguage);
router.delete('/:id', userController.deleteUser);

module.exports = router;
