<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Video {
  id: number
  title: string
  views: string
  danmaku?: string
  duration: string
  date: string
  pic: string
  matchScore?: number
}

interface Props {
  visible: boolean
  videoList: Video[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

const router = useRouter()

// 状态
const isAnalyzing = ref(false)
const analysisProgress = ref(0)
const analysisMode = ref<'custom' | 'weakness' | null>(null)
const customDescription = ref('')
const analysisResult = ref(false)
const recommendedVideos = ref<Video[]>([])
const analysisHint = ref('')

// 分析提示语
const hints = [
  '正在解析語義特徵...',
  '正在匹配教學大綱...',
  '正在計算內容相似度...',
  '正在篩選優質內容...',
  '即將完成分析...',
]

// 开始分析
const startAnalysis = (mode: 'custom' | 'weakness') => {
  if (mode === 'custom' && !customDescription.value.trim()) {
    customDescription.value = '中醫望診教學'
  }

  analysisMode.value = mode
  isAnalyzing.value = true
  analysisProgress.value = 0
  analysisResult.value = false

  let progress = 0
  let hintIndex = 0

  const timer = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 5
    if (progress >= 100) {
      progress = 100
      analysisProgress.value = 100
      analysisHint.value = '分析完成！'
      clearInterval(timer)

      setTimeout(() => {
        generateRecommendations()
        isAnalyzing.value = false
        analysisResult.value = true
      }, 300)
    } else {
      analysisProgress.value = progress
      if (progress > (hintIndex + 1) * 20 && hintIndex < hints.length - 1) {
        hintIndex++
        analysisHint.value = hints[hintIndex] as string
      } else if (!analysisHint.value) {
        analysisHint.value = hints[0] as string
      }
    }
  }, 150)
}

const generateRecommendations = () => {
  if (props.videoList.length === 0) return
  const count = Math.floor(Math.random() * 2) + 2
  const shuffled = [...props.videoList].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, props.videoList.length))

  recommendedVideos.value = selected.map((video) => ({
    ...video,
    matchScore: Math.floor(Math.random() * 20) + 80,
  }))
}

const goToVideo = (id: number) => {
  router.push(`/Hina/AIVideoIntroduce/${id}`)
  handleClose()
}

const resetModal = () => {
  isAnalyzing.value = false
  analysisProgress.value = 0
  analysisMode.value = null
  analysisResult.value = false
  recommendedVideos.value = []
  analysisHint.value = ''
}

