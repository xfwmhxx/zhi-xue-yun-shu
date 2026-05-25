<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Video {
  id: number
  title: string
  views: string
  danmaku?: string
  duration: string
  date: string
  pic: string
  description?: string
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

// 热门课题（简体）
const hotTopics = ['望诊模拟', '舌象辨认', '伤寒论复盘', '针灸实操', '脉诊入门', '本草数字化']

// 状态控制
const isGenerating = ref(false)
const generationProgress = ref(0)
const generateDescription = ref('')
const selectedTopic = ref('')
const generationResult = ref(false)
const generatedVideo = ref<Video | null>(null)
const generatedVideoUrl = ref('')
const generationHint = ref('')
const videoPlayerRef = ref<HTMLVideoElement | null>(null)

// 生成提示语（简体）
const genHints = [
  '正在解析教学语义...',
  '正在构建教学脚本...',
  '正在生成视觉元素...',
  '正在合成音视频流...',
  '正在进行质量校验...',
  '即将完成生成...',
]

// 开始生成
const startGeneration = (mode: 'text' | 'topic') => {
  if (mode === 'text' && !generateDescription.value.trim()) {
    generateDescription.value = '中医望诊基础教学'
  }
  if (mode === 'topic' && !selectedTopic.value) return

  isGenerating.value = true
  generationProgress.value = 0
  generationResult.value = false

  let progress = 0
  let hintIndex = 0

  const timer = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 3
    if (progress >= 100) {
      progress = 100
      generationProgress.value = 100
      generationHint.value = '影像绘就完成！'
      clearInterval(timer)

      setTimeout(() => {
        generateVideo()
        isGenerating.value = false
        generationResult.value = true
      }, 400)
    } else {
      generationProgress.value = progress
      if (progress > (hintIndex + 1) * 16 && hintIndex < genHints.length - 1) {
        hintIndex++
        generationHint.value = genHints[hintIndex] as string
      } else if (!generationHint.value) {
        generationHint.value = genHints[0] as string
      }
    }
  }, 120)
}

// 视频生成逻辑
const generateVideo = () => {
  if (props.videoList.length === 0) return
  const randomIndex = Math.floor(Math.random() * props.videoList.length)
  const selectedVideo = { ...props.videoList[randomIndex] }

  const topic = selectedTopic.value || generateDescription.value.slice(0, 20)
  selectedVideo.title = `【AI生成】${topic} · 智能教学视频`
  selectedVideo.description = `本视频由 AI 智能生成系统根据“${topic}”课题自动编撰。内容涵盖相关知识点讲解、实操演示及案例分析，旨在为学习者提供高效、精准的教学内容。`
  selectedVideo.date = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')

  generatedVideo.value = selectedVideo as Video
  generatedVideoUrl.value = `/AiVideo/data/${selectedVideo.id}/${selectedVideo.id}.mp4`
}

