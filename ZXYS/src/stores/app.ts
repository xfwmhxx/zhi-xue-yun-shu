// src/stores/appStore.ts
import { reactive, ref } from 'vue'
import type { AppState, AsrCallbacks } from '../types'
import { LLM_CONFIG, APP_CONFIG } from '@/views/MockInterview/constants'
import { validateConfig, delay, generateSSML } from '@/utils'
import { avatarService } from '@/views/MockInterview/services/avatar'
import { llmService } from '@/views/MockInterview/services/llm'
import { useAsr, isAsrSupported } from '@/views/MockInterview/composables/useAsr'

// 应用状态
export const appState = reactive<AppState>({
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
    provider: 'browser',
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
    model: LLM_CONFIG.DEFAULT_MODEL,
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
})

// 最小切分长度
const MIN_SPLIT_LENGTH = 2
// 最大切分长度
const MAX_SPLIT_LENGTH = 20

/**
 * 智能切分句子
 */
function splitSentence(text: string): string[] {
  if (!text) return []

  const chinesePunctuations = new Set(['、', '，', '：', '；', '。', '？', '！', '…', '\n'])
  const englishPunctuations = new Set([',', ':', ';', '.', '?', '!'])

  let count = 0
  let firstValidPunctAfterMin = -1
  let forceBreakIndex = -1
  let i = 0
  const n = text.length

  while (i < n && count < MAX_SPLIT_LENGTH) {
    const char = text[i]

    if (String(char) >= '\u4e00' && String(char) <= '\u9fff') {
      count++
      if (count === MAX_SPLIT_LENGTH) {
        forceBreakIndex = i + 1
      }
      i++
    } else if (String(char) >= '0' && String(char) <= '9') {
      count++
      if (count === MAX_SPLIT_LENGTH) {
        forceBreakIndex = i + 1
      }
      i++
    } else if (
      (String(char) >= 'a' && String(char) <= 'z') ||
      (String(char) >= 'A' && String(char) <= 'Z')
    ) {
      i++
      while (
        i < n &&
        ((String(text[i]) >= 'a' && String(text[i]) <= 'z') ||
          (String(text[i]) >= 'A' && String(text[i]) <= 'Z'))
      ) {
        i++
      }
      count++
      if (count === MAX_SPLIT_LENGTH) {
        forceBreakIndex = i
      }
    } else {
      if (chinesePunctuations.has(String(char))) {
        if (count >= MIN_SPLIT_LENGTH && firstValidPunctAfterMin === -1) {
          firstValidPunctAfterMin = i
        }
        i++
      } else if (englishPunctuations.has(String(char))) {
        if (i + 1 >= n || text[i + 1] === ' ') {
          if (count >= MIN_SPLIT_LENGTH && firstValidPunctAfterMin === -1) {
            firstValidPunctAfterMin = i
          }
        }
        i++
      } else {
        i++
      }
    }
  }

  let splitIndex = -1
  if (firstValidPunctAfterMin !== -1) {
    splitIndex = firstValidPunctAfterMin + 1
  } else if (forceBreakIndex !== -1) {
    splitIndex = forceBreakIndex
  }

  if (splitIndex > 0 && splitIndex < text.length) {
    return [text.substring(0, splitIndex), text.substring(splitIndex)]
  }

  return [text]
}

// 虚拟人状态
export const avatarState = ref('')

// ASR 实例
let asrInstance: any = null

// 生成会话ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Store类
export class AppStore {
  /**
   * 连接虚拟人
   */
  async connectAvatar(): Promise<void> {
    const { appId, appSecret } = appState.avatar

    if (!validateConfig({ appId, appSecret }, ['appId', 'appSecret'])) {
      throw new Error('appId 或 appSecret 为空')
    }

    try {
      const avatar = await avatarService.connect(
        {
          appId,
          appSecret,
        },
        {
          onSubtitleOn: (text: string) => {
            appState.ui.subTitleText = text
          },
          onSubtitleOff: () => {
            appState.ui.subTitleText = ''
          },
          onStateChange: (state: string) => {
            avatarState.value = state
            if (state === 'speak') {
              appState.avatar.speaking = true
              appState.ui.isSpeaking = true
            } else if (state === 'think') {
              appState.avatar.thinking = true
              appState.ui.isThinking = true
            } else {
              appState.avatar.speaking = false
              appState.avatar.thinking = false
              appState.ui.isSpeaking = false
              appState.ui.isThinking = false
            }
          },
        },
      )

      appState.avatar.instance = avatar
      appState.avatar.connected = true

      appState.session.id = generateSessionId()
      appState.session.startTime = Date.now()
      appState.session.isActive = true

      console.log('[AppStore] 虚拟人连接成功')
    } catch (error) {
      appState.avatar.connected = false
      console.error('[AppStore] 虚拟人连接失败:', error)
      throw error
    }
  }

  /**
   * 断开虚拟人连接
   */
  disconnectAvatar(): void {
    if (appState.avatar.instance) {
      avatarService.disconnect(appState.avatar.instance)
      appState.avatar.instance = null
      appState.avatar.connected = false
      appState.avatar.speaking = false
      appState.avatar.thinking = false
      avatarState.value = ''

      appState.session.endTime = Date.now()
      appState.session.isActive = false

      if (asrInstance) {
        asrInstance.stop()
        asrInstance = null
      }
      appState.asr.isListening = false

      console.log('[AppStore] 虚拟人已断开')
    }
  }

