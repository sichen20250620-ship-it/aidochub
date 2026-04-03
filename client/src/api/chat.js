import request from './index'

// 获取 AI 状态
export function getAIStatus() {
  return request.get('/chat/status')
}

// AI 对话（SSE 流式）
export function chatStream({ question, history }, onChunk, onSources, onDone, onError) {
  const token = localStorage.getItem('token')

  fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ question, history })
  }).then(async (response) => {
    if (!response.ok) {
      onError('请求失败: ' + response.status)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          if (data.type === 'chunk') {
            onChunk(data.content)
          } else if (data.type === 'sources') {
            onSources(data.content)
          } else if (data.type === 'done') {
            onDone()
          } else if (data.type === 'error') {
            onError(data.content)
          }
        } catch {
          // ignore
        }
      }
    }
  }).catch((err) => {
    onError(err.message)
  })
}
