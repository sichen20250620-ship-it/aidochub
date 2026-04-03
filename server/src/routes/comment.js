const express = require('express')
const router = express.Router()
const prisma = require('../utils/prisma')
const { authRequired, adminRequired } = require('../middleware/auth')

// 获取文档评论列表
router.get('/:documentId', authRequired, async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { documentId: Number(req.params.documentId) },
    include: { user: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: 'desc' }
  })
  res.json({ code: 0, data: comments, message: 'success' })
})

// 发表评论
router.post('/', authRequired, async (req, res) => {
  const { documentId, content } = req.body
  if (!documentId || !content?.trim()) {
    return res.status(400).json({ code: 400, message: '请填写评论内容' })
  }
  const comment = await prisma.comment.create({
    data: { content: content.trim(), userId: req.user.id, documentId },
    include: { user: { select: { id: true, username: true, avatar: true } } }
  })
  res.json({ code: 0, data: comment, message: '评论成功' })
})

// 删除评论（本人或管理员）
router.delete('/:id', authRequired, async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: Number(req.params.id) } })
  if (!comment) return res.status(404).json({ code: 404, message: '评论不存在' })
  if (comment.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '无权删除' })
  }
  await prisma.comment.delete({ where: { id: comment.id } })
  res.json({ code: 0, data: null, message: '已删除' })
})

module.exports = router
