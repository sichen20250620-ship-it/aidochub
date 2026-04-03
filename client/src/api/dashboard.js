import request from './index'

export function getStats() {
  return request.get('/dashboard/stats')
}

export function getHotDocs() {
  return request.get('/dashboard/hot-docs')
}

export function getRecentDocs() {
  return request.get('/dashboard/recent-docs')
}
