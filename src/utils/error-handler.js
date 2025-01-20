import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

export function setupErrorHandler(app) {
  app.config.errorHandler = (error, instance, info) => {
    console.error('Vue Error:', error)
    console.error('Error Info:', info)
    
    ElMessage.error('系统错误，请稍后重试')
  }
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
    
    if (event.reason?.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
    }
  })
} 