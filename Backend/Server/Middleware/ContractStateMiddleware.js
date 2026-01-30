const validateStateTransition = require("../utils/ValidateStateTransition");
const Contract = require("../Model/Contract");

exports.enforceContractState = (requiredState) => {
  return async (req, res, next) => {
    try {
      const contractId = req.params.id || req.body.contractId;
      console.log('Enforcing contract state. Contract ID:', contractId, 'Required state:', requiredState);
      const contract = await Contract.findById(contractId);
      if (!contract) {
        console.log('Contract not found with ID:', contractId);
        return res.status(404).json({ message: "Contract not found" });
      }
      console.log('Contract found. Current status:', contract.status);
      if (contract.status !== requiredState) {
        return res
          .status(400)
          .json({
            message: `Invalid action. Required state: ${requiredState}, Current state: ${contract.status}`,
          });
      }
      if(contract.status === "Disputed"){
        return res.status(400).json({message: "Action cannot be performed on a disputed contract"});
      }
      req.contract = contract;
      next();
    } catch (error) {
      console.error('Error in enforceContractState:', error);
      res.status(500).json({ message: "Server error" });
    }
  };
};
