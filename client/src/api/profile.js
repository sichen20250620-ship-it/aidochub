import request from './index'

export function changePassword({ oldPassword, newPassword }) {
  return request.put('/auth/password', { oldPassword, newPassword })
}

export function getHistory() {
  return request.get('/auth/history')
}
