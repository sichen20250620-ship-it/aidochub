import request from './index'

export function getComments(documentId) {
  return request.get(`/comments/${documentId}`)
}

export function addComment({ documentId, content }) {
  return request.post('/comments', { documentId, content })
}

export function deleteComment(id) {
  return request.delete(`/comments/${id}`)
}
