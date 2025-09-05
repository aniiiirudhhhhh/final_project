const Transaction = require("../models/Transaction");
const RewardPolicy = require("../models/RewardPolicy");
const User = require("../models/User");

// Customer makes a purchase
exports.addTransaction = async (req, res) => {
  try {
    const customerId = req.user._id; // logged-in customer
    const { amount, category, redeemPoints, adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    // Get admin’s reward policy
    const policy = await RewardPolicy.findOne({ adminId });
    if (!policy) {
      return res
        .status(404)
        .json({ message: "No reward policy found for this business" });
    }

    // Get customer
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // ---------- Points Calculation Logic ----------
    let earnedPoints = 0;

    // 1) Tier multiplier
    let tierMultiplier = 1;
    if (customer.tier) {
      const tierRule = policy.tierRules.find(t => t.tier === customer.tier);
      if (tierRule) {
        tierMultiplier = tierRule.multiplier;
      }
    }

    // 2) Category-specific rule (if exists, overrides basePointsPer100)
    const categoryRule = policy.categoryRules.find(c => c.category === category);
    if (categoryRule) {
      if (amount >= categoryRule.minAmount) {
        earnedPoints = Math.floor((amount / 100) * categoryRule.pointsPer100);
        if (categoryRule.bonusPoints) {
          earnedPoints += categoryRule.bonusPoints;
        }
      } else {
        // fallback to base
        earnedPoints = Math.floor((amount / 100) * policy.basePointsPer100);
      }
    } else {
      // no category rule -> use base
      earnedPoints = Math.floor((amount / 100) * policy.basePointsPer100);
    }

    // Apply tier multiplier
    earnedPoints = Math.floor(earnedPoints * tierMultiplier);

    // 3) Threshold bonuses
    if (policy.spendThresholds && policy.spendThresholds.length > 0) {
      policy.spendThresholds.forEach(threshold => {
        if (amount >= threshold.minAmount) {
          earnedPoints += threshold.bonusPoints;
        }
      });
    }

    // ---------- Redemption Logic ----------
    let pointsToRedeem = redeemPoints || 0;
    if (pointsToRedeem > customer.pointsBalance) {
      return res.status(400).json({ message: "Not enough points to redeem" });
    }

    // ---------- Update Balance ----------
    const finalPoints = customer.pointsBalance + earnedPoints - pointsToRedeem;
    customer.pointsBalance = finalPoints;
    await customer.save();

    // ---------- Save Transaction ----------
    const transaction = await Transaction.create({
      adminId,
      customerId,
      amount,
      category,
      earnedPoints,
      redeemedPoints: pointsToRedeem,
      finalPoints,
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get transaction history for the logged-in customer
exports.getCustomerHistory = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const transactions = await Transaction.find({ customerId }).sort({
      createdAt: -1,
    });

    res.json({
      customer: {
        name: customer.name,
        email: customer.email,
        tier: customer.tier,
        pointsBalance: customer.pointsBalance,
      },
      transactions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const customerId = req.user._id;

    // Get customer
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Fetch transactions for this customer
    const transactions = await Transaction.find({ customerId }).sort({
      createdAt: -1,
    });

    res.json({
      currentBalance: customer.pointsBalance,
      tier: customer.tier,
      transactions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
