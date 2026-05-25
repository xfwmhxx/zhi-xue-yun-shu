// TraditionalChineseDialog/index.ts
import { createApp, h } from 'vue'
import type { App, Plugin, ComponentPublicInstance } from 'vue'
import TraditionalChineseDialog from './Dialogue.vue'
import type { DialogOptions, DialogStep } from './Dialogue.vue'

export interface DialogInstance extends ComponentPublicInstance {
  show: () => void
  hide: () => void
  goToStep: (index: number) => void
  currentStep: number
}

class DialogService {
  private instance: DialogInstance | null = null
  private container: HTMLElement | null = null
  private app: App | null = null

  show(options: DialogOptions) {
    console.log('🚀 DialogService.show 被调用')

    // 如果已有实例，先销毁
    this.hide()

    // 创建容器
    this.container = document.createElement('div')
    this.container.id = 'tcd-dialog-container-' + Date.now()
    document.body.appendChild(this.container)
    console.log('📦 容器已创建，ID:', this.container.id)

    // 保存当前实例的引用
    const service = this

    // 创建 Vue 应用
    this.app = createApp({
      render() {
        console.log('🎨 渲染对话框组件')
        return h(TraditionalChineseDialog, {
          ...options,
          autoStart: true, // 组件会自动开始
          onClose: () => {
            console.log('🔒 对话框关闭回调')
            options.onClose?.()
            service.hide()
          },
          onAllComplete: () => {
            console.log('✅ 所有步骤完成回调')
            options.onAllComplete?.()
            service.hide()
          },
        })
      },
    })

    try {
      console.log('⚡ 开始挂载对话框应用')
      const dialog = this.app.mount(this.container)
      console.log('✔ 对话框应用挂载完成')

      this.instance = dialog as DialogInstance
      console.log('🎯 对话框实例创建完成')

      // 重要修复：检查实例是否有 show 方法
      console.log('🔍 检查实例方法:')
      console.log('- 实例对象:', this.instance)
      console.log('- 实例的 show 方法:', this.instance?.show)
      console.log('- 实例的 hide 方法:', this.instance?.hide)

      // 如果实例有 show 方法，调用它
      if (this.instance && this.instance.show && typeof this.instance.show === 'function') {
        console.log('🎬 调用实例的 show 方法')
        this.instance.show()
      } else {
        console.log('ℹ️ 实例没有 show 方法，但组件已在 autoStart: true 时自动显示')
        // autoStart: true 时组件会自动显示，所以这里不需要调用 show()
      }
    } catch (error) {
      console.error('💥 挂载对话框应用时出错:', error)
      // 出错时清理
      this.hide()
    }
  }

  hide() {
    console.log('🗑️ DialogService.hide 被调用')

    if (this.instance) {
      // 检查实例是否有 hide 方法
      if (this.instance.hide && typeof this.instance.hide === 'function') {
        console.log('🔒 调用实例的 hide 方法')
        this.instance.hide()
      } else {
        console.log('ℹ️ 实例没有 hide 方法')
      }
    }

    if (this.app) {
      console.log('🧹 卸载 Vue 应用')
      this.app.unmount()
    }

    if (this.container && this.container.parentNode) {
      console.log('🗑️ 移除容器元素')
      this.container.parentNode.removeChild(this.container)
    }

    this.instance = null
    this.app = null
    this.container = null
  }

  goToStep(index: number) {
    console.log(`📊 跳转到步骤 ${index}`)

    if (this.instance) {
      if (this.instance.goToStep && typeof this.instance.goToStep === 'function') {
        this.instance.goToStep(index)
      } else {
        console.log('ℹ️ 实例没有 goToStep 方法')
      }
    } else {
      console.log('⚠️ 没有活动的对话框实例')
    }
  }
}

// 创建单例实例
const dialogService = new DialogService()

// 确保在全局对象上可用（调试用）
if (typeof window !== 'undefined') {
  ;(window as any).$tcd = dialogService
  console.log('🌍 window.$tcd 已设置')
}

// 插件对象
const TraditionalChineseDialogPlugin: Plugin = {
  install(app: App) {
    console.log('🔧 安装 TraditionalChineseDialog 插件')

    // 注册全局组件
    app.component('TraditionalChineseDialog', TraditionalChineseDialog)
    console.log('✅ 组件注册完成')

    // 添加到全局属性
    app.config.globalProperties.$tcd = dialogService
    console.log('✅ 全局属性 $tcd 已添加')

    // 提供注入
    app.provide('tcd', dialogService)
    console.log('✅ provide 注入完成')
  },
}

// 导出组件
export { TraditionalChineseDialog, type DialogStep, type DialogOptions }

// 导出服务实例
export const tcd = dialogService

// 导出插件
export default TraditionalChineseDialogPlugin
