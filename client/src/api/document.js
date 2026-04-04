import request from './index'

// 文档列表
export function getDocuments(params) {
  return request.get('/documents', { params })
}

// 文档详情
export function getDocumentById(id) {
  return request.get(`/documents/${id}`)
}

// 上传文档（管理员）
export function uploadDocument(formData) {
  return request.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 批量上传文档
export function uploadDocumentBatch(formData) {
  return request.post('/documents/upload-batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  })
}

// 删除文档（管理员）
export function deleteDocument(id) {
  return request.delete(`/documents/${id}`)
}
