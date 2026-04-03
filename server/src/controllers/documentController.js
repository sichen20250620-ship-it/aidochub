const documentService = require('../services/documentService')

const documentController = {
  // 上传文档（管理员）
  async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ code: 400, message: '请选择 HTML 文件' })
      }
      const { categoryId, title } = req.body
      if (!categoryId) {
        return res.status(400).json({ code: 400, message: '请选择知识分类' })
      }

      const doc = await documentService.create({
        file: req.file,
        categoryId,
        title,
        uploaderId: req.user.id
      })
      res.json({ code: 0, data: doc, message: '上传成功' })
    } catch (err) {
      res.status(500).json({ code: 500, message: err.message })
    }
  },

  // 文档列表
  async getList(req, res) {
    const { categoryId, keyword, page, pageSize } = req.query
    const result = await documentService.getList({
      categoryId,
      keyword,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20
    })
    res.json({ code: 0, data: result, message: 'success' })
  },

  // 文档详情
  async getById(req, res) {
    const doc = await documentService.getById(Number(req.params.id))
    if (!doc) {
      return res.status(404).json({ code: 404, message: '文档不存在' })
    }
    res.json({ code: 0, data: doc, message: 'success' })
  },

  // 删除文档（管理员）
  async delete(req, res) {
    const doc = await documentService.delete(Number(req.params.id))
    if (!doc) {
      return res.status(404).json({ code: 404, message: '文档不存在' })
    }
    res.json({ code: 0, data: null, message: '删除成功' })
  }
}

module.exports = documentController
