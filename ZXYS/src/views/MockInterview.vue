<!-- src/components/PlacementTest/MockInterview.vue -->
<template>
  <PageTransition
    v-if="showTransition"
    mode="leave"
    :show-text="true"
    @animation-end="onEnterAnimationEnd"
  />
  <BreadcrumbNav title="模拟面试" :show-back="false"></BreadcrumbNav>

  <!-- 模拟面试主容器 -->
  <div class="interview-container">
    <!-- 左侧区域：数字人 -->
    <div class="left-section">
      <xunfei_shuziren ref="xunfeiShuzirenRef" />
    </div>

    <!-- 中间区域：对话框 -->
    <div class="center-section">
      <DialogArea
        :interview-started="interviewStarted"
        :interview-status="interviewStatus"
        :messages="messages"
        :is-avatar-initializing="isAvatarInitializing"
        @ai-response-complete="handleAiResponse"
        @answer-selected="handleAnswerSelected"
        @test-completed="handleTestCompleted"
      />
    </div>

    <!-- 右侧区域：摄像头 + 面试要求 -->
    <div class="right-section">
      <!-- 摄像头采集区 (杏林画框风格) -->
      <div class="xinglin-box camera-box">
        <div class="box-header">
          <div class="status-indicator">
            <span class="pulse-dot" :class="{ active: cameraActive }"></span>
            <span class="status-text">{{ cameraActive ? '实时监考画面' : '摄像头未连接' }}</span>
          </div>
        </div>
        <div class="video-wrapper">
          <!-- 使用 Camera 组件替换原生 video -->
          <Camera
            ref="cameraRef"
            :auto-start="true"
            :mirror="true"
            :video-constraints="videoConstraints"
            @camera-ready="onCameraReady"
            @camera-error="onCameraError"
            @face-detected="onFaceDetected"
            @emotion-changed="onEmotionChanged"
          />
        </div>
      </div>

      <!-- 面试要求提示区 (杏林画框风格) -->
      <div class="xinglin-box requirements-box">
        <h4 class="req-title">测试环境规范</h4>
        <div class="req-content">
          <ul class="custom-list">
            <li>
              <span class="list-bullet">◈</span>
              <p>确保光线充足，面部清晰可见</p>
            </li>
            <li>
              <span class="list-bullet">◈</span>
              <p>请在安静环境下进行答题</p>
            </li>
            <li>
              <span class="list-bullet">◈</span>
              <p>建议佩戴耳机以获得最佳反馈</p>
            </li>
            <li>
              <span class="list-bullet">◈</span>
              <p>测试过程中请勿关闭摄像头</p>
            </li>
          </ul>
        </div>
        <div class="ai-badge">
          <i class="fas fa-shield-alt"></i>
          <span>智能研判中</span>
          <span v-if="currentEmotion" class="emotion-badge">{{ currentEmotion }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 测试完成遮罩层 -->
  <transition name="fade">
    <div
      v-if="showCompletionOverlay"
      class="completion-overlay"
      @click.self="closeCompletionOverlay"
    >
      <div class="completion-card glass-effect">
        <div class="completion-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#2e7d32" stroke-width="2" fill="none" />
            <path d="M8 12L11 15L16 9" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h3 class="completion-title">测试完成</h3>
        <p class="completion-text">您已完成所有题目，成绩已保存</p>
        <div class="completion-stats">
          <div class="stat-item">
            <span class="stat-label">完成题目</span>
            <span class="stat-value">{{ testResult.totalCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确率</span>
            <span class="stat-value">{{ testResult.accuracy || '0%' }}</span>
          </div>
        </div>
        <div class="completion-actions">
          <button class="btn-download" @click="downloadResult">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3V12M12 12L9 9M12 12L15 9" stroke="currentColor" stroke-width="2" />
              <path
                d="M5 17V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V17"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            下载报告
          </button>
          <button class="btn-home" @click="goToHome">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" stroke-width="2" />
              <path d="M12 15V21" stroke="currentColor" stroke-width="2" />
              <path d="M9 18L15 18" stroke="currentColor" stroke-width="2" />
            </svg>
            返回首页
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import xunfei_shuziren from '@/views/MockInterview/xunfei_shuziren.vue'
import DialogArea from '@/views/MockInterview/DialogArea.vue'
import Camera from '@/views/MockInterview/camera.vue'
import { appState, appStore } from '@/stores/app'

// 引入过渡页面组件
import PageTransition from '@/components/PageTransition.vue'
const showTransition = ref(false)

// 路由
const router = useRouter()

// 定义 Camera 组件的类型
interface CameraInstance {
  start: () => void
  stop: () => void
  isActive: () => boolean
  getCurrentEmotion?: () => {
    emotion: string
    displayName: string
    icon: string
    confidence: number
  }
  uploadAllEmotionImages?: (
    interviewId: number,
  ) => Promise<{ success: boolean; uploaded: number; failed: number }>
  getEmotionAnalysisJson?: () => any
  clearData?: () => void
}

// ============ 先声明所有 ref 变量 ============
// 数字人组件引用
const xunfeiShuzirenRef = ref<{ isInitializing: boolean } | null>(null)
const isAvatarInitializing = ref(true)

// 面试相关逻辑
const interviewStarted = ref(true)
const interviewStatus = ref('测试中')
const messages = ref<Array<{ id: number; type: 'user' | 'ai'; content: string }>>([])

// 测试结果
const testResult = ref({
  totalCount: 0,
  accuracy: '0%',
  exportData: null,
})
const showCompletionOverlay = ref(false)

// Camera 组件相关
const cameraRef = ref<CameraInstance | null>(null)
const cameraActive = ref(false)
const currentEmotion = ref('')
const videoConstraints = ref({
  width: { ideal: 640 },
  height: { ideal: 480 },
  facingMode: 'user',
})

// ============ 提供全局状态和方法（在变量声明之后） ============
provide('appState', appState)
provide('appStore', appStore)
provide('cameraRef', cameraRef)

// ============ 函数定义 ============
// 监控数字人初始化状态
const checkAvatarInitializing = () => {
  if (xunfeiShuzirenRef.value) {
    const newState = xunfeiShuzirenRef.value.isInitializing
    if (isAvatarInitializing.value !== newState) {
      console.log('[MockInterview] 数字人初始化状态变化:', newState)
      isAvatarInitializing.value = newState
    }
  }
}

// 定时检查数字人初始化状态
let checkInterval: number | null = null

// 表情显示名称映射
const getEmotionDisplayName = (emotion: string): string => {
  const map: Record<string, string> = {
    happy: '😊 开心',
    surprise: '😲 惊讶',
    anger: '😠 愤怒',
    sadness: '😢 悲伤',
    fear: '😨 恐惧',
    disgust: '😖 厌恶',
    neutral: '😐 中性',
  }
  return map[emotion] || '😐 中性'
}

// Camera 组件事件处理
const onCameraReady = () => {
  cameraActive.value = true
  console.log('[MockInterview] 摄像头已准备就绪')
}

const onCameraError = (error: Error) => {
  console.error('[MockInterview] 摄像头错误:', error)
  cameraActive.value = false
}

const onFaceDetected = (detected: boolean) => {
  if (detected) {
    console.log('[MockInterview] 检测到人脸')
  } else {
    console.log('[MockInterview] 未检测到人脸')
  }
}

const onEmotionChanged = (emotion: string) => {
  currentEmotion.value = getEmotionDisplayName(emotion)
  console.log('[MockInterview] 表情变化:', currentEmotion.value)
}

// 手动控制摄像头
const startCamera = () => {
  if (cameraRef.value && cameraRef.value.start) {
    cameraRef.value.start()
  }
}

const stopCamera = () => {
  if (cameraRef.value && cameraRef.value.stop) {
    cameraRef.value.stop()
  }
}

// AI响应处理
function handleAiResponse(data: any) {
  console.log('[MockInterview] AI响应:', data)
  if (data && data.content) {
    messages.value.push({
      id: Date.now(),
      type: 'ai',
      content: data.content,
    })
  }
}

// 处理答案选择
function handleAnswerSelected(data: any) {
  console.log('[MockInterview] 答案已选择:', data)
}

// 处理测试完成
function handleTestCompleted(data: any) {
  console.log('[MockInterview] 测试完成:', data)
  testResult.value = {
    totalCount: data.totalCount || 0,
    accuracy: data.accuracy || '0%',
    exportData: data,
  }
  showCompletionOverlay.value = true
  interviewStatus.value = '已完成'
}

// 下载结果报告
const downloadResult = () => {
  if (testResult.value.exportData) {
    const jsonStr = JSON.stringify(testResult.value.exportData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `test_result_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('[MockInterview] 报告已下载')
  }
}

// 返回首页
const goToHome = () => {
  router.push('/Foundations/userhome/interview')
}

// 关闭完成遮罩层
const closeCompletionOverlay = () => {
  showCompletionOverlay.value = false
}
const onEnterAnimationEnd = () => {
  showTransition.value = false
}

// ============ 生命周期 ============
onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'

  // 启动定时检查数字人初始化状态
  checkInterval = window.setInterval(() => {
    checkAvatarInitializing()
  }, 500)

  console.log('[MockInterview] 组件挂载，双视频流已启动（数字人 + 摄像头）')
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  if (cameraRef.value && cameraRef.value.stop) {
    cameraRef.value.stop()
  }
  console.log('[MockInterview] 组件卸载')
})

// 暴露方法给父组件
defineExpose({
  startCamera,
  stopCamera,
  cameraActive,
  getCurrentEmotion: () => cameraRef.value?.getCurrentEmotion?.(),
})
</script>

<style scoped>
/* 布局主容器 */
.interview-container {
  top: 40px;
  position: relative;
  display: flex;
  height: calc(100vh - 12vh);
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
  z-index: 1;
}

.left-section {
  flex: 0 0 380px;
}

.center-section {
  flex: 1;
  min-width: 450px;
}

.right-section {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 杏林风格通用卡片 */
.xinglin-box {
  background: rgba(255, 253, 247, 0.85);
  border-radius: 24px;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(166, 124, 82, 0.5);
  position: relative;
  box-shadow: 0 10px 40px rgba(90, 57, 33, 0.12);
  padding: 20px;
  font-family: 'STKaiti', 'SimSun', serif;
  overflow: hidden;
}

/* 内部装饰线条 */
.xinglin-box::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 18px;
  pointer-events: none;
}

/* 视频框特定样式 */
.camera-box {
  flex: 0 0 auto;
}

.box-header {
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #b71c1c;
  border-radius: 50%;
  box-shadow: 0 0 8px #b71c1c;
  animation: recording 1.5s infinite;
}

.pulse-dot.active {
  background: #2e7d32;
  box-shadow: 0 0 8px #2e7d32;
  animation: recording-active 1.5s infinite;
}

@keyframes recording {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes recording-active {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.status-text {
  font-size: 14px;
  color: #3d2b1f;
  font-weight: bold;
  letter-spacing: 1px;
}

.video-wrapper {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #2d1f0f;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(166, 124, 82, 0.3);
  z-index: 1;
}

/* Camera 组件样式覆盖 */
.video-wrapper :deep(.camera-container) {
  width: 100%;
  height: 100%;
}

.video-wrapper :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

/* 面试要求特定样式 */
.requirements-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.req-title {
  font-size: 18px;
  color: #3d2b1f;
  margin: 0 0 15px 0;
  text-align: center;
  letter-spacing: 2px;
  z-index: 1;
}

.req-content {
  flex: 1;
  z-index: 1;
}

.custom-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.custom-list li {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  color: #5d4632;
  font-size: 15px;
  line-height: 1.4;
}

.list-bullet {
  color: #a67c52;
  font-size: 12px;
  margin-top: 2px;
}

.ai-badge {
  margin-top: auto;
  background: rgba(166, 124, 82, 0.1);
  border: 1px solid rgba(166, 124, 82, 0.3);
  padding: 8px;
  border-radius: 8px;
  text-align: center;
  color: #8b7355;
  font-size: 13px;
  font-style: italic;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.emotion-badge {
  background: rgba(166, 124, 82, 0.2);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 12px;
  color: #a67c52;
  font-style: normal;
}

/* 完成遮罩层 */
.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(101, 67, 33, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.completion-card {
  width: 420px;
  padding: 40px;
  text-align: center;
  background: linear-gradient(135deg, #fff8dc 0%, #f5deb3 100%);
  border-radius: 24px;
  border: 3px solid rgba(210, 180, 140, 0.4);
  box-shadow: 0 20px 60px rgba(101, 67, 33, 0.4);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-effect {
  background: rgba(255, 253, 247, 0.95);
  backdrop-filter: blur(20px);
}

.completion-icon {
  margin-bottom: 20px;
}

.completion-icon svg {
  filter: drop-shadow(0 4px 12px rgba(46, 125, 50, 0.3));
}

.completion-title {
  font-size: 28px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 12px;
  font-family: 'STKaiti', 'SimSun', serif;
}

.completion-text {
  font-size: 16px;
  color: #5d4632;
  margin-bottom: 24px;
}

.completion-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 32px;
  padding: 16px;
  background: rgba(166, 124, 82, 0.1);
  border-radius: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #8b7355;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #5a3921;
}

.completion-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-download,
.btn-home {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
  border: none;
}

.btn-download {
  background: linear-gradient(135deg, #5a3921, #3d2b1f);
  color: #fff;
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(90, 57, 33, 0.3);
}

.btn-home {
  background: linear-gradient(135deg, rgba(166, 124, 82, 0.2), rgba(139, 69, 19, 0.15));
  color: #5a3921;
  border: 1px solid rgba(166, 124, 82, 0.3);
}

.btn-home:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, rgba(166, 124, 82, 0.3), rgba(139, 69, 19, 0.25));
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式适配 */
@media (max-width: 1400px) {
  .left-section {
    flex: 0 0 320px;
  }
  .right-section {
    flex: 0 0 280px;
  }
}

@media (max-width: 1200px) {
  .interview-container {
    flex-direction: column;
    height: auto;
    overflow-y: auto;
  }

  :global(body) {
    overflow: auto !important;
  }

  .left-section,
  .center-section,
  .right-section {
    min-width: 100%;
    max-width: 100%;
  }

  .video-wrapper {
    aspect-ratio: 16 / 9;
  }
}
</style>
