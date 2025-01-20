import request from '@/utils/request'
import { API_URLS } from './config'

export function getUserList(params) {
  return request({
    url: API_URLS.USER_LIST,
    method: 'get',
    params
  })
}

export function disableUser(userId, reason) {
  return request({
    url: API_URLS.USER_DISABLE(userId),
    method: 'put',
    data: { reason }
  })
}

export function enableUser(userId) {
  return request({
    url: API_URLS.USER_ENABLE(userId),
    method: 'put'
  })
}

export function searchUsers(params) {
  return request({
    url: API_URLS.USER_LIST,
    method: 'get',
    params: {
      ...params,
      limit: 10
    }
  })
}

export function toggleUserStatus(userId) {
  return request({
    url: `${API_URLS.USER_LIST}/${userId}/toggle-status`,
    method: 'put'
  })
}

export function deleteUser(userId) {
  return request({
    url: `${API_URLS.USER_LIST}/${userId}`,
    method: 'delete'
  })
}

export function resetUserPassword(userId, newPassword) {
  return request({
    url: `${API_URLS.USER_LIST}/${userId}/reset-password`,
    method: 'put',
    data: newPassword ? { newPassword } : {}
  })
}

export function registerUser(data) {
  return request({
    url: '/api/user/register',
    method: 'post',
    data
  })
}

export function updateUserBalance(userId, balance) {
  return request({
    url: `/api/user/balance`,
    method: 'put',
    data: { 
      userId: Number(userId),
      amount: Number(balance) 
    }
  })
}
