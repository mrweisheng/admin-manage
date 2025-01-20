<template>
  <div class="message-types-container">
    <!-- 操作栏 -->
    <el-card class="action-card">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加消息类型
      </el-button>
    </el-card>

    <!-- 消息类型列表 -->
    <el-card>
      <el-table v-loading="loading" :data="messageTypes" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="message_type" label="消息类型" />
        <el-table-column prop="points" label="积分" width="100">
          <template #default="{ row }">
            {{ row.points.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑消息类型' : '添加消息类型'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="dialog.form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="消息类型" prop="message_type" v-if="!dialog.isEdit">
          <el-input v-model="dialog.form.message_type" />
        </el-form-item>
        <el-form-item label="积分" prop="points">
          <el-input-number
            v-model="dialog.form.points"
            :precision="2"
            :step="0.1"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="dialog.form.description"
            type="textarea"
            rows="3"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="dialog.isEdit">
          <el-select v-model="dialog.form.status">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="dialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getMessageTypes, createMessageType, updateMessageType, deleteMessageType } from '@/api/message-type'

const loading = ref(false)
const messageTypes = ref([])
const formRef = ref(null)

const dialog = ref({
  visible: false,
  loading: false,
  isEdit: false,
  form: {
    message_type: '',
    points: 1,
    description: '',
    status: 'active'
  }
})

const rules = {
  message_type: [
    { required: true, message: '请输入消息类型', trigger: 'blur' }
  ],
  points: [
    { required: true, message: '请输入积分', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// 获取消息类型列表
const fetchMessageTypes = async () => {
  loading.value = true
  try {
    // API 直接返回数组数据
    const data = await getMessageTypes()
    messageTypes.value = data.map(item => ({
      ...item,
      points: parseFloat(item.points)
    }))
  } catch (error) {
    console.error('获取消息类型列表失败:', error)
    ElMessage.error('获取消息类型列表失败')
  } finally {
    loading.value = false
  }
}

// 添加消息类型
const handleAdd = () => {
  dialog.value = {
    visible: true,
    loading: false,
    isEdit: false,
    form: {
      message_type: '',
      points: 1,
      description: '',
      status: 'active'
    }
  }
}

// 编辑消息类型
const handleEdit = (row) => {
  dialog.value = {
    visible: true,
    loading: false,
    isEdit: true,
    form: {
      ...row
    }
  }
}

// 删除消息类型
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除消息类型"${row.message_type}"吗？`,
      '警告',
      {
        type: 'warning',
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await deleteMessageType(row.id)
    ElMessage.success('删除成功')
    fetchMessageTypes()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除消息类型失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    dialog.value.loading = true
    try {
      if (dialog.value.isEdit) {
        await updateMessageType(dialog.value.form.id, dialog.value.form)
        ElMessage.success('更新成功')
      } else {
        await createMessageType(dialog.value.form)
        ElMessage.success('创建成功')
      }
      dialog.value.visible = false
      fetchMessageTypes()
    } catch (error) {
      console.error('保存消息类型失败:', error)
    } finally {
      dialog.value.loading = false
    }
  })
}

onMounted(() => {
  fetchMessageTypes()
})
</script>

<style scoped>
.message-types-container {
  padding: 20px;
}

.action-card {
  margin-bottom: 20px;
}
</style> 