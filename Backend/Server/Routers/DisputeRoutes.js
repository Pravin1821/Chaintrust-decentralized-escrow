const express = require("express");
const router = express.Router();
const { raiseDispute } = require("../Controller/DisputeController");
const { resolveDispute } = require("../Controller/DisputeController");
const { getAllDisputes } = require("../Controller/DisputeController");
const { protect } = require("../Middleware/AuthMiddleware");
const { authorizeRoles } = require("../Middleware/RoleMiddleware");

router.post("/raiseDispute", protect, authorizeRoles("client", "freelancer"), raiseDispute);
router.post("/resolve", protect, authorizeRoles("admin"), resolveDispute);
router.get("/all", protect, authorizeRoles("admin"), getAllDisputes);

module.exports = router;