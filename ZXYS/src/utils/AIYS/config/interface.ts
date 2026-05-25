import type { JSONObject } from '@/services/interface'
import {
  AICallAgentConfig,
  AICallAgentType,
  AICallTemplateConfig,
  AIChatAgentType,
  AIChatTemplateConfig,
} from 'aliyun-auikit-aicall'

// 在 import 语句后面添加这些类型定义

// RTC 引擎配置类型
export interface rtcEngineConfig {
  appId?: string
  channelId?: string
  userId?: string
  environment: string
  useAudioPlugin: boolean
  dumpAudioData: boolean
}

// 聊天同步配置类型
export interface ChatSyncConfig {
  enabled?: boolean
  syncInterval?: number
  enable: boolean
}

export interface AICallRunConfig {
  // 可选，默认使用上海区域 cn-shanghai
  region?: string
  // 必选，应用服务器地址
  // 格式示例 https://xxxx.domain.com
  // 1. 除本地 localhost 调试外，需要为 https 域名
  // 2. 结尾不应包含 /
  appServer: string

  // 智能体类型，如果配置则不展示智能体类型选择页面
  agentType?: AICallAgentType | AIChatAgentType
  // 可选，通话智能体模板
  callTemplateConfig?: AICallTemplateConfig
  // 可选，通话智能体用户数据
  callUserData?: string
  callAgentConfig?: AICallAgentConfig

  // 智能体 id 可通过控制台获取 https://ice.console.aliyun.com/ai/robot/list
  // 语音通话智能体 id
  voiceAgentId?: string
  // 数字人智能体 id
  avatarAgentId?: string
  // 视觉智能体 id
  visionAgentId?: string
  // 视频通话智能体 id
  videoAgentId?: string
  // 必选，消息通话智能体 id
  chatAgentId: string

  // 电话通话智能体 id
  pstnAgentId?: string

  // 可选，消息通话智能体模板
  chatTemplateConfig?: AIChatTemplateConfig

  // 可选，消息通话智能体用户数据
  chatUserData?: JSONObject

  // ✅ 新增：RTC 引擎配置
  rtcEngineConfig?: rtcEngineConfig

  // ✅ 新增：聊天同步配置
  chatSyncConfig?: ChatSyncConfig

  // ✅ 新增：引擎配置（用于传递给 SDK）
  engineConfig?: Record<string, any>
}

export type AICallUserRunConfig = AICallRunConfig | (() => AICallRunConfig)
export const getRuntimeConfig = (runConfig: AICallUserRunConfig) => {
  const rc = typeof runConfig === 'function' ? runConfig() : runConfig
  return rc
}
export const getCallAgentId = (rc: AICallRunConfig, agentType?: AICallAgentType) => {
  if (agentType === AICallAgentType.VoiceAgent) {
    return rc.voiceAgentId
  }
  if (agentType === AICallAgentType.AvatarAgent) {
    return rc.avatarAgentId
  }
  if (agentType === AICallAgentType.VisionAgent) {
    return rc.visionAgentId
  }
  if (agentType === AICallAgentType.VideoAgent) {
    return rc.videoAgentId
  }
  return ''
}
