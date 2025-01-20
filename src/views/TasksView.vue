<template>
  <div class="tasks-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="失败" value="失败" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户">
          <el-input v-model="searchForm.user_id" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card>
      <el-table v-loading="loading" :data="taskList" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" width="200">
          <template #default="{ row }">
            <div>用户名：{{ row.user?.username }}</div>
            <div>昵称：{{ row.user?.nickname }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="任务内容" show-overflow-tooltip />
        <el-table-column label="联系方式" width="150">
          <template #default="{ row }">
            <div v-for="number in row.numbers" :key="number">
              {{ number }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="媒体文件" width="120">
          <template #default="{ row }">
            <div v-if="row.media_urls?.length" class="media-list">
              <!-- 图片处理 -->
              <template v-if="row.media_type === 'image'">
                <el-image
                  v-for="(url, index) in row.media_urls"
                  :key="index"
                  :src="url"
                  :preview-src-list="row.media_urls"
                  :initial-index="index"
                  fit="cover"
                  class="media-preview"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </template>
              
              <!-- 视频处理 -->
              <template v-else-if="row.media_type === 'video'">
                <div
                  v-for="(url, index) in row.media_urls"
                  :key="index"
                  class="video-preview"
                  @click="handleVideoClick(url)"
                >
                  <el-icon><VideoPlay /></el-icon>
                </div>
              </template>
            </div>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
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

    <!-- 添加视频预览对话框 -->
    <el-dialog
      v-model="videoDialog.visible"
      title="视频预览"
      width="800px"
      destroy-on-close
      center
      :close-on-click-modal="false"
    >
      <div class="video-container">
        <video
          v-if="videoDialog.url"
          :src="videoDialog.url"
          controls
          class="video-player"
          autoplay
        >
          您的浏览器不支持 video 标签
        </video>
      </div>
      <template #footer>
        <el-button @click="videoDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getTaskList } from '@/api/task'
import { ElMessage } from 'element-plus'
import { Picture, VideoPlay } from '@element-plus/icons-vue'

const loading = ref(false)
const taskList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dateRange = ref([])

const searchForm = ref({
  status: '',
  user_id: ''
})

// 视频预览对话框状态
const videoDialog = ref({
  visible: false,
  url: ''
})

// 获取任务列表
const fetchTaskList = async () => {
  loading.value = true
  try {
    const { data } = await getTaskList({
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm.value,
      start_date: dateRange.value?.[0],
      end_date: dateRange.value?.[1]
    })
    taskList.value = data.tasks
    total.value = data.total
  } catch (error) {
    console.error('获取任务列表失败:', error)
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

// 状态标签类型
const getStatusType = (status) => {
  const map = {
    '待处理': 'info',
    '处理中': 'warning',
    '已完成': 'success',
    '失败': 'danger'
  }
  return map[status] || 'info'
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchTaskList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    status: '',
    user_id: ''
  }
  dateRange.value = []
  handleSearch()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchTaskList()
}

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchTaskList()
}

// 处理视频点击
const handleVideoClick = (url) => {
  videoDialog.value = {
    visible: true,
    url
  }
}

// 初始化
fetchTaskList()
</script>

<style scoped>
.tasks-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.media-list {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.media-preview {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  cursor: pointer;
  object-fit: cover;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  color: #909399;
}

.video-preview {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #409EFF;
}

.video-preview:hover {
  background-color: #ecf5ff;
}

.video-player {
  width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  border-radius: 4px;
}
</style> 