const handleClose = () => {
  console.log('handleClose called')
  emit('update:visible', false)
  emit('close')
  // 延迟重置，等待退出动画完成
  setTimeout(resetModal, 400)
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="zen-fade">
      <!-- 遮罩层：负责整体背景淡入 -->
      <div v-if="visible" class="modal-overlay" @click.self="handleClose">
        <!-- 弹窗卡片：独立动画 -->
        <div class="modal-card">
          <!-- 杏林主题装饰角 -->
          <div class="corner-deco tl"></div>
          <div class="corner-deco tr"></div>
          <div class="corner-deco bl"></div>
          <div class="corner-deco br"></div>

          <!-- 头部：印章风格 -->
          <div class="modal-header">
            <div class="seal-box">
              <span class="seal-char">智</span>
            </div>
            <div class="header-text">
              <h2 class="modal-title">AI 慧眼识才</h2>
              <p class="modal-subtitle">智能辩证 · 寻得真理</p>
            </div>
            <button class="close-btn" @click="handleClose">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- 内容区 -->
          <div class="modal-content custom-scrollbar">
            <!-- 阶段1：选择模式 -->
            <div v-if="!isAnalyzing && !analysisResult" class="mode-selection">
              <div class="mode-card" @click="startAnalysis('custom')">
                <div class="mode-icon-ink">
                  <i class="fas fa-feather-alt"></i>
                </div>
                <h3 class="mode-title">自定义描述检索</h3>
                <p class="mode-desc">简述您的学习困惑，AI 将在数据库中为您找到答案</p>

                <div class="custom-input-wrapper" @click.stop>
                  <textarea
                    v-model="customDescription"
                    class="zen-textarea"
                    placeholder="例如：想学习望闻问切相关的內容..."
                    rows="3"
                    maxlength="200"
                  ></textarea>
                  <div class="char-count">{{ customDescription.length }}/200</div>
                </div>

                <button class="zen-action-btn" @click.stop="startAnalysis('custom')">
                  <i class="fas fa-search"></i>
                  开始智能检索
                </button>
              </div>

              <div class="divider-ink">
                <span class="line"></span>
                <span class="ink-text">杏林智搜</span>
                <span class="line"></span>
              </div>

              <div class="mode-card" @click="startAnalysis('weakness')">
                <div class="mode-icon-ink">
                  <i class="fas fa-yin-yang"></i>
                </div>
                <h3 class="mode-title">薄弱知识点分析</h3>
                <p class="mode-desc">基于您的学习历程，自动辨别知识盲区精准推荐</p>
                <div class="status-badge">系统已就绪，随时待命</div>
                <button class="zen-action-btn" @click.stop="startAnalysis('weakness')">
                  <i class="fas fa-chart-line"></i>
                  开始智能分析
                </button>
              </div>
            </div>

            <!-- 阶段2：分析进度 -->
            <div v-if="isAnalyzing" class="analyzing-section">
              <div class="analyzing-icon-wrap">
                <div class="pulse-ring"></div>
                <i class="fas fa-microchip"></i>
              </div>
              <h3 class="analyzing-title">{{ analysisHint }}</h3>

              <div class="analysis-steps">
                <div
                  v-for="(step, i) in ['读取', '解析', '计算', '排序']"
                  :key="i"
                  class="step-item"
                  :class="{ active: analysisProgress >= (i + 1) * 25 }"
                >
                  <div class="step-dot"></div>
                  <span>{{ step }}</span>
                </div>
              </div>

              <div class="progress-container">
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: analysisProgress + '%' }"></div>
                </div>
                <span class="progress-percent">{{ analysisProgress }}%</span>
              </div>
            </div>

            <!-- 阶段3：分析结果 -->
            <div v-if="analysisResult && !isAnalyzing" class="result-section">
              <div class="result-header">
                <i class="fas fa-check-circle result-success-icon"></i>
                <h3 class="result-msg">已为您寻得契合的数据</h3>
              </div>

              <div class="result-list">
                <div
                  v-for="video in recommendedVideos"
                  :key="video.id"
                  class="result-item"
                  @click="goToVideo(video.id)"
                >
                  <div class="result-thumb">
                    <img :src="video.pic" :alt="video.title" />
                    <span class="match-badge">{{ video.matchScore }}% 契合</span>
                  </div>
                  <div class="result-info">
                    <h4 class="result-title">{{ video.title }}</h4>
                    <div class="result-meta">
                      <span><i class="fas fa-history"></i> {{ video.duration }}</span>
                      <span><i class="fas fa-eye"></i> {{ video.views }}</span>
                    </div>
                    <div class="score-track">
                      <div class="score-fill" :style="{ width: video.matchScore + '%' }"></div>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right res-arrow"></i>
                </div>
              </div>

              <div class="result-actions">
                <button class="action-btn-outline" @click="resetModal">重新分析</button>
                <button class="action-btn-solid" @click="handleClose">完成</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 核心变量 */
.modal-overlay {
  --apricot-base: #fdfaf5;
  --bronze-border: #8b5a2e;
  --ink-text: #3e2723;
  --seal-red: #b71c1c;
  --soft-gold: #a67c52;

  position: fixed;
  inset: 0;
  background: rgba(30, 20, 15, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  opacity: 1; /* 初始显示 */
}

/* 过渡动画：分层处理 */
.zen-fade-enter-active,
.zen-fade-leave-active {
  transition: opacity 0.4s ease;
}
.zen-fade-enter-from,
.zen-fade-leave-to {
  opacity: 0;
}

/* 卡片弹性入场 */
.zen-fade-enter-active .modal-card {
  animation: modal-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.zen-fade-leave-active .modal-card {
  animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse forwards;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 弹窗卡片主体 */
.modal-card {
  background: var(--apricot-base) url('https://www.transparenttextures.com/patterns/paper.png');
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  border: 1px solid var(--bronze-border);
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
}

/* 四角装饰 */
.corner-deco {
  position: absolute;
  width: 25px;
  height: 25px;
  border: 2px solid var(--soft-gold);
  pointer-events: none;
}
.tl {
  top: 12px;
  left: 12px;
  border-right: none;
  border-bottom: none;
}
.tr {
  top: 12px;
  right: 12px;
  border-left: none;
  border-bottom: none;
}
.bl {
  bottom: 12px;
  left: 12px;
  border-right: none;
  border-top: none;
}
.br {
  bottom: 12px;
  right: 12px;
  border-left: none;
  border-top: none;
}

/* 头部样式 */
.modal-header {
  padding: 30px 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px dashed rgba(139, 90, 46, 0.2);
}

.seal-box {
  width: 52px;
  height: 52px;
  border: 2px solid var(--seal-red);
  padding: 2px;
  background: white;
  box-shadow: 2px 2px 0 var(--seal-red);
}

.seal-char {
  width: 100%;
  height: 100%;
  background: var(--seal-red);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: '楷体', KaiTi, serif;
  font-size: 30px;
  font-weight: bold;
}

.modal-title {
  font-family: '华文楷书', '楷体', serif;
  font-size: 24px;
  color: var(--ink-text);
  margin: 0;
}

.modal-subtitle {
  font-size: 12px;
  color: var(--soft-gold);
  margin: 4px 0 0 0;
  letter-spacing: 2px;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 20px;
  color: var(--soft-gold);
  cursor: pointer;
  transition: 0.3s;
}
.close-btn:hover {
  color: var(--seal-red);
  transform: rotate(90deg);
}

/* 内容区域 */
.modal-content {
  padding: 30px 40px;
  overflow-y: auto;
  flex: 1;
}

/* 模式选择 */
.mode-selection {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.mode-card {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(139, 90, 46, 0.1);
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: 0.4s;
}

.mode-card:hover {
  background: #fff;
  border-color: var(--seal-red);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(139, 90, 46, 0.1);
}

.mode-icon-ink {
  font-size: 30px;
  color: var(--seal-red);
  margin-bottom: 12px;
}
.mode-desc {
  font-size: 13px;
  color: var(--soft-gold);
  margin-bottom: 15px;
}

.zen-textarea {
  width: 90%;
  background: #fff9f0;
  border: 1px solid rgba(139, 90, 46, 0.15);
  padding: 12px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink-text);
  resize: none;
  outline: none;
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--soft-gold);
  margin-top: 5px;
}

.zen-action-btn {
  margin-top: 15px;
  background: var(--ink-text);
  color: #fff;
  border: none;
  padding: 10px 35px;
  border-radius: 40px;
  font-family: '楷体', serif;
  cursor: pointer;
  transition: 0.3s;
}

.zen-action-btn:hover {
  background: var(--seal-red);
  box-shadow: 0 5px 15px rgba(183, 28, 28, 0.3);
}

.divider-ink {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}
.divider-ink .line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--soft-gold), transparent);
}
.ink-text {
  font-size: 12px;
  color: var(--soft-gold);
  font-style: italic;
}

