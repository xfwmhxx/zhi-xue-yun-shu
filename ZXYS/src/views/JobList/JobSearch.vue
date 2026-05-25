<template>
  <section class="search-area">
    <div class="search-wrapper-with-ai">
      <!-- 左侧AI推荐按钮 -->
      <div class="ai-side-btn" @click="handleAiRecommendClick">
        <div class="seal-stamp">
          <span class="seal-text">智</span>
        </div>
        <div class="btn-text-wrapper">
          <span class="btn-title">AI推荐</span>
          <span class="btn-subtitle">慧眼识才</span>
        </div>
      </div>

      <!-- 搜索引导区域 -->
      <div class="ink-search-container">
        <!-- 装饰性元素：模拟毛笔笔触 -->
        <div class="brush-stroke"></div>

        <div class="search-input-box">
          <input
            type="text"
            v-model="localSearchTerm"
            class="zen-input"
            placeholder="搜索你想要的职位..."
            @keyup.enter="handleSearch"
          />
          <button class="zen-search-btn" @click="handleSearch">
            <i class="fas fa-search"></i>
            <span>探尋</span>
          </button>
        </div>

        <!-- 极简标签区 -->
        <div class="quick-tags">
          <span class="tag-label">热门岗位：</span>
          <span v-for="tag in hotTags" :key="tag" class="tag-item" @click="selectTag(tag)">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 右侧自定义面试按钮 -->
      <div class="ai-side-btn" @click="handleCustomInterviewClick">
        <div class="scroll-decoration">
          <span class="scroll-text">面</span>
        </div>
        <div class="btn-text-wrapper">
          <span class="btn-title">自定义面试</span>
          <span class="btn-subtitle">因材施教</span>
        </div>
      </div>
    </div>

    <!-- 弹窗系统 -->
    <Teleport to="body">
      <!-- 1. AI智能推荐弹窗 -->
      <Transition name="zen-modal">
        <div v-if="showAiModal" class="xinglin-overlay">
          <div class="xinglin-card">
            <!-- 装饰纹样 -->
            <div class="zen-corner tl"></div>
            <div class="zen-corner br"></div>

            <!-- 步骤 0: 初始确认 -->
            <div v-if="aiStep === 0" class="zen-content">
              <div class="zen-icon-seal">智</div>
              <h3 class="zen-title">AI 智能分析</h3>
              <p class="zen-desc">
                系统将根据您在系统中存储的简历进行深度分析，为您匹配最合适的职位。
              </p>
              <div class="zen-btn-group">
                <button class="zen-btn btn-cancel" @click="closeModals">取消</button>
                <button class="zen-btn btn-confirm" @click="runAiAnalysis">确定分析</button>
              </div>
            </div>

            <!-- 步骤 1: 分析进度条 -->
            <div v-if="aiStep === 1" class="zen-content">
              <h3 class="zen-title">正在通过 AI 慧眼分析...</h3>
              <div class="zen-progress-wrap">
                <div class="zen-progress-track">
                  <div class="zen-progress-bar" :style="{ width: progress + '%' }"></div>
                </div>
                <div class="zen-progress-text">{{ progress }}%</div>
              </div>
              <p class="zen-hint">正在研读您的简历经络...</p>
            </div>

            <!-- 步骤 2: 结果展示 -->
            <div v-if="aiStep === 2" class="zen-content">
              <h3 class="zen-title">为您甄选的推荐职位</h3>
              <div class="zen-job-list">
                <div
                  v-for="job in recommendedJobs"
                  :key="job.id"
                  class="zen-job-item"
                  :class="{ active: selectedJob?.id === job.id }"
                  @click="selectedJob = job"
                >
                  <div class="job-meta">
                    <span class="job-name">{{ job.title }}</span>
                    <span class="job-type">{{ job.type }}</span>
                  </div>
                  <div class="job-tags-mini">
                    <span v-for="tag in job.tags.slice(0, 3)" :key="tag">#{{ tag }}</span>
                  </div>
                </div>
              </div>
              <div class="zen-btn-group" style="margin-top: 25px">
                <button class="zen-btn btn-cancel" @click="aiStep = 0">返回</button>
                <button
                  class="zen-btn btn-generate"
                  :disabled="!selectedJob"
                  @click="runGeneration('ai')"
                >
                  生成面试
                </button>
              </div>
            </div>

            <!-- 步骤 3: 生成面试进度条 -->
            <div v-if="aiStep === 3" class="zen-content">
              <h3 class="zen-title">正在编撰面试题目...</h3>
              <div class="zen-progress-wrap">
                <div class="zen-progress-track">
                  <div class="zen-progress-bar accent" :style="{ width: genProgress + '%' }"></div>
                </div>
                <div class="zen-progress-text accent">{{ genProgress }}%</div>
              </div>
              <p class="zen-hint">AI 正在根据您的履历生成个性化面试环节...</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 2. 自定义面试弹窗 -->
      <Transition name="zen-modal">
        <div v-if="showCustomModal" class="xinglin-overlay">
          <div class="xinglin-card">
            <div class="zen-corner tl"></div>
            <div class="zen-corner br"></div>

            <!-- 步骤 0: 输入描述 -->
            <div v-if="customStep === 0" class="zen-content">
              <div class="zen-icon-seal red">面</div>
              <h3 class="zen-title">自定义面试描述</h3>
              <p class="zen-desc">请输入您期望面试的职位名称、所属科室或特定的临床场景要求：</p>
              <textarea
                v-model="customInput"
                class="zen-textarea"
                placeholder="例如：中医骨伤科主治医师，重点考查正骨手法与术后康复思路..."
              ></textarea>
              <div class="zen-btn-group">
                <button class="zen-btn btn-cancel" @click="closeModals">取消</button>
                <button
                  class="zen-btn btn-generate"
                  :disabled="!customInput.trim()"
                  @click="runGeneration('custom')"
                >
                  生成面试
                </button>
              </div>
            </div>

            <!-- 步骤 1: 生成进度条 -->
            <div v-if="customStep === 1" class="zen-content">
              <h3 class="zen-title">正在为您构建专属考场...</h3>
              <div class="zen-progress-wrap">
                <div class="zen-progress-track">
                  <div class="zen-progress-bar accent" :style="{ width: genProgress + '%' }"></div>
                </div>
                <div class="zen-progress-text accent">{{ genProgress }}%</div>
              </div>
              <p class="zen-hint">AI 正在处理您的自定义场景需求...</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { message } from '@/components/Notification'
