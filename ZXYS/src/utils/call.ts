// src/utils/call.ts

import { AICallAgentType } from 'aliyun-auikit-aicall'

/**
 * 是否有视频输出能力
 * @param agentType 智能体类型
 * @returns 是否有视频输出
 */
export const hasVideoOutbound = (agentType?: AICallAgentType): boolean => {
  return agentType === AICallAgentType.VideoAgent || agentType === AICallAgentType.VisionAgent
}

/**
 * 是否有视频输入能力
 * @param agentType 智能体类型
 * @returns 是否有视频输入
 */
export const hasVideoInbound = (agentType?: AICallAgentType): boolean => {
  return agentType === AICallAgentType.VideoAgent || agentType === AICallAgentType.AvatarAgent
}