.status-badge {
  margin: 15px 0;
  font-size: 13px;
  color: var(--seal-red);
  font-style: italic;
}

/* 分析动画 */
.analyzing-section {
  text-align: center;
  padding: 40px 0;
}
.analyzing-icon-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 35px;
  color: var(--seal-red);
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border: 2px solid var(--seal-red);
  border-radius: 50%;
  animation: zen-pulse 1.8s infinite;
}

@keyframes zen-pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.analysis-steps {
  display: flex;
  justify-content: space-between;
  margin: 35px 0;
}
.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--soft-gold);
  opacity: 0.4;
  transition: 0.4s;
}
.step-item.active {
  opacity: 1;
  color: var(--seal-red);
  font-weight: bold;
}
.step-dot {
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
}

.progress-track {
  flex: 1;
  height: 5px;
  background: #eee5d8;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--seal-red);
  transition: width 0.3s;
}
.progress-percent {
  font-family: 'Georgia', serif;
  font-weight: bold;
  color: var(--seal-red);
  width: 45px;
  margin-left: 10px;
}

/* 结果列表 */
.result-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}
.result-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #fff;
  border: 1px solid rgba(139, 90, 46, 0.1);
  cursor: pointer;
  transition: 0.3s;
}
.result-item:hover {
  transform: translateX(8px);
  border-color: var(--seal-red);
}

.result-thumb {
  position: relative;
  width: 130px;
  height: 74px;
  flex-shrink: 0;
}
.result-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.match-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: var(--seal-red);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
}

.result-info {
  flex: 1;
}
.result-title {
  font-size: 15px;
  color: var(--ink-text);
  margin: 0 0 8px;
}
.result-meta {
  font-size: 11px;
  color: var(--soft-gold);
  display: flex;
  gap: 12px;
}

.score-track {
  height: 3px;
  background: #f0f0f0;
  margin-top: 8px;
  border-radius: 2px;
}
.score-fill {
  height: 100%;
  background: #2e7d32;
  border-radius: 2px;
}

.res-arrow {
  color: var(--soft-gold);
  margin-left: 10px;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}
.action-btn-outline {
  background: none;
  border: 1px solid var(--soft-gold);
  color: var(--soft-gold);
  padding: 8px 25px;
  cursor: pointer;
  font-family: '楷体', serif;
}
.action-btn-solid {
  background: var(--seal-red);
  color: #fff;
  border: none;
  padding: 8px 30px;
  cursor: pointer;
  font-family: '楷体', serif;
}

/* 滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--apricot-base);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--soft-gold);
  border-radius: 2px;
}

@media (max-width: 600px) {
  .modal-card {
    max-height: 95vh;
  }
  .result-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .result-thumb {
    width: 100%;
    height: 100px;
  }
}
</style>
