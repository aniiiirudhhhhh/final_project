const User = require("../models/User");

exports.getCustomerProfile = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Access denied. Customers only." });
    }

    const customer = await User.findById(req.user._id).select("-password");
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

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

exports.getCustomersByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Find all customers with this adminId
    const customers = await User.find({ adminId: req.user._id, role: "customer" }).select("-password");

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