// 重置弹窗
const resetModal = () => {
  isGenerating.value = false
  generationProgress.value = 0
  generateDescription.value = ''
  selectedTopic.value = ''
  generationResult.value = false
  generatedVideo.value = null
  generatedVideoUrl.value = ''
  generationHint.value = ''
  if (videoPlayerRef.value) {
    videoPlayerRef.value.pause()
    videoPlayerRef.value.currentTime = 0
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
  // 延迟重置，确保退出动画顺滑
  setTimeout(resetModal, 400)
}

// 背景锁定
watch(
  () => props.visible,
  (val) => {
    if (val) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
  },
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="zen-fade">
      <!-- 遮罩层：柔和淡入 -->
      <div v-if="visible" class="modal-overlay" @click.self="handleClose">
        <!-- 弹窗卡片：弹性缩放入场 -->
        <div class="modal-card">
          <!-- 杏林装饰：古铜护角 -->
          <div class="corner-deco tl"></div>
          <div class="corner-deco tr"></div>
          <div class="corner-deco bl"></div>
          <div class="corner-deco br"></div>

          <!-- 头部：卷轴封泥风格 -->
          <div class="modal-header">
            <div class="scroll-seal">
              <span class="scroll-text">影</span>
            </div>
            <div class="header-info">
              <h2 class="modal-title">启笔成影</h2>
              <p class="modal-subtitle">AI 智能生成 · 绘就中医真境</p>
            </div>
            <button class="close-btn" @click="handleClose">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- 内容区域 -->
          <div class="modal-body custom-scrollbar">
            <!-- 阶段 1：模式选择 -->
            <div v-if="!isGenerating && !generationResult" class="mode-select-view">
              <div class="glass-card mode-item" @click="startGeneration('text')">
                <div class="mode-icon-box">
                  <i class="fas fa-feather-pointed"></i>
                </div>
                <h3>文本生成视频</h3>
                <p>输入教学描述，AI 将自动编排脚本并生成完整教学影像。</p>

                <div class="input-container" @click.stop>
                  <textarea
                    v-model="generateDescription"
                    class="ink-textarea"
                    placeholder="例如：生成一个关于“脉诊入门”的基础教学视频..."
                    maxlength="300"
                  ></textarea>
                  <div class="char-count">{{ generateDescription.length }}/300</div>
                </div>

                <button class="action-btn-solid" @click.stop="startGeneration('text')">
                  <i class="fas fa-wand-magic-sparkles"></i> 开始生成
                </button>
              </div>

              <div class="zen-divider">
                <span class="line"></span>
                <span class="text">或</span>
                <span class="line"></span>
              </div>

              <div class="glass-card mode-item" @click="startGeneration('topic')">
                <div class="mode-icon-box">
                  <i class="fas fa-scroll"></i>
                </div>
                <h3>基于课题生成</h3>
                <p>选择经典课题，由 AI 快速渲染专业的教学演示影像。</p>

                <div class="topic-grid" @click.stop>
                  <div
                    v-for="topic in hotTopics"
                    :key="topic"
                    class="topic-chip"
                    :class="{ active: selectedTopic === topic }"
                    @click="selectedTopic = topic"
                  >
                    <i class="fas fa-tag"></i> {{ topic }}
                  </div>
                </div>

                <button
                  class="action-btn-solid"
                  :disabled="!selectedTopic"
                  @click.stop="startGeneration('topic')"
                >
                  <i class="fas fa-wand-magic-sparkles"></i>
                  {{ selectedTopic ? '开始生成' : '请选择课题' }}
                </button>
              </div>
            </div>

            <!-- 阶段 2：生成进度 -->
            <div v-if="isGenerating" class="generating-view">
              <div class="ink-animation-container">
                <div class="brush-icon">
                  <i class="fas fa-paint-brush"></i>
                  <div class="ink-splash"></div>
                </div>
              </div>
              <h3 class="generating-title">{{ generationHint }}</h3>

              <div class="step-nodes">
                <div
                  v-for="(step, i) in ['解析', '脚本', '渲染', '后期']"
                  :key="i"
                  class="step-node"
                  :class="{ active: generationProgress >= (i + 1) * 25 }"
                >
                  <div class="dot-wrap">
                    <i v-if="generationProgress >= (i + 1) * 25" class="fas fa-check-circle"></i>
                    <i v-else class="far fa-circle"></i>
                  </div>
                  <span>{{ step }}</span>
                </div>
              </div>

              <div class="progress-bar-container">
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: generationProgress + '%' }"></div>
                </div>
                <div class="bar-value">{{ generationProgress }}%</div>
              </div>
            </div>

            <!-- 阶段 3：结果呈现 -->
            <div v-if="generationResult && !isGenerating" class="result-view">
              <div class="result-head">
                <i class="fas fa-circle-check"></i>
                <h3>视频制作完成</h3>
                <span class="ai-tag"><i class="fas fa-robot"></i> AI 合成</span>
              </div>

              <div class="video-player-frame">
                <video
                  ref="videoPlayerRef"
                  :src="generatedVideoUrl"
                  controls
                  class="main-video"
                  :poster="generatedVideo?.pic"
                ></video>
                <div class="duration-badge">
                  <i class="fas fa-clock"></i> {{ generatedVideo?.duration }}
                </div>
              </div>

              <div class="video-detail-card">
                <h4 class="v-title">{{ generatedVideo?.title }}</h4>
                <p class="v-desc">{{ generatedVideo?.description }}</p>
                <div class="v-meta">
                  <span
                    ><i class="fas fa-calendar-day"></i> 生成日期：{{ generatedVideo?.date }}</span
                  >
                </div>
              </div>

              <div class="notice-box">
                <i class="fas fa-circle-info"></i>
                <p>生成的视频已自动加入学修档案，可供所有学员共同探究。</p>
              </div>

              <div class="action-footer">
                <button class="btn-outline" @click="resetModal">
                  <i class="fas fa-rotate-right"></i> 继续生成
                </button>
                <button class="btn-solid" @click="handleClose">
                  <i class="fas fa-check"></i> 完成
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 杏林视觉变量 */
.modal-overlay {
  --apricot-bg: #fdfaf5;
  --ink-brown: #3e2723;
  --bronze: #8b5a2e;
  --seal-red: #b71c1c;
  --soft-gold: #a67c52;
  --glass-white: rgba(255, 255, 255, 0.75);

  position: fixed;
  inset: 0;
  background: rgba(30, 20, 15, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
  opacity: 1;
}

/* 动画系统 */
.zen-fade-enter-active,
.zen-fade-leave-active {
  transition: opacity 0.4s ease;
}
.zen-fade-enter-from,
.zen-fade-leave-to {
  opacity: 0;
}

/* 卡片弹性缩放 */
.zen-fade-enter-active .modal-card {
  animation: xinglin-zoom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.zen-fade-leave-active .modal-card {
  animation: xinglin-zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse forwards;
}

@keyframes xinglin-zoom {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 宣纸质感卡片 */
.modal-card {
  background: var(--apricot-bg) url('https://www.transparenttextures.com/patterns/paper.png');
  width: 100%;
  max-width: 750px;
  max-height: 85vh;
  border: 1px solid var(--bronze);
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 35px 80px rgba(0, 0, 0, 0.45);
}

/* 古铜色护角装饰 */
.corner-deco {
  position: absolute;
  width: 26px;
  height: 26px;
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

/* 头部设计 */
.modal-header {
  padding: 30px 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px dashed rgba(139, 90, 46, 0.25);
}

.scroll-seal {
  width: 54px;
  height: 54px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scroll-seal::before,
.scroll-seal::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 44px;
  background: linear-gradient(180deg, var(--soft-gold), var(--bronze));
  border-radius: 3px;
}
.scroll-seal::before {
  left: 0;
}
.scroll-seal::after {
  right: 0;
}

.scroll-text {
  width: 42px;
  height: 42px;
  background: rgba(139, 90, 43, 0.1);
  color: var(--bronze);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: '楷体', serif;
  font-size: 28px;
  font-weight: bold;
  border-radius: 4px;
}

.modal-title {
  font-family: '华文楷书', '楷体', serif;
  font-size: 25px;
  color: var(--ink-brown);
  margin: 0;
}
.modal-subtitle {
  font-size: 13px;
  color: var(--soft-gold);
  margin: 5px 0 0 0;
  letter-spacing: 2px;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 22px;
  color: var(--soft-gold);
  cursor: pointer;
  transition: 0.3s;
}
.close-btn:hover {
  color: var(--seal-red);
  transform: rotate(90deg);
}

/* 滚动主体 */
.modal-body {
  padding: 30px 40px;
  overflow-y: auto;
  flex: 1;
}

/* 模式选择 */
.mode-select-view {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.mode-item {
  background: var(--glass-white);
  border: 1px solid rgba(139, 90, 46, 0.12);
  padding: 28px;
  text-align: center;
  cursor: pointer;
  transition: 0.4s;
}
.mode-item:hover {
  background: #fff;
  border-color: var(--seal-red);
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(139, 90, 46, 0.12);
}

.mode-icon-box {
  font-size: 34px;
  color: var(--seal-red);
  margin-bottom: 12px;
}
.mode-item h3 {
  font-family: '楷体', serif;
  font-size: 20px;
  color: var(--ink-brown);
  margin: 0 0 8px;
}
.mode-item p {
  font-size: 14px;
  color: var(--soft-gold);
  margin-bottom: 20px;
  line-height: 1.5;
}

.ink-textarea {
  width: 90%;
  height: 90px;
  background: #fffbf5;
  border: 1px solid rgba(139, 90, 46, 0.2);
  padding: 14px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink-brown);
  resize: none;
  outline: none;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--soft-gold);
  margin-top: 6px;
}

.topic-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 25px;
}
.topic-chip {
  padding: 7px 18px;
  background: rgba(139, 90, 46, 0.05);
  border: 1px solid rgba(139, 90, 46, 0.18);
  border-radius: 30px;
  font-size: 13px;
  color: var(--ink-brown);
  transition: 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.topic-chip i {
  font-size: 11px;
  opacity: 0.7;
}
.topic-chip:hover {
  border-color: var(--soft-gold);
  background: rgba(139, 90, 46, 0.1);
}
.topic-chip.active {
  background: var(--seal-red);
  border-color: var(--seal-red);
  color: #fff;
}

.action-btn-solid {
  background: var(--ink-brown);
  color: #fff;
  border: none;
  padding: 12px 45px;
  border-radius: 45px;
  font-family: '楷体', serif;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.action-btn-solid:hover:not(:disabled) {
  background: var(--seal-red);
  box-shadow: 0 8px 20px rgba(183, 28, 28, 0.35);
}
.action-btn-solid:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.zen-divider {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 10px 0;
}
.zen-divider .line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--soft-gold), transparent);
}
.zen-divider .text {
  font-size: 13px;
  color: var(--soft-gold);
  font-style: italic;
}

/* 生成动画 */
.generating-view {
  text-align: center;
  padding: 50px 0;
}
.brush-icon {
  position: relative;
  font-size: 52px;
  color: var(--seal-red);
  animation: brushMove 1.6s infinite ease-in-out;
}
@keyframes brushMove {
  0%,
  100% {
    transform: rotate(-12deg) translateY(0);
  }
  50% {
    transform: rotate(12deg) translateY(-12px);
  }
}

.ink-splash {
  position: absolute;
  bottom: -12px;
  right: 0;
  width: 14px;
  height: 14px;
  background: var(--bronze);
  border-radius: 50%;
  animation: inkDrop 1.6s infinite;
}
@keyframes inkDrop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(22px) scale(1.3);
    opacity: 0;
  }
}

