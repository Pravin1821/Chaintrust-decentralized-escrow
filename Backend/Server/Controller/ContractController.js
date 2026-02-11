const Contract = require("../Model/Contract");

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
        role: "Freelancer",
        isActive: true,
      });
      if (!freelancerUser) {
        return res
          .status(400)
          .json({ message: "Freelancer not found or inactive" });
      }
    }

    const status = freelancerUser ? "Assigned" : "Created";

    const newContract = new Contract({
      client: req.user._id,
      title,
      description,
      amount,
      deadline,
      freelancer: freelancerUser ? freelancerUser._id : null,
      status,
    });

    await newContract.save();
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
    const contracts = await Contract.find({ client: req.user._id })
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
      role: "Freelancer",
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
    if (existingContract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (!["Created", "Assigned"].includes(existingContract.status)) {
      return res.status(400).json({
        message:
          "Freelancer can only be assigned on Created/Assigned contracts",
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
    existingContract.updatedAt = Date.now();
    await existingContract.save();
    res
      .status(200)
      .json({ message: "Freelancer assigned successfully", existingContract });
  } catch (error) {
    console.error("assignFreelancer error", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.fundContract = async (req, res) => {
  try {
    const contract = req.contract;
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (contract.escrowStatus === "Funded") {
      return res.status(400).json({ message: "Contract already funded" });
    }
    if (contract.status === "Disputed") {
      return res
        .status(400)
        .json({ message: "Cannot fund a disputed contract" });
    }
    contract.status = "Funded";
    contract.escrowStatus = "Funded";
    contract.fundedAt = Date.now();
    contract.updatedAt = Date.now();
    await contract.save();
    res.status(200).json({ message: "Contract funded successfully", contract });
  } catch (error) {
    console.error(error);
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
