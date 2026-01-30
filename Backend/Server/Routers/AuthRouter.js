const express = require("express");
const router = express.Router();
const authController = require("../Controller/AuthController");
const { protect } = require("../Middleware/AuthMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", protect, authController.me);
router.patch("/update", protect, authController.update);
router.get("/profile", protect, authController.getProfile);
module.exports = router;