  /**
   * 发送消息到LLM并让虚拟人播报
   */
  async sendMessage(): Promise<string | undefined> {
    const { llm, ui, avatar } = appState

    if (!validateConfig(llm, ['apiKey']) || !ui.text || !avatar.instance) {
      console.warn('[AppStore] 发送消息条件不满足')
      return
    }

    try {
      appState.ui.totalText = ''

      const stream = await llmService.sendMessageWithStream(
        {
          provider: 'openai',
          model: llm.model,
          apiKey: llm.apiKey,
          temperature: llm.temperature,
          maxTokens: llm.maxTokens,
        },
        ui.text,
      )

      if (!stream) return

      await this.waitForAvatarReady()

      let buffer = ''
      let isFirstChunk = true
      let fullContent = ''

      for await (const chunk of stream) {
        buffer += chunk
        fullContent += chunk

        const arr = splitSentence(buffer)

        if (arr.length > 1) {
          const ssml = generateSSML(arr[0] || '')
          if (isFirstChunk) {
            avatar.instance.speak(ssml, true, false)
            isFirstChunk = false
          } else {
            avatar.instance.speak(ssml, false, false)
          }

          buffer = arr[1] || ''
        }
      }

      if (buffer.length > 0) {
        const ssml = generateSSML(buffer)

        if (isFirstChunk) {
          avatar.instance.speak(ssml, true, false)
        } else {
          avatar.instance.speak(ssml, false, false)
        }
      }

      const finalSsml = generateSSML('')
      avatar.instance.speak(finalSsml, false, true)

      appState.ui.totalText = fullContent

      return fullContent
    } catch (error) {
      console.error('[AppStore] 发送消息失败:', error)
      throw error
    }
  }

  /**
   * 开始语音输入 - 使用浏览器 ASR
   */

  /**
   * 开始语音输入
   */
  /**
   * 开始语音输入
   */
  startVoiceInput(callbacks?: AsrCallbacks): void {
    console.log('[AppStore] 开始语音输入')

    if (!isAsrSupported()) {
      console.error('[AppStore] 浏览器不支持语音识别')
      callbacks?.onError?.({
        error: 'not_supported',
        message: '您的浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器',
      })
      return
    }

    // 请求麦克风权限
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          console.log('[AppStore] 麦克风权限已获取')
          this._startAsr(callbacks)
        })
        .catch((err) => {
          console.error('[AppStore] 麦克风权限被拒绝:', err)
          callbacks?.onError?.({
            error: 'microphone_denied',
            message: '请允许麦克风权限以使用语音输入',
          })
        })
    } else {
      this._startAsr(callbacks)
    }
  }
  private _startAsr(callbacks?: AsrCallbacks): void {
    console.log('[AppStore] 启动 ASR')

    asrInstance = useAsr()
    asrInstance.start({
      onStart: () => {
        appState.asr.isListening = true
        callbacks?.onStart?.()
      },
      onFinished: (text: string) => {
        appState.asr.isListening = false
        callbacks?.onResult?.(text, true) // 使用 onResult 传递最终结果
        callbacks?.onStop?.()
      },
      onError: (error: any) => {
        appState.asr.isListening = false
        callbacks?.onError?.(error)
        callbacks?.onStop?.()
      },
    })
  }

  /**
   * 停止语音输入
   */
  stopVoiceInput(): void {
    console.log('[AppStore] 停止语音输入')
    if (asrInstance) {
      asrInstance.stop()
    }
    appState.asr.isListening = false
  }

  /**
   * 停止语音输入
   */
  // stopVoiceInput(): void {
  //   console.log('[AppStore] 停止语音输入')

  //   if (asrInstance) {
  //     asrInstance.stop()
  //   }

  //   appState.asr.isListening = false
  // }

  /**
   * 设置虚拟人实例
   */
  setAvatarInstance(instance: any): void {
    console.log('[AppStore] 设置虚拟人实例')
    appState.avatar.instance = instance
  }

  /**
   * 更新虚拟人状态
   */
  updateAvatarState(updates: Partial<AppState['avatar']>): void {
    Object.assign(appState.avatar, updates)
  }

  /**
   * 重置会话
   */
  resetSession(): void {
    console.log('[AppStore] 重置会话')
    appState.session.id = generateSessionId()
    appState.session.startTime = Date.now()
    appState.session.endTime = null
    appState.session.isActive = true
    appState.ui.totalText = ''
    appState.ui.text = ''
    appState.ui.subTitleText = ''
  }

  /**
   * 结束会话
   */
  endSession(): void {
    console.log('[AppStore] 结束会话')
    appState.session.endTime = Date.now()
    appState.session.isActive = false
  }

  /**
   * 设置思考状态
   */
  setThinking(thinking: boolean): void {
    appState.ui.isThinking = thinking
    appState.avatar.thinking = thinking
  }

  /**
   * 设置说话状态
   */
  setSpeaking(speaking: boolean): void {
    appState.ui.isSpeaking = speaking
    appState.avatar.speaking = speaking
  }

  /**
   * 设置文本
   */
  setText(text: string): void {
    appState.ui.text = text
  }

  /**
   * 设置字幕文本
   */
  setSubTitleText(text: string): void {
    appState.ui.subTitleText = text
  }

  /**
   * 设置总文本
   */
  setTotalText(text: string): void {
    appState.ui.totalText = text
  }

  /**
   * 清空文本
   */
  clearText(): void {
    appState.ui.text = ''
    appState.ui.subTitleText = ''
    appState.ui.totalText = ''
  }

  /**
   * 等待虚拟人准备就绪
   */
  private async waitForAvatarReady(): Promise<void> {
    if (avatarState.value === 'speak') {
      appState.avatar.instance?.think()
      await delay(APP_CONFIG.SPEAK_INTERRUPT_DELAY)
    }
  }
}

// 导出单例
export const appStore = new AppStore()

// 导出只读状态
export const useAppState = () => {
  return appState
}
