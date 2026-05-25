<!-- components/AnalysisOverlay.vue -->
<template>
  <transition name="fade">
    <div v-if="show" class="analysis-overlay">
      <div class="analysis-card glass-effect shadow-lg">
        <div class="analysis-icon">
          <div class="pulse-ring"></div>
          <i class="symbol-diamond large"></i>
        </div>
        <h3 class="analysis-title">AI 修学评估中</h3>
        <p class="analysis-subtitle">正在分析测试数据并同步知识掌握度...</p>

        <div class="progress-container">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="progress-text">{{ Math.round(progress) }}%</div>
        </div>

        <div class="analysis-tips">
          <span class="tip-item">● 正在分析您的回答质量</span>
          <span class="tip-item">● 正在生成个性化能力画像</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  progress: number
}>()
</script>

<style scoped>
.analysis-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 253, 247, 0.96);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.analysis-card {
  width: 420px;
  padding: 45px;
  text-align: center;
  border-radius: 30px;
  border: 1px solid rgba(166, 124, 82, 0.3);
  background: rgba(255, 253, 247, 0.95);
}

.glass-effect {
  background: rgba(255, 253, 247, 0.85);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(166, 124, 82, 0.4);
  box-shadow: 0 15px 35px rgba(90, 57, 33, 0.12);
}

.analysis-icon {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid #a67c52;
  border-radius: 50%;
  animation: pulseRotate 2.5s infinite;
}

.symbol-diamond.large {
  width: 28px;
  height: 28px;
  background: #a67c52;
  transform: rotate(45deg);
}

.analysis-title {
  font-size: 26px;
  color: #3d2b1f;
  margin-bottom: 12px;
  font-weight: bold;
}

.analysis-subtitle {
  font-size: 15px;
  color: #8b7355;
  margin-bottom: 40px;
}

.progress-container {
  margin-bottom: 35px;
}

.progress-bar-bg {
  width: 100%;
  height: 12px;
  background: rgba(166, 124, 82, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b7355, #5a3921);
  border-radius: 10px;
  transition: width 0.4s ease;
}

.progress-text {
  font-size: 20px;
  font-weight: bold;
  color: #5a3921;
}

.analysis-tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  color: #a02828;
  opacity: 0.9;
}

@keyframes pulseRotate {
  0% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 0.3; }
  100% { transform: scale(0.9); opacity: 0.8; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>