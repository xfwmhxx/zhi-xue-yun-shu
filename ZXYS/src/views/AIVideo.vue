<template>
  <div class="video-index-page">
    <!-- 顶部标题区：强化中医AI教学主题 -->
    <section class="hero-section">
      <h1 class="classic-title">智影慧教 · 象数合一</h1>
      <div class="subtitle-wrapper">
        <span class="line"></span>
        <p class="classic-subtitle">以 AI 算法为墨 · 绘就中医辨证之真境</p>
        <span class="line"></span>
      </div>
    </section>

    <!-- 搜索与操作区：完全对齐书城样式 -->
    <section class="search-area">
      <div class="search-wrapper-with-ai">
        <!-- 左侧AI推荐按钮（对齐原样式） -->
        <div class="ai-side-btn" @click="handleAiRecommend">
          <div class="seal-stamp">
            <span class="seal-text">智</span>
          </div>
          <div class="btn-text-wrapper">
            <span class="btn-title">AI推薦</span>
            <span class="btn-subtitle">慧眼識才</span>
          </div>
        </div>

        <!-- 宣纸搜索引导区域 -->
        <div class="ink-search-container">
          <!-- 装饰性元素：模拟毛笔笔触 -->
          <div class="brush-stroke"></div>

          <div class="search-input-box">
            <input
              type="text"
              v-model="searchTerm"
              class="zen-input"
              placeholder="搜索医案复盘、针灸演示、本草数字化教学..."
              @keyup.enter="handleSearch"
            />
            <button class="zen-search-btn" @click="handleSearch">
              <i class="fas fa-search"></i>
              <span>探尋</span>
            </button>
          </div>

          <!-- 极简标签区 -->
          <div class="quick-tags">
            <span class="tag-label">热门课题：</span>
            <span v-for="tag in hotTags" :key="tag" class="tag-item" @click="selectTag(tag)">
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- 右侧：AI 生成按钮（启笔成影）对齐右侧样式 -->
        <div class="ai-side-btn" @click="handleAiGenerate">
          <div class="scroll-decoration">
            <span class="scroll-text">影</span>
          </div>
          <div class="btn-text-wrapper">
            <span class="btn-title">啟筆成影</span>
            <span class="btn-subtitle">AI 智能生成</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-text">載入視頻數據中...</div>
      <div class="loading-decoration"></div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p>數據加載失敗：{{ error }}</p>
      <button @click="loadVideoData" class="retry-btn">重新加載</button>
    </div>

    <!-- 主体：宣纸磨砂大罩子 -->
    <main v-else class="classic-main-overlay">
      <!-- 视频网格：B站式排版，纯净无UP主 -->
      <section class="video-grid">
        <div
          v-for="video in filteredVideoList"
          :key="video.id"
          class="trad-video-card"
          @click="goToVideoDetail(video.id)"
        >
          <div class="thumb-wrap">
            <img :src="video.pic" :alt="video.title" />
            <div class="duration-tag">{{ video.duration }}</div>
            <!-- 悬停数据统计 -->
            <div class="hover-stats">
              <span><i class="fas fa-play"></i> {{ video.views }}</span>
              <span><i class="fas fa-comment-dots"></i> {{ video.danmaku }}</span>
            </div>
          </div>
          <div class="info-wrap">
            <h3 class="video-title">{{ video.title }}</h3>
            <div class="date-meta">
              <i class="far fa-calendar-alt"></i> 编撰于：{{ video.date }}
            </div>
          </div>
        </div>
      </section>

      <!-- 无搜索结果提示 -->
      <div v-if="filteredVideoList.length === 0" class="no-results-zen">
        <p>未覓得相關視頻</p>
        <button class="reset-search-zen" @click="resetSearch">重置篩選</button>
      </div>

      <!-- 分页操作 -->
      <div class="pagination-area" v-if="filteredVideoList.length > 0">
        <button class="btn-more" @click="loadMoreVideos">
          更新一批案卷 <i class="fas fa-sync"></i>
        </button>
      </div>
    </main>
  </div>
  <!-- AI 推荐弹窗 -->
  <AIRecommendModal
    v-model:visible="showRecommendModal"
    :videoList="videoList"
    @close="showRecommendModal = false"
  />

  <!-- AI 生成弹窗 -->
  <AIGenerateModal
    v-model:visible="showGenerateModal"
    :videoList="videoList"
    @close="showGenerateModal = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from '@/components/Notification'
