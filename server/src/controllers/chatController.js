const chatService = require('../services/chatService')
const { getAIStatus } = require('../services/ai')

const chatController = {
  // AI 对话（SSE 流式）
  async chat(req, res) {
    const { question, history } = req.body
    if (!question?.trim()) {
      return res.status(400).json({ code: 400, message: '请输入问题' })
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // 客户端断开时清理
    req.on('close', () => res.end())

    await chatService.chat({ question: question.trim(), history }, res)
  },

  // 获取 AI 状态
  status(req, res) {
    res.json({ code: 0, data: getAIStatus(), message: 'success' })
  }
}

module.exports = chatController
