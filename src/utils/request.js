import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:5000',  // 本地
  // baseURL: 'http://104.37.187.30:5000', //美国服务器
  // baseURL: 'http://195.133.11.240:5000', //俄罗斯服务器
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
    // 如果响应直接是数组，说明是消息类型列表接口
    if (Array.isArray(response.data)) {
      return response.data
    }
    // 如果响应包含 message 和 data 字段，说明是标准响应格式
    if (response.data && response.data.message) {
      return response.data
    }
    // 其他情况返回原始响应
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