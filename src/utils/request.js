import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'https://task-server-zyir.onrender.com',
  // baseURL: 'http://localhost:3000',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          const userStore = useUserStore()
          userStore.resetToken()
          router.push('/login')
          ElMessage.error('认证失败，请重新登录')
          break
        case 403:
          ElMessage.error('没有权限执行此操作')
          break
        case 400:
          ElMessage.error(error.response.data.message || '请求参数错误')
          break
        case 409:
          ElMessage.error(error.response.data.message || '资源冲突')
          break
        default:
          ElMessage.error('服务器错误，请稍后重试')
      }
    } else {
      ElMessage.error('网络错误，请检查您的网络连接')
    }
    return Promise.reject(error)
  }
)

export default request 