const express = require("express");
const router = express.Router();
const rentRequestController = require("../controllers/rentRequestController");

router.post("/", rentRequestController.createRentRequest);
router.get("/buyer/:buyerId", rentRequestController.getBuyerRequests);
router.get("/seller/:sellerId", rentRequestController.getSellerRequests);
router.put("/:id/status", rentRequestController.updateRequestStatus);

module.exports = router;