.generating-title {
  font-family: '楷体', serif;
  font-size: 22px;
  color: var(--ink-brown);
  margin: 30px 0 40px;
}

.step-nodes {
  display: flex;
  justify-content: space-around;
  margin-bottom: 45px;
}
.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  opacity: 0.3;
  transition: 0.5s;
  color: var(--soft-gold);
}
.step-node.active {
  opacity: 1;
  color: var(--seal-red);
  font-weight: bold;
}
.step-node .dot-wrap {
  font-size: 18px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 15px;
}
.bar-track {
  flex: 1;
  height: 6px;
  background: #eee5d8;
  border-radius: 4px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: var(--seal-red);
  transition: width 0.3s;
}
.bar-value {
  width: 50px;
  font-weight: bold;
  color: var(--seal-red);
  font-family: 'Georgia', serif;
  font-size: 17px;
}

/* 结果展现 */
.result-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 25px;
}
.result-head i {
  color: #2e7d32;
  font-size: 28px;
}
.result-head h3 {
  font-size: 20px;
  color: var(--ink-brown);
  flex: 1;
  margin: 0;
}
.ai-tag {
  background: var(--seal-red);
  color: #fff;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.video-player-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border: 1px solid var(--bronze);
  border-radius: 4px;
  overflow: hidden;
}
.main-video {
  width: 100%;
  height: 100%;
  display: block;
}
.duration-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 3px 10px;
  font-size: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.video-detail-card {
  margin: 20px 0;
  padding: 22px;
  background: #fff;
  border-left: 5px solid var(--seal-red);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
}
.v-title {
  font-size: 18px;
  color: var(--ink-brown);
  margin: 0 0 10px;
  font-weight: bold;
}
.v-desc {
  font-size: 15px;
  color: var(--soft-gold);
  line-height: 1.7;
  margin: 0 0 14px;
}
.v-meta {
  font-size: 13px;
  color: var(--soft-gold);
  display: flex;
  align-items: center;
  gap: 6px;
}

