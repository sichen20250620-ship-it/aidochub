import request from './index'

// 用户管理
export function getUsers() {
  return request.get('/admin/users')
}

export function createUser(data) {
  return request.post('/admin/users', data)
}

export function updateUserRole(id, role) {
  return request.put(`/admin/users/${id}/role`, { role })
}

export function updateUserStatus(id, status) {
  return request.put(`/admin/users/${id}/status`, { status })
}

export function resetUserPassword(id, password) {
  return request.put(`/admin/users/${id}/password`, { password })
}

// 分类管理
export function createCategory(data) {
  return request.post('/admin/categories', data)
}

export function updateCategory(id, data) {
  return request.put(`/admin/categories/${id}`, data)
}

export function deleteCategory(id) {
  return request.delete(`/admin/categories/${id}`)
}
