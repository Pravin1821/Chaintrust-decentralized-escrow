const express = require('express');
const router = express.Router();
const authController = require('../Controller/AuthController');
router.post('/register', authController.register);
router.post('/login', authController.login);
router.patch('/update', authController.update);
router.get('/profile', authController.getProfile);
module.exports = router;