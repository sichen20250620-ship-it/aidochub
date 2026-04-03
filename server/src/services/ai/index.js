const ClaudeProvider = require('./claudeProvider')
const DeepSeekProvider = require('./deepseekProvider')

// 按优先级排列的 Provider 列表
const providers = [
  new ClaudeProvider(),
  new DeepSeekProvider()
]

/**
 * 获取当前可用的 AI Provider
 * 优先级：Claude > DeepSeek
 * 也可通过 AI_PROVIDER 环境变量强制指定
 */
function getProvider() {
  const forced = process.env.AI_PROVIDER
  if (forced) {
    const match = providers.find(p => p.name.toLowerCase().includes(forced.toLowerCase()))
    if (match?.isConfigured()) return match
  }

  // 自动选择第一个已配置的
  const available = providers.find(p => p.isConfigured())
  return available || null
}

/**
 * 获取 AI 状态信息
 */
function getAIStatus() {
  const current = getProvider()
  return {
    available: !!current,
    provider: current?.name || null,
    providers: providers.map(p => ({
      name: p.name,
      configured: p.isConfigured()
    }))
  }
}

module.exports = { getProvider, getAIStatus }
