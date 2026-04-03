const express = require('express')
const router = express.Router()
const prisma = require('../utils/prisma')
const { authRequired } = require('../middleware/auth')

// 总览统计
router.get('/stats', authRequired, async (req, res) => {
  const [userCount, docCount, categoryCount, commentCount, totalViews] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.category.count(),
    prisma.comment.count(),
    prisma.document.aggregate({ _sum: { viewCount: true } })
  ])

  res.json({
    code: 0,
    data: {
      userCount,
      docCount,
      categoryCount,
      commentCount,
      totalViews: totalViews._sum.viewCount || 0
    },
    message: 'success'
  })
})

// 热门文档 Top 10
router.get('/hot-docs', authRequired, async (req, res) => {
  const docs = await prisma.document.findMany({
    take: 10,
    orderBy: { viewCount: 'desc' },
    select: {
      id: true, title: true, viewCount: true, createdAt: true,
      category: { select: { id: true, name: true, icon: true } },
      _count: { select: { comments: true, favorites: true } }
    }
  })
  res.json({ code: 0, data: docs, message: 'success' })
})

// 最近上传
router.get('/recent-docs', authRequired, async (req, res) => {
  const docs = await prisma.document.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, viewCount: true, createdAt: true,
      category: { select: { id: true, name: true, icon: true } },
      uploader: { select: { id: true, username: true } }
    }
  })
  res.json({ code: 0, data: docs, message: 'success' })
})

module.exports = router
