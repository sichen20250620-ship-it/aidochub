import request from './index'

// 获取 AI 状态
export function getAIStatus() {
  return request.get('/chat/status')
}

// 解析 SSE 行
function processLine(line, onChunk, onSources, onDone, onError) {
  if (!line.startsWith('data: ')) return
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
    // ignore parse errors
  }
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
    let hasEnded = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        processLine(line, onChunk, onSources, () => { hasEnded = true; onDone() }, onError)
      }
    }

    // 处理 buffer 中残留的数据
    if (buffer.trim()) {
      processLine(buffer, onChunk, onSources, () => { hasEnded = true; onDone() }, onError)
    }

    // 如果流结束但没收到 done/error 事件，手动结束
    if (!hasEnded) {
      onDone()
    }
  }).catch((err) => {
    onError(err.message)
  })
}
