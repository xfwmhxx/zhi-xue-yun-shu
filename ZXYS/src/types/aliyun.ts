// src/types/index.ts

import type {
  AICallAgentConfig,
  AICallAgentType,
  AIChatAgentType,
  AIChatTemplateConfig,
} from 'aliyun-auikit-aicall'
import type { JSONObject } from '@/services/interface'

// src/types/index.ts
export * from './interface' // 通用的 interface
// export * from './service-interface'  // 服务相关的 interface

/**
 * App 组件 Props 类型
 */
export interface AppProps {
  /** 模式：standard 或 proxy */
  mode?: 'standard' | 'proxy'
  /** 用户 ID */
  userId?: string
  /** 用户 Token */
  userToken?: string
  /** 共享 Token */
  shareToken?: string
  /** 应用服务器地址 */
  appServer?: string
  /** 区域 */
  region?: string
  /** 智能体类型 */
  agentType?: AICallAgentType | AIChatAgentType
  /** 智能体 ID */
  agentId?: string
  /** 用户数据 */
  userData?: string | JSONObject
  /** 通话智能体配置 */
  agentConfig?: AICallAgentConfig
  /** 聊天模板配置 */
  chatTemplateConfig?: AIChatTemplateConfig
  /** 认证失败回调 */
  onAuthFail?: () => void
}

/**
 * PSTN 类型枚举（扩展原有类型）
 */
export enum AIPSTNType {
  Outbound = 1,
  Inbound = 2,
}

/**
 * Welcome 组件选中的类型值
 */
export type WelcomeTypeValue = AICallAgentType | AIChatAgentType | AIPSTNType | undefined

// 从 aliyun-auikit-aicall 重新导出常用类型
export type {
  AICallAgentInfo,
  AICallAgentState,
  AICallAgentVcrResult,
  AICallSpeakingInterruptedReason,
  AICallState,
  AICallSubtitleData,
  AICallVoiceprintResult,
  JSONObject,
  LatencyStat,
} from 'aliyun-auikit-aicall'

// 导出事件类型
export type { AUIAICallControllerEvents } from './AUIAICallControllerEvents'
