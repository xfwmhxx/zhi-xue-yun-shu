// src/components/MockInterview/composables/useTTS.ts
import { ref } from 'vue'
import {
  speakWithAvatar,
  stopAvatarTTS,
  setAvatarTTSCallbacks,
  isAvatarAvailable,
} from '@/services/avatarTTS'

export function useTTS() {
  const ttsEnabled = ref(true)
  const isSpeaking = ref(false)

  const handleSpeakText = async (text: any) => {
    if (!ttsEnabled.value) return
    if (!text || text.trim() === '') return

    console.log('[useTTS] 准备朗读:', text.substring(0, 50))

    try {
      await speakWithAvatar(text, {
        voice: 'x4_lingxiaoying_assist',
        speed: 50,
        volume: 80,
        pitch: 50,
      })
    } catch (error) {
      console.error('[useTTS] 朗读失败:', error)
    }
  }

  const handleStopTTS = () => {
    stopAvatarTTS()
    isSpeaking.value = false
  }

  const toggleTTS = () => {
    ttsEnabled.value = !ttsEnabled.value
    if (!ttsEnabled.value) handleStopTTS()
    localStorage.setItem('ttsEnabled', String(ttsEnabled.value))
  }

  const initTTS = () => {
    const saved = localStorage.getItem('ttsEnabled')
    if (saved !== null) ttsEnabled.value = saved === 'true'

    setAvatarTTSCallbacks({
      onPlayStart: () => {
        console.log('[useTTS] 开始播放')
        isSpeaking.value = true
      },
      onPlayEnd: () => {
        console.log('[useTTS] 播放结束')
        isSpeaking.value = false
      },
      onError: (error: any) => {
        console.error('[useTTS] 错误:', error)
        isSpeaking.value = false
      },
    })

    console.log('[useTTS] 初始化完成')
  }

  return {
    ttsEnabled,
    isSpeaking,
    handleSpeakText,
    handleStopTTS,
    toggleTTS,
    initTTS,
  }
}
