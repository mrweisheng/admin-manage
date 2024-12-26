<template>
  <el-button
    type="primary"
    :loading="loading"
    @click="handleExport"
  >
    <el-icon><Download /></el-icon>
    导出数据
  </el-button>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  filename: {
    type: String,
    required: true
  },
  exportFunction: {
    type: Function,
    required: true
  }
})

const loading = ref(false)

const handleExport = async () => {
  loading.value = true
  try {
    const response = await props.exportFunction()
    const blob = new Blob([response.data])
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${props.filename}-${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(link.href)
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}
</script> 