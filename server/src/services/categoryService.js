const prisma = require('../utils/prisma')

const categoryService = {
  async getAll() {
    const categories = await prisma.category.findMany({
      orderBy: { sort: 'asc' },
      include: { _count: { select: { documents: true } } }
    })
    return categories.map(c => ({
      ...c,
      tags: JSON.parse(c.tags),
      docCount: c._count.documents,
      _count: undefined
    }))
  },

  async getById(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { documents: true } } }
    })
    if (!category) return null
    return {
      ...category,
      tags: JSON.parse(category.tags),
      docCount: category._count.documents,
      _count: undefined
    }
  }
}

module.exports = categoryService
