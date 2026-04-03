const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../utils/prisma')

const authService = {
  async register({ email, username, password }) {
    // 检查邮箱是否已注册
    const existEmail = await prisma.user.findUnique({ where: { email } })
    if (existEmail) throw new Error('该邮箱已被注册')

    // 检查用户名是否已存在
    const existName = await prisma.user.findUnique({ where: { username } })
    if (existName) throw new Error('该用户名已被使用')

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword }
    })

    const token = this.generateToken(user)
    return { user: this.sanitizeUser(user), token }
  },

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('邮箱或密码错误')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('邮箱或密码错误')

    const token = this.generateToken(user)
    return { user: this.sanitizeUser(user), token }
  },

  async getUserById(id) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return null
    return this.sanitizeUser(user)
  },

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
  },

  // 去除密码字段
  sanitizeUser(user) {
    const { password, ...rest } = user
    return rest
  }
}

module.exports = authService
