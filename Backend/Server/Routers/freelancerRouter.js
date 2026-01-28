const express = require("express");
const router = express.Router();
const {
  getAssignedContracts,
  submitWork,
  getConntractById,
    applyToContract
} = require("../Controller/FreelancerController");
const { protect } = require("../Middleware/AuthMiddleware");
const { authorizeRoles } = require("../Middleware/RoleMiddleware");

router.use(protect);
router.use(authorizeRoles("freelancer"));
router.get("/assignedContracts", getAssignedContracts);
router.post("/submitWork", submitWork);
router.get("/contract/:id", getConntractById);
router.post("/apply/:id", applyToContract);

module.exports = router;
