import { createApp, h, ref, type App, type ComponentPublicInstance } from 'vue'
import MessageNotification from './Notification.vue'

// 消息配置接口
export interface MessageConfig {
  // 添加 export
  // 消息类型
  type?: 'success' | 'error' | 'warning' | 'info'
  // 标题（必需）
  title: string
  // 备注（可选）
  note?: string
  // 停留时间（毫秒）
  duration?: number
  // 距离顶部的距离（像素）
  top?: number
  // 关闭回调
  onClose?: () => void
}

// 消息实例接口
export interface MessageInstance {
  // 添加 export
  close: () => void
}

// 消息队列
const messageQueue: ComponentPublicInstance[] = []
// 消息ID计数器
let idCounter = 0

// 创建消息函数
const createMessage = (config: MessageConfig): MessageInstance => {
  const id = `message_${++idCounter}`
  const container = document.createElement('div')
  document.body.appendChild(container)

  let messageApp: App
  let messageInstance: ComponentPublicInstance | null = null // 初始化为null

  // 关闭消息函数
  const close = () => {
    if (messageInstance) {
      // 触发组件的hide方法
      if ((messageInstance as any).hide) {
        ;(messageInstance as any).hide()
      } else {
        // 如果组件没有暴露hide方法，直接移除
        removeMessage()
      }
    }
  }

  // 移除消息
  const removeMessage = () => {
    if (messageApp) {
      messageApp.unmount()
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }

    // 从队列中移除
    if (messageInstance) {
      const index = messageQueue.indexOf(messageInstance)
      if (index > -1) {
        messageQueue.splice(index, 1)
      }
    }

    // 调用关闭回调
    if (config.onClose) {
      config.onClose()
    }
  }

  // 计算top值（考虑多个消息的堆叠）
  const calculateTop = () => {
    const baseTop = config.top || 10
    const messageHeight = 120 // 消息组件高度（包含外边距）
    const gap = 16 // 消息之间的间隙

    if (messageQueue.length === 0) {
      return baseTop
    }

    // 获取最后一个消息的top值
    const lastMessage = messageQueue[messageQueue.length - 1]

    // 修复：添加安全检查
    if (!lastMessage || !lastMessage.$el) {
      return baseTop
    }

    const lastTop = parseInt(lastMessage.$el.style.top) || baseTop
    return lastTop + messageHeight + gap
  }

  // 创建Vue应用
  messageApp = createApp({
    setup() {
      const show = ref(true)
      const top = ref(calculateTop())

      // 当组件销毁时调用
      const handleDestroy = () => {
        removeMessage()
      }

      return () =>
        h(MessageNotification, {
          type: config.type,
          title: config.title,
          note: config.note,
          duration: config.duration,
          top: top.value,
          show: show.value,
          onDestroy: handleDestroy,
          onClose: () => {
            if (config.onClose) {
              config.onClose()
            }
          },
        })
    },
  })

  // 挂载应用
  messageInstance = messageApp.mount(container) as ComponentPublicInstance

  // 修复：确保messageInstance不为null
  if (messageInstance) {
    messageQueue.push(messageInstance)
  }

  return {
    close,
  }
}

// 消息API
const message = {
  // 成功消息
  success: (title: string, config?: Omit<MessageConfig, 'type' | 'title'>) => {
    return createMessage({
      type: 'success',
      title,
      ...config,
    })
  },

  // 错误消息
  error: (title: string, config?: Omit<MessageConfig, 'type' | 'title'>) => {
    return createMessage({
      type: 'error',
      title,
      ...config,
    })
  },

  // 警告消息
  warning: (title: string, config?: Omit<MessageConfig, 'type' | 'title'>) => {
    return createMessage({
      type: 'warning',
      title,
      ...config,
    })
  },

  // 信息消息
  info: (title: string, config?: Omit<MessageConfig, 'type' | 'title'>) => {
    return createMessage({
      type: 'info',
      title,
      ...config,
    })
  },

  // 手动创建消息
  open: (config: MessageConfig) => {
    return createMessage(config)
  },
}

export default message
