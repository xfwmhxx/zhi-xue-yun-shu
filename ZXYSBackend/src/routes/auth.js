const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 发送验证码
router.post('/send-code', authController.sendCode);

// 注册
router.post('/register', authController.register);

// 登录
router.post('/login', authController.login);

// 用户初始化
router.post('/initialize', authController.initializeUser);

module.exports = router;