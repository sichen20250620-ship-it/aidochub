const authService = require('../services/authService')

const authController = {
  async register(req, res) {
    try {
      const { email, username, password } = req.body
      if (!email || !username || !password) {
        return res.status(400).json({ code: 400, message: '请填写完整信息' })
      }
      const result = await authService.register({ email, username, password })
      res.json({ code: 0, data: result, message: '注册成功' })
    } catch (err) {
      res.status(400).json({ code: 400, message: err.message })
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({ code: 400, message: '请填写邮箱和密码' })
      }
      const result = await authService.login({ email, password })
      res.json({ code: 0, data: result, message: '登录成功' })
    } catch (err) {
      res.status(400).json({ code: 400, message: err.message })
    }
  },

  async getProfile(req, res) {
    const user = await authService.getUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' })
    }
    res.json({ code: 0, data: user, message: 'success' })
  }
}

module.exports = authController
