const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/AuthMiddleware");
const { authorizeRoles } = require("../Middleware/RoleMiddleware");
const User = require("../Model/User");

// Get all users (Admin only)
router.get("/", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

// Update user status (Admin only)
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      // Prevent admin from modifying their own account
      if (id === req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "You cannot modify your own account status" });
      }

      const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, select: "-password" },
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User status updated successfully", user });
    } catch (error) {
      console.error("Error updating user status:", error);
      res
        .status(500)
        .json({
          message: "Failed to update user status",
          error: error.message,
        });
    }
  },
);

module.exports = router;
