import type { App } from 'vue'
import MessageNotification from './Notification.vue'
import message from './useMessage'

// 导出组件
export { MessageNotification, message }

// 导出类型
export type { MessageConfig, MessageInstance } from './useMessage'

// 安装插件
const install = (app: App) => {
  // 注册全局组件
  app.component('MessageNotification', MessageNotification)

  // 添加到全局属性
  app.config.globalProperties.$message = message
}

// 默认导出
export default {
  install,
  ...message,
}
