const bcrypt = require('bcryptjs')
const prisma = require('../utils/prisma')
const authService = require('../services/authService')

const authController = {
  async register(req, res) {
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
  },

  // 修改密码
  async changePassword(req, res) {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ code: 400, message: '请填写旧密码和新密码' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ code: 400, message: '新密码至少6位' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) {
      return res.status(400).json({ code: 400, message: '旧密码错误' })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } })
    res.json({ code: 0, data: null, message: '密码修改成功' })
  },

  // 浏览记录（最近浏览的文档，按阅读量排序取用户收藏+最近文档）
  async getHistory(req, res) {
    // 获取最近阅读过的文档（通过评论、收藏间接推断 + 最新文档）
    const [favorites, recentDocs] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: req.user.id },
        include: {
          document: {
            select: {
              id: true, title: true, summary: true, viewCount: true, createdAt: true,
              category: { select: { id: true, name: true, icon: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.document.findMany({
        take: 10,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true, title: true, summary: true, viewCount: true, createdAt: true,
          category: { select: { id: true, name: true, icon: true } }
        }
      })
    ])

    res.json({
      code: 0,
      data: {
        favorites: favorites.map(f => f.document),
        recentDocs
      },
      message: 'success'
    })
  }
}

module.exports = authController
