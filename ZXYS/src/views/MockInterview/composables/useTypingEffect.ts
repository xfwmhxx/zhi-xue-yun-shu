// src/components/MockInterview/composables/useTypingEffect.ts
import { ref, onUnmounted } from 'vue'

export function useTypingEffect(speed: number = 25) {
  const isTyping = ref(false)
  const typedText = ref('')
  const timerList: number[] = []

  const startTyping = (fullText: string, onComplete?: () => void, onChar?: (char: string, index: number) => void) => {
    stopTyping()
    isTyping.value = true
    typedText.value = ''
    let index = 0

    const interval = setInterval(() => {
      if (index < fullText.length) {
        const char = fullText.charAt(index)
        typedText.value += char
        // 可选：每打一个字触发回调
        if (onChar) {
          onChar(char, index)
        }
        index++
      } else {
        clearInterval(interval)
        isTyping.value = false
        onComplete?.()
      }
    }, speed)

    timerList.push(interval as any)
  }

  const stopTyping = () => {
    timerList.forEach(clearInterval)
    timerList.length = 0
    isTyping.value = false
  }

  const resetTyping = () => {
    stopTyping()
    typedText.value = ''
  }

  onUnmounted(() => {
    stopTyping()
  })

  return {
    isTyping,
    typedText,
    startTyping,
    stopTyping,
    resetTyping
  }
}