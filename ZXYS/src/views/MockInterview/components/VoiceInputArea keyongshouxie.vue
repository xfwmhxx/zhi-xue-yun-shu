<template>
  <div class="input-area" v-if="showInputArea && !allQuestionsCompleted">
    <div class="voice-input-container">
      <!-- 输入模式切换按钮 -->
      <div class="input-mode-toggle">
        <button
          class="mode-btn"
          :class="{ active: inputMode === 'voice' }"
          @click="setInputMode('voice')"
          :disabled="!connected"
        >
          <i class="fas fa-microphone"></i>
          语音输入
        </button>
        <button
          class="mode-btn"
          :class="{ active: inputMode === 'manual' }"
          @click="setInputMode('manual')"
        >
          <i class="fas fa-keyboard"></i>
          手动输入
        </button>
      </div>

      <!-- 语音识别结果区域（语音模式） -->
      <div
        v-if="inputMode === 'voice'"
        class="voice-result-container"
        :class="{ 'has-result': voiceText || isListening }"
      >
        <div class="voice-result-header">
          <span class="voice-icon">🎤</span>
          <span class="voice-label">语音识别结果</span>
          <button v-if="voiceText" class="clear-voice-btn" @click="clearVoiceText">清空</button>
          <button
            v-if="voiceText && ttsEnabled"
            class="read-btn"
            @click="handleSpeakText(voiceText)"
            title="朗读识别结果"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 10H7L12 5V19L7 14H3V10Z"
                stroke="currentColor"
                stroke-width="2"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div class="voice-result-text" :class="{ recognizing: isListening }">
          <span v-if="isListening && !voiceText" class="recognizing-text">正在识别...</span>
          <span v-else>{{ voiceText || '等待语音输入...' }}</span>
          <span v-if="isListening" class="recording-cursor">|</span>
        </div>
      </div>

      <!-- 手动输入区域（手动模式） -->
      <div v-if="inputMode === 'manual'" class="manual-input-container">
        <div class="manual-input-header">
          <span class="manual-icon">✍️</span>
          <span class="manual-label">手动输入答案</span>
        </div>
        <textarea
          ref="manualTextareaRef"
          v-model="manualInputText"
          class="manual-textarea"
          placeholder="请输入您的答案..."
          rows="3"
          @keydown.ctrl.enter="handleManualSubmit"
        ></textarea>
        <div class="manual-tips">
          <span class="tip-icon">💡</span>
          <span class="tip-text">按 Ctrl+Enter 快速提交</span>
        </div>
      </div>

      <div class="voice-controls">
        <!-- 语音模式按钮 -->
        <template v-if="inputMode === 'voice'">
          <button
            class="voice-btn"
            :class="{ recording: isListening, disabled: !connected }"
            @click="handleVoiceInput"
            :disabled="isSubmitting || !connected || !isVoiceSupported"
          >
            <div class="voice-btn-icon">
              <svg v-if="!isListening" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" />
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" />
                <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" />
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect
                  x="6"
                  y="6"
                  width="12"
                  height="12"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>
            <span class="voice-btn-text">{{ isListening ? '停止录音' : '开始录音' }}</span>
          </button>

          <button
            class="submit-btn"
            :class="{ disabled: !voiceText.trim() || isSubmitting }"
            @click="handleSubmitAnswer"
            :disabled="!voiceText.trim() || isSubmitting"
          >
            <svg v-if="!isSubmitting" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else class="loading-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            提交答案
          </button>
        </template>

        <!-- 手动模式按钮 -->
        <template v-if="inputMode === 'manual'">
          <button
            class="submit-btn manual-submit"
            :class="{ disabled: !manualInputText.trim() || isSubmitting }"
            @click="handleManualSubmit"
            :disabled="!manualInputText.trim() || isSubmitting"
          >
            <svg v-if="!isSubmitting" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else class="loading-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            提交答案
          </button>
        </template>
      </div>

      <div class="voice-tips">
        <span class="tip-icon">💡</span>
        <span class="tip-text" v-if="inputMode === 'voice'">
          点击麦克风按钮，说出您的答案，系统会自动转换为文字
        </span>
        <span class="tip-text" v-else> 在输入框中输入您的答案，点击提交或按 Ctrl+Enter </span>
      </div>

      <!-- 浏览器不支持提示 -->
      <div v-if="!isVoiceSupported && inputMode === 'voice'" class="browser-warning">
        <span class="warning-icon">⚠️</span>
        <span class="warning-text"
          >您的浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器，或切换到手动输入模式</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { isAsrSupported } from '@/views/MockInterview/composables/useAsr'

interface Props {
  showInputArea: boolean
  allQuestionsCompleted: boolean
  voiceText: string
  isListening: boolean
  isSubmitting: boolean
  connected: boolean
  ttsEnabled: boolean
  handleVoiceInput: () => void
  clearVoiceText: () => void
  handleSubmitAnswer: () => void
  handleSpeakText: (text: string) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'manual-submit', text: string): void
}>()

// 输入模式：'voice' 或 'manual'
const inputMode = ref<'voice' | 'manual'>('voice')
// 手动输入的文本
const manualInputText = ref('')
// 手动输入框的引用
const manualTextareaRef = ref<HTMLTextAreaElement | null>(null)

// 检查浏览器是否支持语音识别 - 使用函数调用而不是 computed
const isVoiceSupported = isAsrSupported()

