<!-- components/AnsweredQuestion.vue -->
<template>
  <div class="message-wrapper ai-message">
    <div class="message-bubble ai-bubble shadow-soft">
      <div class="question-header">
        <span class="question-type">{{ question.type }}</span>
        <span class="question-number">第 {{ index + 1 }} 题</span>
        <button v-if="ttsEnabled" class="read-btn" @click="handleSpeakText(question.content)" title="朗读题目">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 10H7L12 5V19L7 14H3V10Z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <div class="question-content">{{ question.content }}</div>
      <div class="answer-result">
        <div class="user-answer">
          <span class="answer-label">您的回答：</span>
          <span class="answer-text">{{ question.user_answer }}</span>
          <button v-if="question.user_answer && ttsEnabled" class="read-btn small" @click="handleSpeakText(question.user_answer!)" title="朗读您的回答">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M3 10H7L12 5V19L7 14H3V10Z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div v-if="question.answer_logic" class="answer-logic">
          <span class="logic-label">参考答案：</span>
          <span class="logic-text">{{ question.answer_logic }}</span>
          <button v-if="ttsEnabled" class="read-btn small" @click="handleSpeakText(question.answer_logic)" title="朗读参考答案">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M3 10H7L12 5V19L7 14H3V10Z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div v-if="question.key_points" class="key-points">
          <span class="points-label">评分要点：</span>
          <span class="points-text">{{ question.key_points }}</span>
          <button v-if="ttsEnabled" class="read-btn small" @click="handleSpeakText(question.key_points)" title="朗读评分要点">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M3 10H7L12 5V19L7 14H3V10Z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '../types'

defineProps<{
  question: Question
  index: number
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

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.2);
}

.question-type {
  font-size: 14px;
  font-weight: bold;
  color: #a67c52;
  background: rgba(166, 124, 82, 0.1);
  padding: 2px 10px;
  border-radius: 20px;
}

.question-number {
  font-size: 12px;
  color: #8b7355;
}

.question-content {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
  font-weight: 500;
}

.answer-result {
  background: rgba(166, 124, 82, 0.05);
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
}

.user-answer {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.answer-label {
  font-weight: bold;
  color: #5a3921;
  display: block;
  margin-bottom: 4px;
}

.answer-text {
  color: #3d2b1f;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  flex: 1;
}

.answer-logic,
.key-points {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(166, 124, 82, 0.2);
}

.logic-label,
.points-label {
  font-weight: bold;
  color: #8b7355;
  font-size: 12px;
  display: block;
  margin-bottom: 4px;
}

.logic-text,
.points-text {
  font-size: 13px;
  color: #6b4e2e;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
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
  vertical-align: middle;
}

.read-btn.small {
  padding: 2px 4px;
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
</style>