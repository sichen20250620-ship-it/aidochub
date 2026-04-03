const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // 初始化分类
  const categories = [
    {
      id: 'claude-code',
      name: 'Claude Code',
      icon: '🤖',
      description: 'Claude Code CLI工具使用指南、最佳实践、高级技巧',
      tags: JSON.stringify(['AI编程', 'CLI', '代码助手']),
      sort: 1
    },
    {
      id: 'openclaw-agent',
      name: 'OpenClaw Agent',
      icon: '🦞',
      description: 'OpenClaw Agent框架使用、配置与开发实战',
      tags: JSON.stringify(['AI Agent', '自动化', '框架']),
      sort: 2
    },
    {
      id: 'comic-generation',
      name: '漫画/漫剧生成',
      icon: '🎨',
      description: 'AI漫画、漫剧、图文视频生成工具与工作流',
      tags: JSON.stringify(['漫画', '视频', 'AI创作']),
      sort: 3
    }
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat
    })
  }
  console.log('分类数据初始化完成')

  // 初始化管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@aidochub.com' },
    update: {},
    create: {
      email: 'admin@aidochub.com',
      username: 'admin',
      password: adminPassword,
      role: 'admin'
    }
  })
  console.log('管理员账号初始化完成 (admin@aidochub.com / admin123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
