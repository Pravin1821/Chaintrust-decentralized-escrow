const mongoose = require("mongoose");
const disputeSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      unique: true,
    },
    raisedBy: {
      type: String,
      enum: ["client", "freelancer"],
      required: true,
    },
    raisedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    evidence: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Open", "Resolved"],
      default: "Open",
    },
    resolution: {
      type: String,
      enum: ["clientWins", "freelancerWins", "null"],
      default: "null",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    Disputer: ["Resolved", "Refunded", "Paid"],
  },
  { timestamps: true },
);
module.exports = mongoose.model("Dispute", disputeSchema);
