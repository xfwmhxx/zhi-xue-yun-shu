<!-- src/views/Call/index.vue -->
<template>
  <!-- <Layout :showText="true" :themeBtn="false" :settingBtn="false" @on-exit="handleExit"> -->
  <!-- 使用 v-if 确保 controller 存在时才渲染 Stage -->
  <Stage
    v-if="controller"
    :autoCall="autoCall"
    @on-auth-fail="handleAuthFail"
    @on-exit="handleExit"
  />
  <!-- 加载状态 -->
  <div v-else class="loading-container">
    <div class="loading-spinner"></div>
    <p>正在初始化通话...</p>
  </div>
  <slot></slot>
  <!-- </Layout> -->
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeMount, type Ref } from 'vue'
import { useTranslation } from '@/utils/AIYS/common/i18nContext'
import {
  AICallAgentConfig,
  AICallAgentType,
  AICallChatSyncConfig,
  AICallTemplateConfig,
} from 'aliyun-auikit-aicall'

// import { type AUIAICallController } from 'aliyun-auikit-aicall'
import { message } from 'ant-design-vue'
import AUIAICallProxyController from '@/utils/AIYS/controller/AUIAICallProxyController'
import AUIAICallStandardController from '@/utils/AIYS/controller/AUIAICallStandardController'
import type { AICallRunConfig } from '@/utils/AIYS/config/interface'

import Stage from './Stage.vue'
import { useCallStore } from '@/stores/call'
import { provideController } from './ControllerContext'

