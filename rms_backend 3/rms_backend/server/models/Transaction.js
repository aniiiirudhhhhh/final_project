const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  earnedPoints: {
    type: Number,
    default: 0,
  },
  redeemedPoints: {
    type: Number,
    default: 0,
  },
  redeemedAmount: {
    type: Number,
    default: 0, // 💡 amount reduced based on redeemed points
  },
  finalAmount: {
    type: Number,
    required: true, // 💡 actual amount after redemption
  },
  finalPoints: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
