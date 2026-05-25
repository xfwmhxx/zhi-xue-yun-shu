// src/services/avatarTTS.ts
import { ref } from 'vue'

// TTS 全局状态
export const avatarTTSState = ref({
  isPlaying: false,
  isConnecting: false,
  currentText: ''
})

// 数字人 SDK 引用
let avatarPlatformInstance: any = null
let isInstanceSet = false

// 设置数字人实例
export const setAvatarInstance = (instance: any) => {
  avatarPlatformInstance = instance
  isInstanceSet = true
  console.log('[AvatarTTS] 数字人实例已设置:', !!instance)
}

// 获取数字人实例
export const getAvatarInstance = () => {
  return avatarPlatformInstance
}

// 检查实例是否可用
export const isAvatarAvailable = () => {
  return !!(avatarPlatformInstance && typeof avatarPlatformInstance.writeText === 'function')
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
const waitForAvatarInstance = (timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (avatarPlatformInstance && typeof avatarPlatformInstance.writeText === 'function') {
        clearInterval(checkInterval)
        console.log('[AvatarTTS] 数字人实例已就绪')
        resolve()
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        reject(new Error('等待数字人实例超时'))
      }
    }, 100)
  })
}

// 使用数字人内置 TTS 朗读文本
export const speakWithAvatar = async (text: string, options?: {
  voice?: string
  speed?: number
  volume?: number
  pitch?: number
}): Promise<void> => {
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
      
      // 构造 TTS 参数
      const ttsOptions = {
        tts: {
          vcn: options?.voice || 'x4_lingxiaoying_assist',
          speed: options?.speed ?? 50,
          pitch: options?.pitch ?? 50,
          volume: options?.volume ?? 100,
          emotion: 13
        },
        // 关键：设置 nlp 为 false，不调用大模型
        nlp: false
      }
      
      console.log('[AvatarTTS] 发送朗读请求，参数:', ttsOptions)
      
      // 使用数字人 SDK 的 writeText 方法，只朗读不对话
      avatarPlatformInstance.writeText(text, ttsOptions)
      console.log('[AvatarTTS] 已发送朗读请求')
      
      // 监听音频播放结束
      const onAudioStop = () => {
        console.log('[AvatarTTS] 朗读完成')
        avatarTTSState.value.isPlaying = false
        avatarTTSState.value.currentText = ''
        globalCallbacks.onPlayEnd?.()
        resolve()
        // 移除监听器
        if (avatarPlatformInstance && avatarPlatformInstance.off) {
          avatarPlatformInstance.off('audio_stop', onAudioStop)
        }
      }
      
      // 监听音频停止事件
      if (avatarPlatformInstance && avatarPlatformInstance.on) {
        avatarPlatformInstance.on('audio_stop', onAudioStop)
        // 设置超时保底
        setTimeout(() => {
          if (avatarTTSState.value.isPlaying) {
            console.log('[AvatarTTS] 朗读超时，强制完成')
            onAudioStop()
          }
        }, Math.max(3000, text.length * 80))
      } else {
        // 如果没有事件监听，根据文本长度估算播放时间
        const duration = Math.max(2000, text.length * 80)
        setTimeout(() => {
          avatarTTSState.value.isPlaying = false
          globalCallbacks.onPlayEnd?.()
          resolve()
        }, duration)
      }
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
    isAvailable: isAvatarAvailable()
  }
}