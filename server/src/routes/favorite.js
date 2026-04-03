const express = require('express')
const router = express.Router()
const prisma = require('../utils/prisma')
const { authRequired } = require('../middleware/auth')

// 收藏/取消收藏（切换）
router.post('/toggle', authRequired, async (req, res) => {
  const { documentId } = req.body
  if (!documentId) return res.status(400).json({ code: 400, message: '缺少 documentId' })

  const existing = await prisma.favorite.findUnique({
    where: { userId_documentId: { userId: req.user.id, documentId } }
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    res.json({ code: 0, data: { favorited: false }, message: '已取消收藏' })
  } else {
    await prisma.favorite.create({ data: { userId: req.user.id, documentId } })
    res.json({ code: 0, data: { favorited: true }, message: '已收藏' })
  }
})

// 检查是否已收藏
router.get('/check/:documentId', authRequired, async (req, res) => {
  const fav = await prisma.favorite.findUnique({
    where: {
      userId_documentId: {
        userId: req.user.id,
        documentId: Number(req.params.documentId)
      }
    }
  })
  res.json({ code: 0, data: { favorited: !!fav }, message: 'success' })
})

// 我的收藏列表
router.get('/my', authRequired, async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    include: {
      document: {
        select: {
          id: true, title: true, summary: true, categoryId: true, viewCount: true, createdAt: true,
          category: { select: { id: true, name: true, icon: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  res.json({ code: 0, data: favorites.map(f => f.document), message: 'success' })
})

module.exports = router
