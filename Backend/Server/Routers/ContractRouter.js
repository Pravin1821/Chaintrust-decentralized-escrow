const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/AuthMiddleware");
const { authorizeRoles } = require("../Middleware/RoleMiddleware");
const contractController = require("../Controller/ContractController");
const {
  enforceContractState,
} = require("../Middleware/ContractStateMiddleware");
router.post(
  "/createContract",
  protect,
  authorizeRoles("Client"),
  contractController.createContract,
);
router.get(
  "/getContracts",
  protect,
  authorizeRoles("Client"),
  contractController.getContractById,
);
router.get("/", protect, async (req, res) => {
  try {
    const Contract = require("../Model/Contract");
    const { status, admin } = req.query;

    let query = {};

    // If status is specified, filter by status
    if (status) {
      query.status = status;
    }

    // If admin=true, return all contracts (admin view)
    // Otherwise, filter by user
    if (admin !== "true") {
      const userId = req.user._id;
      query.$or = [{ client: userId }, { freelancer: userId }];
    }

    const contracts = await Contract.find(query)
      .populate("client", "username email")
      .populate("freelancer", "username email")
      .sort({ createdAt: -1 });

    // Transform to match frontend expectations
    const transformedContracts = contracts.map((contract) => ({
      ...contract.toObject(),
      clientId: contract.client,
      freelancerId: contract.freelancer,
      escrowAmount: contract.amount,
    }));

    res.json(transformedContracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.post(
  "/assignFreelancer/:id",
  protect,
  authorizeRoles("Client"),
  contractController.assignFreelancer,
);
router.post(
  "/fundContract/:id",
  protect,
  authorizeRoles("Client"),
  enforceContractState("Assigned"),
  contractController.fundContract,
);
router.post(
  "/approveWork/:id",
  protect,
  authorizeRoles("Client"),
  enforceContractState("Submitted"),
  contractController.approveWork,
);
router.get(
  "/marketpalce",
  protect,
  authorizeRoles("Freelancer"),
  contractController.getMarketplaceContracts,
);
router.get(
  "/user/:userId/stats",
  protect,
  contractController.getUserContractStats,
);

// Admin moderation routes
router.patch(
  "/:id/moderate",
  protect,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { action } = req.body;

      if (!["flag", "hide", "restore"].includes(action)) {
        return res
          .status(400)
          .json({
            message: "Invalid action. Must be 'flag', 'hide', or 'restore'",
          });
      }

      const Contract = require("../Model/Contract");
      const contract = await Contract.findById(id);

      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      switch (action) {
        case "flag":
          contract.isFlagged = true;
          break;
        case "hide":
          contract.isHidden = true;
          break;
        case "restore":
          contract.isFlagged = false;
          contract.isHidden = false;
          break;
      }

      await contract.save();

      res.json({ message: `Contract ${action}ed successfully`, contract });
    } catch (error) {
      console.error("Error moderating contract:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

module.exports = router;
