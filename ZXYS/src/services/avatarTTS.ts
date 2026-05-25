// src/services/avatarTTS.ts
import { ref } from 'vue'

// TTS 全局状态
export const avatarTTSState = ref({
  isPlaying: false,
  isConnecting: false,
  currentText: '',
})

// 数字人 SDK 引用
let avatarPlatformInstance: any = null
let isSDKReady = false

// 设置数字人实例
export const setAvatarInstance = (instance: any) => {
  avatarPlatformInstance = instance
  console.log('[AvatarTTS] 数字人实例已设置:', !!instance)
  console.log('[AvatarTTS] 实例方法检查:', {
    hasWriteText: typeof instance?.writeText === 'function',
    hasInterrupt: typeof instance?.interrupt === 'function',
    hasStart: typeof instance?.start === 'function',
  })
}

// 检查实例是否可用
export const isAvatarAvailable = () => {
  const available = !!(
    avatarPlatformInstance && typeof avatarPlatformInstance.writeText === 'function'
  )
  if (!available && avatarPlatformInstance) {
    console.warn('[AvatarTTS] 实例存在但 writeText 方法不可用，等待 SDK 就绪')
  }
  return available
}

// 设置 SDK 就绪标志
export const setSDKReady = (ready: boolean) => {
  isSDKReady = ready
  console.log('[AvatarTTS] SDK 就绪状态:', ready)
}

// TTS 回调接口
export interface AvatarTTSCallbacks {
  onPlayStart?: () => void
  onPlayEnd?: () => void
  onError?: (error: Error) => void
}

let globalCallbacks: AvatarTTSCallbacks = {}

// 设置全局 TTS 回调
export const setAvatarTTSCallbacks = (callbacks: AvatarTTSCallbacks) => {
  globalCallbacks = { ...globalCallbacks, ...callbacks }
}

// 等待数字人实例就绪
const waitForAvatarInstance = (timeout = 10000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isAvatarAvailable()) {
      console.log('[AvatarTTS] 实例已就绪')
      resolve()
      return
    }

    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (isAvatarAvailable()) {
        clearInterval(checkInterval)
        console.log('[AvatarTTS] 实例已就绪 (等待时间: ' + (Date.now() - startTime) + 'ms)')
        resolve()
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        console.error('[AvatarTTS] 等待实例超时')
        reject(new Error('等待数字人实例超时'))
      }
    }, 200)
  })
}

// 使用数字人内置 TTS 朗读文本
export const speakWithAvatar = async (
  text: string,
  options?: {
    voice?: string
    speed?: number
    volume?: number
    pitch?: number
  },
): Promise<void> => {
  if (!text || text.trim() === '') {
    console.log('[AvatarTTS] 文本为空，跳过')
    return
  }

  // 等待实例就绪
  try {
    await waitForAvatarInstance()
  } catch (error) {
    console.error('[AvatarTTS] 等待实例超时:', error)
    globalCallbacks.onError?.(new Error('数字人实例未就绪'))
    return
  }

  if (!avatarPlatformInstance) {
    console.error('[AvatarTTS] 数字人实例不存在')
    globalCallbacks.onError?.(new Error('数字人实例不存在'))
    return
  }

  if (typeof avatarPlatformInstance.writeText !== 'function') {
    console.error('[AvatarTTS] 数字人 SDK 不支持 writeText 方法')
    globalCallbacks.onError?.(new Error('数字人 SDK 不支持 writeText 方法'))
    return
  }

  return new Promise((resolve, reject) => {
    try {
      console.log('[AvatarTTS] 开始使用数字人朗读:', text.substring(0, 50))
      avatarTTSState.value.isPlaying = true
      avatarTTSState.value.currentText = text

      // 触发开始回调
      globalCallbacks.onPlayStart?.()

      // 构造 TTS 参数 - 只朗读不对话
      const ttsOptions = {
        tts: {
          vcn: options?.voice || 'x4_lingxiaoying_assist',
          speed: options?.speed ?? 50,
          pitch: options?.pitch ?? 50,
          volume: options?.volume ?? 100,
          emotion: 13,
        },
        // 关键：设置 nlp 为 false，不调用大模型
        nlp: false,
      }

      console.log('[AvatarTTS] 发送朗读请求，文本长度:', text.length)

      // 使用数字人 SDK 的 writeText 方法
      avatarPlatformInstance.writeText(text, ttsOptions)
      console.log('[AvatarTTS] 朗读请求已发送')

      // 监听音频播放结束
      const onAudioStop = () => {
        console.log('[AvatarTTS] 朗读完成')
        avatarTTSState.value.isPlaying = false
        avatarTTSState.value.currentText = ''
        globalCallbacks.onPlayEnd?.()
        resolve()
        if (avatarPlatformInstance && avatarPlatformInstance.off) {
          avatarPlatformInstance.off('audio_stop', onAudioStop)
        }
      }

      // 设置超时保底（根据文本长度估算）
      const estimatedDuration = Math.min(8000, Math.max(2000, text.length * 60))
      console.log('[AvatarTTS] 设置超时保底:', estimatedDuration + 'ms')

      setTimeout(() => {
        if (avatarTTSState.value.isPlaying) {
          console.log('[AvatarTTS] 朗读超时，强制完成')
          avatarTTSState.value.isPlaying = false
          avatarTTSState.value.currentText = ''
          globalCallbacks.onPlayEnd?.()
          resolve()
        }
      }, estimatedDuration)
    } catch (error) {
      console.error('[AvatarTTS] 朗读失败:', error)
      avatarTTSState.value.isPlaying = false
      globalCallbacks.onError?.(error as Error)
      reject(error)
    }
  })
}

// 停止朗读
export const stopAvatarTTS = (): void => {
  if (avatarPlatformInstance && typeof avatarPlatformInstance.interrupt === 'function') {
    avatarPlatformInstance.interrupt()
    console.log('[AvatarTTS] 已停止朗读')
  }
  avatarTTSState.value.isPlaying = false
  avatarTTSState.value.currentText = ''
  globalCallbacks.onPlayEnd?.()
}

// 获取 TTS 状态
export const getAvatarTTSState = () => {
  return {
    isPlaying: avatarTTSState.value.isPlaying,
    currentText: avatarTTSState.value.currentText,
    isAvailable: isAvatarAvailable(),
  }
}
