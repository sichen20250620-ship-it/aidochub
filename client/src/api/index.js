import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 响应拦截器：统一处理返回数据
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[API Error]', error.message)
    return Promise.reject(error)
  }
)

export default request
