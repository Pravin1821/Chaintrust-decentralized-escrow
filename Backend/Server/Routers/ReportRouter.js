const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/AuthMiddleware");
const { authorizeRoles } = require("../Middleware/RoleMiddleware");
const ReportController = require("../Controller/ReportController");

// Create report (client or freelancer on related contract)
router.post(
  "/",
  protect,
  authorizeRoles("Client", "Freelancer"),
  ReportController.createReport,
);

// Admin: list reports with optional ?status=
router.get("/", protect, authorizeRoles("Admin"), ReportController.listReports);

// Admin: update status (Pending/Reviewed/Dismissed)
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("Admin"),
  ReportController.updateStatus,
);

// Admin: suspend a user referenced in a report
router.post(
  "/:id/suspend",
  protect,
  authorizeRoles("Admin"),
  ReportController.suspendUser,
);

module.exports = router;
