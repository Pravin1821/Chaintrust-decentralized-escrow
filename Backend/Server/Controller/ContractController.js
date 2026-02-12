const Contract = require("../Model/Contract");
const NotificationController = require("./NotificationController");

const isEditableStatus = (contract) => {
  const blockedStatuses = [
    "Funded",
    "Submitted",
    "Approved",
    "Paid",
    "Disputed",
    "Resolved",
  ];
  return (
    !blockedStatuses.includes(contract.status) &&
    contract.escrowStatus !== "Funded"
  );
};

exports.createContract = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      deadline,
      freelancer: invitedFreelancer,
    } = req.body;

    let freelancerUser = null;
    if (invitedFreelancer) {
      const User = require("../Model/User");
      freelancerUser = await User.findOne({
        _id: invitedFreelancer,
        role: { $in: ["Freelancer", "freelancer"] },
        isActive: true,
      });
      if (!freelancerUser) {
        return res
          .status(400)
          .json({ message: "Freelancer not found or inactive" });
      }
    }

    const isInvite = Boolean(freelancerUser);
    const status = isInvite ? "Invited" : "Created";

    const newContract = new Contract({
      client: req.user._id,
      title,
      description,
      amount,
      deadline,
      freelancer: null,
      status,
      isPublic: !isInvite,
      invitation: isInvite
        ? {
            invitedFreelancer: freelancerUser._id,
            status: "Pending",
            declineReason: null,
            respondedAt: null,
          }
        : undefined,
    });

    await newContract.save();

    // Send notification to freelancer if invited
    if (freelancerUser) {
      await NotificationController.createNotification(
        freelancerUser._id,
        "CONTRACT_INVITED",
        "New Contract Invitation",
        `You have been invited to work on "${title}" by ${req.user.username || req.user.name}`,
        { contract: newContract._id },
      );
    }

    res
      .status(201)
      .json({ message: "Contract created successfully", newContract });
  } catch (error) {
    console.error("createContract error", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contracts = await Contract.find({
      client: req.user._id,
      isDeleted: { $ne: true },
    })
      .populate({ path: "freelancer", select: "username email name" })
      .populate({
        path: "applications.freelancer",
        select: "username email name",
      })
      .sort({ createdAt: -1 });
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.assignFreelancer = async (req, res) => {
  try {
    const { freelancerId, allowWithoutApplication } = req.body;
    const contractId = req.params.id;
    const User = require("../Model/User");

    const freelancerUser = await User.findOne({
      _id: freelancerId,
      role: { $in: ["Freelancer", "freelancer"] },
      isActive: true,
    });
    if (!freelancerUser) {
      return res
        .status(400)
        .json({ message: "Freelancer not found or inactive" });
    }

    const existingContract = await Contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (existingContract.isDeleted) {
      return res.status(400).json({ message: "Contract is deleted" });
    }
    if (existingContract.isDeleted) {
      return res.status(400).json({ message: "Contract is deleted" });
    }
    if (existingContract.isDeleted) {
      return res.status(400).json({ message: "Contract is deleted" });
    }
    if (existingContract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (!["Created", "Assigned", "Invited"].includes(existingContract.status)) {
      return res.status(400).json({
        message:
          "Freelancer can only be assigned on Created/Assigned/Invited contracts",
      });
    }

    const hasApplied = existingContract.applications.some(
      (app) => app.freelancer.toString() === freelancerId,
    );
    if (!hasApplied && !allowWithoutApplication) {
      return res.status(400).json({
        message:
          "Freelancer has not applied to this contract. Pass allowWithoutApplication to override.",
      });
    }

    existingContract.freelancer = freelancerId;
    existingContract.status = "Assigned";
    existingContract.isPublic = false;
    existingContract.updatedAt = Date.now();
    existingContract.invitation = {
      invitedFreelancer: freelancerId,
      status: "Accepted",
      declineReason: null,
      respondedAt: Date.now(),
    };
    await existingContract.save();

    // Send notification to freelancer
    await NotificationController.createNotification(
      freelancerId,
      "CONTRACT_ASSIGNED",
      "Contract Assigned",
      `You have been assigned to "${existingContract.title}"`,
      { contract: existingContract._id },
    );

    res
      .status(200)
      .json({ message: "Freelancer assigned successfully", existingContract });
  } catch (error) {
    console.error("assignFreelancer error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update contract details before funding
exports.updateContract = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { title, description, amount, deadline } = req.body;

    const existingContract = await Contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (existingContract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (!isEditableStatus(existingContract)) {
      return res
        .status(400)
        .json({ message: "Contract can only be edited before funding" });
    }

    if (typeof title === "string") existingContract.title = title;
    if (typeof description === "string")
      existingContract.description = description;
    if (typeof amount !== "undefined") existingContract.amount = amount;
    if (typeof deadline !== "undefined") existingContract.deadline = deadline;
    existingContract.updatedAt = Date.now();

    await existingContract.save();

    // Notify assigned freelancer, if any
    if (existingContract.freelancer) {
      await NotificationController.createNotification(
        existingContract.freelancer,
        "CONTRACT_UPDATED",
        "Contract Updated",
        `Contract "${existingContract.title}" has been updated by the client`,
        { contract: existingContract._id },
      );
    }

    res
      .status(200)
      .json({ message: "Contract updated", contract: existingContract });
  } catch (error) {
    console.error("updateContract error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a contract before funding
exports.deleteContract = async (req, res) => {
  try {
    const contractId = req.params.id;
    const existingContract = await Contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (existingContract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (existingContract.isDeleted) {
      return res.status(400).json({ message: "Contract already deleted" });
    }
    if (!["Created", "Invited"].includes(existingContract.status)) {
      return res.status(400).json({
        message: "Contract can only be deleted before assignment/funding",
      });
    }

    // Notify assigned freelancer about cancellation
    if (existingContract.freelancer) {
      await NotificationController.createNotification(
        existingContract.freelancer,
        "CONTRACT_CANCELLED",
        "Contract Cancelled",
        `Contract "${existingContract.title}" has been cancelled by the client`,
        { contract: existingContract._id },
      );
    }

    existingContract.isDeleted = true;
    existingContract.isPublic = false;
    existingContract.isHidden = true;
    existingContract.updatedAt = Date.now();
    await existingContract.save();

    res.status(200).json({ message: "Contract deleted" });
  } catch (error) {
    console.error("deleteContract error", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.fundContract = async (req, res) => {
  try {
    const contract = req.contract;
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Ensure requester is the client
    if ((req.user?.role || "").toLowerCase() !== "client") {
      return res.status(403).json({ message: "Forbidden: Clients only" });
    }
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (contract.isDeleted) {
      return res.status(400).json({ message: "Contract is deleted" });
    }
    if (contract.status !== "Assigned") {
      return res
        .status(400)
        .json({ message: "Contract must be in Assigned status to fund" });
    }
    if (contract.escrow?.status === "Funded") {
      return res.status(400).json({ message: "Contract already funded" });
    }

    const transactionId = `txn_${Math.random().toString(36).slice(2, 10)}`;
    const fundedAt = new Date();

    contract.status = "Funded";
    contract.escrowStatus = "Funded"; // maintain legacy field
    contract.fundedAt = fundedAt;
    contract.updatedAt = fundedAt;
    contract.escrow = {
      amount: contract.amount,
      fundedAt,
      transactionId,
      status: "Funded",
    };
    await contract.save();

    // Notify freelancer
    if (contract.freelancer) {
      await NotificationController.createNotification(
        contract.freelancer,
        "CONTRACT_FUNDED",
        "Contract Funded",
        `The contract "${contract.title}" has been funded. You can now start working.`,
        { contract: contract._id },
      );
    }

    res.status(200).json({ message: "Contract funded successfully", contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Freelancer requests contract revision (pre-funding)
exports.requestRevision = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { proposedAmount, proposedRequirements } = req.body;

    const existingContract = await Contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (existingContract.isDeleted) {
      return res.status(400).json({ message: "Contract is deleted" });
    }
    if (existingContract.freelancer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (existingContract.status !== "Assigned") {
      return res
        .status(400)
        .json({ message: "Revisions allowed only on Assigned contracts" });
    }
    if (
      [
        "Funded",
        "Submitted",
        "Approved",
        "Paid",
        "Disputed",
        "Resolved",
      ].includes(existingContract.status)
    ) {
      return res
        .status(400)
        .json({ message: "Cannot request revision after funding" });
    }
    if (existingContract.revisionRequest?.status === "Pending") {
      return res.status(400).json({ message: "Revision already pending" });
    }

    existingContract.revisionRequest = {
      proposedAmount,
      proposedRequirements,
      status: "Pending",
      requestedAt: Date.now(),
    };
    existingContract.updatedAt = Date.now();
    await existingContract.save();

    await NotificationController.createNotification(
      existingContract.client,
      "CONTRACT_UPDATED",
      "Revision Requested",
      `${req.user.username || req.user.name || "Freelancer"} requested changes on "${existingContract.title}"`,
      { contract: existingContract._id },
    );

    res.status(200).json({
      message: "Revision request submitted",
      contract: existingContract,
    });
  } catch (error) {
    console.error("requestRevision error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Client responds to revision request
exports.respondRevision = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { action } = req.body; // approve | reject

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const existingContract = await Contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (existingContract.isDeleted) {
      return res.status(400).json({ message: "Contract is deleted" });
    }
    if (existingContract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (existingContract.revisionRequest?.status !== "Pending") {
      return res.status(400).json({ message: "No pending revision" });
    }
    if (
      [
        "Funded",
        "Submitted",
        "Approved",
        "Paid",
        "Disputed",
        "Resolved",
      ].includes(existingContract.status)
    ) {
      return res.status(400).json({ message: "Cannot respond after funding" });
    }

    if (action === "approve") {
      if (existingContract.revisionRequest.proposedAmount != null) {
        existingContract.amount =
          existingContract.revisionRequest.proposedAmount;
      }
      if (existingContract.revisionRequest.proposedRequirements) {
        existingContract.description =
          existingContract.revisionRequest.proposedRequirements;
      }
      existingContract.revisionRequest.status = "Approved";
    } else {
      existingContract.revisionRequest.status = "Rejected";
    }
    existingContract.updatedAt = Date.now();
    await existingContract.save();

    // Notify freelancer
    if (existingContract.freelancer) {
      await NotificationController.createNotification(
        existingContract.freelancer,
        "CONTRACT_UPDATED",
        action === "approve" ? "Revision Approved" : "Revision Rejected",
        action === "approve"
          ? `Your revision for "${existingContract.title}" was approved.`
          : `Your revision for "${existingContract.title}" was rejected.`,
        { contract: existingContract._id },
      );
    }

    res
      .status(200)
      .json({ message: `Revision ${action}d`, contract: existingContract });
  } catch (error) {
    console.error("respondRevision error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Freelancer responds to an invitation (accept/decline)
exports.respondInvite = async (req, res) => {
  try {
    const { action, reason } = req.body; // action: "accept" | "decline"
    const contractId = req.params.id;

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const existingContract = await Contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const invitedId =
      existingContract?.invitation?.invitedFreelancer?.toString();
    if (!invitedId || invitedId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (existingContract.status !== "Invited") {
      return res
        .status(400)
        .json({ message: "Invitation is no longer active" });
    }
    if (existingContract.invitation?.status !== "Pending") {
      return res.status(400).json({ message: "Invitation already responded" });
    }

    if (action === "accept") {
      existingContract.status = "Assigned";
      existingContract.freelancer = req.user._id;
      existingContract.isPublic = false;
      existingContract.invitation.status = "Accepted";
      existingContract.invitation.declineReason = null;
      existingContract.invitation.respondedAt = Date.now();
      existingContract.acceptedAt = Date.now();
      existingContract.updatedAt = Date.now();

      await existingContract.save();

      // Notify client
      await NotificationController.createNotification(
        existingContract.client,
        "CONTRACT_ASSIGNED",
        "Invitation Accepted",
        `${req.user.username || req.user.name || "Freelancer"} accepted your invitation for "${existingContract.title}"`,
        { contract: existingContract._id },
      );

      return res
        .status(200)
        .json({ message: "Invitation accepted", contract: existingContract });
    }

    // decline
    existingContract.status = "Created";
    existingContract.freelancer = null;
    existingContract.isPublic = true;
    existingContract.invitation.status = "Declined";
    existingContract.invitation.declineReason = reason || "No reason provided";
    existingContract.invitation.respondedAt = Date.now();
    existingContract.declinedAt = Date.now();
    existingContract.updatedAt = Date.now();

    await existingContract.save();

    await NotificationController.createNotification(
      existingContract.client,
      "CONTRACT_INVITED",
      "Invitation Declined",
      `${req.user.username || req.user.name || "Freelancer"} declined your invitation for "${existingContract.title}"`,
      { contract: existingContract._id },
    );

    return res.status(200).json({
      message: "Invitation declined and contract reopened to marketplace",
      contract: existingContract,
    });
  } catch (error) {
    console.error("respondInvite error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch pending invitations for a freelancer
exports.getInvitedContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      status: "Invited",
      "invitation.invitedFreelancer": req.user._id,
      "invitation.status": "Pending",
      isDeleted: { $ne: true },
    })
      .populate({ path: "client", select: "username email name" })
      .sort({ createdAt: -1 });

    res.status(200).json(contracts);
  } catch (error) {
    console.error("getInvitedContracts error", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveWork = async (req, res) => {
  try {
    const contractId = req.params.id;
    const existingContract = await Contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (existingContract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (existingContract.status === "Disputed") {
      return res
        .status(400)
        .json({ message: "Cannot approve a disputed contract" });
    }
    if (existingContract.status !== "Submitted") {
      return res
        .status(400)
        .json({ message: "Only Submitted contracts can be approved" });
    }
    existingContract.status = "Approved";
    existingContract.approvedAt = Date.now();
    existingContract.updatedAt = Date.now();
    // web3 hooks will go here later
    existingContract.status = "Paid";
    existingContract.paidAt = Date.now();
    await existingContract.save();

    // Notify freelancer
    if (existingContract.freelancer) {
      await NotificationController.createNotification(
        existingContract.freelancer,
        "PAYMENT_RELEASED",
        "Work Approved & Payment Released",
        `Your work on "${existingContract.title}" has been approved and payment has been released!`,
        { contract: existingContract._id },
      );
    }

    res
      .status(200)
      .json({ message: "Work approved successfully", existingContract });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.getMarketplaceContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      status: "Created",
      isPublic: true,
      isDeleted: { $ne: true },
      freelancer: null,
      deadline: { $gt: new Date() },
    })
      .populate({ path: "client", select: "username email name" })
      .sort({ createdAt: -1 });

    // Add hasApplied flag for the requesting user
    const userId = req.user?._id?.toString();

    res.status(200).json(
      contracts.map((c) => ({
        ...c.toObject(),
        applicationsCount: c.applications.length,
        hasApplied: userId
          ? c.applications.some((app) => app.freelancer.toString() === userId)
          : false,
      })),
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserContractStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const contracts = await Contract.find({
      freelancer: userId,
      status: {
        $in: [
          "Assigned",
          "Funded",
          "Submitted",
          "Approved",
          "Paid",
          "Disputed",
          "Resolved",
        ],
      },
    })
      .populate({ path: "client", select: "username email name" })
      .sort({ createdAt: -1 })
      .limit(10);

    const completedContracts = contracts.filter(
      (c) => c.status === "Paid",
    ).length;
    const totalEarnings = contracts
      .filter((c) => c.status === "Paid")
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const disputes = contracts.filter((c) => c.status === "Disputed").length;

    res.status(200).json({
      completedContracts,
      totalEarnings,
      disputes,
      recentContracts: contracts.slice(0, 5),
    });
  } catch (error) {
    console.error("[ContractController] GetUserContractStats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
