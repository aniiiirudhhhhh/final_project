const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ link to Admin
  pointsBalance: { type: Number, default: 0 },
  history: [
    {
      type: { type: String, enum: ["earn", "redeem"], required: true },
      points: { type: Number, required: true },
      description: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

// hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
