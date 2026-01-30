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
  authorizeRoles("client", "freelancer"),
  raiseDispute,
);
router.post("/resolve", protect, authorizeRoles("admin"), resolveDispute);
router.get("/all", protect, authorizeRoles("admin"), getAllDisputes);
router.get(
  "/my",
  protect,
  authorizeRoles("client", "freelancer"),
  getMyDisputes,
);

module.exports = router;
