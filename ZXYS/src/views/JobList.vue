<template>
  <main class="classic-main">
    <!-- 第一部分：意境开篇 -->
    <section class="hero-section" :class="{ 'hero-hidden': showDetail && isMobileView }">
      <h1 class="classic-title">杏林良才·职位中心</h1>
      <div class="subtitle-wrapper">
        <span class="line"></span>
        <p class="classic-subtitle">悬壶济世 · 虚位以待</p>
        <span class="line"></span>
      </div>
    </section>

    <!-- 第二部分：搜索组件 -->
    <JobSearch @search="handleSearch" />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-text">载入职位数据中...</div>
      <div class="loading-decoration"></div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p>数据加载失败：{{ error }}</p>
      <button @click="loadJobsData" class="retry-btn">重新加載</button>
    </div>

    <!-- 第三部分：核心内容区域 -->
    <div v-else class="main-content">
      <!-- 左侧：职位列表 -->
      <div class="job-list-section">
        <div class="section-header-zen">
          <div class="header-left">
            <span class="brush-icon"></span>
            <h2>职位列表</h2>
          </div>
          <p class="job-count">共计 {{ filteredJobs.length }} 席</p>
        </div>

        <div class="job-list-container-zen">
          <div class="job-list">
            <div
              v-for="job in filteredJobs"
              :key="job.id"
              class="job-item-zen"
              :class="{ selected: selectedJobId === job.id }"
              @click="selectJob(job.id)"
            >
              <div class="job-item-inner">
                <div class="job-title-row">
                  <h3 class="job-title">{{ job.title }}</h3>
                  <span class="job-type-stamp">{{ job.type }}</span>
                </div>
                <div class="job-description">
                  <p class="description-text">{{ getShortDescription(job.description) }}</p>
                </div>
                <div class="job-tags-zen">
                  <span v-for="tag in job.tags" :key="tag" class="tag-zen">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="filteredJobs.length === 0" class="no-results-zen">
            <p>为找到相关职位</p>
            <button class="reset-search-zen" @click="resetSearch">重置篩選</button>
          </div>
        </div>
      </div>

      <!-- 右侧：职位详情 -->
      <div class="job-detail-sticky-wrapper" v-if="!isMobileView">
        <div class="job-detail-section-zen" v-if="selectedJob">
          <div class="detail-header-zen">
            <h2 class="detail-title-zen">{{ selectedJob.title }}</h2>
            <div class="decoration-line"></div>
          </div>

          <div class="detail-scroll-area">
            <div class="detail-content-zen">
              <div class="classic-section">
                <h3 class="classic-section-title">职位描述</h3>
                <p class="classic-text-content">{{ selectedJob.description }}</p>
              </div>

              <div class="classic-section">
                <h3 class="classic-section-title">任职要求</h3>
                <ul class="classic-list">
                  <li v-for="(req, index) in selectedJob.requirements" :key="index">{{ req }}</li>
                </ul>
              </div>

              <div class="classic-section">
                <h3 class="classic-section-title">核心能力</h3>
                <div class="core-skills-zen">
                  <span v-for="skill in selectedJob.coreSkills" :key="skill" class="skill-tag-zen">
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-actions-zen">
            <button class="zen-action-btn" @click="startMockInterview">开始模拟面试</button>
          </div>
        </div>

        <!-- 未选择时的占位图 -->
        <div class="job-detail-placeholder-zen" v-else>
          <div class="placeholder-inner">
            <div class="placeholder-icon-zen">📜</div>
            <h3>請選擇職位以閱覽詳情</h3>
            <p>博极医源 · 精勤不倦</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端全屏详情 -->
    <div class="mobile-detail-view-zen" v-if="showDetail && selectedJob && isMobileView">
      <div class="mobile-nav-zen">
        <button class="back-btn-zen" @click="showDetail = false">← 返回列表</button>
        <span class="nav-title-zen">{{ selectedJob.title }}</span>
      </div>
      <div class="mobile-content-zen">
        <div class="classic-section">
          <h3 class="classic-section-title">職位描述</h3>
          <p class="classic-text-content">{{ selectedJob.description }}</p>
        </div>
        <div class="classic-section">
          <h3 class="classic-section-title">任職要求</h3>
          <ul class="classic-list">
            <li v-for="(req, index) in selectedJob.requirements" :key="index">{{ req }}</li>
          </ul>
        </div>
        <div class="detail-actions-zen">
          <button class="zen-action-btn" @click="startMockInterview">開始模擬面試</button>
        </div>
      </div>
    </div>
    <!-- 生成面试进度弹窗 (杏林主题) -->
    <Teleport to="body">
      <Transition name="zen-fade">
        <div v-if="showGenModal" class="xinglin-gen-overlay">
          <div class="xinglin-gen-card">
            <!-- 装饰边角 -->
            <div class="corner-deco tl"></div>
            <div class="corner-deco br"></div>

            <div class="gen-content">
              <div class="gen-seal-icon">面</div>
              <h3 class="gen-title">正在編撰面試題目...</h3>
              <p class="gen-job-name">當前職位：{{ selectedJob?.title }}</p>

              <div class="gen-progress-area">
                <div class="gen-progress-track">
                  <div class="gen-progress-fill" :style="{ width: genProgress + '%' }"></div>
                </div>
                <div class="gen-progress-val">{{ genProgress }}%</div>
              </div>

              <p class="gen-hint">AI 正在根據職位要求與您的履历，為您量身定制專業考場...</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
  <PageTransition
    v-if="showTransition2"
    mode="enter"
    :show-text="true"
    @animation-end="onLeaveAnimationEnd"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import JobSearch from '@/views/JobList/JobSearch.vue'