import { useRouter } from 'vue-router'

import AIRecommendModal from './AIVideo/AIRecommendModal.vue'
import AIGenerateModal from './AIVideo/AIGenerateModal.vue'

// 弹窗控制
const showRecommendModal = ref(false)
const showGenerateModal = ref(false)

// 数据定义
const searchTerm = ref('')
const hotTags = ['望诊模拟', '舌象辨认', '伤寒论复盘', '针灸实操']
const loading = ref(true)
const error = ref(null)
const videoList = ref<Video[]>([])
const currentPage = ref(1)
const pageSize = ref(8)
// 添加路由实例
const router = useRouter()

// 视频数据类型定义
interface Video {
  id: number
  title: string
  views: string
  danmaku: string
  duration: string
  date: string
  pic: string
  tags?: string[]
  description?: string
}

// 加载视频数据
const loadVideoData = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await fetch('/AiVideo/video.json')

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    videoList.value = Array.isArray(data) ? data : data.videos || []

    if (videoList.value.length === 0) {
      // 如果JSON为空，报错
      message.error('错误', {
        note: '数据读取失败!',
        duration: 3000,
      })
    }
  } catch (err: any) {
    console.error('加载视频数据出错:', err)
    message.error('錯誤', {
      note: '加載視頻數據出錯',
      duration: 2000,
    })
    error.value = err.message
    message.error('错误', {
      note: String(error.value),
      duration: 3000,
    })
  } finally {
    loading.value = false
  }
}

// 计算属性：过滤后的视频列表
const filteredVideoList = computed(() => {
  if (!searchTerm.value.trim()) {
    // 分页显示
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return videoList.value.slice(start, end)
  }

  const term = searchTerm.value.toLowerCase().trim()
  const filtered = videoList.value.filter((video: Video) => {
    return (
      video.title.toLowerCase().includes(term) ||
      video.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
      video.description?.toLowerCase().includes(term)
    )
  })

  // 搜索结果不分页，直接显示所有匹配结果
  return filtered
})

// 方法
const handleSearch = () => {
  if (searchTerm.value.trim()) {
    const resultCount = filteredVideoList.value.length
    message.info('搜索完成', {
      note: `找到 ${resultCount} 個相關視頻`,
      duration: 2000,
    })

    if (resultCount === 0) {
      message.warning('無結果', {
        note: '未找到相關視頻，請嘗試其他關鍵詞',
        duration: 3000,
      })
    }
  } else {
    message.info('提示', {
      note: '請輸入搜索關鍵詞',
      duration: 2000,
    })
  }
}

const selectTag = (tag: string) => {
  searchTerm.value = tag
  handleSearch()
}

const resetSearch = () => {
  searchTerm.value = ''
  currentPage.value = 1
  message.info('重置成功', {
    note: '已清空搜索條件',
    duration: 1500,
  })
}

const loadMoreVideos = () => {
  currentPage.value++
  message.success('加載完成', {
    note: '已加載更多視頻內容',
    duration: 1500,
  })
}

const handleAiRecommend = () => {
  showRecommendModal.value = true
}
const handleAiGenerate = () => {
  showGenerateModal.value = true
}

// 添加跳转方法
const goToVideoDetail = (id: number) => {
  router.push(`/Hina/AIVideoIntroduce/${id}`)
}

onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  loadVideoData()
})
</script>

