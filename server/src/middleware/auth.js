const jwt = require('jsonwebtoken')
const prisma = require('../utils/prisma')

// JWT 鉴权中间件（同时检查账号状态）
async function authRequired(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 检查账号是否被禁用
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user || user.status === 'disabled') {
      return res.status(401).json({ code: 401, message: '账号已被禁用，请联系管理员' })
    }

    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'Token无效或已过期' })
  }
}

// 管理员权限
function adminRequired(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '需要管理员权限' })
  }
  next()
}

// 编辑者及以上权限（admin + editor）
function editorRequired(req, res, next) {
  if (!['admin', 'editor'].includes(req.user.role)) {
    return res.status(403).json({ code: 403, message: '需要编辑者或管理员权限' })
  }
  next()
}

module.exports = { authRequired, adminRequired, editorRequired }
