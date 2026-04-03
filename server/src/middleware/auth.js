const jwt = require('jsonwebtoken')

// JWT 鉴权中间件
function authRequired(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'Token无效或已过期' })
  }
}

// 管理员权限中间件
function adminRequired(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '需要管理员权限' })
  }
  next()
}

module.exports = { authRequired, adminRequired }
