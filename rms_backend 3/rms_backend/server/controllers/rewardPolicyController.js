const RewardPolicy = require("../models/RewardPolicy");

// Create or update a reward policy
exports.createOrUpdatePolicy = async (req, res) => {
  try {
    const adminId = req.user.id; // from JWT
    const data = req.body;

    // check if admin already has a policy
    let policy = await RewardPolicy.findOne({ adminId });

    if (policy) {
      // update
      policy = await RewardPolicy.findOneAndUpdate({ adminId }, data, { new: true });
      return res.json({ message: "Policy updated", policy });
    } else {
      // create
      policy = await RewardPolicy.create({ ...data, adminId });
      return res.status(201).json({ message: "Policy created", policy });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addOrUpdateThreshold = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { minAmount, bonusPoints } = req.body;

    // Find admin's policy
    let policy = await RewardPolicy.findOne({ adminId });
    if (!policy) {
      return res.status(404).json({ message: "No policy found. Create one first." });
    }

    // Check if threshold already exists
    const thresholdIndex = policy.spendThresholds.findIndex(t => t.minAmount === minAmount);
    if (thresholdIndex !== -1) {
      // Update existing threshold
      policy.spendThresholds[thresholdIndex].bonusPoints = bonusPoints;
    } else {
      // Add new threshold
      policy.spendThresholds.push({ minAmount, bonusPoints });
    }

    await policy.save();
    res.json({ message: "Threshold added/updated", policy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addOrUpdateCategoryRule = async (req, res) => {
  try {
    const adminId = req.user.id; // from JWT
    const { category, pointsPer100, minAmount, bonusPoints } = req.body;

    // find policy of the admin
    let policy = await RewardPolicy.findOne({ adminId });
    if (!policy) {
      return res.status(404).json({ message: "No policy found. Please create one first." });
    }

    // check if category already exists
    const categoryIndex = policy.categoryRules.findIndex(rule => rule.category === category);

    if (categoryIndex !== -1) {
      // update existing rule
      policy.categoryRules[categoryIndex] = {
        category,
        pointsPer100,
        minAmount,
        bonusPoints
      };
    } else {
      // add new rule
      policy.categoryRules.push({ category, pointsPer100, minAmount, bonusPoints });
    }

    await policy.save();

    res.json({ message: "Category rule added/updated", policy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const Transaction = require("../models/Transaction");

// GET /api/policy/summary
exports.getPolicySummary = async (req, res) => {
  try {
    const adminId = req.user.id; // from JWT

    // Aggregate transactions of this admin
    const transactions = await Transaction.find({ adminId });

    if (transactions.length === 0) {
      return res.json({
        totalTransactions: 0,
        totalPointsIssued: 0,
        totalPointsRedeemed: 0,
        outstandingPoints: 0,
      });
    }

    const totalTransactions = transactions.length;
    const totalPointsIssued = transactions.reduce((sum, t) => sum + (t.earnedPoints || 0), 0);
    const totalPointsRedeemed = transactions.reduce((sum, t) => sum + (t.redeemedPoints || 0), 0);
    const outstandingPoints = totalPointsIssued - totalPointsRedeemed;

    res.json({
      totalTransactions,
      totalPointsIssued,
      totalPointsRedeemed,
      outstandingPoints,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current admin's policy
exports.getPolicy = async (req, res) => {
  try {
    const policy = await RewardPolicy.findOne({ adminId: req.user.id });
    if (!policy) return res.status(404).json({ message: "No policy found" });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete policy
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await RewardPolicy.findOneAndDelete({ adminId: req.user.id });
    if (!policy) return res.status(404).json({ message: "No policy found" });
    res.json({ message: "Policy deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
