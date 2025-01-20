import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 全局加载状态
  const loading = ref(false)
  
  // 侧边栏折叠状态
  const sidebarCollapsed = ref(false)
  
  // 权限列表
  const permissions = ref([])
  
  // 设置全局加载状态
  function setLoading(status) {
    loading.value = status
  }
  
  // 切换侧边栏状态
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  // 设置权限
  function setPermissions(perms) {
    permissions.value = perms
  }
  
  return {
    loading,
    sidebarCollapsed,
    permissions,
    setLoading,
    toggleSidebar,
    setPermissions
  }
}) 