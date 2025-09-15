const Transaction = require("../models/Transaction");
const RewardPolicy = require("../models/RewardPolicy");
const User = require("../models/User");

// =========================
// Customer makes a purchase
// =========================
const addTransaction = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { amount, category, redeemPoints = 0, adminId } = req.body;

    if (!adminId) return res.status(400).json({ message: "Admin ID is required" });

    const policy = await RewardPolicy.findOne({ adminId });
    if (!policy) return res.status(404).json({ message: "No reward policy found for this business" });

    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (!Array.isArray(customer.pointsHistory)) customer.pointsHistory = [];
    const now = new Date();

    // --- Tier Multiplier ---
    let tierMultiplier = 1;
    if (customer.tier) {
      const tierRule = policy.tierRules?.find(t => t.tierName === customer.tier);
      if (tierRule) tierMultiplier = tierRule.multiplier;
    }

    // --- Base Points ---
    const basePoints = Math.floor((amount / 100) * (policy.basePointsPer100 || 0));

    // --- Category Points ---
    let categoryPoints = 0;
    if (category) {
      const categoryRule = policy.categoryRules?.find(c => c.category === category);
      if (categoryRule && amount >= categoryRule.minAmount) {
        categoryPoints = Math.floor((amount / 100) * categoryRule.pointsPer100) + (categoryRule.bonusPoints || 0);
      }
    }

    // --- Threshold Bonus ---
    let thresholdBonus = 0;
    if (policy.spendThresholds?.length) {
      policy.spendThresholds.forEach(threshold => {
        if (amount >= threshold.minAmount) thresholdBonus += threshold.bonusPoints || 0;
      });
    }

    // --- Total Earned Points ---
    const earnedPoints = Math.floor((basePoints + categoryPoints) * tierMultiplier + thresholdBonus);

    // --- Add Points to Customer ---
    if (earnedPoints > 0) {
      const expiryDays = policy.pointsExpiryDays || 365;
      const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
      customer.pointsHistory.push({ points: earnedPoints, redeemed: false, expiresAt });
    }

    // --- Calculate maximum points that can be redeemed based on amount and redemption rate ---
    const redemptionRate = Number(policy.redemptionRate ?? 1);
    const maxPointsToRedeem = Math.min(Number(redeemPoints), Math.floor(amount / redemptionRate));

    const availablePoints = customer.pointsHistory
      .filter(p => !p.redeemed && p.expiresAt > now)
      .reduce((sum, p) => sum + p.points, 0);

    if (maxPointsToRedeem > availablePoints) {
      return res.status(400).json({ message: "Not enough valid points to redeem" });
    }

    // --- Redeem up to maxPointsToRedeem ---
    let remainingPointsToRedeem = maxPointsToRedeem;
    let actualRedeemedPoints = 0;
    for (const entry of customer.pointsHistory) {
      if (remainingPointsToRedeem <= 0) break;
      if (entry.redeemed || entry.expiresAt <= now) continue;

      if (entry.points <= remainingPointsToRedeem) {
        actualRedeemedPoints += entry.points;
        remainingPointsToRedeem -= entry.points;
        entry.points = 0;
        entry.redeemed = true;
      } else {
        entry.points -= remainingPointsToRedeem;
        actualRedeemedPoints += remainingPointsToRedeem;
        remainingPointsToRedeem = 0;
      }
    }

    // Remove zero points entries that are redeemed
    customer.pointsHistory = customer.pointsHistory.filter(p => p.points > 0 || !p.redeemed);

    // --- Calculate redeemed amount and final amount ---
    const redeemedAmount = actualRedeemedPoints * redemptionRate;
    const finalAmount = Math.max(0, amount - redeemedAmount);

    // --- Update points balance ---
    customer.pointsBalance = customer.pointsHistory
      .filter(p => !p.redeemed && p.expiresAt > now)
      .reduce((sum, p) => sum + p.points, 0);

    // --- Auto-assign tier based on points balance ---
    if (policy.tierRules?.length) {
      const sortedTiers = [...policy.tierRules].sort((a, b) => b.minPoints - a.minPoints);
      for (const tierRule of sortedTiers) {
        if (customer.pointsBalance >= tierRule.minPoints) {
          customer.tier = tierRule.tierName;
          break;
        }
      }
    }

    await customer.save();

    // --- Save Transaction ---
    const transaction = await Transaction.create({
      adminId,
      customerId,
      amount,
      category,
      earnedPoints,
      redeemedPoints: actualRedeemedPoints,
      redeemedAmount,
      finalAmount,
      finalPoints: customer.pointsBalance,
    });

    // --- Response ---
    res.status(201).json({
      transaction,
      currentTier: customer.tier || "No tier assigned",
      currentBalance: customer.pointsBalance,
      pointsBreakdown: {
        basePoints,
        categoryPoints,
        tierMultiplier,
        thresholdBonus,
        totalEarnedPoints: earnedPoints,
      },
      paymentBreakdown: {
        originalAmount: amount,
        redeemedAmount,
        finalAmount,
      },
    });
  } catch (err) {
    console.error("Add Transaction Error:", err);
    res.status(500).json({ message: err.message });
  }
};


// =========================
// Other Controllers (unchanged)
const getHistory = async (req, res) => {
  try {
    const customerId = req.user._id;
    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const transactions = await Transaction.find({ customerId }).sort({ createdAt: -1 });
    res.json({
      currentBalance: customer.pointsBalance,
      tier: customer.tier || "No tier assigned",
      transactions,
    });
  } catch (err) {
    console.error("Get History Error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getCustomerHistory = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const transactions = await Transaction.find({ customerId }).sort({ createdAt: -1 });
    res.json({
      customer: {
        name: customer.name,
        email: customer.email,
        tier: customer.tier || "No tier assigned",
        pointsBalance: customer.pointsBalance,
      },
      transactions,
    });
  } catch (err) {
    console.error("Get Customer History Error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getExpiringPoints = async (req, res) => {
  try {
    const adminId = req.user._id;
    const customers = await User.find({ adminId, role: "customer" });

    const now = new Date();
    const warningDays = 30;

    const result = customers
      .map(c => {
        const expiringPoints = c.pointsHistory
          .filter(p => !p.redeemed && p.expiresAt > now && (p.expiresAt - now) / (1000*60*60*24) <= warningDays)
          .reduce((sum, p) => sum + p.points, 0);
        return { customerId: c._id, name: c.name, email: c.email, expiringPoints };
      })
      .filter(c => c.expiringPoints > 0);

    res.json(result);
  } catch (err) {
    console.error("Get Expiring Points Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// =========================
// Export Controllers
module.exports = {
  addTransaction,
  getHistory,
  getCustomerHistory,
  getExpiringPoints,
};
