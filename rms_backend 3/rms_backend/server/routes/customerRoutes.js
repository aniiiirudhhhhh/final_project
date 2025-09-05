const express = require("express");
const { protect,isAdmin } = require("../middleware/authMiddleware");
const { getCustomerProfile,getCustomersByAdmin } = require("../controllers/customerController");

const router = express.Router();

router.get("/me", protect, getCustomerProfile);
router.get("/all", protect, isAdmin, getCustomersByAdmin);

module.exports = router;
