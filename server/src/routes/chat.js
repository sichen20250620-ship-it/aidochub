const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')
const { authRequired } = require('../middleware/auth')

// AI 对话（流式）
router.post('/', authRequired, chatController.chat)

// AI 状态查询
router.get('/status', authRequired, chatController.status)

module.exports = router
