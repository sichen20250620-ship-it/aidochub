import request from './index'

// 获取 AI 状态
export function getAIStatus() {
  return request.get('/chat/status')
}

// AI 对话（JSON 模式，超时 120 秒）
export function chatRequest({ question, history }) {
  return request.post('/chat', { question, history }, { timeout: 120000 })
}
