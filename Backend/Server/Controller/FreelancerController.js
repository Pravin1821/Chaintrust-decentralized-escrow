const contract = require("../Model/Contract");

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
      .find({ freelancer: req.user._id, status: { $in: statuses } })
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
    res
      .status(200)
      .json({ message: "Work submitted successfully", existingContract });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.getConntractById = async (req, res) => {
  try {
    const contractId = req.params.id;
    const existingContract = await contract
      .findOne({ _id: contractId, freelancer: req.user._id })
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
    if (existingContract.status !== "Created") {
      return res
        .status(400)
        .json({ message: "Can only apply to Created contracts" });
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
      role: "freelancer",
      isActive: true,
    }).select("-password");

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

        return {
          ...freelancer.toObject(),
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
