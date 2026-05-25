<!-- components/DialogHeader.vue -->
<template>
  <div class="dialog-header">
    <div class="dialog-title">
      <i class="symbol-diamond"></i>
      <span>摸底测试对话框</span>
    </div>
    <div class="dialog-status">
      <span class="status-indicator" :class="{ connected: connected }"></span>
      <span class="status-text">{{ connected ? '数字人已连接' : '数字人连接中...' }}</span>
    </div>
    <div class="tts-control">
      <button class="tts-toggle-btn" :class="{ active: ttsEnabled }" @click="toggleTTS">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path v-if="!ttsEnabled" d="M3 10H7L12 5V19L7 14H3V10Z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
          <path v-else d="M3 10H7L12 5V19L7 14H3V10Z M15 9L18 12L15 15 M18 9L21 12L18 15" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <span>{{ ttsEnabled ? '语音朗读开' : '语音朗读关' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  connected: boolean
  ttsEnabled: boolean
  toggleTTS: () => void
}>()
</script>

<style scoped>
.dialog-header {
  padding: 18px 30px;
  background: rgba(166, 124, 82, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(166, 124, 82, 0.2);
  z-index: 10;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: bold;
  color: #3d2b1f;
  letter-spacing: 2px;
}

.symbol-diamond {
  width: 10px;
  height: 10px;
  background: #a67c52;
  transform: rotate(45deg);
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #a02828;
  border-radius: 50%;
  animation: pulseRed 2s infinite;
  display: inline-block;
}

.status-indicator.connected {
  background: #2e7d32;
  animation: none;
}

@keyframes pulseRed {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.5; }
}

.status-text {
  color: #8b7355;
  font-size: 14px;
  margin-left: 8px;
}

.tts-control {
  display: flex;
  align-items: center;
}

.tts-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(166, 124, 82, 0.1);
  border: 1px solid rgba(166, 124, 82, 0.3);
  border-radius: 40px;
  cursor: pointer;
  font-size: 12px;
  color: #8b7355;
  transition: all 0.3s;
}

.tts-toggle-btn:hover {
  background: rgba(166, 124, 82, 0.2);
}

.tts-toggle-btn.active {
  background: rgba(46, 125, 50, 0.1);
  border-color: #2e7d32;
  color: #2e7d32;
}
</style>