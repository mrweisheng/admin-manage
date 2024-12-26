import request from '@/utils/request'
import { API_URLS } from './config'

export function getTaskList(params) {
  return request({
    url: API_URLS.TASK_LIST,
    method: 'get',
    params: {
      ...params,
      start_date: params.dateRange?.[0],
      end_date: params.dateRange?.[1],
      user_id: params.userId
    }
  })
}

export function getTaskDetail(taskId) {
  return request({
    url: `${API_URLS.TASK_LIST}/${taskId}`,
    method: 'get'
  })
}

export function updateTaskStatus(taskId, status) {
  return request({
    url: `${API_URLS.TASK_LIST}/${taskId}/status`,
    method: 'put',
    data: { status }
  })
}

export function getTaskStatusHistory(taskId) {
  return request({
    url: `${API_URLS.TASK_LIST}/${taskId}/history`,
    method: 'get'
  })
}

export function getTaskStats() {
  return request({
    url: API_URLS.TASK_STATS,
    method: 'get'
  })
}

export function exportTasks(params) {
  return request({
    url: `${API_URLS.TASK_LIST}/export`,
    method: 'get',
    params,
    responseType: 'blob'
  })
} 