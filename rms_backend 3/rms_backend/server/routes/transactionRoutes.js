const express = require("express");
const { addTransaction, getHistory ,getCustomerHistory} = require("../controllers/transactionController");
const { protect ,isAdmin} = require("../middleware/authMiddleware");
 
const router = express.Router();
 
// customer must be logged in
router.post("/", protect, addTransaction);
router.get("/history", protect, getHistory);
router.get("/customer/:customerId", protect, isAdmin, getCustomerHistory);
module.exports = router;
 