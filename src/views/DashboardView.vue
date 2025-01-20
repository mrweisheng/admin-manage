<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in statisticsCards" :key="card.title">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>{{ card.title }}</span>
              <el-icon :class="card.iconClass"><component :is="card.icon" /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ card.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>任务状态分布</span>
            </div>
          </template>
          <div class="chart-container">
            <PieChart :data="pieChartData" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>近7天任务趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <LineChart :data="lineChartData" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTaskStats } from '@/api/task'
import PieChart from '@/components/charts/PieChart.vue'
import LineChart from '@/components/charts/LineChart.vue'

const statisticsCards = ref([
  { title: '总任务数', value: 0, icon: 'DataLine', iconClass: 'blue' },
  { title: '待处理任务', value: 0, icon: 'Timer', iconClass: 'orange' },
  { title: '处理中任务', value: 0, icon: 'Loading', iconClass: 'green' },
  { title: '已完成任务', value: 0, icon: 'Check', iconClass: 'purple' }
])

const pieChartData = ref([])
const lineChartData = ref({
  dates: [],
  values: []
})

const fetchDashboardData = async () => {
  try {
    const { data } = await getTaskStats()
    // 更新统计卡片数据
    statisticsCards.value[0].value = data.total
    statisticsCards.value[1].value = data.pending
    statisticsCards.value[2].value = data.processing
    statisticsCards.value[3].value = data.completed

    // 更新饼图数据
    pieChartData.value = [
      { name: '待处理', value: data.pending },
      { name: '处理中', value: data.processing },
      { name: '已完成', value: data.completed },
      { name: '失败', value: data.failed }
    ]

    // 这里的趋势数据需要另外获取或者后端提供
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.statistics-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-row {
  margin-top: 20px;
}

.chart-container {
  height: 300px;
}

.blue { color: #409EFF; }
.orange { color: #E6A23C; }
.green { color: #67C23A; }
.purple { color: #909399; }
</style>
