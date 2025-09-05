const User = require("../models/User");

// 1️⃣ Get logged-in customer profile
const getCustomerProfile = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Access denied. Customers only." });
    }
    const customer = await User.findById(req.user._id).select("-password");
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json({
      name: customer.name,
      email: customer.email,
      points: customer.pointsBalance,
      adminId: customer.adminId,
      history: customer.history
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ Get all customers for an admin
const getCustomersByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const customers = await User.find({ adminId: req.user._id, role: "customer" }).select("-password");
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ Admin updates customer tier
const updateCustomerTier = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const { customerId } = req.params;
    const { tier } = req.body;
    if (!tier) return res.status(400).json({ message: "Tier is required" });

    const customer = await User.findById(customerId);
    if (!customer || customer.role !== "customer") return res.status(404).json({ message: "Customer not found" });

    customer.tier = tier;
    await customer.save();

    res.json({
      message: "Tier updated successfully",
      customer: { _id: customer._id, name: customer.name, email: customer.email, tier: customer.tier }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4️⃣ Customer views own tier
const getCustomerTier = async (req, res) => {
  try {
    if (req.user.role !== "customer") return res.status(403).json({ message: "Access denied. Customers only." });
    const customer = await User.findById(req.user._id).select("tier");
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json({ tier: customer.tier || "No tier assigned" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Export all functions
module.exports = {
  getCustomerProfile,
  getCustomersByAdmin,
  updateCustomerTier,
  getCustomerTier
};
