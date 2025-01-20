import request from '@/utils/request'
import { API_URLS } from './config'

export function register(data) {
  return request({
    url: API_URLS.ADMIN_REGISTER,
    method: 'post',
    data
  })
}

export function login(data) {
  return request({
    url: API_URLS.ADMIN_LOGIN,
    method: 'post',
    data
  })
}

export function getProfile() {
  return request({
    url: API_URLS.ADMIN_PROFILE,
    method: 'get'
  })
} 