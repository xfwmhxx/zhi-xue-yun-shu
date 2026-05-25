<template>
  <BreadcrumbNav
    title="题目列表"
    :breadcrumb-items="[
      { name: from === 'bookshelf' ? '我的书架' : '经典书城', url: returnPath },
      { name: '书籍详情', url: `/Hina/BookIntroduce/${route.params.id}` },
      { name: '题目列表', url: '' },
    ]"
  ></BreadcrumbNav>
  <main class="problem-list-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> 正在开启尘封的卷目...
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button class="back-btn" @click="goBack">返回上级</button>
    </div>

    <!-- 数据渲染 -->
    <div v-else-if="chapterData" class="list-wrapper fade-in">
      <!-- 1. 顶部标题区域 -->
      <header class="list-header">
        <div class="header-left">
          <div class="chapter-info">
            <h1 class="title">《{{ chapterData.bookName }}》· 考点辑录</h1>
            <p class="subtitle">第{{ chapterData.chapterIdx }}卷 · {{ chapterData.chapterName }}</p>
          </div>
        </div>
        <div class="header-right">
          <div class="chapter-seal">正本精选</div>
        </div>
      </header>

      <!-- 2. 艺术分割线 (顶部) -->
      <div class="divider-section top-divider">
        <div class="divider-line"></div>
      </div>

      <!-- 3. 典籍概览 (3列大布局) -->
      <section class="chapter-overview-large">
        <div class="overview-item">
          <i class="fas fa-hourglass-half"></i>
          <div class="ov-text">
            <span class="ov-label">建议研读时长</span>
            <span class="ov-value">{{ chapterData.chapterSummary.suggestTime }}</span>
          </div>
        </div>
        <div class="overview-item">
          <i class="fas fa-layer-group"></i>
          <div class="ov-text">
            <span class="ov-label">难度权重</span>
            <span class="ov-value">{{ chapterData.chapterSummary.difficultyStar }}</span>
          </div>
        </div>
        <div class="overview-item">
          <i class="fas fa-key"></i>
          <div class="ov-text">
            <span class="ov-label">核心考点</span>
            <span class="ov-value">{{ chapterData.chapterSummary.keyPoints }} 处考详</span>
          </div>
        </div>
      </section>

      <!-- 4. 检索操作栏 -->
      <div class="operation-bar">
        <div class="list-count">
          本卷共辑录 <span>{{ chapterData.problems.length }}</span> 道研习题
        </div>
        <div class="search-container">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
              v-model="searchQuery"
              placeholder="输入关键字检索题目..."
              @keyup.enter="applyFilter"
            />
          </div>
          <button class="search-trigger-btn" @click="applyFilter">进行检索</button>
        </div>
      </div>

      <!-- 5. 题目列表主体 -->
      <div class="list-container">
        <div v-for="(prob, index) in displayedProblems" :key="prob.id" class="problem-card">
          <!-- 左侧索引 -->
          <div class="card-left">
            <div class="prob-index">{{ index + 1 < 10 ? '0' + (index + 1) : index + 1 }}</div>
          </div>

          <!-- 中间内容 -->
          <div class="card-body">
            <div class="prob-meta">
              <span class="meta-tag type">{{ prob.type }}</span>
              <!-- 题目难度星级展示 -->
              <div class="difficulty-stars">
                <span class="diff-text">{{ prob.difficultyText }}</span>
                <span class="stars">
                  <i
                    v-for="n in 5"
                    :key="n"
                    :class="[n <= (prob.rating || 0) ? 'fas fa-star' : 'far fa-star']"
                  ></i>
                </span>
              </div>
              <span class="meta-tag page">页码指引：P{{ prob.pageRef }}</span>
            </div>

            <h3 class="prob-stem">{{ prob.stem }}</h3>

            <div class="prob-tags">
              <span v-for="tag in prob.tags" :key="tag" class="tag-item"># {{ tag }}</span>
            </div>
          </div>

          <!-- 右侧分值与进入按钮 -->
          <div class="card-right">
            <div class="score-display">
              <span class="num">{{ prob.score }}</span>
              <span class="unit">分</span>
            </div>
            <button class="enter-btn" @click="goToDetail(prob.id)">
              开始研读 <i class="fas fa-angle-right"></i>
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="displayedProblems.length === 0" class="empty-view">
          <i class="fas fa-scroll"></i>
          <p>未检索到相关考题，请重新输入</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getChapterDetail } from '@/api/book'
import { getUserId } from '@/utils/storage'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

