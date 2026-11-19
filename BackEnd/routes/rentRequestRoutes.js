const express = require("express");
const router = express.Router();
const rentRequestController = require("../controllers/rentRequestController");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/", rentRequestController.createRentRequest);
router.post("/:id/handover", rentRequestController.confirmHandover);
router.post("/handover", rentRequestController.confirmHandover);
router.get("/buyer/:buyerId", rentRequestController.getBuyerRequests);
router.get("/seller/:sellerId", rentRequestController.getSellerRequests);

// GET LOGGED-IN USER'S RENTAL HISTORY
router.get(
  "/history/:role",
  authMiddleware,
  rentRequestController.getRentalHistory
);
router.put("/:id/payment", rentRequestController.updatePaymentStatus);
router.put("/:id/status", rentRequestController.updateRequestStatus);
router.post("/:id/pay", rentRequestController.processPayment);
router.put("/:id/customer-picked", rentRequestController.markCustomerPicked);
router.put("/:id/customer-return", rentRequestController.markCustomerReturned); // 👈 Customer භාරදුන් විට
router.put("/:id/accept-return", rentRequestController.acceptReturnedItem);     // 👈 කඩයේ අයිතිකරු බාරගත් විට
router.delete("/:id", rentRequestController.deleteRentRequest);

module.exports = router;