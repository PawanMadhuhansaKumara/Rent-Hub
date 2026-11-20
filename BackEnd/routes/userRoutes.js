const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { userUpdateUpload } = require('../middleware/upload');

router.get('/:id', userController.getUser);
router.get('/:id/trust-score', userController.getUserTrustScore);
router.get('/:id/earnings', userController.getSellerEarnings);
router.put('/:id', userUpdateUpload, userController.updateUser);
router.put('/:id/bank-details', userController.updateBankDetails);
router.post('/:id/withdraw', userController.requestWithdrawal);
router.put('/:id/map-location', userController.updateMapLocation);
router.put('/:id/language', userController.updateLanguage);
router.post('/:id/topup-cashpoints', userController.topupCashPoints);
router.delete('/:id', userController.deleteUser);

module.exports = router;
