const express = require("express");
const router = express.Router();
const NotificationController = require("../Controller/NotificationController");
const authMiddleware = require("../Middleware/AuthMiddleware");

// All notification routes require authentication
router.use(authMiddleware.protect);

// Get user notifications
router.get("/", NotificationController.getNotifications);

// Get unread count
router.get("/unread/count", NotificationController.getUnreadCount);

// Mark notification as read
router.patch("/:id/read", NotificationController.markAsRead);

// Mark all as read
router.patch("/read/all", NotificationController.markAllAsRead);

// Delete notification
router.delete("/:id", NotificationController.deleteNotification);

module.exports = router;
