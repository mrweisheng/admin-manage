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
      const { data } = await loginApi(credentials)
      token.value = data.token
      userInfo.value = data.admin
      permissions.value = data.admin.permissions
      
      // 保存到 localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(data.admin))
      localStorage.setItem('permissions', JSON.stringify(data.admin.permissions))
      
      return true
    } catch (error) {
      return false
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      const { data } = await getProfile()
      userInfo.value = data
      permissions.value = data.permissions
      
      // 更新 localStorage
      localStorage.setItem('userInfo', JSON.stringify(data))
      localStorage.setItem('permissions', JSON.stringify(data.permissions))
      
      return data
    } catch (error) {
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