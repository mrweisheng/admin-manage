import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.scss'
import { setupErrorHandler } from './utils/error-handler'
import { permission } from './directives/permission'
import './router/permission'

const app = createApp(App)

// 注册全局指令
app.directive('permission', permission)

// 设置错误处理
setupErrorHandler(app)

app.use(createPinia())
   .use(router)
   .use(ElementPlus)
   .mount('#app')
