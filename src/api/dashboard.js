import request from '@/utils/request'

export function getDashboardData() {
  return request({
    url: '/dashboard/statistics',
    method: 'get'
  })
}

export function getWeeklyTrend() {
  return request({
    url: '/dashboard/weekly-trend',
    method: 'get'
  })
}

export function getTaskDistribution() {
  return request({
    url: '/dashboard/task-distribution',
    method: 'get'
  })
} 