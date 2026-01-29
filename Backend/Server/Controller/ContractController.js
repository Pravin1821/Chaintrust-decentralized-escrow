const Contract = require("../Model/Contract");

exports.createContract = async (req, res) => {
  try {
    const { title, description, amount, deadline } = req.body;
    const newContract = new Contract({
      client: req.user._id,
      title,
      description,
      amount,
      deadline,
    });
    await newContract.save();
    res
      .status(201)
      .json({ message: "Contract created successfully", newContract });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contracts = await Contract.find({ client: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.assignFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const contractId = req.params.id;
    const existingContract = await Contract.findById(contractId);
    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (existingContract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (existingContract.status !== "Created") {
      return res.status(400).json({
        message: "Freelancer can only be assigned to Created contracts",
      });
    }
    const hasApplied = existingContract.applications.some(
      (app) => app.freelancer.toString() === freelancerId,
    );
    if (!hasApplied) {
      return res
        .status(400)
        .json({ message: "Freelancer has not applied to this contract" });
    }
    existingContract.freelancer = freelancerId;
    existingContract.status = "Assigned";
    existingContract.updatedAt = Date.now();
    await existingContract.save();
    res
      .status(200)
      .json({ message: "Freelancer assigned successfully", existingContract });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.fundContract = async (req, res) => {
  try {
    const contract = req.contract;
    if(contract.client.toString() !== req.user._id.toString()){
        return res.status(403).json({message: "Unauthorized"});
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
