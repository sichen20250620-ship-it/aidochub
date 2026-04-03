const categoryService = require('../services/categoryService')

const categoryController = {
  async getAll(req, res) {
    const categories = await categoryService.getAll()
    res.json({ code: 0, data: categories, message: 'success' })
  },

  async getById(req, res) {
    const category = await categoryService.getById(req.params.id)
    if (!category) {
      return res.status(404).json({ code: 404, data: null, message: '分类不存在' })
    }
    res.json({ code: 0, data: category, message: 'success' })
  }
}

module.exports = categoryController
