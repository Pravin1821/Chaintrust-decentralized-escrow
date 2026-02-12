const contract = require("../Model/Contract");
const NotificationController = require("./NotificationController");

exports.getAssignedContracts = async (req, res) => {
  try {
    const statuses = [
      "Assigned",
      "Funded",
      "Submitted",
      "Approved",
      "Paid",
      "Disputed",
      "Resolved",
    ];
    const contracts = await contract
      .find({
        freelancer: req.user._id,
        status: { $in: statuses },
        isDeleted: { $ne: true },
      })
      .populate({ path: "client", select: "username email name" })
      .sort({ createdAt: -1 });
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.submitWork = async (req, res) => {
  try {
    const { contractId, ipfsHash } = req.body;
    if (!ipfsHash) {
      return res.status(400).json({ message: "IPFS hash is required" });
    }
    const existingContract = await contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (existingContract.isDeleted) {
      return res.status(400).json({ message: "Contract is deleted" });
    }
    if (existingContract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (existingContract.status === "Disputed") {
      return res
        .status(400)
        .json({ message: "Cannot submit work on a disputed contract" });
    }
    if (existingContract.status !== "Funded") {
      return res
        .status(400)
        .json({ message: "Work can only be submitted for Funded contracts" });
    }
    existingContract.ipfsHash = ipfsHash;
    existingContract.status = "Submitted";
    existingContract.submittedAt = Date.now();
    existingContract.updatedAt = Date.now();
    await existingContract.save();

    // Notify client
    await NotificationController.createNotification(
      existingContract.client,
      "WORK_SUBMITTED",
      "Work Submitted for Review",
      `${req.user.username || req.user.name} has submitted work for "${existingContract.title}"`,
      { contract: existingContract._id },
    );

    res
      .status(200)
      .json({ message: "Work submitted successfully", existingContract });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Accept an invitation to an assigned contract
exports.acceptInvitation = async (req, res) => {
  try {
    const contractId = req.params.id;
    const existingContract = await contract.findById(contractId);
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

    existingContract.status = "Assigned";
    existingContract.freelancer = req.user._id;
    existingContract.isPublic = false;
    existingContract.invitation.status = "Accepted";
    existingContract.invitation.declineReason = null;
    existingContract.invitation.respondedAt = Date.now();
    existingContract.acceptedAt = Date.now();
    existingContract.updatedAt = Date.now();
    await existingContract.save();

    // Notify client that invite was accepted
    await NotificationController.createNotification(
      existingContract.client,
      "CONTRACT_ASSIGNED",
      "Invitation Accepted",
      `${req.user.username || req.user.name || "Freelancer"} accepted your invitation for "${existingContract.title}"`,
      { contract: existingContract._id },
    );

    res.status(200).json({
      message: "Invitation accepted",
      contract: existingContract,
    });
  } catch (error) {
    console.error("acceptInvitation error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Decline an invitation and reopen the contract to the marketplace
exports.declineInvitation = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { reason } = req.body;
    const existingContract = await contract.findById(contractId);
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
        .json({ message: "Only active invitations can be declined" });
    }
    if (existingContract.invitation?.status !== "Pending") {
      return res.status(400).json({ message: "Invitation already responded" });
    }

    existingContract.freelancer = null;
    existingContract.status = "Created";
    existingContract.isPublic = true;
    existingContract.invitation.status = "Declined";
    existingContract.invitation.declineReason = reason || "No reason provided";
    existingContract.invitation.respondedAt = Date.now();
    existingContract.declinedAt = Date.now();
    existingContract.acceptedAt = null;
    existingContract.updatedAt = Date.now();
    await existingContract.save();

    // Notify client that invite was declined
    await NotificationController.createNotification(
      existingContract.client,
      "CONTRACT_INVITED",
      "Invitation Declined",
      `${req.user.username || req.user.name || "Freelancer"} declined your invitation for "${existingContract.title}"`,
      { contract: existingContract._id },
    );

    res.status(200).json({
      message: "Invitation declined and contract reopened",
      contract: existingContract,
    });
  } catch (error) {
    console.error("declineInvitation error", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getConntractById = async (req, res) => {
  try {
    const contractId = req.params.id;
    const existingContract = await contract
      .findOne({
        _id: contractId,
        freelancer: req.user._id,
        isDeleted: { $ne: true },
      })
      .populate({ path: "client", select: "username email name" });
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.status(200).json(existingContract);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.applyToContract = async (req, res) => {
  try {
    const contractId = req.params.id;
    const freelancerId = req.user._id;
    const existingContract = await contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (existingContract.isDeleted) {
      return res.status(400).json({ message: "Contract is deleted" });
    }
    if (existingContract.status !== "Created") {
      return res
        .status(400)
        .json({ message: "Can only apply to Created contracts" });
    }
    if (existingContract.isPublic === false) {
      return res.status(400).json({ message: "Contract is not public" });
    }
    const hasApplied = existingContract.applications.some(
      (app) => app.freelancer.toString() === freelancerId,
    );
    if (hasApplied) {
      return res
        .status(400)
        .json({ message: "You have already applied to this contract" });
    }
    existingContract.applications.push({ freelancer: freelancerId });
    await existingContract.save();

    // Notify client
    await NotificationController.createNotification(
      existingContract.client,
      "APPLICATION_RECEIVED",
      "New Contract Application",
      `${req.user.username || req.user.name} has applied to your contract "${existingContract.title}"`,
      { contract: existingContract._id },
    );

    res
      .status(200)
      .json({ message: "Applied to contract successfully", existingContract });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFreelancerList = async (req, res) => {
  try {
    const User = require("../Model/User");
    const freelancers = await User.find({
      role: { $in: ["Freelancer", "freelancer"] },
      isActive: true,
    }).select("-password -phone -phoneNumber -isPhoneVerified");

    // Enrich with stats from contracts
    const enrichedFreelancers = await Promise.all(
      freelancers.map(async (freelancer) => {
        const contracts = await contract.find({
          freelancer: freelancer._id,
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
        });

        const completedContracts = contracts.filter(
          (c) => c.status === "Paid",
        ).length;
        const totalEarnings = contracts
          .filter((c) => c.status === "Paid")
          .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
        const disputes = contracts.filter(
          (c) => c.status === "Disputed",
        ).length;

        const plain = freelancer.toObject();
        const repScore = Number(plain.reputation?.score ?? plain.reputation) || 0;
        const repLevel = plain.reputation?.level || "New";

        return {
          ...plain,
          reputation: { score: repScore, level: repLevel },
          reputationScore: repScore,
          reputationLevel: repLevel,
          completedContracts,
          totalEarnings,
          disputes,
        };
      }),
    );

    res.status(200).json(enrichedFreelancers);
  } catch (error) {
    console.error("[FreelancerController] GetFreelancerList error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
