import router from './index'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { ElMessage } from 'element-plus'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  
  const userStore = useUserStore()
  const appStore = useAppStore()
  
  if (userStore.token) {
    if (to.path === '/login') {
      // 已登录时访问登录页，重定向到首页
      next({ path: '/' })
      NProgress.done()
    } else {
      try {
        // 确保获取用户信息
        if (!userStore.hasGetInfo) {
          await userStore.getUserInfo()
        }
        next()
      } catch (error) {
        // 获取用户信息失败，可能是 token 失效
        userStore.resetToken()
        ElMessage.error(error.message || '验证失败，请重新登录')
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
