<!-- src/views/Call/Stage.vue -->

<template>
  <StageWrapper>
    <!-- 主体内容 -->
    <div class="stage-bd" @click="handleBodyClick">
      <Vision class="actor" />
    </div>

    <!-- 错误弹窗 -->
    <van-dialog
      v-model:show="showErrorDialog"
      :title="t('error.title')"
      :message="callErrorMessage"
      :show-cancel-button="true"
      :confirm-button-text="t('common.exit')"
      :cancel-button-text="t('common.close')"
      @confirm="handleStopCall"
      @cancel="handleCloseErrorDialog"
    />
  </StageWrapper>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { debounce as debounceFn } from 'lodash-es'
import ARTCAICallEngine, {
  AICallAgentError,
  AICallState,
  AICallVoiceprintResult,
  type JSONObject,
} from 'aliyun-auikit-aicall'
import { showDialog, showToast } from 'vant'
import { isMobile } from '@/utils/AIYS/common/utils'
import { useController } from './ControllerContext'
import { useCallStore } from '@/stores/call'
import StageWrapper from '@/views/AIYS/StageWrapper.vue'
import Vision from './Vision.vue'

// ==================== 日志工具函数 ====================
const logWithTimestamp = (
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data?: any,
) => {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [Stage]`

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

// 定义 Props
export interface StageProps {
  autoCall?: boolean
  onStateChange?: (callState: AICallState) => void
  onExit?: () => void
  onAuthFail?: () => void
  limitSecond?: number
}

const props = withDefaults(defineProps<StageProps>(), {
  autoCall: false,
  onStateChange: () => {},
  onExit: () => {},
  onAuthFail: () => {},
  limitSecond: 0,
})

// 使用 i18n
const { t } = useI18n()

// 使用控制器上下文
const controller = useController()

// 使用状态管理
const callStore = useCallStore()

// 响应式状态
const callState = computed(() => callStore.callState)
const callErrorMessage = ref('')
const showErrorDialog = ref(false)
const resumeDialogVisible = ref(false)

// 倒计时相关
const countdownRef = ref<number>(0)
const startTimeRef = ref<number>(0)

// 计算属性
const isConnecting = computed(() => callState.value === AICallState.Connecting)

const isCallReady = computed(() => callState.value === AICallState.Connected && controller.value)

const title = computed(() => {
  return t('agent.vision') // 直接返回视觉智能体的标题
})

// 防抖中断说话
const interruptSpeaking = debounceFn(() => {
  logWithTimestamp('debug', '中断说话')
  controller.value?.interruptSpeaking()
}, 100)

// 处理主体点击
const handleBodyClick = () => {
  if (isMobile()) {
    interruptSpeaking()
  }
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (isMobile()) return

  if (e.key === 'Tab') {
    logWithTimestamp('debug', 'Tab键按下，中断说话')
    e.stopImmediatePropagation()
    e.preventDefault()
    e.stopPropagation()
    interruptSpeaking()
  }
}

// 处理停止通话
const handleStopCall = () => {
  logWithTimestamp('info', '停止通话')
  controller.value?.handup()
  callStore.reset(!!controller.value?.shareConfig)
  props.onExit?.()
}

// 处理关闭错误弹窗
const handleCloseErrorDialog = () => {
  logWithTimestamp('debug', '关闭错误弹窗')
  callStore.setCallState(AICallState.None)
  showErrorDialog.value = false
}

// 处理状态变化
const handleStateChange = (newState: AICallState) => {
  logWithTimestamp('info', '通话状态变化', { newState })
  callStore.setCallState(newState)

  if (newState === AICallState.Connected) {
    logWithTimestamp('info', '✅ Call connected, Vision component will be rendered')
  }

  if (newState === AICallState.Error) {
    logWithTimestamp('error', '通话错误', { errorCode: controller.value?.errorCode })
    controller.value?.handup()
    callErrorMessage.value = getErrorMessage(controller.value?.errorCode)
    showErrorDialog.value = true
  }
}

// 处理智能体状态变化
const handleAgentStateChange = (newState: any) => {
  logWithTimestamp('debug', '智能体状态变化', { newState })
  callStore.setAgentState(newState)
}

// 处理说话音量变化
const handleActiveSpeakerVolumeChanged = (userId: string, volume: number) => {
  if (userId === '') {
    const isSpeaking = volume > 30
    callStore.setIsSpeaking(isSpeaking)
    if (isSpeaking) {
      logWithTimestamp('debug', '用户正在说话', { volume })
    }
  }
}

// 处理智能体情绪通知
const handleAgentEmotionNotify = (emotion: string, sentenceId: number) => {
  logWithTimestamp('info', '智能体情绪通知', { emotion, sentenceId })
}

// 处理智能体字幕通知
const handleAgentSubtitleNotify = (data: any) => {
  logWithTimestamp('debug', '智能体字幕', { data })
  callStore.updateSubtitle({
    data,
    source: 'agent',
  })
}

// 处理用户字幕通知
const handleUserSubtitleNotify = (data: any, voiceprintResult: AICallVoiceprintResult) => {
  logWithTimestamp('debug', '用户字幕', { data, voiceprintResult })
  callStore.updateSubtitle({
    data,
    source: 'user',
    voiceprintResult,
  })
}

// 处理延迟统计
const handleLatencyStats = (stats: any) => {
  logWithTimestamp('debug', '延迟统计', stats)
  callStore.addLatencyRecord(stats)
}

// 处理用户 Token 过期
const handleUserTokenExpired = () => {
  logWithTimestamp('error', '用户Token过期')
  showToast({
    message: t('login.tokenExpired'),
  })
  props.onAuthFail?.()
}

// 处理通话开始
const handleCallBegin = (elapsedTime: number) => {
  logWithTimestamp('info', `通话开始，耗时: ${elapsedTime}ms`)

  if (countdownRef.value) {
    window.clearInterval(countdownRef.value)
  }

  // 限时逻辑
  if (props.limitSecond && props.limitSecond > 0) {
    startTimeRef.value = Date.now()
    countdownRef.value = window.setInterval(() => {
      const delta = Date.now() - startTimeRef.value
      if (delta > props.limitSecond * 1000) {
        logWithTimestamp('info', `通话超时，限制: ${props.limitSecond}秒`)
        showToast({
          message: t('vision.timeLimit'),
        })
        stopCall()
        if (countdownRef.value) {
          window.clearInterval(countdownRef.value)
        }
      }
    }, 5000)
  }
}

// 处理智能体即将离开
const handleAgentWillLeave = (reason: number) => {
  logWithTimestamp('info', '智能体即将离开', { reason })
  let toast = t('agent.ended')
  if (reason === 2001) {
    toast = t('agent.endedByInactivity')
  } else if (reason === 2002) {
    toast = t('agent.endedByAgent')
  }
  showToast({
    message: toast,
  })
}

// 处理智能体自定义消息
const handleReceivedAgentCustomMessage = (data: any) => {
  logWithTimestamp('debug', '收到智能体自定义消息', data)
  showToast({
    message: t('agent.receivedCustomMessage', { msg: JSON.stringify(data) }),
  })
}

// 处理真人接管即将开始
const handleHumanTakeoverWillStart = () => {
  logWithTimestamp('info', '真人接管即将开始')
  showToast({
    message: t('humanTakeover.willStart'),
  })
}

// 处理真人接管已连接
const handleHumanTakeoverConnected = () => {
  logWithTimestamp('info', '真人接管已连接')
  showToast({
    message: t('humanTakeover.connected'),
  })
}

// 处理视觉自定义截图状态变化
const handleVisionCustomCaptureChanged = (enabled: boolean) => {
  logWithTimestamp('info', '视觉自定义截图状态变化', { enabled })
  if (enabled) {
    showToast({
      message: t('vision.customCapture.enabled'),
    })
  } else {
    showToast({
      message: t('vision.customCapture.disabled'),
    })
  }
}

// 处理说话被打断
const handleSpeakingInterrupted = (reason: any) => {
  logWithTimestamp('info', '说话被打断', { reason })
}

// 处理智能体配置加载完成
const handleAgentConfigLoaded = (config: JSONObject) => {
  logWithTimestamp('info', '智能体配置加载完成', config)
  if (config.AvatarUrl) {
    callStore.setVoiceAvatarUrl(config.AvatarUrl as string)
  }
  if ((config?.TtsConfig as JSONObject)?.VoiceId) {
    callStore.setVoiceId((config.TtsConfig as JSONObject).VoiceId as string)
  }
}

// 处理自动播放失败
const handleAgentAutoPlayFailed = async () => {
  logWithTimestamp('warn', '自动播放失败，需要用户交互')
  if (resumeDialogVisible.value) return

  resumeDialogVisible.value = true

  await showDialog({
    className: 'ai-not-support-dialog',
    title: t('resume.title'),
    message: t('resume.content'),
    showCancelButton: false,
    confirmButtonText: t('resume.btn'),
  })

  resumeDialogVisible.value = false
}

// 处理收到 VCR 结果
const handleReceivedAgentVcrResult = (result: any) => {
  logWithTimestamp('debug', '收到VCR结果', result)
}

// 获取错误消息
const getErrorMessage = (errorCode?: number): string => {
  const errorMessages: Record<number, string> = {
    // 添加具体的错误码映射
  }
  return errorMessages[errorCode || 0] || t('error.unknown')
}

// 停止通话
const stopCall = () => {
  logWithTimestamp('info', '停止通话')
  controller.value?.handup()
  callStore.reset(!!controller.value?.shareConfig)
  props.onExit?.()
}

// 开始通话
const startCall = async () => {
  logWithTimestamp('info', '========== 开始通话 ==========')

  if (!controller.value) {
    logWithTimestamp('error', 'Controller 未就绪')
    return
  }

  // 检查浏览器支持
  const supportedResult = await ARTCAICallEngine.isSupported()
  if (!supportedResult.support) {
    logWithTimestamp('error', '浏览器不支持', { isSecureContext: window.isSecureContext })
    if (!window.isSecureContext) {
      showDialog({
        className: 'ai-not-support-dialog',
        title: t('system.notSupported'),
        message: t('system.notSecureContext'),
        showCancelButton: false,
      })
      return
    }

    showDialog({
      title: t('system.notSupported'),
      message: t('system.notSupported'),
      showCancelButton: false,
    })
    return
  }

  logWithTimestamp('info', '浏览器支持检查通过')

  // 移除旧的事件监听
  removeEventListeners()

  // 绑定事件
  bindEventListeners()

  // 设置初始配置
  const currentAgentConfig = controller.value.config.agentConfig

  if (currentAgentConfig?.enablePushToTalk !== undefined) {
    callStore.setEnablePushToTalk(currentAgentConfig.enablePushToTalk)
  }

  if (currentAgentConfig?.interruptConfig?.enableVoiceInterrupt !== undefined) {
    callStore.setEnableVoiceInterrupt(currentAgentConfig.interruptConfig.enableVoiceInterrupt)
  }

  if (currentAgentConfig?.ttsConfig?.agentVoiceId) {
    callStore.setVoiceId(currentAgentConfig.ttsConfig.agentVoiceId)
  }

  if (currentAgentConfig?.voiceprintConfig?.voiceprintId) {
    callStore.setVoiceprintId(currentAgentConfig.voiceprintConfig.voiceprintId)
  }

  if (currentAgentConfig?.voiceprintConfig?.useVoiceprint !== undefined) {
    callStore.setEnableVoiceprint(currentAgentConfig.voiceprintConfig.useVoiceprint)
  }

  // 开始通话
  const startTime = Date.now()
  try {
    logWithTimestamp('info', '调用 controller.start()...')
    await controller.value.start()
    const duration = Date.now() - startTime
    logWithTimestamp('info', `✅ controller.start() 成功，耗时: ${duration}ms`)
  } catch (error) {
    const duration = Date.now() - startTime
    logWithTimestamp('error', `❌ controller.start() 失败，耗时: ${duration}ms`, error)

    if ((error as AICallAgentError).name === 'ServiceAuthError') {
      logWithTimestamp('error', '服务认证错误')
      props.onAuthFail?.()
    }

    callStore.setCallState(AICallState.Error)
    callErrorMessage.value = getErrorMessage(controller.value.errorCode)
    showErrorDialog.value = true
  }
}

// 绑定事件监听
const bindEventListeners = () => {
  logWithTimestamp('debug', '绑定事件监听器')
  if (!controller.value) return

  const c = controller.value

  c.on('AICallStateChanged', handleStateChange)
  c.on('AICallAgentStateChanged', handleAgentStateChange)
  c.on('AICallActiveSpeakerVolumeChanged', handleActiveSpeakerVolumeChanged)
  c.on('AICallAgentEmotionNotify', handleAgentEmotionNotify)
  c.on('AICallAgentSubtitleNotify', handleAgentSubtitleNotify)
  c.on('AICallUserSubtitleNotify', handleUserSubtitleNotify)
  c.on('AICallLatencyStats', handleLatencyStats)
  c.on('AICallUserTokenExpired', handleUserTokenExpired)
  c.on('AICallBegin', handleCallBegin)
  c.on('AICallAgentWillLeave', handleAgentWillLeave)
  c.on('AICallReceivedAgentCustomMessage', handleReceivedAgentCustomMessage)
  c.on('AICallHumanTakeoverWillStart', handleHumanTakeoverWillStart)
  c.on('AICallHumanTakeoverConnected', handleHumanTakeoverConnected)
  c.on('AICallVisionCustomCaptureChanged', handleVisionCustomCaptureChanged)
  c.on('AICallSpeakingInterrupted', handleSpeakingInterrupted)
  c.on('AICallAgentConfigLoaded', handleAgentConfigLoaded)
  c.on('AICallAgentAutoPlayFailed', handleAgentAutoPlayFailed)
  c.on('AICallReceivedAgentVcrResult', handleReceivedAgentVcrResult)

  logWithTimestamp('debug', '事件监听器绑定完成')
}

// 移除事件监听
const removeEventListeners = () => {
  logWithTimestamp('debug', '移除事件监听器')
  if (!controller.value) return

  const c = controller.value

  c.off?.('AICallStateChanged', handleStateChange)
  c.off?.('AICallAgentStateChanged', handleAgentStateChange)
  c.off?.('AICallActiveSpeakerVolumeChanged', handleActiveSpeakerVolumeChanged)
  c.off?.('AICallAgentEmotionNotify', handleAgentEmotionNotify)
  c.off?.('AICallAgentSubtitleNotify', handleAgentSubtitleNotify)
  c.off?.('AICallUserSubtitleNotify', handleUserSubtitleNotify)
  c.off?.('AICallLatencyStats', handleLatencyStats)
  c.off?.('AICallUserTokenExpired', handleUserTokenExpired)
  c.off?.('AICallBegin', handleCallBegin)
  c.off?.('AICallAgentWillLeave', handleAgentWillLeave)
  c.off?.('AICallReceivedAgentCustomMessage', handleReceivedAgentCustomMessage)
  c.off?.('AICallHumanTakeoverWillStart', handleHumanTakeoverWillStart)
  c.off?.('AICallHumanTakeoverConnected', handleHumanTakeoverConnected)
  c.off?.('AICallVisionCustomCaptureChanged', handleVisionCustomCaptureChanged)
  c.off?.('AICallSpeakingInterrupted', handleSpeakingInterrupted)
  c.off?.('AICallAgentConfigLoaded', handleAgentConfigLoaded)
  c.off?.('AICallAgentAutoPlayFailed', handleAgentAutoPlayFailed)
  c.off?.('AICallReceivedAgentVcrResult', handleReceivedAgentVcrResult)
}

// 处理退出
const handleExit = () => {
  logWithTimestamp('info', '退出通话')
  stopCall()
}

// 组件挂载时
onMounted(() => {
  logWithTimestamp('info', '========== Stage 组件挂载 ==========')
  logWithTimestamp('info', '配置信息', { autoCall: props.autoCall, limitSecond: props.limitSecond })

  // 自动开始通话
  if (props.autoCall && controller.value) {
    logWithTimestamp('info', '自动开始通话')
    startCall()
  } else if (props.autoCall && !controller.value) {
    logWithTimestamp('warn', 'autoCall为true但controller未就绪')
  }

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown, true)
  logWithTimestamp('debug', '键盘事件监听已添加')
})

// 组件卸载时
onUnmounted(() => {
  logWithTimestamp('info', '========== Stage 组件卸载 ==========')

  // 清理
  removeEventListeners()
  controller.value?.handup()
  callStore.reset()

  if (countdownRef.value) {
    window.clearInterval(countdownRef.value)
  }

  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyDown, true)
  logWithTimestamp('debug', '清理完成')
})

// 监听 callState 变化
watch(callState, (newState) => {
  logWithTimestamp('debug', 'callState 变化', { newState })
  props.onStateChange?.(newState)
})

// 监听 controller 变化
watch(
  controller,
  (newController, oldController) => {
    logWithTimestamp('debug', 'controller 变化', {
      hasOld: !!oldController,
      hasNew: !!newController,
      autoCall: props.autoCall,
    })

    if (oldController) {
      removeEventListeners()
      oldController.handup()
    }
    if (newController && props.autoCall) {
      logWithTimestamp('info', 'controller 就绪，开始通话')
      startCall()
    }
  },
  { immediate: true },
)
</script>

<style lang="less" scoped>
.stage-bd {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.connecting-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actor {
  min-height: 0;
  flex: 1;
}

@media screen and (max-width: 768px) {
  .actor {
    padding-top: 8px;
  }
}
</style>
