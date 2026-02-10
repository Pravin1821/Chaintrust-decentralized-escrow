const express = require("express");
const router = express.Router();
const {
  raiseDispute,
  resolveDispute,
  getAllDisputes,
  getMyDisputes,
} = require("../Controller/DisputeController");
const { protect } = require("../Middleware/AuthMiddleware");
const { authorizeRoles } = require("../Middleware/RoleMiddleware");

router.post(
  "/raiseDispute",
  protect,
  authorizeRoles("Client", "Freelancer"),
  raiseDispute,
);
router.post("/resolve", protect, authorizeRoles("Admin"), resolveDispute);
router.post(
  "/:id/resolve",
  protect,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { resolution } = req.body;

      if (!["freelancer", "client"].includes(resolution)) {
        return res
          .status(400)
          .json({
            message:
              "Invalid resolution value. Must be 'freelancer' or 'client'",
          });
      }

      const Dispute = require("../Model/Dispute");
      const Contract = require("../Model/Contract");

      const dispute = await Dispute.findById(id).populate("contract");
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }

      if (dispute.status === "Resolved") {
        return res.status(400).json({ message: "Dispute already resolved" });
      }

      const contract = await Contract.findById(dispute.contract);
      if (!contract) {
        return res
          .status(404)
          .json({ message: "Associated contract not found" });
      }

      // Update dispute
      dispute.status = "Resolved";
      dispute.resolution =
        resolution === "freelancer" ? "freelancerWins" : "clientWins";
      dispute.resolvedBy = req.user._id;
      dispute.resolvedAt = Date.now();

      // Update contract based on resolution
      if (resolution === "freelancer") {
        contract.status = "Paid";
        contract.paidAt = Date.now();
      } else {
        contract.status = "Resolved";
      }

      await dispute.save();
      await contract.save();

      res.json({ message: "Dispute resolved successfully", dispute });
    } catch (error) {
      console.error("Error resolving dispute:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);
router.get("/", protect, authorizeRoles("Admin"), getAllDisputes);
router.get("/all", protect, authorizeRoles("Admin"), getAllDisputes);
router.get(
  "/my",
  protect,
  authorizeRoles("Client", "Freelancer"),
  getMyDisputes,
);

module.exports = router;
