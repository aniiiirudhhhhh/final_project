const express = require("express");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const { 
  getCustomerProfile, 
  getCustomersByAdmin,
  updateCustomerTier,   // ✅ new
  getCustomerTier       // ✅ new
} = require("../controllers/customerController");

const router = express.Router();

// Customer profile
router.get("/me", protect, getCustomerProfile);

// Admin: get all customers
router.get("/all", protect, isAdmin, getCustomersByAdmin);

// Admin: manually update a customer’s tier
router.put("/:customerId/tier", protect, isAdmin, updateCustomerTier);

// Customer: view own tier
router.get("/me/tier", protect, getCustomerTier);

module.exports = router;
