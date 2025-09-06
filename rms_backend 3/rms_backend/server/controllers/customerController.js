const User = require("../models/User");

// helper: recalc active balance
const calculateActivePoints = (pointsHistory) => {
  const now = new Date();
  return pointsHistory
    .filter(p => !p.redeemed && p.expiresAt > now) // only valid points
    .reduce((sum, p) => sum + p.points, 0);
};

// 1️⃣ Get logged-in customer profile
const getCustomerProfile = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id).select("-password");
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (customer.role !== "customer") {
      return res.json({
        name: customer.name,
        email: customer.email,
        role: customer.role
      });
    }

    // recalc balance dynamically from pointsHistory
    const activePoints = calculateActivePoints(customer.pointsHistory || []);
    if (activePoints !== customer.pointsBalance) {
      customer.pointsBalance = activePoints;
      await customer.save();
    }

    res.json({
      name: customer.name,
      email: customer.email,
      points: activePoints,
      tier: customer.tier || "No tier assigned",
      adminId: customer.adminId,
      history: customer.history,
      pointsHistory: customer.pointsHistory  // ✅ show individual points with expiry
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

    let customers = await User.find({
      adminId: req.user._id,
      role: "customer"
    }).select("-password");

    // recalc balances for each customer
    customers = customers.map(c => {
      const activePoints = calculateActivePoints(c.pointsHistory || []);
      c.pointsBalance = activePoints;
      return c;
    });

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
    if (!customer || customer.role !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.tier = tier;
    await customer.save();

    res.json({
      message: "Tier updated successfully",
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        tier: customer.tier
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4️⃣ Customer views own tier
const getCustomerTier = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Access denied. Customers only." });
    }

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
