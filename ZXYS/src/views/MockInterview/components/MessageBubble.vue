<!-- components/MessageBubble.vue -->
<template>
  <div class="message-wrapper" :class="message.type + '-message'">
    <div class="message-bubble shadow-soft" :class="message.type + '-bubble'">
      <template v-if="message.type === 'ai' && message.isTyping">
        <span class="typing-text">{{ message.typingText }}</span>
        <span class="typing-cursor">|</span>
      </template>
      <span v-else>{{ message.content }}</span>
      <button v-if="message.type === 'ai' && !message.isTyping && ttsEnabled" 
              class="read-btn" 
              @click="handleSpeakText(message.content)" 
              title="朗读">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 10H7L12 5V19L7 14H3V10Z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '../types'

defineProps<{
  message: Message
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

.user-message {
  align-self: flex-end;
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

.user-bubble {
  background: linear-gradient(135deg, #5a3921, #3d2b1f);
  color: #fff;
  border-bottom-right-radius: 4px;
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

.message-bubble .read-btn:hover {
  opacity: 1;
}

.typing-cursor {
  color: #a67c52;
  font-weight: bold;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

@keyframes messageIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>