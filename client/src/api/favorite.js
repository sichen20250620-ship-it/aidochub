import request from './index'

export function toggleFavorite(documentId) {
  return request.post('/favorites/toggle', { documentId })
}

export function checkFavorite(documentId) {
  return request.get(`/favorites/check/${documentId}`)
}

export function getMyFavorites() {
  return request.get('/favorites/my')
}
