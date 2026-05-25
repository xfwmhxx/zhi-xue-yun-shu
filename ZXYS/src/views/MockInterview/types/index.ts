// types/index.ts

// 全局应用状态
export interface AppState {
  avatar: {
    connected: boolean
    isSpeaking: boolean
    thinking: boolean
    appId?: string
    appSecret?: string
    instance?: any
    videoElement?: HTMLVideoElement | null
  }
  asr?: {
    isListening: boolean
    text?: string
  }
  llm?: {
    isThinking: boolean
    response?: string
  }
}

// 全局应用 Store
export interface AppStore {
  connectAvatar: () => Promise<void>
  disconnectAvatar: () => void
  startVoiceInput: () => void
  stopVoiceInput: () => void
  sendMessage: (text: string) => void
  // ... 其他方法
}

// 题目接口
export interface Question {
  id?: number
  type: string
  content: string
  key_points: string
  answer_logic: string
  user_answer?: string
  answer_time?: number
  voice_text?: string
}

// 答案记录
export interface AnswerRecord {
  questionId: number
  questionType: string
  content: string
  userAnswer: string
  voiceText?: string
  keyPoints: string
  answerLogic: string
  answerTime: number
  timestamp: number
  isCorrect?: boolean
}

// 测试会话
export interface TestSession {
  sessionId: string
  startTime: number
  endTime: number | null
  isCompleted: boolean
  questions: Question[]
  answers: AnswerRecord[]
  totalCount: number
  correctCount: number
  totalScore: number
  jobDescription?: string
}

// 消息接口
export interface Message {
  id: number
  type: 'user' | 'ai'
  content: string
  isTyping?: boolean
  typingText?: string
}

// 导出数据接口
export interface ExportData {
  sessionId: string
  startTime: string
  endTime: string | null
  totalDuration: string
  totalQuestions: number
  answeredQuestions: number
  unansweredQuestions: number
  completionRate: string
  jobDescription: string
  questions: Array<{
    id: number
    type: string
    content: string
    key_points: string
    answer_logic: string
    user_answer: string
    voice_text: string
    answer_time: number | null
    answer_length: number
    quality: string
    has_answered: boolean
  }>
  answers: AnswerRecord[]
  summary: {
    totalAnswers: number
    averageAnswerLength: number
    answeredQuestionsList: Array<{
      type: string
      content: string
      user_answer: string
      voice_text: string
    }>
  }
}

// 组件 Props
export interface DialogAreaProps {
  interviewStarted: boolean
  interviewStatus: string
  messages: Message[]
}