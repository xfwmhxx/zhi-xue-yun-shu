<!-- components/QuestionMessage.vue -->
<template>
  <div v-if="question" class="message-wrapper ai-message current-question">
    <div class="message-bubble ai-bubble highlight-border shadow-soft">
      <div class="question-header-inline">
        <span v-if="!isTyped" class="typing-text">{{ typedText }}</span>
        <span v-else>{{ question.content }}</span>
        <button v-if="isTyped && ttsEnabled" class="read-btn" @click="handleSpeakText(question.content)" title="朗读题目">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 10H7L12 5V19L7 14H3V10Z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '../types'

defineProps<{
  question: Question | null
  typedText: string
  isTyped: boolean
  ttsEnabled: boolean
  handleSpeakText: (text: string) => void
}>()
</script>

<style scoped>
.message-wrapper {
  max-width: 85%;
  animation: messageIn 0.5s ease;
}

.ai-message {
  align-self: flex-start;
}

.message-bubble {
  padding: 14px 20px;
  font-size: 16px;
  line-height: 1.6;
  position: relative;
  border-radius: 20px;
}

.ai-bubble {
  background: #fff;
  border: 1px solid rgba(166, 124, 82, 0.3);
  color: #3d2b1f;
  border-bottom-left-radius: 4px;
}

.highlight-border {
  border: 2px solid #a67c52;
  background: #fffdf5;
}

.question-header-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.read-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  margin-left: 8px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: #8b7355;
  opacity: 0.6;
  vertical-align: middle;
}

.read-btn:hover {
  background: rgba(166, 124, 82, 0.1);
  color: #a67c52;
  opacity: 1;
  transform: scale(1.1);
}

.message-bubble .read-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.message-bubble:hover .read-btn {
  opacity: 0.8;
}

@keyframes messageIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.typing-text {
  display: inline-block;
}
</style>