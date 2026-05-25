// src/types/index.ts

// 虚拟人相关类型定义
export interface AvatarConfig {
  appId: string
  appSecret: string
}

export interface AvatarState {
  connected: boolean
  speaking: boolean
  thinking: boolean
  videoElement: HTMLVideoElement | null
  instance: any
}

// ASR相关类型定义
export interface AsrConfig {
  provider?: 'tx' | 'xf' | 'browser' // 腾讯云或讯飞
  appId: string | number
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
  // 音频配置
  noiseSuppression?: boolean
  echoCancellation?: boolean
  autoGainControl?: boolean
  deviceId?: string
}

export interface AsrCallbacks {
  onStart?: () => void
  onFinished: (text: string) => void
  onError: (error: any) => void
  onVolumeChange?: (volume: number) => void
  onResult?: (text: string, isFinal: boolean) => void
  onStop?: () => void
}

// LLM相关类型定义
export interface LlmConfig {
  provider: string
  model: string
  apiKey: string
  baseURL?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Store类型定义
export interface AppStore {
  // 虚拟人相关
  connectAvatar(): Promise<void>
  disconnectAvatar(): void
  sendMessage(): Promise<string | undefined>

  // 语音识别相关
  startVoiceInput(callbacks?: AsrCallbacks): void
  stopVoiceInput(): void

  // 其他方法
  setAvatarInstance(instance: any): void
  updateAvatarState(state: Partial<AvatarState>): void
}

// Store状态类型定义
export interface AppState {
  // 虚拟人配置
  avatar: {
    appId: string
    appSecret: string
    connected: boolean
    speaking: boolean
    thinking: boolean
    videoElement: HTMLVideoElement | null
    instance: any
    lastReply?: string
  }

  // ASR配置
  asr: {
    provider: string
    appId: string | number
    secretId: string
    secretKey: string
    apiKey?: string
    apiSecret?: string
    isListening: boolean
    deviceId?: string
    noiseSuppression?: boolean
    echoCancellation?: boolean
    autoGainControl?: boolean
  }

  // LLM配置
  llm: {
    provider: string
    model: string
    apiKey: string
    baseURL?: string
    temperature?: number
    maxTokens?: number
  }

  // UI状态
  ui: {
    text: string
    subTitleText: string
    totalText: string
    isThinking: boolean
    isSpeaking: boolean
  }

  // 会话配置
  session: {
    id: string
    startTime: number
    endTime: number | null
    isActive: boolean
  }
}

// SDK事件类型定义
export interface SdkEvent {
  type:
    | 'subtitle_on'
    | 'subtitle_off'
    | 'speaking_start'
    | 'speaking_end'
    | 'thinking_start'
    | 'thinking_end'
    | 'connected'
    | 'disconnected'
    | 'error'
  text?: string
  data?: any
  timestamp?: number
  [key: string]: any
}

// 面试题目相关类型
export interface Question {
  id: number
  type: string
  content: string
  key_points: string
  answer_logic: string
  user_answer?: string
  answer_time?: number
  isAnswered?: boolean
  isCorrect?: boolean
}

export interface AnswerRecord {
  questionId: number
  questionType: string
  content: string
  userAnswer: string
  keyPoints: string
  answerLogic: string
  answerTime: number
  timestamp: number
  isCorrect?: boolean
}

export interface TestSession {
  sessionId: string
  startTime: number
  endTime: number | null
  isCompleted: boolean
  questions: Question[]
  answers: AnswerRecord[]
  totalCount: number
  correctCount?: number
  score?: number
}

// 设备相关类型
export interface AudioDevice {
  deviceId: string
  label: string
  kind: string
  groupId: string
}

export interface VideoDevice {
  deviceId: string
  label: string
  kind: string
  groupId: string
}

export interface AudioSettings {
  noiseSuppression: boolean
  echoCancellation: boolean
  autoGainControl: boolean
  sampleRate: number
}

// 全局窗口类型扩展
declare global {
  interface Window {
    XmovAvatar: any
    CryptoJSTest: any
    CryptoJS: any
    WebAudioSpeechRecognizer: any
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

// 导出默认配置（请替换为你自己的API凭证）
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  appId: 'your_avatar_appid',
  appSecret: 'your_avatar_appsecret',
}

export const DEFAULT_ASR_CONFIG: Partial<AsrConfig> = {
  provider: 'xf',
  appId: 'your_asr_appid',
  secretId: 'your_asr_secret_id',
  secretKey: 'your_asr_secret_key',
  vadSilenceTime: 2000,
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
}

export const DEFAULT_LLM_CONFIG: Partial<LlmConfig> = {
  provider: 'deepseek',
  model: 'deepseek-chat',
  apiKey: 'your_deepseek_api_key',
  temperature: 0.7,
  maxTokens: 4000,
}

export const DEFAULT_APP_STATE: AppState = {
  avatar: {
    appId: '',
    appSecret: '',
    connected: false,
    speaking: false,
    thinking: false,
    videoElement: null,
    instance: null,
  },
  asr: {
    provider: 'xf',
    appId: '',
    secretId: '',
    secretKey: '',
    isListening: false,
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
  },
  llm: {
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 4000,
  },
  ui: {
    text: '',
    subTitleText: '',
    totalText: '',
    isThinking: false,
    isSpeaking: false,
  },
  session: {
    id: '',
    startTime: 0,
    endTime: null,
    isActive: false,
  },
}

// 工具函数：创建初始状态
export function createInitialState(): AppState {
  return {
    ...DEFAULT_APP_STATE,
    avatar: {
      ...DEFAULT_APP_STATE.avatar,
      appId: DEFAULT_AVATAR_CONFIG.appId,
      appSecret: DEFAULT_AVATAR_CONFIG.appSecret,
    },
    asr: {
      ...DEFAULT_APP_STATE.asr,
      appId: DEFAULT_ASR_CONFIG.appId as string,
      secretId: DEFAULT_ASR_CONFIG.secretId || '',
      secretKey: DEFAULT_ASR_CONFIG.secretKey || '',
      apiKey: DEFAULT_ASR_CONFIG.apiKey,
      apiSecret: DEFAULT_ASR_CONFIG.apiSecret,
    },
    llm: {
      ...DEFAULT_APP_STATE.llm,
      model: DEFAULT_LLM_CONFIG.model || 'deepseek-chat',
      apiKey: DEFAULT_LLM_CONFIG.apiKey || '',
    },
  }
}

// 工具函数：更新状态
export function updateState<T extends AppState>(state: T, updates: Partial<T>): T {
  return { ...state, ...updates }
}

// 工具函数：更新 avatar 状态
export function updateAvatarState(state: AppState, updates: Partial<AppState['avatar']>): AppState {
  return {
    ...state,
    avatar: { ...state.avatar, ...updates },
  }
}

// 工具函数：更新 asr 状态
export function updateAsrState(state: AppState, updates: Partial<AppState['asr']>): AppState {
  return {
    ...state,
    asr: { ...state.asr, ...updates },
  }
}

// 工具函数：更新 llm 状态
export function updateLlmState(state: AppState, updates: Partial<AppState['llm']>): AppState {
  return {
    ...state,
    llm: { ...state.llm, ...updates },
  }
}

// 工具函数：更新 ui 状态
export function updateUiState(state: AppState, updates: Partial<AppState['ui']>): AppState {
  return {
    ...state,
    ui: { ...state.ui, ...updates },
  }
}

// 工具函数：更新 session 状态
export function updateSessionState(
  state: AppState,
  updates: Partial<AppState['session']>,
): AppState {
  return {
    ...state,
    session: { ...state.session, ...updates },
  }
}
