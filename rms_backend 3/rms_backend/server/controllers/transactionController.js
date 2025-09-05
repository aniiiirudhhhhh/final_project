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
 
    // Calculate earned points
    const earnedPoints = Math.floor((amount / 100) * policy.basePointsPer100);
 
    // Validate redeem points
    let pointsToRedeem = redeemPoints || 0;
    if (pointsToRedeem > customer.pointsBalance) {
      return res.status(400).json({ message: "Not enough points to redeem" });
    }
 
    // Update customer’s balance
    const finalPoints = customer.pointsBalance + earnedPoints - pointsToRedeem;
    customer.pointsBalance = finalPoints;
    await customer.save();
 
    // Save transaction
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
      transactions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};