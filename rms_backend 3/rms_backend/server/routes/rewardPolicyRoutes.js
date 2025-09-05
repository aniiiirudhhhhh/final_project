const express = require("express");
const { 
  createOrUpdatePolicy, 
  getPolicy, 
  deletePolicy, 
  addOrUpdateCategoryRule,
  addOrUpdateThreshold,
  getPolicySummary 
} = require("../controllers/rewardPolicyController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin routes for reward policies
router.post("/", protect, isAdmin, createOrUpdatePolicy);   // create/update policy
router.get("/", protect, isAdmin, getPolicy);               // get policy
router.delete("/", protect, isAdmin, deletePolicy);         // delete policy
router.post("/policy/category", protect, isAdmin, addOrUpdateCategoryRule); // add/update category rule
router.post("/threshold", protect, isAdmin, addOrUpdateThreshold);
router.get("/summary", protect, isAdmin, getPolicySummary); // get policy summary
module.exports = router;
