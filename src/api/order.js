import request from '@/utils/request'
import { API_URLS } from './config'

export function getOrders(params) {
  return request({
    url: API_URLS.ORDERS,
    method: 'get',
    params
  })
}

export function getOrderDetail(id) {
  return request({
    url: API_URLS.ORDER_DETAIL(id),
    method: 'get'
  })
} 