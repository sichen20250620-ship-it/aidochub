const categoryService = require('../services/categoryService')

const categoryController = {
  // 获取所有分类
  getAll(req, res) {
    const categories = categoryService.getAll()
    res.json({ code: 0, data: categories, message: 'success' })
  },

  // 获取单个分类
  getById(req, res) {
    const category = categoryService.getById(req.params.id)
    if (!category) {
      return res.status(404).json({ code: 404, data: null, message: '分类不存在' })
    }
    res.json({ code: 0, data: category, message: 'success' })
  }
}

module.exports = categoryController