const route = useRoute()
const router = useRouter()

// 来源信息
const from = ref('bookhouse')
const returnPath = ref('/Foundations/BookHouse')

const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const chapterData = ref<any>(null)
const displayedProblems = ref<any[]>([])
const userId = ref<number | null>(null)

/**
 * 核心逻辑：从 public/ZYDJ/Problem/[id]/[chapters].json 读取数据
 */
const fetchChapterData = async () => {
  loading.value = true
  error.value = null

  const { id, chapterid } = route.params

  try {
    const uid = getUserId()
    if (uid) {
      userId.value = parseInt(uid)
    }

    // 调用后端接口获取章节详情（同时传书籍ID和章节ID）
    const res = await getChapterDetail(
      parseInt(id as string), // bookId
      chapterid as string, // chapterId
      userId.value || undefined,
    )

    if (res.code === 200) {
      const data = res.data

      chapterData.value = {
        bookName: data.chapter.book_name,
        chapterIdx: data.chapter.chapter_idx,
        chapterName: data.chapter.chapter_name,
        chapterId: data.chapter.id,
        chapterSummary: {
          suggestTime: data.chapter.suggest_time,
          difficultyStar: data.chapter.difficulty_star,
          keyPoints: data.chapter.key_points_count,
        },
        problems: data.problems.map((p: any) => ({
          id: p.id,
          type: p.type,
          stem: p.stem,
          difficultyText: p.difficulty_text,
          rating: p.rating,
          score: p.score,
          tags: p.tags || [],
          pageRef: p.page_ref,
          options: p.options,
          answer: p.answer,
          analysis: p.analysis,
          related_kp_ids: p.related_kp_ids,
        })),
      }

      displayedProblems.value = [...chapterData.value.problems]
    } else {
      throw new Error(res.message || '未找到卷目资源')
    }
  } catch (err: any) {
    console.error('加载失败:', err)
    error.value = err.message || '开启卷目失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

/**
 * 检索按钮逻辑
 */
const applyFilter = () => {
  if (!chapterData.value) return
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    displayedProblems.value = [...chapterData.value.problems]
    return
  }
  displayedProblems.value = chapterData.value.problems.filter(
    (p: any) =>
      p.stem.toLowerCase().includes(query) ||
      (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(query))),
  )
}

const goBack = () => router.back()

const goToDetail = (probId: number) => {
  router.push({
    path: `/Hina/BookProblemDetail/${route.params.id}/${route.params.chapterid}/${probId}`,
    state: {
      from: from.value, // 固定值
      returnPath: returnPath.value, // 固定值
    },
  })
}
onMounted(() => {
  // 从路由状态获取来源
  if (router.options.history.state) {
    from.value = (router.options.history.state.from as string) || 'bookhouse'
    returnPath.value =
      (router.options.history.state.returnPath as string) || '/Foundations/BookHouse'
  }

  console.log('来源:', from.value)
  console.log('返回路径:', returnPath.value)

  window.scrollTo(0, 0)
  fetchChapterData()
})
</script>

<style scoped>
.problem-list-page {
  min-height: 100vh;
  padding: 40px 0 100px;
  font-family: 'NO3', serif;
  color: #3e2723;
  position: relative;
  z-index: 1;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 150px 20px;
  font-size: 22px;
  color: #8b5e3c;
}

.error-state {
  color: #b71c1c;
}

.list-wrapper {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 40px;
}

/* 顶部标题区 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: none;
  border: 1px solid #8b5e3c;
  color: #8b5e3c;
  padding: 8px 18px;
  cursor: pointer;
  margin-bottom: 20px;
  font-family: 'NO3';
  transition: 0.3s;
}

.back-btn:hover {
  background: #8b5e3c;
  color: #fff;
}

.title {
  font-size: 46px;
  margin: 0;
  letter-spacing: 3px;
  color: #3e2723;
}

.subtitle {
  font-size: 30px;
  color: #8d6e63;
  margin-top: 10px;
}

.chapter-seal {
  width: 90px;
  height: 45px;
  border: 2px solid #b71c1c;
  color: #b71c1c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 2px;
  border-radius: 2px;
  transform: rotate(3deg);
}

/* 艺术分割线样式 */
.divider-section {
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
}

.top-divider {
  padding: 30px 0 50px 0;
}
.bottom-divider {
  padding: 80px 0 40px 0;
}

.divider-line {
  width: 90%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #8b4513 20%, #8b4513 80%, transparent 100%);
  position: relative;
}

