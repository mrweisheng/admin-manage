import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getProfile } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 读取初始状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || null)
  const permissions = ref(JSON.parse(localStorage.getItem('permissions')) || [])

  const isLoggedIn = computed(() => !!token.value)
  const hasGetInfo = computed(() => !!userInfo.value)

  // 检查权限
  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }

  // 登录
  async function login(credentials) {
    try {
      const response = await loginApi(credentials)
      // 确保响应中包含所需数据
      if (response?.token && response?.admin) {
        token.value = response.token
        userInfo.value = response.admin
        permissions.value = response.admin.permissions || []
        
        // 保存到 localStorage
        localStorage.setItem('token', response.token)
        localStorage.setItem('userInfo', JSON.stringify(response.admin))
        localStorage.setItem('permissions', JSON.stringify(response.admin.permissions || []))
        
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      const { data } = await getProfile()
      userInfo.value = data
      permissions.value = data.permissions || []
      
      // 更新 localStorage
      localStorage.setItem('userInfo', JSON.stringify(data))
      localStorage.setItem('permissions', JSON.stringify(data.permissions || []))
      
      return data
    } catch (error) {
      resetToken()
      throw error
    }
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    
    // 清除 localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('permissions')
    
    router.push('/login')
  }

  // 重置token
  function resetToken() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    
    // 清除 localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('permissions')
  }

  return {
    token,
    userInfo,
    permissions,
    isLoggedIn,
    hasGetInfo,
    hasPermission,
    login,
    getUserInfo,
    logout,
    resetToken
  }
}) 