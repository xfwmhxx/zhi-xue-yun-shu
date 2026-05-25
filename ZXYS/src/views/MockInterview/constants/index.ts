// 应用常量
export const APP_CONFIG = {
  CONTAINER_PREFIX: 'CONTAINER_',
  DEFAULT_VAD_SILENCE_TIME: 300,
  AVATAR_INIT_TIMEOUT: 3000,
  SPEAK_INTERRUPT_DELAY: 2000,
} as const

// LLM配置
export const LLM_CONFIG = {
  BASE_URL: 'https://api.deepseek.com',
  DEFAULT_MODEL: '"deepseek-chat"',
  SYSTEM_PROMPT: '你是人工智能助手',
} as const

export interface AsrConfig {
  provider?: 'tx' | 'xf' // 添加讯飞支持
  appId: string
  // 腾讯云参数（可选的）
  secretId?: string
  secretKey?: string
  // 讯飞参数（可选的）
  apiKey?: string
  apiSecret?: string
  // 通用参数
  vadSilenceTime?: number
  host?: string
  path?: string
}

export interface AsrCallbacks {
  onFinished: (text: string) => void
  onError: (error: any) => void
}

// SDK配置
export const SDK_CONFIG = {
  GATEWAY_URL: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',
  DATA_SOURCE: '2',
  CUSTOM_ID: 'demo',
} as const

// 支持的LLM模型列表
export const SUPPORTED_LLM_MODELS = ['doubao-1-5-pro-32k-250115'] as const

// 支持的ASR提供商
export const SUPPORTED_ASR_PROVIDERS = [{ value: 'tx', label: '腾讯' }] as const
