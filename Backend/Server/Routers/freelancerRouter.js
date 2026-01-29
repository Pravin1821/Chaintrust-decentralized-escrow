const express = require("express");
const router = express.Router();
const {
  getAssignedContracts,
  submitWork,
  getConntractById,
  applyToContract,
} = require("../Controller/FreelancerController");
const { protect } = require("../Middleware/AuthMiddleware");
const { authorizeRoles } = require("../Middleware/RoleMiddleware");
const {
  enforceContractState,
} = require("../Middleware/ContractStateMiddleware");
router.use(protect);
router.use(authorizeRoles("freelancer"));
router.get("/assignedContracts", getAssignedContracts);
router.post("/submitWork", enforceContractState("Funded"), submitWork);
router.get("/contract/:id", getConntractById);
router.post("/apply/:id", applyToContract);

module.exports = router;
