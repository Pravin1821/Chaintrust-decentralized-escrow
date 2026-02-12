const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      "CONTRACT_INVITED",
      "CONTRACT_ASSIGNED",
      "CONTRACT_FUNDED",
      "WORK_SUBMITTED",
      "WORK_APPROVED",
      "WORK_REJECTED",
      "DISPUTE_RAISED",
      "DISPUTE_RESOLVED",
      "APPLICATION_RECEIVED",
      "PAYMENT_RELEASED",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contract",
    default: null,
  },
  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dispute",
    default: null,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