import { generateInterviewQuestions } from '@/api/interview'
import { getUserId } from '@/utils/storage'

// 定义事件
const emit = defineEmits(['search', 'aiRecommend', 'customInterview', 'startInterview'])

// 热门岗位标签
const hotTags = ref(['针灸医师', '中药师', '中医骨伤科医生', '中医康复医师'])

// 本地搜索词
const localSearchTerm = ref('')

// --- 弹窗逻辑状态 ---
const showAiModal = ref(false)
const showCustomModal = ref(false)
const aiStep = ref(0)
const customStep = ref(0)
const progress = ref(0)
const genProgress = ref(0)
const recommendedJobs = ref([])
const selectedJob = ref(null)
const customInput = ref('')

// 锁定页面滚动
const toggleScrollLock = (lock) => {
  document.body.style.overflow = lock ? 'hidden' : ''
}

// 监听弹窗状态
watch([showAiModal, showCustomModal], ([ai, custom]) => {
  toggleScrollLock(ai || custom)
})

// 方法
const handleSearch = () => {
  emit('search', localSearchTerm.value)
}

// 点击 AI 推荐
const handleAiRecommendClick = () => {
  showAiModal.value = true
  aiStep.value = 0
  progress.value = 0
  selectedJob.value = null
}

// 执行 AI 分析
const runAiAnalysis = () => {
  aiStep.value = 1
  let p = 0
  const timer = setInterval(() => {
    p += Math.floor(Math.random() * 15) + 5
    if (p >= 100) {
      progress.value = 100
      clearInterval(timer)
      fetchJobsAndShow()
    } else {
      progress.value = p
    }
  }, 200)
}

