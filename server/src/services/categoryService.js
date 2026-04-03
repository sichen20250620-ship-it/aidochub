// 初始知识分类数据（后续会迁移到数据库）
const categories = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: '🤖',
    description: 'Claude Code CLI工具使用指南、最佳实践、高级技巧',
    docCount: 0,
    tags: ['AI编程', 'CLI', '代码助手']
  },
  {
    id: 'openclaw-agent',
    name: 'OpenClaw Agent',
    icon: '🦞',
    description: 'OpenClaw Agent框架使用、配置与开发实战',
    docCount: 0,
    tags: ['AI Agent', '自动化', '框架']
  },
  {
    id: 'comic-generation',
    name: '漫画/漫剧生成',
    icon: '🎨',
    description: 'AI漫画、漫剧、图文视频生成工具与工作流',
    docCount: 0,
    tags: ['漫画', '视频', 'AI创作']
  }
]

const categoryService = {
  getAll() {
    return categories
  },

  getById(id) {
    return categories.find(c => c.id === id) || null
  }
}

module.exports = categoryService
