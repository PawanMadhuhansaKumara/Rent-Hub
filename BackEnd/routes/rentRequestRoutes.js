const express = require("express");
const router = express.Router();
const rentRequestController = require("../controllers/rentRequestController");

router.post("/", rentRequestController.createRentRequest);
router.post("/:id/handover", rentRequestController.confirmHandover);
router.post("/handover", rentRequestController.confirmHandover);
router.get("/buyer/:buyerId", rentRequestController.getBuyerRequests);
router.get("/seller/:sellerId", rentRequestController.getSellerRequests);
router.put("/:id/status", rentRequestController.updateRequestStatus);
router.delete("/:id", rentRequestController.deleteRentRequest);

module.exports = router;