// 获取职位数据并随机选3个
const fetchJobsAndShow = async () => {
  try {
    const res = await fetch('/Jobs/data.json')
    const data = await res.json()
    // 随机打乱并取前3个
    recommendedJobs.value = [...data.jobs].sort(() => 0.5 - Math.random()).slice(0, 3)
    aiStep.value = 2
  } catch (err) {
    console.error('职位数据加载失败！', err)
    message.error('加载失败', {
      note: '职位数据加载错误',
      duration: 3000,
    })
    closeModals()
  }
}

// 点击 自定义面试
const handleCustomInterviewClick = () => {
  showCustomModal.value = true
  customStep.value = 0
  customInput.value = ''
}

// 执行生成面试进度
const runGeneration = async (type) => {
  // 获取用户ID
  const userIdStr = getUserId()
  if (!userIdStr) {
    message.error('身份错误', { note: '请先登录', duration: 2000 })
    closeModals()
    return
  }

  // 确定职位名称
  let jobTitle = ''
  if (type === 'ai') {
    if (!selectedJob.value) return
    jobTitle = selectedJob.value.title
  } else {
    if (!customInput.value.trim()) return
    jobTitle = customInput.value.trim()
  }

  // 切换到进度条步骤
  if (type === 'ai') aiStep.value = 3
  else customStep.value = 1

  genProgress.value = 0

  // 进度条跑到90%
  let p = 0
  const timer = setInterval(() => {
    p += Math.floor(Math.random() * 8) + 3
    if (p >= 90) {
      p = 90
      clearInterval(timer)
    }
    genProgress.value = p
  }, 150)

  try {
    // 调用后端生成面试题
    const result = await generateInterviewQuestions(parseInt(userIdStr), jobTitle)

    if (result.code === 200) {
      // 进度条跑满
      genProgress.value = 100

      setTimeout(() => {
        message.success('生成完毕', { note: '即将跳转到面试...', duration: 2000 })
        closeModals()
        // 触发父组件跳转，传递面试题数据
        emit('startInterview', {
          title: jobTitle,
          questions: result.data.data.questions,
          isCustom: type === 'custom',
        })
      }, 500)
    } else {
      throw new Error(result.data.message || '生成失败')
    }
  } catch (error) {
    console.error('生成面试题失败:', error)
    clearInterval(timer)
    closeModals()
    if (error.response.status === 400) {
      message.error('数据缺失', {
        note: error.response.data.message || '面试题生成失败，请重试',
        duration: 3000,
      })
    } else {
      message.error('未知错误', {
        note: error.response.data.message || '面试题生成失败，请重试',
        duration: 3000,
      })
    }
  }
}

const closeModals = () => {
  showAiModal.value = false
  showCustomModal.value = false
  toggleScrollLock(false)
}

const selectTag = (tag) => {
  localSearchTerm.value = tag
  emit('search', tag)
}

watch(localSearchTerm, (newValue) => {
  if (newValue === '') {
    emit('search', '')
  }
})

onUnmounted(() => {
  toggleScrollLock(false)
})
</script>

<style scoped>
/* --- 原始样式保持开始 --- */
.search-area {
  max-width: 1300px;
  margin: 0 auto 50px;
  padding: 0 20px;
}

.search-wrapper-with-ai {
  display: flex;
  align-items: stretch;
  gap: 20px;
  flex-wrap: wrap;
}

