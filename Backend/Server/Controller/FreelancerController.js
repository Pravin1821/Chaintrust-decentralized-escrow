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
