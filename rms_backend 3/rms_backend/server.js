const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Admin auth routes
const adminAuthRoutes = require("./server/routes/adminAuthRoutes");
app.use("/auth", adminAuthRoutes); // ✅ /auth/admin/register & /auth/admin/login
const customerAuthRoutes = require("./server/routes/customerAuthRoutes");
app.use("/auth", customerAuthRoutes); // ✅ /auth/customer/register & /auth/customer/login
const rewardPolicyRoutes = require("./server/routes/rewardPolicyRoutes");
app.use("/admin/policy", rewardPolicyRoutes);
const transactionRoutes = require("./server/routes/transactionRoutes");
app.use("/transactions", transactionRoutes);
const customerRoutes = require("./server/routes/customerRoutes");
app.use("/customer", customerRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
