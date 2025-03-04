import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { 
          requiresAuth: true,
          title: '仪表盘'
        }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/UsersView.vue'),
        meta: {
          requiresAuth: true,
          title: '用户管理'
        }
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/TasksView.vue'),
        meta: {
          requiresAuth: true,
          title: '任务管理'
        }
      },
      {
        path: 'message-types',
        name: 'MessageTypes',
        component: () => import('@/views/MessageTypesView.vue'),
        meta: {
          requiresAuth: true,
          title: '消息积分'
        }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/OrdersView.vue'),
        meta: {
          requiresAuth: true,
          title: '订单管理'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/usermanager'),
  routes
})

export default router
