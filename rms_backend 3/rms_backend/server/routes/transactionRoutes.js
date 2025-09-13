const express = require("express");
const {
  addTransaction,
  getHistory,
  getCustomerHistory,
  getExpiringPoints,
} = require("../controllers/transactionController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Debugging – check what was imported
console.log("transactionController imports:", {
  addTransaction,
  getHistory,
  getCustomerHistory,
  getExpiringPoints,
});
console.log("authMiddleware imports:", { protect, isAdmin });

// Routes
router.post("/", protect, addTransaction);
router.get("/history", protect, getHistory);
router.get("/customer/:customerId", protect, isAdmin, getCustomerHistory);
router.get("/points-expiry", protect, isAdmin, getExpiringPoints);

module.exports = router;
