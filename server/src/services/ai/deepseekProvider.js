const BaseProvider = require('./baseProvider')

/**
 * DeepSeek Provider（兼容 OpenAI 格式）
 * 同样适用于其他 OpenAI 兼容 API（OpenRouter、本地 Ollama 等）
 */
class DeepSeekProvider extends BaseProvider {
  get name() {
    return 'DeepSeek'
  }

  isConfigured() {
    return !!process.env.DEEPSEEK_API_KEY
  }

  async chatStream({ systemPrompt, messages, onChunk, onDone, onError }) {
    try {
      const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
      const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

      const body = {
        model,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      }

      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API 错误: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
          try {
            const json = JSON.parse(line.slice(6))
            const text = json.choices?.[0]?.delta?.content || ''
            if (text) {
              fullText += text
              onChunk(text)
            }
          } catch {
            // 忽略解析错误
          }
        }
      }

      onDone(fullText)
    } catch (err) {
      onError(err)
    }
  }
}

module.exports = DeepSeekProvider
