const Dispute = require("../Model/Dispute");
const Contract = require("../Model/Contract");

exports.raiseDispute = async (req, res) => {
  try {
    const { contractID, reason, evidence = [] } = req.body;
    console.log("Incoming contractId:", contractID);
    if (!reason) {
      return res
        .status(400)
        .json({ message: "Reason for dispute is required" });
    }
    const contract = await Contract.findById(contractID);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (contract.dispute) {
      return res
        .status(400)
        .json({ message: "Dispute already exists for this contract" });
    }
    const userId = req.user._id.toString();
    let raisedBy = null;
    if (contract.client.toString() === userId) {
      raisedBy = "client";
    } else if (contract.freelancer?.toString() === userId) {
      raisedBy = "freelancer";
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized to raise dispute on this contract" });
    }
    if (!["Funded", "Submitted"].includes(contract.status)) {
      return res
        .status(400)
        .json({
          message:
            "Dispute can only be raised on Funded or Submitted contracts",
        });
    }
    const dispute = await Dispute.create({
      contract: contract._id,
      raisedBy,
      raisedByUser: req.user._id,
      reason,
      evidence,
    });
    contract.dispute = dispute._id;
    contract.status = "Disputed";
    await contract.save();
    res.status(201).json({ message: "Dispute raised successfully", dispute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const [disputeId, decision] = req.body;
    if (!["clientWins", "freelancerWins"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision value" });
    }
    const dispute = await Dispute.findById(disputeId);
    if (!dispute || dispute.status !== "Open") {
      return res
        .status(404)
        .json({ message: "Dispute not found or already resolved" });
    }
    const contarct = await Contract.findById(dispute.contract);
    if (!contarct) {
      return res.status(404).json({ message: "Associated contract not found" });
    }
    if (decision === "freelancerWins") {
      contarct.status = "Paid";
      contarct.paidAt = Date.now();
    } else {
      contarct.status = "Resolved";
    }
    dispute.status = "Resolved";
    dispute.resolution = decision;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = Date.now();
    await contarct.save();
    await dispute.save();
    res.status(200).json({ message: "Dispute resolved successfully", dispute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("contract")
      .populate("raisedByUser", "name email")
      .populate("resolvedBy", "name email");
    res.status(200).json({ disputes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyDisputes = async (req, res) => {
  try {
    const userId = req.user._id;
    const disputes = await Dispute.find({ raisedByUser: userId })
      .populate("contract")
      .sort({ createdAt: -1 });
    res.status(200).json({ disputes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
