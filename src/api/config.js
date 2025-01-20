export const API_URLS = {
  // 管理员相关
  ADMIN_REGISTER: '/api/admin/register',
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_PROFILE: '/api/admin/profile',
  
  // 用户管理
  USER_LIST: '/api/admin/users',
  USER_DISABLE: (id) => `/api/admin/users/${id}/disable`,
  USER_ENABLE: (id) => `/api/admin/users/${id}/enable`,
  
  // 任务管理
  TASK_LIST: '/api/admin/tasks',
  TASK_STATS: '/api/admin/tasks/stats',
  
  // 消息类型管理
  MESSAGE_TYPES: '/api/admin/message-types',
  MESSAGE_TYPE_DETAIL: (id) => `/api/admin/message-types/${id}`,
  
  // 订单管理
  ORDERS: '/api/admin/orders',
  ORDER_DETAIL: (id) => `/api/admin/orders/${id}`
} 