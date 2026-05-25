// src/types/useAICallProxyController.ts

import type { 
  AICallAgentType, 
  AICallState, 
  AICallErrorCode,
  AICallAgentInfo 
} from 'aliyun-auikit-aicall'
import type { AUIAICallControllerEvents } from './AUIAICallControllerEvents'
import type { Ref } from 'vue'

// 基础控制器返回类型
export interface UseAICallControllerReturn {
  // 状态
  state: AICallState
  errorCode: AICallErrorCode | undefined
  agentInfo: AICallAgentInfo | undefined
  agentState: any
  shareConfig: any
  agentAudioElement: HTMLAudioElement | undefined
  isConnected: boolean
  isInCall: boolean
  
  // 配置
  config: any
  engineConfig: any
  userId: string
  token: string
  
  // 方法
  init: () => Promise<void>
  start: () => Promise<void>
  handup: () => Promise<void>
  destroy: () => void
  
  // 音频控制
  setAgentView: (view: HTMLVideoElement | string) => void
  interruptSpeaking: () => Promise<void>
  enableVoiceInterrupt: (enable: boolean) => Promise<boolean>
  switchVoiceId: (voiceId: string) => Promise<boolean>
  muteMicrophone: (mute: boolean) => boolean
  switchMicrophone: (deviceId: string) => boolean
  muteCamera: (mute: boolean) => Promise<boolean>
  switchCamera: (deviceId?: string) => Promise<boolean>
  startPreview: (elementOrId: string | HTMLVideoElement) => void
  stopPreview: () => void
  
  // 对讲机模式
  enablePushToTalk: (enable: boolean) => Promise<boolean>
  startPushToTalk: () => boolean
  finishPushToTalk: () => boolean
  cancelPushToTalk: () => boolean
  
  // 消息发送
  sendTextToAgent: (req: any) => boolean
  sendCustomMessageToServer: (msg: string) => boolean
  updateLlmSystemPrompt: (prompt: string) => boolean
  
  // Vision 相关
  startVisionCustomCapture: (req: any) => boolean
  stopVisionCustomCapture: () => boolean
  
  // 声纹相关
  enableVoiceprint: (enable: boolean) => boolean
  muteAgentAudioPlaying: (mute: boolean) => boolean
  
  // 事件
  on: <K extends keyof AUIAICallControllerEvents>(
    event: K, 
    callback: (data: AUIAICallControllerEvents[K]) => void
  ) => void
  off: <K extends keyof AUIAICallControllerEvents>(
    event: K, 
    callback: (data: AUIAICallControllerEvents[K]) => void
  ) => void
  once: <K extends keyof AUIAICallControllerEvents>(
    event: K, 
    callback: (data: AUIAICallControllerEvents[K]) => void
  ) => void
}

// 代理控制器配置
export interface UseAICallProxyControllerOptions {
  userId: string
  token: string
  agentType?: AICallAgentType
  agentId?: string
  region?: string
  userData?: string
  engineConfig?: any
  onStateChange?: (state: AICallState) => void
  onError?: (error: { code: number; message: string }) => void
  autoRefreshToken?: boolean
}

// 代理控制器返回类型
export interface UseAICallProxyControllerReturn extends UseAICallControllerReturn {
  start: () => Promise<void>
  isStarting: Readonly<Ref<boolean>>
  startError: Readonly<Ref<Error | null>>
}