const validateStateTransition = require("../utils/ValidateStateTransition");
const Contract = require("../Model/Contract");

exports.enforceContractState = (requiredState) => {
  return async (req, res, next) => {
    try {
      const contractId = req.params.id || req.body.contractId;
      const contract = await Contract.findById(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      if (contract.status !== requiredState) {
        return res
          .status(400)
          .json({
            message: `Invalid action. Required state: ${requiredState}, Current state: ${contract.status}`,
          });
      }
      req.contract = contract;
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
};
