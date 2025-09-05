const mongoose = require("mongoose");

const rewardPolicySchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  policyName: { type: String, required: true },
  description: { type: String },

  // Base earning (default fallback if no tier/category rule applies)
  basePointsPer100: { type: Number, required: true }, 

  // ✅ Tier-specific rules
  tierRules: [
    {
      tier: { type: String, enum: ["Silver", "Gold", "Platinum"], required: true },
      multiplier: { type: Number, required: true, default: 1 } 
      // Example: Silver = 1, Gold = 1.5, Platinum = 2
    }
  ],

  // ✅ Category-specific rules
  categoryRules: [
    {
      category: { type: String, required: true },
      pointsPer100: { type: Number, required: true },
      minAmount: { type: Number, default: 0 },
      bonusPoints: { type: Number, default: 0 }
    }
  ],

  // ✅ Threshold bonuses
  spendThresholds: [
    {
      minAmount: { type: Number, required: true },
      bonusPoints: { type: Number, required: true }
    }
  ],

  // ✅ Redemption rules
  redemptionRate: { type: Number, required: true }, // e.g., 1 point = ₹1
  minRedeemPoints: { type: Number, default: 100 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RewardPolicy", rewardPolicySchema);
