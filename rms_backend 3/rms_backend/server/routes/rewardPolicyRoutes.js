const express = require("express");
const {
  createOrUpdatePolicy,
  getPolicy,
  deletePolicy,
  addOrUpdateCategoryRule,
  addOrUpdateThreshold,
  getPolicySummary,
  addOrUpdateTierRule,
  getTierRules,
} = require("../controllers/rewardPolicyController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// ✅ Missing import fixed
const RewardPolicy = require("../models/RewardPolicy");

const router = express.Router();

// ---------------- Admin Routes ----------------

// Create/update full policy
router.post("/", protect, isAdmin, createOrUpdatePolicy);

// Get current policy
router.get("/", protect, isAdmin, getPolicy);

// Delete policy
router.delete("/", protect, isAdmin, deletePolicy);

// Category-specific rules
router.post("/policy/category", protect, isAdmin, addOrUpdateCategoryRule);

// Spend threshold bonuses
router.post("/threshold", protect, isAdmin, addOrUpdateThreshold);

// Tier rules
router.post("/tier", protect, isAdmin, addOrUpdateTierRule);
router.get("/tier", protect, isAdmin, getTierRules);

// Policy summary
router.get("/summary", protect, isAdmin, getPolicySummary);

// ---------------- Customer-facing Route ----------------
router.get("/customer-rules/:adminId", protect, async (req, res) => {
  try {
    const { adminId } = req.params;
    const policy = await RewardPolicy.findOne({ adminId });

    if (!policy) {
      return res
        .status(404)
        .json({ message: "Policy not found for this business" });
    }

    res.json({
      validCategories: policy.categoryRules?.map((c) => c.category) || [],
      thresholds:
        policy.spendThresholds?.map((t) => ({
          amount: t.minAmount,
          bonusPoints: t.bonusPoints,
        })) || [],
    });
  } catch (err) {
    console.error("Error fetching customer rules:", err);
    res.status(500).json({ message: "Server error fetching rules" });
  }
});

module.exports = router;
