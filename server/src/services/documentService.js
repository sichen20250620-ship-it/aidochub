const fs = require('fs')
const cheerio = require('cheerio')
const prisma = require('../utils/prisma')

const documentService = {
  // 解析 HTML 文件，提取标题和摘要，保留完整 HTML
  parseHtmlFile(filePath) {
    const html = fs.readFileSync(filePath, 'utf-8')
    const $ = cheerio.load(html)

    // 提取标题：优先 <title>，其次 <h1>
    const title = $('title').text().trim() || $('h1').first().text().trim() || '未命名文档'

    // 提取纯文本摘要（前200字）
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
    const summary = bodyText.substring(0, 200)

    // 保存完整 HTML（包含 head 中的 style/script）
    const content = html

    return { title, summary, content }
  },

  // 上传并创建文档
  async create({ file, categoryId, title, uploaderId }) {
    const parsed = this.parseHtmlFile(file.path)

    const doc = await prisma.document.create({
      data: {
        title: title || parsed.title,
        summary: parsed.summary,
        content: parsed.content,
        filePath: file.path,
        categoryId,
        uploaderId
      },
      include: { category: true, uploader: { select: { id: true, username: true } } }
    })

    // 更新分类文档计数不用单独字段，通过查询获取

    return doc
  },

  // 获取文档列表（支持分类筛选和搜索）
  async getList({ categoryId, keyword, page = 1, pageSize = 20 }) {
    const where = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { summary: { contains: keyword } }
      ]
    }

    const [docs, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          title: true,
          summary: true,
          categoryId: true,
          viewCount: true,
          createdAt: true,
          category: { select: { id: true, name: true, icon: true } },
          uploader: { select: { id: true, username: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.document.count({ where })
    ])

    return { list: docs, total, page, pageSize }
  },

  // 获取文档详情（含完整 HTML 内容）
  async getById(id) {
    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        uploader: { select: { id: true, username: true } }
      }
    })

    if (doc) {
      // 阅读量 +1
      await prisma.document.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      })
    }

    return doc
  },

  // 删除文档
  async delete(id) {
    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) return null

    // 删除文件
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath)
    }

    await prisma.document.delete({ where: { id } })
    return doc
  },

  // 获取分类的文档数量
  async getCategoryDocCount(categoryId) {
    return prisma.document.count({ where: { categoryId } })
  }
}

module.exports = documentService