// 设置输入模式
const setInputMode = (mode: 'voice' | 'manual') => {
  console.log('[VoiceInputArea] 切换输入模式:', mode)
  inputMode.value = mode
  if (mode === 'manual') {
    // 切换到手动模式时，如果正在录音则停止
    if (props.isListening) {
      props.handleVoiceInput()
    }
    // 聚焦到输入框
    nextTick(() => {
      manualTextareaRef.value?.focus()
    })
  } else {
    // 切换到语音模式时，清空手动输入
    manualInputText.value = ''
  }
}

// 手动提交答案
const handleManualSubmit = () => {
  if (!manualInputText.value.trim() || props.isSubmitting) {
    console.log('[VoiceInputArea] 手动提交条件不满足:', {
      hasText: !!manualInputText.value.trim(),
      isSubmitting: props.isSubmitting,
    })
    return
  }
  console.log('[VoiceInputArea] 手动提交答案:', manualInputText.value.trim())
  emit('manual-submit', manualInputText.value.trim())
  // 提交后不清空输入框，让用户可以看到已提交的内容
  // manualInputText.value = ''
}

// 监控 connected 状态变化
watch(
  () => props.connected,
  (newVal, oldVal) => {
    console.log('[VoiceInputArea] connected 状态变化:', {
      oldVal,
      newVal,
      showInputArea: props.showInputArea,
    })
  },
  { immediate: true },
)

// 监控 showInputArea 状态变化
watch(
  () => props.showInputArea,
  (newVal) => {
    console.log('[VoiceInputArea] showInputArea 状态变化:', newVal, 'connected:', props.connected)
  },
  { immediate: true },
)

// 监控 voiceText 变化
watch(
  () => props.voiceText,
  (newVal) => {
    if (newVal) {
      console.log('[VoiceInputArea] 语音识别文本更新:', newVal.substring(0, 50))
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.input-area {
  background: rgba(166, 124, 82, 0.05);
  border-radius: 20px;
  padding: 15px;
  transition: all 0.5s ease;
}

.voice-input-container {
  width: 100%;
}

/* 输入模式切换按钮 */
.input-mode-toggle {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  background: rgba(166, 124, 82, 0.1);
  border-radius: 40px;
  padding: 4px;
}

.mode-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'STKaiti', serif;
  background: transparent;
  color: #8b7355;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.mode-btn.active {
  background: linear-gradient(135deg, #5a3921, #3d2b1f);
  color: #fff;
  box-shadow: 0 2px 8px rgba(90, 57, 33, 0.2);
}

.mode-btn:hover:not(.active) {
  background: rgba(166, 124, 82, 0.2);
  color: #5a3921;
}

.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 语音识别结果区域 */
.voice-result-container {
  background: rgba(166, 124, 82, 0.08);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(166, 124, 82, 0.2);
  transition: all 0.3s;
}

.voice-result-container.has-result {
  border-color: #a67c52;
  background: rgba(166, 124, 82, 0.12);
}

.voice-result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.2);
}

.voice-icon {
  font-size: 18px;
}

.voice-label {
  font-size: 14px;
  font-weight: bold;
  color: #5a3921;
  flex: 1;
}

.clear-voice-btn {
  background: none;
  border: none;
  color: #8b7355;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s;
}

.clear-voice-btn:hover {
  background: rgba(166, 124, 82, 0.1);
  color: #a02828;
}

.read-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: #8b7355;
  opacity: 0.6;
}

.read-btn:hover {
  background: rgba(166, 124, 82, 0.1);
  color: #a67c52;
  opacity: 1;
  transform: scale(1.1);
}

.voice-result-text {
  font-size: 15px;
  line-height: 1.6;
  color: #3d2b1f;
  min-height: 60px;
  max-height: 150px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
}

.voice-result-text.recognizing {
  background: rgba(166, 124, 82, 0.05);
  border-left: 3px solid #a67c52;
}

.recognizing-text {
  color: #8b7355;
  font-style: italic;
}

.recording-cursor {
  animation: blink 1s infinite;
  color: #a67c52;
  font-weight: bold;
}

/* 手动输入区域 */
.manual-input-container {
  background: rgba(166, 124, 82, 0.08);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(166, 124, 82, 0.2);
}

.manual-input-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.2);
}

.manual-icon {
  font-size: 18px;
}

.manual-label {
  font-size: 14px;
  font-weight: bold;
  color: #5a3921;
}

.manual-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(166, 124, 82, 0.3);
  border-radius: 12px;
  color: #3d2b1f;
  font-size: 14px;
  line-height: 1.5;
  font-family: 'STKaiti', 'SimSun', serif;
  resize: vertical;
  transition: all 0.3s;
}

.manual-textarea:focus {
  outline: none;
  border-color: #a67c52;
  box-shadow: 0 0 8px rgba(166, 124, 82, 0.3);
  background: #fff;
}

.manual-textarea::placeholder {
  color: #c9b6a0;
}

.manual-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #8b7355;
  display: flex;
  align-items: center;
  gap: 6px;
}

.voice-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.voice-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #5a3921, #3d2b1f);
  color: #fff;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.voice-btn.recording {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  animation: pulse 1.5s infinite;
}

.voice-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.voice-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(90, 57, 33, 0.3);
}

.submit-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
  color: #fff;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.submit-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.submit-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn.manual-submit {
  background: linear-gradient(135deg, #5a3921, #3d2b1f);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.voice-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(166, 124, 82, 0.05);
  border-radius: 12px;
  font-size: 12px;
  color: #8b7355;
}

/* 浏览器不支持提示样式 */
.browser-warning {
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #856404;
}

.warning-icon {
  font-size: 16px;
}

.warning-text {
  flex: 1;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
