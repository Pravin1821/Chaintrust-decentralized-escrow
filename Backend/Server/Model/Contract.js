const mongoose = require("mongoose");
const contractSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  applications: [
    {
      freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "Created",
      "Invited",
      "Applied",
      "Assigned",
      "Funded",
      "Submitted",
      "Approved",
      "Paid",
      "Disputed",
      "Resolved",
    ],
    default: "Created",
  },
  blockchainContrctId: {
    type: Number,
    default: null,
  },
  escrowAddress: {
    type: String,
    default: null,
  },
  escrowStatus: {
    type: String,
    enum: ["NotFunded", "Funded", "Refunded"],
    default: "NotFunded",
  },
  fundedAt: {
    type: Date,
  },
  ipfsHash: {
    type: String,
    default: null,
  },
  submittedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  paidAt: {
    type: Date,
    default: null,
  },
  invitation: {
    invitedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined"],
      default: null,
    },
    declineReason: {
      type: String,
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  acceptedAt: {
    type: Date,
    default: null,
  },
  declinedAt: {
    type: Date,
    default: null,
  },
  declineReason: {
    type: String,
    default: null,
  },
  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dispute",
    default: null,
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  revisionRequest: {
    proposedAmount: {
      type: Number,
      default: null,
    },
    proposedRequirements: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", null],
      default: null,
    },
    requestedAt: {
      type: Date,
      default: null,
    },
  },
});
module.exports = mongoose.model("Contract", contractSchema);
