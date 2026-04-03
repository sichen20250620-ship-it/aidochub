/**
 * AI Provider 基类
 * 所有 AI 提供商都需要实现这个接口
 */
class BaseProvider {
  constructor(config) {
    this.config = config
  }

  /** 获取提供商名称 */
  get name() {
    throw new Error('子类必须实现 name')
  }

  /** 检查是否已配置（有 API Key） */
  isConfigured() {
    throw new Error('子类必须实现 isConfigured()')
  }

  /**
   * 流式对话
   * @param {object} params
   * @param {string} params.systemPrompt - 系统提示词
   * @param {Array} params.messages - 消息历史 [{role, content}]
   * @param {function} params.onChunk - 收到文本片段的回调 (text) => void
   * @param {function} params.onDone - 完成回调 (fullText) => void
   * @param {function} params.onError - 错误回调 (error) => void
   */
  async chatStream(params) {
    throw new Error('子类必须实现 chatStream()')
  }
}

module.exports = BaseProvider
