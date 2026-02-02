const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ["client", "freelancer", "admin"],
    default: "client",
  },
  walletAddress: {
    type: String,
    default: null,
  },
  isWalletVerified: {
    type: Boolean,
    default: true,
  },
  reputation: {
    type: Number,
    default: 0,
  },
  skills: {
    type: [String],
    default: [],
  },
  bio: {
    type: String,
    default: "",
  },
  hourlyRate: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  permissions: {
    type: [String],
    default: [],
  },
  department: {
    type: String,
    default: null,
  },
});
module.exports = mongoose.model("User", userSchema);
