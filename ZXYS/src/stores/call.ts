// src/views/Call/store/index.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  AICallAgentState,
  AICallAgentType,
  AICallState,
  type AICallSubtitleData,
  AICallVoiceprintResult,
  type LatencyStat,
} from 'aliyun-auikit-aicall'

// 字幕项类型
export interface SubtitleItem {
  data: AICallSubtitleData
  source: 'agent' | 'user'
  voiceprintResult?: AICallVoiceprintResult
}

// 初始状态
const initialCallState = {
  callState: AICallState.None,
  agentType: undefined as AICallAgentType | undefined,
  agentState: AICallAgentState.Listening,
  isSpeaking: false,
  currentSubtitle: undefined as SubtitleItem | undefined,
  subtitleList: [] as SubtitleItem[],
  enablePushToTalk: false,
  updatingPushToTalk: false,
  pushingToTalk: false,
  enableVoiceInterrupt: true,
  updatingVoiceInterrupt: false,
  enableVoiceprint: false,
  updatingVoiceprint: false,
  voiceId: '',
  updatingVoiceId: false,
  microphoneMuted: false,
  cameraMuted: false,
  agentVoiceIdList: [] as string[],
  voiceAvatarUrl: '',
  latencyStats: [] as LatencyStat[],
  voiceprintId: '',
}