import { message } from '@/components/Notification'
import { useRouter } from 'vue-router'
// 添加导入
import { generateInterviewQuestions } from '@/api/interview'
import { getUserId } from '@/utils/storage'

// 引入过渡页面组件
import PageTransition from '@/components/PageTransition.vue'
// 初始化离开的过渡动画的状态，默认不启动
const showTransition2 = ref(false)
const router = useRouter()

// 数据定义
const searchTerm = ref('')
const showDetail = ref(false)
const selectedJobId = ref(null)
const isMobileView = ref(false)
const jobs = ref([])
const loading = ref(true)
const error = ref(null)

// 面试部分弹窗相关
const showGenModal = ref(false)
const genProgress = ref(0)
// 加载JSON数据
const loadJobsData = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await fetch('/Jobs/data.json')

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    jobs.value = Array.isArray(data) ? data : data.jobs || []

    if (jobs.value.length > 0) {
      selectedJobId.value = jobs.value[0].id
    }
  } catch (err) {
    console.error('加载职位数据出错:', err)
    message.error('错误', {
      note: '加载职位数据出错',
      duration: 2000,
    })
    error.value = err.message
    jobs.value = getFallbackData()
    if (jobs.value.length > 0) {
      selectedJobId.value = jobs.value[0].id
    }
  } finally {
    loading.value = false
  }
}

// 备用数据
const getFallbackData = () => [
  {
    id: 1,
    title: '中医主治医师',
    type: '全职',
    tags: ['中医诊疗', '辨证论治', '针灸', '方剂学'],
    description: '负责中医门诊诊疗工作，运用中医理论进行辨证论治，为患者提供个性化的中医治疗方案。',
    requirements: ['中医学本科及以上学历', '持有中医执业医师资格证书', '3年以上中医临床工作经验'],
    coreSkills: ['中医辨证', '针灸技术', '方剂应用'],
  },
  {
    id: 2,
    title: '针灸医师',
    type: '全职',
    tags: ['针灸治疗', '艾灸疗法', '经络学说'],
    description: '负责针灸科日常诊疗工作，运用针灸技术治疗各种疾病。',
    requirements: ['针灸推拿专业大专及以上学历', '持有针灸医师资格证书'],
    coreSkills: ['穴位定位', '针刺手法', '电针操作'],
  },
]

// 计算属性
const filteredJobs = computed(() => {
  if (!searchTerm.value.trim()) return jobs.value
  const term = searchTerm.value.toLowerCase().trim()
  return jobs.value.filter(
    (job) =>
      job.title.toLowerCase().includes(term) ||
      job.tags?.some((tag) => tag.toLowerCase().includes(term)),
  )
})

const selectedJob = computed(() => {
  return jobs.value.find((job) => job.id === selectedJobId.value)
})

// 方法
const handleSearch = (term) => {
  searchTerm.value = term
  if (filteredJobs.value.length > 0) {
    selectedJobId.value = filteredJobs.value[0].id
  }
}

const selectJob = (jobId) => {
  selectedJobId.value = jobId
  if (isMobileView.value) showDetail.value = true
}

// 锁定背景滚动的方法
const toggleScrollLock = (lock) => {
  document.body.style.overflow = lock ? 'hidden' : ''
}

