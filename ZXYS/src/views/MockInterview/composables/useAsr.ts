import { ref } from 'vue'

// 浏览器语音识别接口
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// 浏览器语音识别类
class BrowserSpeechRecognition {
  private recognition: any = null
  private isListening = false
  private onResultCallback: ((text: string) => void) | null = null
  private onErrorCallback: ((error: any) => void) | null = null
  private onStartCallback: (() => void) | null = null
  private onEndCallback: (() => void) | null = null
  private interimText = ''
  private finalText = ''
  private restartTimeout: any = null
  private isManualStop = false
  private isStarting = false // 防止重复启动

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('[BrowserASR] 浏览器不支持语音识别')
      return
    }
    this.recognition = new SpeechRecognition()
    this.init()
  }

  private init() {
    if (!this.recognition) return

    this.recognition.lang = 'zh-CN'
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ''
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result) continue // ✅ 防止 undefined

        const transcript = result[0]?.transcript

        if (result.isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        this.finalText = finalTranscript
        console.log('[BrowserASR] 最终识别:', finalTranscript)
        this.onResultCallback?.(finalTranscript)
        // 识别完成后自动停止
        this.stop()
      }

      if (interimTranscript) {
        this.interimText = interimTranscript
        console.log('[BrowserASR] 临时识别:', interimTranscript)
      }
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('[BrowserASR] 识别错误:', event.error)

      if (event.error === 'aborted') {
        console.log('[BrowserASR] 识别被中止')
        return
      }

      if (event.error === 'no-speech') {
        console.log('[BrowserASR] 未检测到语音')
        return
      }

      if (event.error === 'audio-capture') {
        console.error('[BrowserASR] 麦克风未找到')
        this.onErrorCallback?.({ error: event.error, message: '未找到麦克风设备' })
        return
      }

      if (event.error === 'not-allowed') {
        console.error('[BrowserASR] 麦克风权限被拒绝')
        this.onErrorCallback?.({ error: event.error, message: '请允许麦克风权限' })
        return
      }

      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        this.onErrorCallback?.({ error: event.error, message: event.message || event.error })
      }
    }

    this.recognition.onstart = () => {
      console.log('[BrowserASR] 开始录音')
      this.isListening = true
      this.isStarting = false
      this.interimText = ''
      this.finalText = ''
      this.onStartCallback?.()
    }

    this.recognition.onend = () => {
      console.log('[BrowserASR] 录音结束')
      this.isListening = false
      this.isStarting = false
      if (this.restartTimeout) clearTimeout(this.restartTimeout)
      this.onEndCallback?.()
    }
  }

  // 开始识别
  start(options?: {
    onStart?: () => void
    onFinished?: (text: string) => void
    onError?: (error: any) => void
  }) {
    if (!this.recognition) {
      options?.onError?.({ error: 'not_supported', message: '浏览器不支持语音识别' })
      return
    }

    // 防止重复启动
    if (this.isListening || this.isStarting) {
      console.log('[BrowserASR] 已在录音中，跳过启动')
      return
    }

    this.isManualStop = false
    this.isStarting = true
    this.onStartCallback = options?.onStart || null
    this.onResultCallback = options?.onFinished || null
    this.onErrorCallback = options?.onError || null

    try {
      this.recognition.start()
    } catch (error) {
      console.error('[BrowserASR] 启动失败:', error)
      this.isStarting = false
      options?.onError?.({ error: 'start_failed', message: '启动语音识别失败' })
    }
  }

  // 停止识别
  stop() {
    this.isManualStop = true
    this.isStarting = false
    if (this.restartTimeout) clearTimeout(this.restartTimeout)
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop()
      } catch (error) {
        console.error('[BrowserASR] 停止失败:', error)
      }
    }
    this.isListening = false
  }

  // 获取状态
  getStatus() {
    return {
      isListening: this.isListening,
      isSupported: !!this.recognition,
    }
  }

  // 检查是否支持
  static isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }
}

// 导出 useAsr 函数
export const useAsr = (config?: any) => {
  let instance: BrowserSpeechRecognition | null = null

  const start = (options?: {
    onStart?: () => void
    onFinished?: (text: string) => void
    onError?: (error: any) => void
  }) => {
    if (!BrowserSpeechRecognition.isSupported()) {
      options?.onError?.({
        error: 'not_supported',
        message: '浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器',
      })
      return
    }

    if (!instance) {
      instance = new BrowserSpeechRecognition()
    }

    instance.start({
      onStart: options?.onStart,
      onFinished: options?.onFinished,
      onError: options?.onError,
    })
  }

  const stop = () => {
    if (instance) {
      instance.stop()
    }
  }

  const getStatus = () => {
    return instance
      ? instance.getStatus()
      : { isListening: false, isSupported: BrowserSpeechRecognition.isSupported() }
  }

  return {
    start,
    stop,
    getStatus,
  }
}

// 检查浏览器支持
export const isAsrSupported = () => {
  return BrowserSpeechRecognition.isSupported()
}