.divider-line::before,
.divider-line::after {
  content: '❖';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #8b4513;
  font-size: 22px;
}

.divider-line::before {
  left: -30px;
}
.divider-line::after {
  right: -30px;
}

/* 3列概览卡片 */
.chapter-overview-large {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 60px;
}

.overview-item {
  background: rgba(253, 245, 230, 0.8);
  backdrop-filter: blur(10px);
  padding: 35px 30px;
  border: 1px solid rgba(139, 94, 60, 0.3);
  display: flex;
  align-items: center;
  gap: 25px;
  transition: 0.3s;
}

.overview-item:hover {
  transform: translateY(-5px);
  border-color: #8b5e3c;
}

.overview-item i {
  font-size: 40px;
  color: #b71c1c;
}

.ov-label {
  font-size: 20px;
  color: #8d6e63;
  margin-bottom: 8px;
}

.ov-value {
  font-size: 30px;
  font-weight: bold;
}

/* 检索栏 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.list-count {
  font-size: 24px;
  color: #5d4037;
}
.list-count span {
  color: #b71c1c;
  font-size: 40px;
  font-weight: bold;
}

.search-container {
  display: flex;
  gap: 15px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e0d8c3;
  padding: 0 20px;
  width: 350px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  padding: 14px 0;
  font-family: 'NO3';
  font-size: 16px;
}

.search-trigger-btn {
  background: #3e2723;
  color: #fff;
  border: none;
  padding: 0 30px;
  font-family: 'NO3';
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
}

.search-trigger-btn:hover {
  background: #b71c1c;
  transform: translateY(-2px);
}

/* 题目卡片 */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.problem-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  display: flex;
  transition: 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.problem-card:hover {
  transform: translateX(12px);
  border-color: #8b5e3c;
  box-shadow: -10px 10px 30px rgba(139, 94, 60, 0.1);
}

.card-left {
  width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fdfaf5;
  border-right: 1px solid #f0f0f0;
}

.prob-index {
  font-size: 26px;
  font-weight: bold;
  color: #d7ccc8;
}

.card-body {
  flex: 1;
  padding: 35px;
}

.prob-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.difficulty-stars {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 10px;
  border: 1px solid #e0d8c3;
  background: #fdfcf9;
}

.diff-text {
  font-size: 12px;
  color: #8b5e3c;
  font-weight: bold;
}

.stars {
  color: #fbc02d;
  font-size: 12px;
  letter-spacing: 1px;
}

.meta-tag {
  font-size: 12px;
  padding: 3px 12px;
}
.meta-tag.type {
  background: #3e2723;
  color: #fff;
}
.meta-tag.page {
  color: #8d6e63;
  font-style: italic;
}

.prob-stem {
  font-size: 22px;
  line-height: 1.7;
  margin: 0 0 25px 0;
  font-weight: 500;
}

.prob-tags {
  display: flex;
  gap: 15px;
}

.tag-item {
  font-size: 20px;
  color: #8b5e3c;
  background: #fdf5e6;
  padding: 4px 15px;
  border-radius: 20px;
}

.card-right {
  width: 200px;
  border-left: 1px solid #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 25px;
}

.score-display .num {
  font-size: 42px;
  font-weight: bold;
  color: #3e2723;
}
.score-display .unit {
  font-size: 16px;
  color: #8d6e63;
}

.enter-btn {
  background: #fff;
  border: 1px solid #3e2723;
  color: #3e2723;
  padding: 12px 25px;
  font-family: 'NO3';
  font-size: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.enter-btn:hover {
  background: #3e2723;
  color: #fff;
}

/* 底部竖排文本区 */
.foot-text-container {
  display: flex;
  justify-content: center;
  padding-bottom: 120px;
}

.foot-text {
  color: #8b4513;
  display: flex;
  justify-content: center;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.5em;
  line-height: 1.8em;
  font-family: 'No1', sans-serif;
  font-size: 26px;
}

.foot-text p {
  margin: 0;
  padding: 15px 0;
}

.empty-view {
  text-align: center;
  padding: 100px;
  color: #a1887f;
  font-size: 20px;
}

.fade-in {
  animation: fadeIn 0.8s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .chapter-overview-large {
    grid-template-columns: 1fr;
  }
  .problem-card {
    flex-direction: column;
  }
  .card-right {
    width: 100%;
    border-top: 1px solid #f5f5f5;
    padding: 25px;
    flex-direction: row;
  }
}
</style>
