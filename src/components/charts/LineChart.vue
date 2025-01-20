<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.data.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '任务数',
        type: 'line',
        smooth: true,
        data: props.data.values,
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  }
  
  chart.setOption(option)
}

watch(() => props.data, () => {
  chart?.setOption({
    xAxis: { data: props.data.dates },
    series: [{ data: props.data.values }]
  })
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', () => chart?.resize())
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style> 