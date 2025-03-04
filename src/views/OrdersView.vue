<template>
  <div class="orders-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select v-model="searchForm.message_type" placeholder="请选择消息类型" clearable>
            <el-option
              v-for="type in messageTypes"
              :key="type.message_type"
              :label="type.message_type"
              :value="type.message_type"
            />
          </el-select>
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

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon size="40"><Message /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">总消息数</div>
              <div class="stats-value">{{ stats.total_messages }}</div>
              <div class="stats-trend">
                <el-icon :color="stats.message_trend >= 0 ? '#67c23a' : '#f56c6c'">
                  <CaretTop v-if="stats.message_trend >= 0" />
                  <CaretBottom v-else />
                </el-icon>
                <span :style="{ color: stats.message_trend >= 0 ? '#67c23a' : '#f56c6c' }">
                  {{ Math.abs(stats.message_trend) }}%
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon size="40"><Coin /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">总积分消耗</div>
              <div class="stats-value">{{ stats.total_points }}</div>
              <div class="stats-trend">
                <el-icon :color="stats.points_trend >= 0 ? '#67c23a' : '#f56c6c'">
                  <CaretTop v-if="stats.points_trend >= 0" />
                  <CaretBottom v-else />
                </el-icon>
                <span :style="{ color: stats.points_trend >= 0 ? '#67c23a' : '#f56c6c' }">
                  {{ Math.abs(stats.points_trend) }}%
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon size="40"><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">总订单数</div>
              <div class="stats-value">{{ stats.total_orders }}</div>
              <div class="stats-trend">
                <el-icon :color="stats.orders_trend >= 0 ? '#67c23a' : '#f56c6c'">
                  <CaretTop v-if="stats.orders_trend >= 0" />
                  <CaretBottom v-else />
                </el-icon>
                <span :style="{ color: stats.orders_trend >= 0 ? '#67c23a' : '#f56c6c' }">
                  {{ Math.abs(stats.orders_trend) }}%
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单列表 -->
    <el-card>
      <el-table v-loading="loading" :data="orderList" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" width="150">
          <template #default="{ row }">
            <div>用户名：{{ row.username }}</div>
            <div>昵称：{{ row.nickname }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="message_type" label="消息类型" width="120" />
        <el-table-column prop="message_count" label="消息数量" width="100" />
        <el-table-column label="积分信息" width="200">
          <template #default="{ row }">
            <div>单价：{{ row.unit_price }}</div>
            <div>总积分：{{ row.total_points }}</div>
          </template>
        </el-table-column>
        <el-table-column label="余额变动" width="200">
          <template #default="{ row }">
            <div>变动前：{{ row.balance_before }}</div>
            <div>变动后：{{ row.balance_after }}</div>
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
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDetail(row)">
              详情
            </el-button>
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="订单详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单ID">{{ detailDialog.data?.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailDialog.data?.username }}</el-descriptions-item>
        <el-descriptions-item label="消息类型">{{ detailDialog.data?.message_type }}</el-descriptions-item>
        <el-descriptions-item label="消息数量">{{ detailDialog.data?.message_count }}</el-descriptions-item>
        <el-descriptions-item label="单价">{{ detailDialog.data?.unit_price }}</el-descriptions-item>
        <el-descriptions-item label="总积分">{{ detailDialog.data?.total_points }}</el-descriptions-item>
        <el-descriptions-item label="变动前余额">{{ detailDialog.data?.balance_before }}</el-descriptions-item>
        <el-descriptions-item label="变动后余额">{{ detailDialog.data?.balance_after }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(detailDialog.data?.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailDialog.data?.status)">
            {{ detailDialog.data?.status }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <template v-if="detailDialog.data?.task">
        <div class="task-info">
          <h3>任务信息</h3>
          <p>内容：{{ detailDialog.data.task.content }}</p>
          <p>联系方式：{{ detailDialog.data.task.numbers?.join(', ') }}</p>
          <div v-if="detailDialog.data.task.media_urls?.length">
            <p>媒体文件：</p>
            <div class="media-list">
              <template v-if="detailDialog.data.task.media_type === 'image'">
                <el-image
                  v-for="(url, index) in detailDialog.data.task.media_urls"
                  :key="index"
                  :src="url"
                  :preview-src-list="detailDialog.data.task.media_urls"
                  fit="cover"
                  class="media-preview"
                />
              </template>
              <template v-else-if="detailDialog.data.task.media_type === 'video'">
                <video
                  v-for="(url, index) in detailDialog.data.task.media_urls"
                  :key="index"
                  :src="url"
                  controls
                  class="video-preview"
                />
              </template>
            </div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrders, getOrderDetail } from '@/api/order'
import { getMessageTypes } from '@/api/message-type'
import {
  Message,
  Coin,
  Document,
  CaretTop,
  CaretBottom
} from '@element-plus/icons-vue'

const loading = ref(false)
const orderList = ref([])
const messageTypes = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dateRange = ref([])

const searchForm = ref({
  username: '',
  message_type: ''
})

const stats = ref({
  total_messages: 0,
  total_points: 0,
  total_orders: 0
})

const detailDialog = ref({
  visible: false,
  loading: false,
  data: null
})

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const response = await getOrders({
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm.value,
      start_date: dateRange.value?.[0],
      end_date: dateRange.value?.[1]
    })
    
    // 从 response.data 中获取数据
    const { orders, pagination, stats: orderStats } = response.data
    orderList.value = orders
    total.value = pagination.total
    stats.value = orderStats
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取消息类型列表
const fetchMessageTypes = async () => {
  try {
    const response = await getMessageTypes()
    messageTypes.value = response
  } catch (error) {
    console.error('获取消息类型列表失败:', error)
  }
}

// 查看详情
const handleDetail = async (row) => {
  detailDialog.value.loading = true
  try {
    const response = await getOrderDetail(row.id)
    detailDialog.value.data = response.data
    detailDialog.value.visible = true
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    detailDialog.value.loading = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    username: '',
    message_type: ''
  }
  dateRange.value = []
  handleSearch()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchOrders()
}

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchOrders()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    'completed': 'success',
    'pending': 'warning',
    'failed': 'danger'
  }
  return map[status] || 'info'
}

onMounted(() => {
  fetchOrders()
  fetchMessageTypes()
})
</script>

<style scoped>
.orders-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stats-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stats-icon {
  margin-right: 20px;
  color: #409EFF;
}

.stats-info {
  flex: 1;
}

.stats-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stats-trend {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.stats-trend .el-icon {
  margin-right: 4px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.task-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.media-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.media-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.video-preview {
  width: 200px;
  max-height: 150px;
  border-radius: 4px;
}
</style>
