import request from '@/utils/request'
import { API_URLS } from './config'

export function getMessageTypes() {
  return request({
    url: API_URLS.MESSAGE_TYPES,
    method: 'get'
  })
}

export function createMessageType(data) {
  return request({
    url: API_URLS.MESSAGE_TYPES,
    method: 'post',
    data
  })
}

export function updateMessageType(id, data) {
  return request({
    url: API_URLS.MESSAGE_TYPE_DETAIL(id),
    method: 'put',
    data
  })
}

export function deleteMessageType(id) {
  return request({
    url: API_URLS.MESSAGE_TYPE_DETAIL(id),
    method: 'delete'
  })
} 