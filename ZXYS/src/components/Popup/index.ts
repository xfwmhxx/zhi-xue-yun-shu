import {
  type App,
  createApp,
  h,
  ref,
  onBeforeUnmount,
  type Component,
  defineComponent,
  type VNode,
} from 'vue'
import PopupComponent from './Popup.vue'

// 定义弹窗配置接口
export interface PopupOptions {
  // 弹窗类型：1-标准弹窗，2-无标题弹窗，3-单按钮弹窗
  type: 1 | 2 | 3
  // 弹窗标题（类型1和3需要）
  title?: string
  // 弹窗内容，可以是字符串或字符串数组
  content: string | string[]
  // 是否可以通过点击遮罩层关闭
  closeOnClickOverlay?: boolean
  // 是否可以通过ESC键关闭
  closeOnPressEscape?: boolean
  // 弹窗宽度
  width?: string
  // 弹窗高度
  height?: string
  // 弹窗最小宽度
  minWidth?: string
  // 弹窗最小高度
  minHeight?: string
  // 弹窗最大宽度
  maxWidth?: string
  // 弹窗最大高度
  maxHeight?: string
  // 确认回调
  onConfirm?: () => void
  // 取消回调
  onCancel?: () => void
  // 打开回调
  onOpened?: () => void
  // 关闭回调
  onClosed?: () => void
}

// 弹窗实例
interface PopupInstance {
  open: () => void
  close: () => void
  destroy: () => void
}

// 全局弹窗挂载容器
let popupContainer: HTMLDivElement | null = null
let popupInstance: PopupInstance | null = null

// 创建弹窗容器
const createPopupContainer = (): HTMLDivElement => {
  const container = document.createElement('div')
  container.id = 'popup-global-container'
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
  `
  document.body.appendChild(container)
  return container
}

// 清理已存在的弹窗
const destroyExistingPopup = () => {
  if (popupInstance) {
    popupInstance.destroy()
  }
  if (popupContainer && popupContainer.parentNode) {
    popupContainer.parentNode.removeChild(popupContainer)
    popupContainer = null
  }
}

// 创建弹窗实例
const createPopup = (options: PopupOptions): PopupInstance & Promise<boolean> => {
  // 清理已存在的弹窗
  destroyExistingPopup()

  // 创建容器
  popupContainer = createPopupContainer()

  // 创建Promise用于返回结果
  let resolvePromise: (value: boolean) => void
  let rejectPromise: (reason?: any) => void
  let isResolved = false

  const promise = new Promise<boolean>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  // 创建Vue应用
  const popupApp = createApp({
    name: 'GlobalPopup',
    setup() {
      const visible = ref(false)

      // 打开弹窗
      const open = () => {
        visible.value = true
      }

      // 关闭弹窗
      const close = () => {
        visible.value = false
      }

      // 销毁弹窗
      const destroy = () => {
        setTimeout(() => {
          if (popupApp) {
            popupApp.unmount()
          }
          if (popupContainer && popupContainer.parentNode) {
            popupContainer.parentNode.removeChild(popupContainer)
            popupContainer = null
          }
          popupInstance = null
        }, 400) // 等待动画完成
      }

      // 立即打开弹窗
      setTimeout(() => {
        open()
      }, 0)

      // 处理确认
      const handleConfirm = () => {
        if (!isResolved) {
          isResolved = true
          resolvePromise(true)
        }
        options.onConfirm?.()
        close()
      }

      // 处理取消
      const handleCancel = () => {
        if (!isResolved) {
          isResolved = true
          resolvePromise(false)
        }
        options.onCancel?.()
        close()
      }

      // 处理打开
      const handleOpened = () => {
        options.onOpened?.()
      }

      // 处理关闭
      const handleClosed = () => {
        destroy()
        options.onClosed?.()
      }

      // 确保在组件销毁前处理结果
      onBeforeUnmount(() => {
        if (!isResolved) {
          isResolved = true
          resolvePromise(false) // 默认返回false
        }
      })

      return () =>
        h(PopupComponent, {
          type: options.type,
          title: options.title,
          content: options.content,
          modelValue: visible.value,
          closeOnClickOverlay: options.closeOnClickOverlay,
          closeOnPressEscape: options.closeOnPressEscape,
          width: options.width,
          height: options.height,
          minWidth: options.minWidth,
          minHeight: options.minHeight,
          maxWidth: options.maxWidth,
          maxHeight: options.maxHeight,
          'onUpdate:modelValue': (value: boolean) => {
            if (!value) {
              close()
            }
          },
          onConfirm: handleConfirm,
          onCancel: handleCancel,
          onOpened: handleOpened,
          onClosed: handleClosed,
        })
    },
  })

  // 挂载到容器
  popupApp.mount(popupContainer)

  // 创建实例对象
  const instance: PopupInstance = {
    open: () => {
      // 通过ref控制打开
    },
    close: () => {
      if (popupContainer) {
        const popupElement = popupContainer.querySelector('.modal-overlay')
        if (popupElement) {
          const popupComponent = popupElement as HTMLElement
          popupComponent.dispatchEvent(new MouseEvent('click'))
        }
      }
    },
    destroy: () => {
      destroyExistingPopup()
    },
  }

  popupInstance = instance

  // 合并实例和Promise
  const combinedInstance = Object.assign(instance, {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  }) as PopupInstance & Promise<boolean>

  return combinedInstance
}

// 命令式API
export const PopupPlugin = {
  // 打开弹窗
  open(options: PopupOptions): Promise<boolean> {
    return createPopup(options) as unknown as Promise<boolean>
  },

  // 打开类型1弹窗
  showType1(options: Omit<PopupOptions, 'type'> & { title: string }): Promise<boolean> {
    return this.open({
      ...options,
      type: 1,
      width: options.width || '60vw',
      height: options.height || 'auto',
      minWidth: options.minWidth || '500px',
      minHeight: options.minHeight || '400px',
      maxWidth: options.maxWidth || '800px',
      maxHeight: options.maxHeight || '500px',
    })
  },

  // 打开类型2弹窗
  showType2(options: Omit<PopupOptions, 'type' | 'title'>): Promise<boolean> {
    return this.open({
      ...options,
      type: 2,
      width: options.width || '60vw',
      height: options.height || 'auto',
      minWidth: options.minWidth || '500px',
      minHeight: options.minHeight || '400px',
      maxWidth: options.maxWidth || '800px',
      maxHeight: options.maxHeight || '500px',
    })
  },

  // 打开类型3弹窗
  showType3(options: Omit<PopupOptions, 'type'> & { title: string }): Promise<boolean> {
    return this.open({
      ...options,
      type: 3,
      width: options.width || '60vw',
      height: options.height || 'auto',
      minWidth: options.minWidth || '500px',
      minHeight: options.minHeight || '400px',
      maxWidth: options.maxWidth || '800px',
      maxHeight: options.maxHeight || '500px',
    })
  },

  // 关闭所有弹窗
  closeAll(): void {
    destroyExistingPopup()
  },

  // 检查是否有弹窗显示
  isOpen(): boolean {
    return popupInstance !== null
  },
}

// Vue插件安装
const Popup = {
  install(app: App) {
    // 注册全局组件
    app.component('Popup', PopupComponent)

    // 添加全局属性
    app.config.globalProperties.$popup = PopupPlugin

    // 提供插件
    app.provide('popup', PopupPlugin)
  },
}

// 导出组件
export { PopupComponent }

// 默认导出插件
export default Popup
