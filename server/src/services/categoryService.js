const prisma = require('../utils/prisma')

const categoryService = {
  async getAll() {
    const categories = await prisma.category.findMany({
      orderBy: { sort: 'asc' }
    })
    return categories.map(c => ({
      ...c,
      tags: JSON.parse(c.tags)
    }))
  },

  async getById(id) {
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) return null
    return { ...category, tags: JSON.parse(category.tags) }
  }
}

module.exports = categoryService
