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

    // 获取完整响应文本，然后逐行解析 SSE
    const text = await response.text()
    let hasContent = false
    let hasEnded = false

    const lines = text.split('\n')
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6))
        if (data.type === 'chunk') {
          hasContent = true
          onChunk(data.content)
        } else if (data.type === 'sources') {
          onSources(data.content)
        } else if (data.type === 'done') {
          hasEnded = true
          onDone()
        } else if (data.type === 'error') {
          hasEnded = true
          onError(data.content)
        }
      } catch {
        // ignore parse errors
      }
    }

    // 兜底：确保一定会结束
    if (!hasEnded) {
      if (hasContent) {
        onDone()
      } else {
        onError('未收到 AI 回复')
      }
    }
  }).catch((err) => {
    onError(err.message)
  })
}
