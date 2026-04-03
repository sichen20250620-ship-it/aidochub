const cheerio = require('cheerio')
const prisma = require('../utils/prisma')
const { getProvider } = require('./ai')

const SYSTEM_PROMPT = `你是 AIDocHub 智能助手，一个专业的 AI 知识文档问答系统。

你的职责：
1. 基于提供的文档内容，准确回答用户的问题
2. 如果文档中包含相关信息，优先引用文档内容回答
3. 如果文档中没有直接答案，可以基于文档上下文进行合理推断，但要说明
4. 回答时使用清晰的结构（标题、列表、代码块等）
5. 中文回答，技术术语保留英文

当前知识库涵盖：Claude Code、OpenClaw Agent、漫画/漫剧/图文视频生成等 AI 工具的使用文档。`

const chatService = {
  /**
   * 从数据库检索与问题相关的文档
   * 简易关键词匹配，后续可升级为向量检索
   */
  async retrieveDocuments(question, limit = 3) {
    // 提取关键词（去除常见停用词）
    const stopWords = ['的', '了', '吗', '呢', '是', '在', '和', '有', '这', '那', '我', '你', '他', '怎么', '如何', '什么', '哪个', '可以', '能', '要']
    const keywords = question
      .replace(/[？?！!，,。.、]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.includes(w))

    if (keywords.length === 0) {
      // 无有效关键词，返回最新文档
      return prisma.document.findMany({
        take: limit,
        orderBy: { viewCount: 'desc' },
        select: { id: true, title: true, summary: true, content: true, categoryId: true }
      })
    }

    // 用 OR 条件搜索标题和摘要
    const conditions = keywords.flatMap(kw => [
      { title: { contains: kw } },
      { summary: { contains: kw } }
    ])

    const docs = await prisma.document.findMany({
      where: { OR: conditions },
      take: limit,
      orderBy: { viewCount: 'desc' },
      select: { id: true, title: true, summary: true, content: true, categoryId: true }
    })

    return docs
  },

  /**
   * 从 HTML 内容提取纯文本（用于构建上下文）
   */
  extractText(html) {
    const $ = cheerio.load(html)
    $('script, style').remove()
    return $('body').text().replace(/\s+/g, ' ').trim()
  },

  /**
   * 构建 RAG 上下文
   */
  buildContext(docs) {
    if (docs.length === 0) return '（当前知识库暂无相关文档）'

    return docs.map((doc, i) => {
      const text = this.extractText(doc.content)
      // 截取前 3000 字符，避免上下文过长
      const truncated = text.length > 3000 ? text.substring(0, 3000) + '...' : text
      return `【文档${i + 1}】${doc.title}\n${truncated}`
    }).join('\n\n---\n\n')
  },

  /**
   * JSON 对话（可靠模式，适合开发阶段）
   */
  async chatJSON({ question, history = [] }) {
    const provider = getProvider()
    if (!provider) {
      throw new Error('AI 服务未配置，请在 .env 中设置 ANTHROPIC_API_KEY 或 DEEPSEEK_API_KEY')
    }

    // 1. 检索相关文档
    const docs = await this.retrieveDocuments(question)

    // 2. 构建上下文
    const context = this.buildContext(docs)
    const contextPrompt = `${SYSTEM_PROMPT}\n\n以下是从知识库中检索到的相关文档内容，请基于这些内容回答用户问题：\n\n${context}`

    // 3. 构建消息历史
    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: question }
    ]

    // 4. 调用 AI
    const sources = docs.map(d => ({ id: d.id, title: d.title }))
    console.log(`[Chat] 调用 ${provider.name}, 问题: "${question}", 检索到 ${docs.length} 篇文档`)

    return new Promise((resolve, reject) => {
      let fullText = ''
      provider.chatStream({
        systemPrompt: contextPrompt,
        messages,
        onChunk(text) {
          fullText += text
        },
        onDone() {
          console.log(`[Chat] 回答完成, 长度: ${fullText.length}`)
          resolve({ answer: fullText, sources })
        },
        onError(err) {
          console.error(`[Chat] AI 错误:`, err.message || err)
          reject(err)
        }
      })
    })
  }
}

module.exports = chatService