.ai-side-btn {
  flex: 0 0 140px;
  background: rgba(245, 240, 230, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.4s ease;
  border: 1px solid rgba(139, 90, 43, 0.3);
  padding: 20px 12px;
}

.ai-side-btn:hover {
  transform: translateY(-3px);
  background: rgba(235, 220, 200, 0.95);
  border-color: #b87c4f;
}

.seal-stamp {
  width: 60px;
  height: 60px;
  border: 2px solid #b45f2b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.seal-stamp::before {
  content: '';
  position: absolute;
  width: 70px;
  height: 70px;
  border: 1px solid #c97e4a;
  border-radius: 50%;
  opacity: 0.6;
}

.seal-text,
.scroll-text {
  font-size: 32px;
  font-family: '华文楷书', '楷体', 'KaiTi', serif;
  font-weight: bold;
}

.seal-text {
  color: #b45f2b;
}
.scroll-text {
  color: #8b5a2e;
}

.scroll-decoration {
  width: 60px;
  height: 60px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-decoration::before,
.scroll-decoration::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 50px;
  background: linear-gradient(180deg, #b87c4f 0%, #8b5a2e 100%);
  border-radius: 4px;
}

.scroll-decoration::before {
  left: 0;
  top: 5px;
}
.scroll-decoration::after {
  right: 0;
  top: 5px;
}

.scroll-text {
  background: rgba(139, 90, 43, 0.1);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-text-wrapper {
  text-align: center;
}

.btn-title {
  display: block;
  font-size: 20px;
  /* font-weight: 600; */
  color: #5d3a28;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.btn-subtitle {
  display: block;
  font-size: 16px;
  color: #9b6a48;
  letter-spacing: 1px;
}

.ink-search-container {
  flex: 1;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  padding: 35px;
  border-radius: 2px;
  box-shadow: 0 10px 30px rgba(74, 52, 46, 0.05);
  border: 1px solid rgba(166, 124, 82, 0.2);
}

.search-input-box {
  display: flex;
  border-bottom: 2px solid #5d4037;
  padding-bottom: 5px;
}

.zen-input {
  flex: 1;
  background: transparent;
  border: none;
  font-family: 'NO3', serif;
  font-size: 22px;
  padding: 10px;
  color: #4a342e;
  outline: none;
}

.zen-input:focus {
  outline: none;
}

.zen-search-btn {
  background: transparent;
  border: none;
  color: #5d4037;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'NO3', serif;
  font-size: 18px;
  transition: color 0.3s;
}

.zen-search-btn:hover {
  color: #b71c1c;
}

.quick-tags {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.tag-label {
  font-size: 20px;
  color: #8d6e63;
}

.tag-item {
  font-size: 20px;
  cursor: pointer;
  color: #a67c52;
  transition: all 0.3s;
  border-bottom: 1px solid transparent;
}

.tag-item:hover {
  color: #b71c1c;
  border-bottom-color: #b71c1c;
}

/* 响应式 */
@media (max-width: 1024px) {
  .ai-side-btn {
    flex: 0 0 120px;
    padding: 15px 8px;
  }
  .seal-stamp,
  .scroll-decoration {
    width: 50px;
    height: 50px;
  }
  .seal-text,
  .scroll-text {
    font-size: 26px;
  }
  .btn-title {
    font-size: 14px;
  }
  .btn-subtitle {
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .ink-search-container {
    padding: 20px;
  }
  .zen-input {
    font-size: 16px;
  }
  .search-wrapper-with-ai {
    flex-direction: row;
    gap: 12px;
  }
  .ai-side-btn {
    flex: 1;
    flex-direction: row;
    padding: 12px;
    gap: 12px;
    align-items: center;
    justify-content: flex-start;
  }
  .seal-stamp,
  .scroll-decoration {
    width: 40px;
    height: 40px;
  }
  .seal-text,
  .scroll-text {
    font-size: 22px;
  }
  .btn-text-wrapper {
    text-align: left;
  }
  .btn-title {
    font-size: 13px;
  }
  .btn-subtitle {
    font-size: 9px;
  }
}
/* --- 原始样式保持结束 --- */

/* --- 新增：杏林主题弹窗样式 --- */
.xinglin-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(36, 26, 22, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.xinglin-card {
  background: #fdfaf5 url('https://www.transparenttextures.com/patterns/paper-fibers.png');
  width: 500px;
  max-width: 90%;
  padding: 40px;
  border-radius: 4px;
  border: 1.5px solid #8b5a2e;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.3),
    inset 0 0 40px rgba(139, 90, 43, 0.05);
  position: relative;
}

/* 装饰边角 */
.zen-corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid #b45f2b;
}
.tl {
  top: 15px;
  left: 15px;
  border-right: none;
  border-bottom: none;
}
.br {
  bottom: 15px;
  right: 15px;
  border-left: none;
  border-top: none;
}

.zen-content {
  text-align: center;
}

.zen-icon-seal {
  width: 60px;
  height: 60px;
  border: 2px solid #b71c1c;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: '楷体';
  font-size: 32px;
  color: #b71c1c;
  font-weight: bold;
  border-radius: 4px;
  background: rgba(183, 28, 28, 0.05);
}
.zen-icon-seal.red {
  color: #b71c1c;
  border-color: #b71c1c;
}

.zen-title {
  font-family: '华文楷书', '楷体', serif;
  font-size: 26px;
  color: #3e2723;
  margin-bottom: 15px;
}

.zen-desc {
  color: #8b5a2e;
  line-height: 1.6;
  margin-bottom: 30px;
}

.zen-textarea {
  width: 100%;
  height: 120px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid #d4c4a8;
  padding: 15px;
  font-family: '楷体';
  font-size: 16px;
  color: #5d3a28;
  outline: none;
  resize: none;
  margin-bottom: 25px;
  box-sizing: border-box;
}
.zen-textarea:focus {
  border-color: #b45f2b;
  background: #fff;
}

/* 进度条样式 */
.zen-progress-wrap {
  margin: 30px 0;
}
.zen-progress-track {
  width: 100%;
  height: 10px;
  background: #e8e0d0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}
.zen-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #b87c4f, #8b5a2e);
  transition: width 0.3s ease;
}
.zen-progress-bar.accent {
  background: linear-gradient(90deg, #d32f2f, #b71c1c);
}
.zen-progress-text {
  font-weight: bold;
  color: #8b5a2e;
}
.zen-progress-text.accent {
  color: #b71c1c;
}
.zen-hint {
  font-size: 14px;
  color: #a67c52;
  font-style: italic;
}

/* 职位列表 - 自然撑开 */
.zen-job-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: left;
}
.zen-job-item {
  padding: 18px;
  background: #fff;
  border: 1px solid #d4c4a8;
  cursor: pointer;
  transition: all 0.2s;
}
.zen-job-item:hover {
  border-color: #b87c4f;
  background: #fdfaf5;
}
.zen-job-item.active {
  border: 2px solid #b71c1c;
  background: rgba(183, 28, 28, 0.02);
}
.job-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.job-name {
  font-weight: bold;
  color: #4a342e;
  font-size: 18px;
}
.job-type {
  font-size: 12px;
  color: #a67c52;
  background: #f0ece4;
  padding: 2px 6px;
}
.job-tags-mini {
  color: #b87c4f;
  font-size: 12px;
}
.job-tags-mini span {
  margin-right: 10px;
}

/* 按钮组 */
.zen-btn-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.zen-btn {
  padding: 10px 30px;
  font-family: '楷体';
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.3s;
}
.btn-cancel {
  background: transparent;
  color: #8b5a2e;
  border: 1px solid #8b5a2e;
}
.btn-confirm {
  background: #8b5a2e;
  color: #fff;
  border: 1px solid #8b5a2e;
}
.btn-generate {
  background: #b71c1c;
  color: #fff;
  border: 1px solid #b71c1c;
}
.btn-generate:disabled {
  background: #e0d0c5;
  border-color: #d0c0b5;
  cursor: not-allowed;
}
.zen-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* 弹窗动画 */
.zen-modal-enter-active {
  animation: zen-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.zen-modal-leave-active {
  animation: zen-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse;
}

@keyframes zen-in {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
