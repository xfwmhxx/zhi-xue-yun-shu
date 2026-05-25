// src/types/AUIAICallControllerEvents.ts
// 或者 src/composables/types/AUIAICallControllerEvents.ts

import {
  type AICallAgentInfo,
  AICallAgentState,
  AICallAgentVcrResult,
  AICallSpeakingInterruptedReason,
  AICallState,
  type AICallSubtitleData,
  AICallVoiceprintResult,
  type JSONObject,
  type LatencyStat,
} from 'aliyun-auikit-aicall'

/**
 * AI 通话控制器事件类型定义
 * 与 React 版本完全兼容
 */
export interface AUIAICallControllerEvents {
  /**
   * AI智能体已被启动
   * Agent has been started
   */
  AICallAIAgentStarted: (agentInfo: AICallAgentInfo, elapsedTime: number) => void

  /**
   * AI智能体开始通话
   * Agent has start call
   */
  AICallBegin: (elapsedTime: number) => void

  /**
   * AI智能体结束通话
   * Agent has end call
   */
  AICallEnd: () => void

  /**
   * 当前通话状态改变
   * Call state changed
   */
  AICallStateChanged: (state: AICallState) => void

  /**
   * 智能体状态改变
   * Agent state changed
   */
  AICallAgentStateChanged: (state: AICallAgentState) => void

  /**
   * 当前讲话人ID及音量
   * Current active speaker volume
   * @param userId 当前讲话人ID
   * @param volume 音量[0-100]
   */
  AICallActiveSpeakerVolumeChanged: (userId: string, volume: number) => void

  /**
   * 对讲机模式变化
   * Push to talk mode changed
   * @param enable 对讲机模式状态
   */
  AICallPushToTalkChanged: (enable: boolean) => void

  /**
   * 用户提问被智能体识别字幕通知
   * User voice subtitle notify
   */
  AICallUserSubtitleNotify: (data: AICallSubtitleData, voiceprintResult: AICallVoiceprintResult) => void

  /**
   * 智能体回答字幕通知
   * Agent response subtitle notify
   */
  AICallAgentSubtitleNotify: (data: AICallSubtitleData) => void

  /**
   * 智能体情绪结果通知
   * Agent emotion result notify
   * @param emotion 情绪标签，例如：neutral\happy\angry\sad 等
   * @param userAsrSentenceId 回答用户问题的句子ID
   */
  AICallAgentEmotionNotify: (emotion: string, userAsrSentenceId: number) => void

  /**
   * 用户token过期
   * User token expired
   */
  AICallUserTokenExpired: () => void

  /**
   * 智能体音频流订阅成功
   * Agent audio subscribed
   */
  AICallAgentAudioSubscribed: (audioElement?: HTMLAudioElement) => void

  /**
   * 智能体即将结束通话
   * Agent will leave
   * @param reason 原因：2001(闲时退出), 2002(真人接管结束), 0(其他)
   * @param message 消息
   */
  AICallAgentWillLeave: (reason: number, message: string) => void

  /**
   * 智能体自定义消息
   * Agent custom message
   */
  AICallReceivedAgentCustomMessage: (data: {
    [key: string]: string | number | boolean | object | null | undefined
  }) => void

  /**
   * 智能体转人工
   * Agent human takeover
   */
  AICallHumanTakeoverWillStart: (uid: string, takeoverMode: number) => void

  /**
   * 智能体转人工成功
   * Agent human takeover success
   */
  AICallHumanTakeoverConnected: (uid: string) => void

  /**
   * 视觉自定义截图状态变化
   * Vision custom capture changed
   */
  AICallVisionCustomCaptureChanged: (enable: boolean) => void

  /**
   * 智能体当前讲话被打断原因
   * Agent speaking interrupted
   */
  AICallSpeakingInterrupted: (reason: AICallSpeakingInterruptedReason) => void

  /**
   * 智能体配置加载完成
   * Agent config loaded
   */
  AICallAgentConfigLoaded: (config: JSONObject) => void

  /**
   * 智能体自动播放失败
   * Agent auto play failed
   */
  AICallAgentAutoPlayFailed: () => void

  /**
   * 收到当前智能体发过来的VCR结果
   * Received a VCR result from the current agent
   * @param result VCR结果
   */
  AICallReceivedAgentVcrResult: (result: AICallAgentVcrResult) => void

  /**
   * 延迟统计
   * Latency statistics
   */
  AICallLatencyStats: (stats: LatencyStat) => void
}