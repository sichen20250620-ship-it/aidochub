import request from './index'

// 获取所有知识分类
export function getCategories() {
  return request.get('/categories')
}

// 获取单个分类详情
export function getCategoryById(id) {
  return request.get(`/categories/${id}`)
}
