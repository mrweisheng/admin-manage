export const API_URLS = {
  // 管理员相关
  ADMIN_REGISTER: '/taskapi/admin/register',
  ADMIN_LOGIN: '/taskapi/admin/login',
  ADMIN_PROFILE: '/taskapi/admin/profile',
  
  // 用户管理
  USER_LIST: '/taskapi/admin/users',
  USER_DISABLE: (id) => `/taskapi/admin/users/${id}/disable`,
  USER_ENABLE: (id) => `/taskapi/admin/users/${id}/enable`,
  
  // 任务管理
  TASK_LIST: '/taskapi/admin/tasks',
  TASK_STATS: '/taskapi/admin/tasks/stats',
  
  // 消息类型管理
  MESSAGE_TYPES: '/taskapi/admin/message-types',
  MESSAGE_TYPE_DETAIL: (id) => `/taskapi/admin/message-types/${id}`,
  
  // 订单管理
  ORDERS: '/taskapi/admin/orders',
  ORDER_DETAIL: (id) => `/taskapi/admin/orders/${id}`
} 