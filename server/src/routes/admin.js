const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const prisma = require('../utils/prisma')
const { authRequired, adminRequired } = require('../middleware/auth')

// ==================== 用户管理 ====================

// 获取用户列表
router.get('/users', authRequired, adminRequired, async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, username: true, role: true,
      employeeId: true, status: true, avatar: true,
      createdAt: true, updatedAt: true,
      _count: { select: { documents: true, comments: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  res.json({ code: 0, data: users, message: 'success' })
})

// 创建用户（管理员为员工创建账号）
router.post('/users', authRequired, adminRequired, async (req, res) => {
  const { email, username, password, role, employeeId } = req.body
  if (!email || !username || !password) {
    return res.status(400).json({ code: 400, message: '邮箱、用户名、密码为必填' })
  }
  if (role && !['admin', 'editor', 'user'].includes(role)) {
    return res.status(400).json({ code: 400, message: '角色必须为 admin/editor/user' })
  }

  // 检查重复
  const exist = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  })
  if (exist) {
    return res.status(400).json({ code: 400, message: '邮箱或用户名已存在' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role: role || 'user',
      employeeId: employeeId || null
    },
    select: {
      id: true, email: true, username: true, role: true,
      employeeId: true, status: true, createdAt: true
    }
  })
  res.json({ code: 0, data: user, message: '创建成功' })
})

// 修改用户角色
router.put('/users/:id/role', authRequired, adminRequired, async (req, res) => {
  const { role } = req.body
  if (!['admin', 'editor', 'user'].includes(role)) {
    return res.status(400).json({ code: 400, message: '角色必须为 admin/editor/user' })
  }
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { role },
    select: { id: true, username: true, role: true }
  })
  res.json({ code: 0, data: user, message: '角色已更新' })
})

// 启用/禁用用户
router.put('/users/:id/status', authRequired, adminRequired, async (req, res) => {
  const { status } = req.body
  if (!['active', 'disabled'].includes(status)) {
    return res.status(400).json({ code: 400, message: '状态必须为 active/disabled' })
  }
  // 不能禁用自己
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ code: 400, message: '不能禁用自己的账号' })
  }
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { status },
    select: { id: true, username: true, status: true }
  })
  res.json({ code: 0, data: user, message: status === 'active' ? '已启用' : '已禁用' })
})

// 重置用户密码
router.put('/users/:id/password', authRequired, adminRequired, async (req, res) => {
  const { password } = req.body
  if (!password || password.length < 6) {
    return res.status(400).json({ code: 400, message: '密码至少6位' })
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { password: hashedPassword }
  })
  res.json({ code: 0, data: null, message: '密码已重置' })
})

// ==================== 分类管理 ====================

// 创建分类
router.post('/categories', authRequired, adminRequired, async (req, res) => {
  const { id, name, icon, description, tags, sort } = req.body
  if (!id || !name) {
    return res.status(400).json({ code: 400, message: 'id 和 name 为必填' })
  }
  const category = await prisma.category.create({
    data: {
      id,
      name,
      icon: icon || '📁',
      description: description || '',
      tags: JSON.stringify(tags || []),
      sort: sort || 0
    }
  })
  res.json({ code: 0, data: { ...category, tags: JSON.parse(category.tags) }, message: '创建成功' })
})

// 更新分类
router.put('/categories/:id', authRequired, adminRequired, async (req, res) => {
  const { name, icon, description, tags, sort } = req.body
  const data = {}
  if (name !== undefined) data.name = name
  if (icon !== undefined) data.icon = icon
  if (description !== undefined) data.description = description
  if (tags !== undefined) data.tags = JSON.stringify(tags)
  if (sort !== undefined) data.sort = sort

  const category = await prisma.category.update({
    where: { id: req.params.id },
    data
  })
  res.json({ code: 0, data: { ...category, tags: JSON.parse(category.tags) }, message: '更新成功' })
})

// 删除分类（需要先确认没有文档）
router.delete('/categories/:id', authRequired, adminRequired, async (req, res) => {
  const docCount = await prisma.document.count({ where: { categoryId: req.params.id } })
  if (docCount > 0) {
    return res.status(400).json({ code: 400, message: `该分类下还有 ${docCount} 篇文档，请先移除` })
  }
  await prisma.category.delete({ where: { id: req.params.id } })
  res.json({ code: 0, data: null, message: '删除成功' })
})

module.exports = router
