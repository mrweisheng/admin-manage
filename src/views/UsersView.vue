<template>
  <div class="users-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <div class="search-header">
        <!-- 添加注册按钮 -->
        <el-button type="primary" @click="handleRegister">
          <el-icon><Plus /></el-icon>注册用户
        </el-button>
        <!-- 原有的搜索表单 -->
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.search" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-card>
      <el-table v-loading="loading" :data="userList" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="balance" label="余额" width="120">
          <template #default="{ row }">
            <el-tag type="info">
              {{ row.balance || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <el-button type="primary" size="small">
                操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- 启用/禁用 -->
                  <el-dropdown-item
                    v-if="row.status === 'active'"
                    @click="handleDisable(row)"
                  >
                    <el-icon><Lock /></el-icon>禁用
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-else
                    @click="handleEnable(row)"
                  >
                    <el-icon><Unlock /></el-icon>启用
                  </el-dropdown-item>
                  
                  <!-- 重置密码 -->
                  <el-dropdown-item @click="handleResetPassword(row)">
                    <el-icon><Key /></el-icon>重置密码
                  </el-dropdown-item>
                  
                  <!-- 编辑余额 -->
                  <el-dropdown-item @click="handleEditBalance(row)">
                    <el-icon><Money /></el-icon>编辑余额
                  </el-dropdown-item>
                  
                  <!-- 删除 -->
                  <el-dropdown-item divided @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 禁用原因对话框 -->
    <el-dialog v-model="disableDialog.visible" title="禁用用户" width="500px">
      <el-form>
        <el-form-item label="禁用原因" required>
          <el-input
            v-model="disableDialog.reason"
            type="textarea"
            rows="3"
            placeholder="请输入禁用原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="disableDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmDisable" :loading="disableDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="resetDialog.visible" title="重置密码" width="500px">
      <el-form>
        <el-form-item label="新密码" required>
          <el-input
            v-model="resetDialog.password"
            placeholder="不填则随机生成密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmReset" :loading="resetDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 余额编辑对话框 -->
    <el-dialog v-model="balanceDialog.visible" title="编辑余额" width="500px">
      <el-form>
        <el-form-item label="新余额" required>
          <el-input
            v-model.number="balanceDialog.balance"
            placeholder="请输入新的余额"
            type="number"
            step="0.01"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="balanceDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmEditBalance"
          :loading="balanceDialog.loading"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加注册用户对话框 -->
    <el-dialog v-model="registerDialog.visible" title="注册用户" width="500px">
      <el-form
        ref="registerFormRef"
        :model="registerDialog.form"
        :rules="registerRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="registerDialog.form.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerDialog.form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="registerDialog.form.nickname"
            placeholder="请输入昵称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="registerDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmRegister"
          :loading="registerDialog.loading"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserList, disableUser, enableUser, deleteUser, resetUserPassword, registerUser, updateUserBalance } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Lock, Unlock, Key, Delete, ArrowDown, Money } from '@element-plus/icons-vue'

const loading = ref(false)
const userList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const searchForm = ref({
  search: '',
  status: ''
})

const disableDialog = ref({
  visible: false,
  loading: false,
  userId: null,
  reason: ''
})

const resetDialog = ref({
  visible: false,
  loading: false,
  userId: null,
  password: ''
})

// 注册对话框状态
const registerDialog = ref({
  visible: false,
  loading: false,
  form: {
    username: '',
    password: '',
    nickname: ''
  }
})

// 注册表单校验规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 20, message: '最大长度为 20 个字符', trigger: 'blur' }
  ]
}

const registerFormRef = ref(null)

// 余额编辑对话框状态
const balanceDialog = ref({
  visible: false,
  loading: false,
  userId: null,
  balance: 0
})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const { data } = await getUserList({
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm.value
    })
    userList.value = data.users
    total.value = data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    search: '',
    status: ''
  }
  handleSearch()
}

// 禁用用户
const handleDisable = (row) => {
  disableDialog.value = {
    visible: true,
    loading: false,
    userId: row.id,
    reason: ''
  }
}

// 确认禁用
const confirmDisable = async () => {
  if (!disableDialog.value.reason) {
    ElMessage.warning('请输入禁用原因')
    return
  }

  disableDialog.value.loading = true
  try {
    await disableUser(disableDialog.value.userId, disableDialog.value.reason)
    ElMessage.success('禁用成功')
    disableDialog.value.visible = false
    fetchUserList()
  } catch (error) {
    console.error('禁用用户失败:', error)
  } finally {
    disableDialog.value.loading = false
  }
}

// 启用用户
const handleEnable = async (row) => {
  try {
    await ElMessageBox.confirm('确定要启用该用户吗？', '提示', {
      type: 'warning'
    })
    await enableUser(row.id)
    ElMessage.success('启用成功')
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('启用用户失败:', error)
    }
  }
}

// 重置密码
const handleResetPassword = (row) => {
  resetDialog.value = {
    visible: true,
    loading: false,
    userId: row.id,
    password: ''
  }
}

// 确认重置密码
const confirmReset = async () => {
  resetDialog.value.loading = true
  try {
    const { data } = await resetUserPassword(
      resetDialog.value.userId,
      resetDialog.value.password || undefined
    )
    
    // 如果返回了新密码（随机生成的情况），显示给管理员
    if (data.newPassword) {
      ElMessageBox.alert(
        `新密码: ${data.newPassword}`,
        '密码重置成功',
        {
          confirmButtonText: '复制密码',
          callback: () => {
            // 复制密码到剪贴板
            navigator.clipboard.writeText(data.newPassword)
            ElMessage.success('密码已复制到剪贴板')
          }
        }
      )
    } else {
      ElMessage.success('密码重置成功')
    }
    
    resetDialog.value.visible = false
  } catch (error) {
    console.error('重置密码失败:', error)
  } finally {
    resetDialog.value.loading = false
  }
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？此操作不可恢复！`,
      '警告',
      {
        type: 'warning',
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
    }
  }
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUserList()
}

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUserList()
}

// 打开注册对话框
const handleRegister = () => {
  registerDialog.value = {
    visible: true,
    loading: false,
    form: {
      username: '',
      password: '',
      nickname: ''
    }
  }
}

// 编辑余额
const handleEditBalance = (row) => {
  balanceDialog.value = {
    visible: true,
    loading: false,
    userId: row.id,
    balance: row.balance || 0
  }
}

// 确认编辑余额
const confirmEditBalance = async () => {
  if (isNaN(balanceDialog.value.balance)) {
    ElMessage.warning('请输入有效的数字')
    return
  }

  balanceDialog.value.loading = true
  try {
    await updateUserBalance(balanceDialog.value.userId, balanceDialog.value.balance)
    ElMessage.success('余额更新成功')
    balanceDialog.value.visible = false
    fetchUserList()
  } catch (error) {
    console.error('更新余额失败:', error)
  } finally {
    balanceDialog.value.loading = false
  }
}

// 确认注册
const confirmRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    registerDialog.value.loading = true
    try {
      await registerUser(registerDialog.value.form)
      ElMessage.success('注册成功')
      registerDialog.value.visible = false
      fetchUserList() // 刷新用户列表
    } catch (error) {
      console.error('注册用户失败:', error)
    } finally {
      registerDialog.value.loading = false
    }
  })
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-dropdown-menu__item .el-icon {
  margin-right: 4px;
}

/* 为不同操作添加不同的颜色 */
.el-dropdown-menu__item:hover .el-icon {
  color: var(--el-color-primary);
}

.el-dropdown-menu__item:last-child:hover .el-icon {
  color: var(--el-color-danger);
}
</style>
