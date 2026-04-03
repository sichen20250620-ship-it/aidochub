const Anthropic = require('@anthropic-ai/sdk')
const BaseProvider = require('./baseProvider')

class ClaudeProvider extends BaseProvider {
  get name() {
    return 'Claude (Anthropic API)'
  }

  isConfigured() {
    return !!process.env.ANTHROPIC_API_KEY
  }

  async chatStream({ systemPrompt, messages, onChunk, onDone, onError }) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

      const stream = await client.messages.stream({
        model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages
      })

      let fullText = ''

      stream.on('text', (text) => {
        fullText += text
        onChunk(text)
      })

      stream.on('end', () => {
        onDone(fullText)
      })

      stream.on('error', (err) => {
        onError(err)
      })
    } catch (err) {
      onError(err)
    }
  }
}

module.exports = ClaudeProvider
