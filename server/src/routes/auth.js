const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { authRequired } = require('../middleware/auth')

// 注册
router.post('/register', authController.register)

// 登录
router.post('/login', authController.login)

// 获取当前用户信息（需登录）
router.get('/profile', authRequired, authController.getProfile)

// 修改密码
router.put('/password', authRequired, authController.changePassword)

// 浏览记录
router.get('/history', authRequired, authController.getHistory)

module.exports = router