// 定义 Store
export const useCallStore = defineStore('call', () => {
  // ==================== 状态 ====================

  // 基础状态
  const callState = ref<AICallState>(initialCallState.callState)
  const agentType = ref<AICallAgentType | undefined>(initialCallState.agentType)
  const agentState = ref<AICallAgentState>(initialCallState.agentState)
  const isSpeaking = ref<boolean>(initialCallState.isSpeaking)

  // 字幕相关
  const currentSubtitle = ref<SubtitleItem | undefined>(initialCallState.currentSubtitle)
  const subtitleList = ref<SubtitleItem[]>(initialCallState.subtitleList)

  // 对讲机模式
  const enablePushToTalk = ref<boolean>(initialCallState.enablePushToTalk)
  const updatingPushToTalk = ref<boolean>(initialCallState.updatingPushToTalk)
  const pushingToTalk = ref<boolean>(initialCallState.pushingToTalk)

  // 智能打断
  const enableVoiceInterrupt = ref<boolean>(initialCallState.enableVoiceInterrupt)
  const updatingVoiceInterrupt = ref<boolean>(initialCallState.updatingVoiceInterrupt)

  // 声纹识别
  const enableVoiceprint = ref<boolean>(initialCallState.enableVoiceprint)
  const updatingVoiceprint = ref<boolean>(initialCallState.updatingVoiceprint)
  const voiceprintId = ref<string | undefined>(initialCallState.voiceprintId)

  // 音色
  const voiceId = ref<string>(initialCallState.voiceId)
  const updatingVoiceId = ref<boolean>(initialCallState.updatingVoiceId)

  // 音视频控制
  const microphoneMuted = ref<boolean>(initialCallState.microphoneMuted)
  const cameraMuted = ref<boolean>(initialCallState.cameraMuted)

  // 其他配置
  const agentVoiceIdList = ref<string[]>(initialCallState.agentVoiceIdList)
  const voiceAvatarUrl = ref<string>(initialCallState.voiceAvatarUrl)
  const latencyStats = ref<LatencyStat[]>(initialCallState.latencyStats)

  // ==================== 计算属性 ====================

  const isConnected = computed(() => callState.value === AICallState.Connected)
  const isError = computed(() => callState.value === AICallState.Error)
  const isConnecting = computed(() => callState.value === AICallState.Connecting)
  const isInCall = computed(() =>
    [AICallState.Connecting, AICallState.Connected].includes(callState.value),
  )

  // ==================== 方法 ====================

  /**
   * 更新字幕
   * @param subtitle 字幕项
   */
  const updateSubtitle = (subtitle: SubtitleItem) => {
    // Agent 未识别到主讲人，跳过
    if (
      subtitle.source === 'user' &&
      (subtitle.voiceprintResult === AICallVoiceprintResult.UndetectedSpeaker ||
        subtitle.voiceprintResult === AICallVoiceprintResult.UndetectedSpeakerWithAIVad)
    ) {
      return
    }

    const existSubtitleIndex = subtitleList.value.findIndex(
      (item) =>
        item.data.sentenceId === subtitle.data.sentenceId && item.source === subtitle.source,
    )

    // subtitle 已经存在
    if (existSubtitleIndex > -1) {
      const existSubtitle = subtitleList.value[existSubtitleIndex]
      if (subtitle.source === 'agent') {
        subtitle.data.text = existSubtitle?.data.text + subtitle.data.text
      }

      subtitleList.value.splice(existSubtitleIndex, 1, subtitle)
    } else if (subtitle.data.text) {
      subtitleList.value.push(subtitle)
    }

    currentSubtitle.value = subtitle
  }

  /**
   * 添加延迟记录
   * @param stats 延迟统计
   */
  const addLatencyRecord = (stats: LatencyStat) => {
    latencyStats.value = [stats, ...latencyStats.value]
  }

  /**
   * 重置状态
   * @param reserveAgentType 是否保留 agentType
   */
  const reset = (reserveAgentType = false) => {
    callState.value = AICallState.None
    agentState.value = AICallAgentState.Listening
    isSpeaking.value = false
    currentSubtitle.value = undefined
    subtitleList.value = []
    enablePushToTalk.value = false
    updatingPushToTalk.value = false
    pushingToTalk.value = false
    enableVoiceInterrupt.value = true
    updatingVoiceInterrupt.value = false
    enableVoiceprint.value = false
    updatingVoiceprint.value = false
    voiceId.value = ''
    updatingVoiceId.value = false
    microphoneMuted.value = false
    cameraMuted.value = false
    agentVoiceIdList.value = []
    voiceAvatarUrl.value = ''
    latencyStats.value = []

    if (!reserveAgentType) {
      agentType.value = undefined
    }
  }

  /**
   * 设置通话状态
   */
  const setCallState = (state: AICallState) => {
    callState.value = state
  }

  /**
   * 设置智能体状态
   */
  const setAgentState = (state: AICallAgentState) => {
    agentState.value = state
  }

  /**
   * 设置是否正在说话
   */
  const setIsSpeaking = (speaking: boolean) => {
    isSpeaking.value = speaking
  }

  /**
   * 设置麦克风静音状态
   */
  const setMicrophoneMuted = (muted: boolean) => {
    microphoneMuted.value = muted
  }

  /**
   * 设置摄像头静音状态
   */
  const setCameraMuted = (muted: boolean) => {
    cameraMuted.value = muted
  }

  /**
   * 设置声纹 ID
   */
  const setVoiceprintId = (id: string) => {
    voiceprintId.value = id
  }

  /**
   * 设置音色
   */
  const setVoiceId = (id: string) => {
    voiceId.value = id
  }

  /**
   * 设置头像 URL
   */
  const setVoiceAvatarUrl = (url: string) => {
    voiceAvatarUrl.value = url
  }

  /**
   * 设置智能体类型
   */
  const setAgentType = (type: AICallAgentType) => {
    agentType.value = type
  }

  /**
   * 设置对讲机模式
   */
  const setEnablePushToTalk = (enable: boolean) => {
    enablePushToTalk.value = enable
  }

  /**
   * 设置智能打断
   */
  const setEnableVoiceInterrupt = (enable: boolean) => {
    enableVoiceInterrupt.value = enable
  }

  /**
   * 设置声纹识别
   */
  const setEnableVoiceprint = (enable: boolean) => {
    enableVoiceprint.value = enable
  }

  /**
   * 清除字幕
   */
  const clearSubtitles = () => {
    subtitleList.value = []
    currentSubtitle.value = undefined
  }

  /**
   * 获取字幕历史
   */
  const getSubtitleHistory = (limit = 50) => {
    return subtitleList.value.slice(-limit)
  }

  return {
    // 状态
    callState,
    agentType,
    agentState,
    isSpeaking,
    currentSubtitle,
    subtitleList,
    enablePushToTalk,
    updatingPushToTalk,
    pushingToTalk,
    enableVoiceInterrupt,
    updatingVoiceInterrupt,
    enableVoiceprint,
    updatingVoiceprint,
    voiceprintId,
    voiceId,
    updatingVoiceId,
    microphoneMuted,
    cameraMuted,
    agentVoiceIdList,
    voiceAvatarUrl,
    latencyStats,

    // 计算属性
    isConnected,
    isError,
    isConnecting,
    isInCall,

    // 方法
    updateSubtitle,
    addLatencyRecord,
    reset,
    setCallState,
    setAgentState,
    setIsSpeaking,
    setMicrophoneMuted,
    setCameraMuted,
    setVoiceprintId,
    setVoiceId,
    setVoiceAvatarUrl,
    setAgentType,
    setEnablePushToTalk,
    setEnableVoiceInterrupt,
    setEnableVoiceprint,
    clearSubtitles,
    getSubtitleHistory,
  }
})
