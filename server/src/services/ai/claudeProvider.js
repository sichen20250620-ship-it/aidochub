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

      const stream = await client.messages.create({
        model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
        stream: true
      })

      let fullText = ''

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.text) {
          fullText += event.delta.text
          onChunk(event.delta.text)
        }
      }

      onDone(fullText)
    } catch (err) {
      onError(err)
    }
  }
}

module.exports = ClaudeProvider