const startMockInterview = async () => {
  if (!selectedJob.value) return

  // 获取用户ID
  const userIdStr = getUserId()
  if (!userIdStr) {
    message.error('身份错误', { note: '请先登录', duration: 2000 })
    return
  }

  // 开启弹窗，重置进度
  showGenModal.value = true
  genProgress.value = 0
  toggleScrollLock(true)

  // 进度条跑到90%（等待后端响应）
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
    const result = await generateInterviewQuestions(parseInt(userIdStr), selectedJob.value.title)

    if (result.code === 200) {
      // 进度条跑满到100%
      genProgress.value = 100

      setTimeout(() => {
        message.success('生成完毕', { note: '即将跳转到面试...', duration: 2000 })
        showGenModal.value = false
        toggleScrollLock(false)
        // 跳转到面试页面
        showTransition2.value = true
      }, 500)
    } else {
      throw new Error(result.data.message || '生成失败')
    }
  } catch (error) {
    console.error('生成面试题失败:', error)
    console.log(error.response.data)
    clearInterval(timer)
    showGenModal.value = false
    toggleScrollLock(false)
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

const resetSearch = () => {
  searchTerm.value = ''
}

const getShortDescription = (description) => {
  if (!description) return ''
  return description.length > 45 ? description.substring(0, 45) + '...' : description
}

const checkMobileView = () => {
  isMobileView.value = window.innerWidth <= 768
}

const onLeaveAnimationEnd = () => {
  router.push('/Hina/MockInterview')
  // 重置过渡状态
  setTimeout(() => {
    showTransition2.value = false
  }, 100)
}

// 生命周期
onMounted(() => {
  checkMobileView()
  window.addEventListener('resize', checkMobileView)
  loadJobsData()
  toggleScrollLock(false)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileView)
})

watch(searchTerm, (newValue) => {
  if (!newValue.trim() && jobs.value.length > 0 && !selectedJobId.value) {
    selectedJobId.value = jobs.value[0].id
  }
})
</script>

<style scoped>
.classic-main {
  width: 100%;
  min-height: 100vh;
  padding-top: 5vh;
  padding-bottom: 50px;
  font-family: 'NO3', serif;
  color: #4a342e;
}

/* 标题区 */
.hero-section {
  text-align: center;
  /* margin-bottom: 40px; */
  transition: all 0.5s ease;
}

.hero-hidden {
  opacity: 0;
  transform: translateY(-20px);
  margin-bottom: 0;
  height: 0;
  overflow: hidden;
}

.classic-title {
  font-size: 70px;
  letter-spacing: 8px;
  margin: 10px 0;
  font-weight: 550;
  color: #2c1e1a;
}

.subtitle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.subtitle-wrapper .line {
  width: 30px;
  height: 1px;
  background-color: #a67c52;
}

.classic-subtitle {
  font-size: 24px;
  color: #8d6e63;
  letter-spacing: 3px;
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 100px 20px;
  color: #8d6e63;
}

.loading-text {
  font-size: 18px;
  margin-bottom: 15px;
}

.loading-decoration {
  width: 40px;
  height: 2px;
  background: #a67c52;
  margin: 0 auto;
  animation: expandWidth 1.5s ease-in-out infinite;
}

@keyframes expandWidth {
  0%,
  100% {
    width: 40px;
    opacity: 0.3;
  }
  50% {
    width: 80px;
    opacity: 1;
  }
}

.error-container {
  text-align: center;
  padding: 100px 20px;
  color: #b71c1c;
}

.retry-btn {
  margin-top: 20px;
  padding: 8px 24px;
  background: #5d4037;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'NO3', serif;
}

.retry-btn:hover {
  background: #b71c1c;
}

/* 主内容区 */
.main-content {
  display: flex;
  max-width: 1300px;
  margin: 0 auto;
  gap: 30px;
  padding: 0 40px;
  align-items: flex-start;
}

.job-list-section {
  flex: 4;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 10px;
  border: 1px solid rgba(166, 124, 82, 0.15);
  padding: 20px;
}

.section-header-zen {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px dashed rgba(166, 124, 82, 0.3);
}

.brush-icon {
  width: 4px;
  height: 24px;
  background: #5d4037;
  margin-right: 10px;
  display: inline-block;
  vertical-align: middle;
}

.section-header-zen h2 {
  font-size: 30px;
  font-weight: 400;
  color: #5d4037;
  display: inline-block;
}

.job-count {
  font-size: 20px;
  color: #8d6e63;
}

.job-item-zen {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.job-item-zen:hover {
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.95);
  border-color: #a67c52;
}

.job-item-zen.selected {
  background: rgba(255, 255, 255, 1);
  border-color: #b71c1c;
  box-shadow: -5px 0 0 #b71c1c;
}

.job-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.job-title {
  font-size: 30px;
  font-weight: 600;
  color: #2c1e1a;
}

.job-type-stamp {
  font-size: 12px;
  color: #b71c1c;
  border: 1px solid #b71c1c;
  padding: 1px 6px;
  border-radius: 3px;
}

.description-text {
  font-size: 20px;
  color: #6d4c41;
  line-height: 1.6;
  margin-bottom: 12px;
}

.tag-zen {
  display: inline-block;
  background: rgba(166, 124, 82, 0.1);
  color: #8d6e63;
  padding: 3px 10px;
  font-size: 20px;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 5px;
}

/* 详情区域 */
.job-detail-sticky-wrapper {
  flex: 6;
  position: sticky;
  top: 100px;
  height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
}

