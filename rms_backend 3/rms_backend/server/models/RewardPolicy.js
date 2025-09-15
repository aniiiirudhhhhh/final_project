const mongoose = require("mongoose");

const rewardPolicySchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  policyName: { type: String, required: true },
  description: { type: String },

  // Base earning: use dynamic unit/points (not per 100)
  baseUnit: { type: Number, required: true, default: 1 },              // e.g., 1, 5, 50, 100
  basePointsPerUnit: { type: Number, required: true, default: 0 },     // points per baseUnit

  // Tier-specific rules with minPoints for automatic assignment
  tierRules: [
    {
      tierName: { type: String, enum: ["Silver", "Gold", "Platinum"], required: true },
      minPoints: { type: Number, required: true },
      multiplier: { type: Number, required: true, default: 1 },
      benefits: { type: String }
    }
  ],

  // Category-specific rules (dynamic unit)
  categoryRules: [
    {
      category: { type: String, required: true },
      unit: { type: Number, required: true, default: 1 },             // e.g., 10, 25, 100
      pointsPerUnit: { type: Number, required: true, default: 0 },    // points per unit for category
      minAmount: { type: Number, default: 0 },
      bonusPoints: { type: Number, default: 0 }
    }
  ],

  // Threshold bonuses
  spendThresholds: [
    {
      minAmount: { type: Number, required: true },
      bonusPoints: { type: Number, required: true }
    }
  ],

  // Redemption rules
  redemptionRate: { type: Number, required: true },           // e.g., 1 point = ₹1
  minRedeemPoints: { type: Number, default: 100 },

  // Points expiry (in days)
  pointsExpiryDays: { type: Number, default: 365 },

  // Spin wheel config
  spinWheelMinPoints: { type: Number, default: 0 },
  spinWheelSegments: { type: [Number], default: [] },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RewardPolicy", rewardPolicySchema);
