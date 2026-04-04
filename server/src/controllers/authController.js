const authService = require('../services/authService')

const authController = {
  async register(req, res) {
    // 自主注册已关闭，请联系管理员创建账号
    return res.status(403).json({ code: 403, message: '注册已关闭，请联系管理员创建账号' })
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