.job-detail-section-zen,
.job-detail-placeholder-zen {
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(166, 124, 82, 0.15);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px 0 40px;
}

.detail-header-zen {
  padding: 30px 40px 10px;
  text-align: center;
}

.detail-title-zen {
  font-size: 40px;
  letter-spacing: 2px;
}

.decoration-line {
  height: 1px;
  background: linear-gradient(to right, transparent, #a67c52, transparent);
  margin: 15px auto;
  width: 80%;
}

.classic-section-title {
  font-size: 24px;
  color: #b71c1c;
  margin-bottom: 12px;
  border-left: 3px solid #b71c1c;
  padding-left: 10px;
}

.classic-text-content {
  line-height: 1.8;
  color: #4e342e;
  font-size: 20px;
}

.classic-list {
  padding-left: 20px;
  color: #4e342e;
}

.classic-list li {
  margin-bottom: 8px;
  line-height: 1.6;
  font-size: 20px;
}

.core-skills-zen {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag-zen {
  background: rgba(166, 124, 82, 0.15);
  color: #5d4037;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 16px;
}

.detail-actions-zen {
  padding: 20px 40px 30px;
  background: rgba(255, 248, 240, 0.9);
  border-top: 1px solid rgba(166, 124, 82, 0.2);
  display: flex;
  justify-content: center;
}

.zen-action-btn {
  background: #5d4037;
  color: #fff;
  border: none;
  padding: 12px 40px;
  font-size: 24px;
  font-family: 'NO3', serif;
  cursor: pointer;
  border-radius: 40px;
  transition: all 0.3s ease;
}

.zen-action-btn:hover {
  background: #b71c1c;
  transform: translateY(-2px);
}

.job-detail-placeholder-zen {
  justify-content: center;
  align-items: center;
  border: 1px dashed rgba(166, 124, 82, 0.4);
}

.placeholder-inner {
  text-align: center;
  opacity: 0.5;
}

.placeholder-icon-zen {
  font-size: 50px;
  margin-bottom: 15px;
}

/* 滚动条 */
.detail-scroll-area::-webkit-scrollbar {
  width: 5px;
}
.detail-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(166, 124, 82, 0.3);
  border-radius: 10px;
}

/* 移动端 */
.mobile-detail-view-zen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fdfaf5;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.mobile-nav-zen {
  padding: 15px;
  background: #5d4037;
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn-zen {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.mobile-content-zen {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.mobile-content-zen .detail-actions-zen {
  padding: 20px 0;
  background: transparent;
}

.no-results-zen {
  text-align: center;
  padding: 60px 20px;
  color: #8d6e63;
}

.reset-search-zen {
  margin-top: 15px;
  padding: 6px 20px;
  background: transparent;
  border: 1px solid #a67c52;
  color: #a67c52;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'NO3', serif;
}

.reset-search-zen:hover {
  background: #a67c52;
  color: white;
}

/* 响应式 */
@media (max-width: 1024px) {
  .classic-title {
    font-size: 48px;
  }
  .main-content {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .classic-title {
    font-size: 32px;
  }
  .main-content {
    flex-direction: column;
  }
  .job-list-section {
    width: 100%;
    flex: none;
  }
  .job-detail-sticky-wrapper {
    display: none;
  }
}

/* --- 杏林生成弹窗样式 --- */
.xinglin-gen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(44, 30, 26, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.xinglin-gen-card {
  background: #fdfaf5 url('https://www.transparenttextures.com/patterns/paper.png');
  width: 450px;
  padding: 40px;
  border: 1.5px solid #8b5a2e;
  position: relative;
  text-align: center;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
}

.corner-deco {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #b45f2b;
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

.gen-seal-icon {
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
  background: rgba(183, 28, 28, 0.05);
}

.gen-title {
  font-family: '华文楷书', '楷体', serif;
  font-size: 24px;
  color: #3e2723;
  margin-bottom: 10px;
}

.gen-job-name {
  color: #8b5a2e;
  font-size: 16px;
  margin-bottom: 30px;
  font-weight: bold;
}

.gen-progress-area {
  margin-bottom: 25px;
}

.gen-progress-track {
  width: 100%;
  height: 10px;
  background: #e8e0d0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}

.gen-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d32f2f, #b71c1c);
  transition: width 0.2s ease;
}

.gen-progress-val {
  font-weight: bold;
  color: #b71c1c;
  font-size: 18px;
}

.gen-hint {
  font-size: 13px;
  color: #a67c52;
  font-style: italic;
  font-family: '楷体';
}

/* 弹窗过渡动画 */
.zen-fade-enter-active {
  animation: zen-zoom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.zen-fade-leave-active {
  animation: zen-zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse;
}

@keyframes zen-zoom {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