// ==================== 日志工具函数 ====================
const logWithTimestamp = (
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data?: any,
) => {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [Call]`

  switch (level) {
    case 'info':
      console.log(`${prefix} ℹ️ ${message}`)
      if (data) console.log(`${prefix} 📦 数据:`, data)
      break
    case 'warn':
      console.warn(`${prefix} ⚠️ ${message}`)
      if (data) console.warn(`${prefix} 📦 数据:`, data)
      break
    case 'error':
      console.error(`${prefix} ❌ ${message}`)
      if (data) console.error(`${prefix} 📦 数据:`, data)
      break
    case 'debug':
      console.debug(`${prefix} 🔍 ${message}`)
      if (data) console.debug(`${prefix} 📦 数据:`, data)
      break
  }
}

// 定义 AUIAICallController 接口
// 定义本地类型 - 使用更灵活的类型
interface AUIAICallController {
  userId?: string
  config?: any
  shareConfig?: any
  handup: () => void
  startPreview?: (videoElement: HTMLVideoElement) => void | Promise<void> // 允许 void 或 Promise<void>
  engineConfig?: any
}

// 定义 props
interface Props {
  mode?: string
  rc: AICallRunConfig
  userId?: string
  userToken?: string
  shareToken?: string
  autoCall?: boolean
  appServer?: string
  agentType: AICallAgentType
  agentId?: string
  region?: string
  userData?: string
  agentConfig?: AICallAgentConfig
  isShare?: boolean
  onExit?: () => void
  onAuthFail?: () => void
  chatSyncConfig?: AICallChatSyncConfig
  rtcEngineConfig?: {
    environment?: 'PRE' | 'PROD'
    useAudioPlugin?: boolean
    dumpAudioData?: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  mode: undefined,
  userId: undefined,
  userToken: undefined,
  shareToken: undefined,
  autoCall: false,
  appServer: undefined,
  agentId: undefined,
  region: undefined,
  userData: undefined,
  agentConfig: undefined,
  isShare: false,
  onExit: undefined,
  onAuthFail: undefined,
  chatSyncConfig: undefined,
  rtcEngineConfig: undefined,
})

const { t } = useTranslation()
// 修改：使用 AUIAICallController 类型作为联合类型的父类型
const controller = ref<AUIAICallController | null>(null)
const isInitialized = ref(false)

// 获取 store 实例
const callStore = useCallStore()

// 创建 controller - 移到 onBeforeMount 中确保在渲染前执行
onBeforeMount(() => {
  logWithTimestamp('info', '========== 组件开始初始化 ==========')
  createAndProvideController()
})

// 创建并提供 controller
const createAndProvideController = () => {
  const startTime = Date.now()
  logWithTimestamp('info', '========== 开始创建Controller ==========')

  logWithTimestamp('debug', '检查必需参数', {
    hasUserId: !!props.userId,
    hasUserToken: !!props.userToken,
    hasAppServer: !!props.appServer,
    hasShareToken: !!props.shareToken,
    agentType: props.agentType,
    mode: props.mode,
  })

  // 检查必需参数
  if (!props.userId || !props.userToken) {
    logWithTimestamp('error', '缺少必需参数: userId 或 userToken', {
      userId: props.userId ? '存在' : '缺失',
      userToken: props.userToken ? '存在' : '缺失',
    })
    console.warn('⚠️ MISSING REQUIRED PARAMS: userId or userToken is missing!')
    return
  }

  // 更新 store
  if (callStore.setAgentType) {
    callStore.setAgentType(props.agentType)
    logWithTimestamp('debug', '已更新store中的agentType', { agentType: props.agentType })
  } else {
    callStore.agentType = props.agentType
    logWithTimestamp('debug', '直接设置store.agentType', { agentType: props.agentType })
  }

  // 判断模式
  const isStandardMode = props.mode === 'standard' || !!props.shareToken
  logWithTimestamp('info', `模式判断结果: ${isStandardMode ? 'Standard模式' : 'Proxy模式'}`, {
    mode: props.mode,
    hasShareToken: !!props.shareToken,
  })

  // 创建控制器 - 使用父类型
  let _controller: AUIAICallController | null = null

  if (isStandardMode) {
    logWithTimestamp('info', '创建 Standard 控制器', { userId: props.userId })
    const standardController = new AUIAICallStandardController(props.userId!, props.userToken!)

    // 设置 appServer - 只有 Standard 模式才有 appServer 属性
    const serverUrl = props.appServer || props.rc?.appServer || ''
    if (serverUrl) {
      logWithTimestamp('info', '设置 appServer', { url: serverUrl })
      standardController.appServer = serverUrl
    } else {
      logWithTimestamp('warn', '未提供 appServer，请求可能失败')
    }

    _controller = standardController
  } else {
    logWithTimestamp('info', '创建 Proxy 控制器', { userId: props.userId })
    _controller = new AUIAICallProxyController(props.userId!, props.userToken!)
  }

  // 确保控制器创建成功
  if (!_controller) {
    logWithTimestamp('error', '控制器创建失败')
    console.error('❌ Failed to create controller')
    return
  }

  logWithTimestamp('info', '控制器创建成功')

  // 设置 RTC 配置（两种模式都支持）
  if (props.rtcEngineConfig) {
    logWithTimestamp('info', '设置 RTC 引擎配置', props.rtcEngineConfig)
    if (!_controller.engineConfig) {
      ;(_controller as any).engineConfig = {}
    }
    ;(_controller as any).engineConfig.rtcEngineConfig = props.rtcEngineConfig
  }

  // 构建 config 对象
  const configObject = {
    agentType: props.agentType,
    region: props.region || 'cn-shanghai',
    userData: props.userData,
    agentConfig: props.agentConfig,
    agentId: props.agentId || '',
    userId: props.userId,
    userJoinToken: '',
    chatSyncConfig: props.chatSyncConfig,
  }

  logWithTimestamp('debug', '设置控制器配置', configObject)
  _controller.config = configObject

  // 处理 shareToken
  if (props.shareToken) {
    logWithTimestamp('info', '处理 shareToken', {
      shareToken: props.shareToken.substring(0, 20) + '...',
    })
    _controller.shareConfig = props.shareToken

    if (!_controller.shareConfig) {
      logWithTimestamp('error', 'shareToken 无效')
      message.error(t('share.tokenInvalid'))
      return
    }

    if (_controller.shareConfig.region) {
      logWithTimestamp('info', '从 shareToken 更新 region', {
        region: _controller.shareConfig.region,
      })
      _controller.config.region = _controller.shareConfig.region
    }

    if (_controller.shareConfig.templateConfig) {
      logWithTimestamp('debug', '从 shareToken 更新 templateConfig')
      _controller.config.templateConfig = AICallTemplateConfig.fromJsonString(
        _controller.shareConfig?.agentType || AICallAgentType.VoiceAgent,
        _controller.shareConfig?.templateConfig,
      )
    }

    if (_controller.shareConfig.userData) {
      logWithTimestamp('debug', '从 shareToken 更新 userData')
      _controller.config.userData = _controller.shareConfig.userData
    }
  }

  // 设置 controller 值
  controller.value = _controller

  // 立即 provide - 现在 controller 的类型是 Ref<AUIAICallController | null>
  logWithTimestamp('info', '✅ Controller 创建完成，正在提供给子组件...')
  logWithTimestamp('debug', 'Controller 详情', {
    userId: _controller.userId,
    hasConfig: !!_controller.config,
    agentType: _controller.config?.agentType,
  })
  provideController(controller)

  isInitialized.value = true

  const duration = Date.now() - startTime
  logWithTimestamp('info', `========== Controller 创建完成，耗时: ${duration}ms ==========`)
}

// 事件处理
const handleAuthFail = () => {
  logWithTimestamp('error', '认证失败事件触发')
  props.onAuthFail?.()
}

const handleExit = () => {
  logWithTimestamp('info', '退出事件触发')
  props.onExit?.()
}

// 关闭页面时尝试挂断来停止智能体
onMounted(() => {
  logWithTimestamp('info', '组件已挂载')

  const beforeOnload = () => {
    logWithTimestamp('info', '页面关闭/刷新前，执行挂断操作')
    controller.value?.handup()
  }

  window.addEventListener('beforeunload', beforeOnload)
  logWithTimestamp('debug', '已注册 beforeunload 事件监听器')
})

onUnmounted(() => {
  logWithTimestamp('info', '组件即将卸载，清理资源')

  const beforeOnload = () => {
    logWithTimestamp('info', '页面关闭/刷新前，执行挂断操作')
    controller.value?.handup()
  }
  window.removeEventListener('beforeunload', beforeOnload)
  logWithTimestamp('debug', '已移除 beforeunload 事件监听器')
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
