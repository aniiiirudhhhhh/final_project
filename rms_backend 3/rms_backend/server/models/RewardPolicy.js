const mongoose = require("mongoose");

const rewardPolicySchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  policyName: { type: String, required: true },
  description: { type: String },

  // Base earning
  basePointsPer100: { type: Number, required: true }, 

  // Category-specific rules
  categoryRules: [
    {
      category: { type: String, required: true },
      pointsPer100: { type: Number, required: true },
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
  redemptionRate: { type: Number, required: true },
  minRedeemPoints: { type: Number, default: 100 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RewardPolicy", rewardPolicySchema);
