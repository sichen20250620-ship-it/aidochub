const chatService = require('../services/chatService')
const { getAIStatus } = require('../services/ai')

const chatController = {
  // AI 对话（JSON 响应）
  async chat(req, res) {
    const { question, history } = req.body
    if (!question?.trim()) {
      return res.status(400).json({ code: 400, message: '请输入问题' })
    }

    try {
      const result = await chatService.chatJSON({ question: question.trim(), history })
      res.json({ code: 0, data: result, message: 'success' })
    } catch (err) {
      console.error('[Chat] 错误:', err.message)
      res.status(500).json({ code: 500, message: err.message || 'AI 调用失败' })
    }
  },

  // 获取 AI 状态
  status(req, res) {
    res.json({ code: 0, data: getAIStatus(), message: 'success' })
  }
}

module.exports = chatController