.notice-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(33, 150, 243, 0.06);
  border: 1px solid rgba(33, 150, 243, 0.15);
  margin-bottom: 35px;
  border-radius: 4px;
}
.notice-box i {
  color: #2196f3;
  font-size: 16px;
  margin-top: 2px;
}
.notice-box p {
  font-size: 13px;
  color: var(--ink-brown);
  margin: 0;
  line-height: 1.5;
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}
.btn-outline {
  background: none;
  border: 1px solid var(--bronze);
  color: var(--bronze);
  padding: 10px 32px;
  font-family: '楷体', serif;
  cursor: pointer;
  transition: 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}
.btn-outline:hover {
  background: rgba(139, 90, 46, 0.05);
  color: var(--seal-red);
  border-color: var(--seal-red);
}
.btn-solid {
  background: var(--seal-red);
  color: #fff;
  border: none;
  padding: 10px 45px;
  font-family: '楷体', serif;
  cursor: pointer;
  transition: 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}
.btn-solid:hover {
  background: var(--ink-brown);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 滚动条美化 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--apricot-bg);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--soft-gold);
  border-radius: 6px;
}

@media (max-width: 600px) {
  .modal-card {
    max-height: 95vh;
  }
  .modal-header,
  .modal-body {
    padding: 20px;
  }
  .result-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .action-footer {
    flex-direction: column;
  }
  .action-footer button {
    width: 100%;
    justify-content: center;
  }
}
</style>