<style scoped>
/* 全局变量 */
:root {
  --trad-gold: #a67c52;
  --cinnabar-red: #b71c1c;
  --ink-black: #3e2723;
  --text-sepia: #4a342e;
}

.video-index-page {
  width: 100%;
  min-height: 100vh;
  padding-top: 5vh;
  font-family: 'NO3', serif;
}

/* 1. 意境标题区 */
.hero-section {
  text-align: center;
  margin-bottom: 40px;
  transition: all 0.5s ease;
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

/* 2. 搜索区域：完全对齐书城样式 */
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

/* 左右两侧按钮统一样式 */
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

/* 左侧印章样式 */
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

.seal-text {
  font-size: 32px;
  font-family: '华文楷书', '楷体', 'KaiTi', serif;
  font-weight: bold;
  color: #b45f2b;
}

/* 右侧卷轴装饰样式 */
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
  font-size: 32px;
  font-family: '华文楷书', '楷体', 'KaiTi', serif;
  font-weight: bold;
  color: #8b5a2e;
  background: rgba(139, 90, 43, 0.1);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

/* 按钮文字包装 */
.btn-text-wrapper {
  text-align: center;
}

.btn-title {
  display: block;
  font-size: 20px;
  font-weight: 600;
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

/* 中间搜索容器 */
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

/* 错误状态 */
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

/* 无搜索结果 */
.no-results-zen {
  text-align: center;
  padding: 80px 20px;
  color: #8d6e63;
}

.reset-search-zen {
  margin-top: 15px;
  padding: 8px 24px;
  background: transparent;
  border: 1px solid #a67c52;
  color: #a67c52;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'NO3', serif;
  transition: all 0.3s;
}

.reset-search-zen:hover {
  background: #a67c52;
  color: white;
}

/* 3. 核心内容罩子 */
.classic-main-overlay {
  max-width: 1400px;
  margin: 0 auto 80px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 4px;
  padding: 60px 40px;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
}

/* 4. 视频网格 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 50px 30px;
}

.trad-video-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.trad-video-card:hover {
  transform: translateY(-5px);
}

.thumb-wrap {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.thumb-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.trad-video-card:hover .thumb-wrap img {
  transform: scale(1.08);
}

.hover-stats {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  align-items: flex-end;
  gap: 15px;
  padding: 15px;
  color: #fff;
  opacity: 0;
  transition: 0.3s;
}

.trad-video-card:hover .hover-stats {
  opacity: 1;
}

.duration-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
}

.info-wrap {
  margin-top: 18px;
}

.video-title {
  font-size: 16px;
  line-height: 1.6;
  color: #18191c;
  height: 3.2em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 12px;
  font-weight: 500;
}

.date-meta {
  font-size: 12px;
  color: #9499a0;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 5. 分页操作 */
.pagination-area {
  text-align: center;
  margin-top: 60px;
}

.btn-more {
  background: transparent;
  border: 1.5px solid var(--trad-gold);
  color: var(--trad-gold);
  padding: 12px 60px;
  border-radius: 30px;
  font-family: 'NO3';
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-more:hover {
  background: var(--trad-gold);
  color: #a67c52;
  border-color: var(--trad-gold);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(166, 124, 82, 0.3);
}

/* 6. 杏林弹窗样式（对齐原组件） */
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

/* 响应式 */
@media (max-width: 1024px) {
  .classic-title {
    font-size: 48px;
  }

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
  .classic-title {
    font-size: 32px;
    letter-spacing: 4px;
  }

  .classic-subtitle {
    font-size: 14px;
  }

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

  .quick-tags {
    gap: 12px;
  }

  .tag-label,
  .tag-item {
    font-size: 12px;
  }

  .classic-main-overlay {
    padding: 30px 20px;
  }

  .video-grid {
    gap: 30px 20px;
  }

  .xinglin-gen-card {
    width: 90%;
    padding: 30px;
  }

  .btn-more {
    padding: 10px 40px;
    font-size: 16px;
  }
}
</style>
