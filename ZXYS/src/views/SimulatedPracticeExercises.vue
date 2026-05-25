<template>
  <div class="exam-page-container">
    <!-- 1. 顶部状态栏 -->
    <header class="exam-header">
      <div class="header-left">
        <span class="exam-tag">模拟实战</span>
        <h1 class="exam-main-title">{{ examData?.examTitle || '载入中...' }}</h1>
      </div>
      <div class="header-right">
        <div class="timer-box">
          <i class="fas fa-clock"></i>
          <span class="timer-text">{{ formatTime(secondsElapsed) }}</span>
        </div>
        <button class="submit-btn" @click="confirmSubmit" v-if="!isSubmitted">
          <i class="fas fa-paper-plane"></i> 结束交卷
        </button>
        <button class="exit-btn" @click="handleExit"><i class="fas fa-door-open"></i> 退出</button>
      </div>
    </header>

    <!-- 2. 主体内容布局：严格左右结构 -->
    <main class="exam-main-layout">
      <!-- 左侧：题目显示区 -->
      <section class="question-column" v-if="currentQuestion">
        <!-- 题型指示栏 -->
        <div class="section-indicator">
          <span class="q-index">第 {{ currentQuestionIndex + 1 }} 题</span>
          <span class="section-name">【{{ currentQuestion.sectionName }}】</span>
          <span class="total-hint">全卷共 {{ flattenedQuestions.length }} 题</span>
        </div>

        <!-- 题目滚动容器 -->
        <div class="question-scroll-wrapper">
          <!-- A3/A4型题 病例描述 -->
          <div v-if="currentQuestion.parentStem" class="case-description-box">
            <div class="case-label"><i class="fas fa-file-medical"></i> 病例案例：</div>
            <p class="artistic-text">{{ currentQuestion.parentStem }}</p>
          </div>

          <!-- B型题 共用备选项 -->
          <div v-if="currentQuestion.stemGroup" class="b-type-options-box">
            <div class="case-label"><i class="fas fa-layer-group"></i> 共用备选项：</div>
            <pre class="artistic-text">{{ currentQuestion.stemGroup }}</pre>
          </div>

          <!-- 题干 -->
          <div class="question-stem-row">
            <span class="q-type-badge">{{ currentQuestion.type }}</span>
            <p class="artistic-text stem-content">{{ currentQuestion.stem }}</p>
          </div>

          <!-- 选项列表 -->
          <div class="options-container">
            <div
              v-for="(text, key) in currentQuestion.options"
              :key="key"
              class="option-card"
              :class="{
                'active-selected': userAnswers[currentQuestion.uniqueId] === key,
                'is-correct': isSubmitted && currentQuestion.answer === key,
                'is-wrong':
                  isSubmitted &&
                  userAnswers[currentQuestion.uniqueId] === key &&
                  userAnswers[currentQuestion.uniqueId] !== currentQuestion.answer,
                readonly: isSubmitted,
              }"
              @click="selectOption(key)"
            >
              <span class="opt-key">{{ key }}</span>
              <span class="opt-text artistic-text">{{ text }}</span>
              <!-- 状态图标 -->
              <i
                v-if="isSubmitted && currentQuestion.answer === key"
                class="fas fa-check-circle result-icon success"
              ></i>
              <i
                v-if="
                  isSubmitted &&
                  userAnswers[currentQuestion.uniqueId] === key &&
                  userAnswers[currentQuestion.uniqueId] !== currentQuestion.answer
                "
                class="fas fa-times-circle result-icon error"
              ></i>
            </div>
          </div>

          <!-- 答案解析 (仅交卷后显示) -->
          <div v-if="isSubmitted" class="analysis-card">
            <div class="analysis-top">
              <span class="ans-correct">正确答案：{{ currentQuestion.answer }}</span>
              <span
                class="ans-mine"
                :class="
                  userAnswers[currentQuestion.uniqueId] === currentQuestion.answer
                    ? 'text-success'
                    : 'text-error'
                "
              >
                你的回答：{{ userAnswers[currentQuestion.uniqueId] || '未答' }}
              </span>
            </div>
            <div class="analysis-content artistic-text">
              <strong>【解析】：</strong>{{ currentQuestion.analysis }}
            </div>
          </div>
        </div>

        <!-- 底部切题导航 -->
        <footer class="nav-footer">
          <button
            class="nav-action-btn"
            :disabled="currentQuestionIndex === 0"
            @click="prevQuestion"
          >
            <i class="fas fa-chevron-left"></i> 上一题
          </button>
          <div class="progress-info">
            已答：{{ Object.keys(userAnswers).length }} / {{ flattenedQuestions.length }}
          </div>
          <button
            class="nav-action-btn"
            :disabled="currentQuestionIndex === flattenedQuestions.length - 1"
            @click="nextQuestion"
          >
            下一题 <i class="fas fa-chevron-right"></i>
          </button>
        </footer>
      </section>

      <!-- 右侧：固定答题卡侧边栏 -->
      <aside class="sidebar-column">
        <div class="sidebar-inner">
          <h3 class="sidebar-title"><i class="fas fa-th-large"></i> 答题卡看板</h3>

          <div class="category-list">
            <div v-for="(section, sIdx) in categorizedGroups" :key="sIdx" class="category-item">
              <div class="category-header">
                <span class="cat-name">{{ section.name }}</span>
                <span class="cat-count">{{ getSectionCount(section.indices) }}</span>
              </div>
              <div class="answer-num-grid">
                <div
                  v-for="idx in section.indices"
                  :key="idx"
                  class="num-node"
                  :class="{
                    'has-done': userAnswers[flattenedQuestions[idx]!.uniqueId],
                    'is-now': currentQuestionIndex === idx,
                    'result-ok':
                      isSubmitted &&
                      userAnswers[flattenedQuestions[idx]!.uniqueId] ===
                        flattenedQuestions[idx]!.answer,
                    'result-no':
                      isSubmitted &&
                      userAnswers[flattenedQuestions[idx]!.uniqueId] !==
                        flattenedQuestions[idx]!.answer,
                  }"
                  @click="jumpToQuestion(idx)"
                >
                  {{ idx + 1 }}
                </div>
              </div>
            </div>
          </div>

          <!-- 交卷后的分数报告 -->
          <div v-if="isSubmitted" class="final-score-box">
            <div class="score-label">总分结果</div>
            <div class="score-num">{{ finalScore }} <small>分</small></div>
            <div class="score-summary">
              正确率：{{ Math.round((correctCount / flattenedQuestions.length) * 100) }}%
            </div>
            <div class="score-tag" :class="finalScore >= 60 ? 'pass' : 'fail'">
              {{ finalScore >= 60 ? '合格' : '不合格' }}
            </div>
          </div>
        </div>
      </aside>
    </main>

    <!-- 加载等待层 -->
    <div v-if="loading" class="loading-full-screen">
      <div class="ink-loading-box">
        <span class="ink-text">题目加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'

interface Question {
  uniqueId: string
  id: number
  type: string
  stem: string
  options: Record<string, string>
  answer: string
  analysis: string
  sectionName: string
  parentStem?: string
  stemGroup?: string
}

interface SectionGroup {
  name: string
  indices: number[]
}

const loading = ref(true)
const examData = ref<any>(null)
const flattenedQuestions = ref<Question[]>([])
const categorizedGroups = ref<SectionGroup[]>([])
const currentQuestionIndex = ref(0)
const userAnswers = ref<Record<string, string>>({})
const isSubmitted = ref(false)
const secondsElapsed = ref(0)
const finalScore = ref(0)
const correctCount = ref(0)
let timerInterval: any = null

const currentQuestion = computed(() => flattenedQuestions.value[currentQuestionIndex.value])

const loadExamData = async () => {
  try {
    const response = await fetch('/Certification/exam-data.json')
    const data = await response.json()
    examData.value = data

    const list: Question[] = []
    const groups: SectionGroup[] = []

    data.sections.forEach((section: any) => {
      const currentIndices: number[] = []
      section.questions.forEach((q: any) => {
        if (q.type === 'A1' || q.type === 'A2') {
          currentIndices.push(list.length)
          list.push({ ...q, uniqueId: `q-${q.id}`, sectionName: section.sectionName })
        } else if (q.type === 'A3' || q.type === 'A4') {
          q.subQuestions.forEach((sub: any) => {
            currentIndices.push(list.length)
            list.push({
              ...sub,
              uniqueId: `q-${q.id}-${sub.subId}`,
              id: q.id,
              type: q.type,
              parentStem: q.stem,
              sectionName: section.sectionName,
            })
          })
        } else if (q.type === 'B') {
          q.subQuestions.forEach((sub: any) => {
            currentIndices.push(list.length)
            list.push({
              ...sub,
              uniqueId: `q-${q.id}-${sub.subId}`,
              id: q.id,
              type: q.type,
              stemGroup: q.stemGroup,
              options: parseBOptions(q.stemGroup),
              sectionName: section.sectionName,
            })
          })
        }
      })
      groups.push({ name: section.sectionName, indices: currentIndices })
    })
    flattenedQuestions.value = list
    categorizedGroups.value = groups
  } catch (err) {
    console.error('加载失败:', err)
  } finally {
    loading.value = false
  }
}

const parseBOptions = (group: string) => {
  const options: any = {}
  group.split('\n').forEach((line) => {
    const match = line.match(/^([A-E])\.\s*(.*)/)
    if (match) options[match[1]!] = match[2]
  })
  return options
}

const getSectionCount = (indices: number[]) => {
  const done = indices.filter(
    (idx) => userAnswers.value[flattenedQuestions.value[idx]!.uniqueId],
  ).length
  return `${done}/${indices.length}`
}

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60),
    s = sec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const selectOption = (key: string) => {
  if (!isSubmitted.value) userAnswers.value[currentQuestion.value!.uniqueId] = key
}
const jumpToQuestion = (index: number) => {
  currentQuestionIndex.value = index
}
const nextQuestion = () => {
  if (currentQuestionIndex.value < flattenedQuestions.value.length - 1) currentQuestionIndex.value++
}
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) currentQuestionIndex.value--
}

const confirmSubmit = () => {
  if (Object.keys(userAnswers.value).length < flattenedQuestions.value.length) {
    if (!confirm('尚有题目未完成，确认交卷？')) return
  } else {
    if (!confirm('确认交卷查看成绩？')) return
  }
  finishExam()
}

const finishExam = () => {
  clearInterval(timerInterval)
  isSubmitted.value = true
  let score = 0,
    count = 0
  flattenedQuestions.value.forEach((q) => {
    if (userAnswers.value[q.uniqueId] === q.answer) {
      score += examData.value.scorePerQuestion
      count++
    }
  })
  finalScore.value = score
  correctCount.value = count
}

const handleExit = () => {
  if (isSubmitted.value || confirm('退出将不保存进度，确认？')) window.history.back()
}

onMounted(() => {
  loadExamData()
  timerInterval = setInterval(() => {
    secondsElapsed.value++
  }, 1000)
})
onUnmounted(() => {
  clearInterval(timerInterval)
})
</script>

<style scoped>
/* --- 全局基础 --- */
.exam-page-container,
.exam-page-container *:not(.fas) {
  font-family: 'NO3', serif !important;
}

/* 艺术字体大字号补偿 */
.artistic-text {
  line-height: 1.8 !important;
  letter-spacing: 1.5px;
}

.exam-page-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #fdfaf5;
  color: #3e2723;
  overflow: hidden;
}

/* --- 顶部栏 --- */
.exam-header {
  height: 100px;
  background: #3e2723;
  color: #efebe9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1; /* 让左侧标题占据剩余的所有空间 */
  min-width: 0; /* 关键：允许 flex 子项在空间不足时正确收缩而不溢出 */
}

.exam-main-title {
  font-size: 24px; /* 稍微加大，对应你的大字体需求 */
  white-space: nowrap; /* 禁止标题换行 */
  overflow: hidden; /* 配合下面两行，如果屏幕实在太小，则显示省略号 */
  margin-left: 15px;
  text-overflow: ellipsis;
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-shrink: 0; /* 禁止右侧的操作按钮区域被挤压 */
  margin-left: 20px;
}
.exam-tag {
  background: #8b4513;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  flex-shrink: 0; /* 禁止标签被挤压 */
  white-space: nowrap;
}

.timer-box {
  font-size: 22px;
  font-family: monospace !important;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 15px;
  border-radius: 20px;
}
.submit-btn {
  background: #d4a373;
  border: none;
  color: white;
  padding: 6px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

/* --- 核心布局：锁定左右结构 --- */
.exam-main-layout {
  flex: 1;
  display: flex; /* 强制水平 */
  flex-direction: row;
  overflow: hidden;
  width: 100%;
}

/* 左边题目栏 */
.question-column {
  flex: 1; /* 占据剩余空间 */
  min-width: 600px;
  display: flex;
  flex-direction: column;
  padding: 20px 40px;
  background: #fdfaf5;
  border-right: 1px solid #e0e0e0;
}

/* 右边答题卡：强制固定宽度，不折叠 */
.sidebar-column {
  width: 320px;
  flex-shrink: 0;
  background: #f5f5f5;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* --- 题目细节 --- */
.section-indicator {
  border-bottom: 2px solid #8b4513;
  padding-bottom: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 15px;
}

.q-index {
  font-size: 30px;
  font-weight: bold;
  color: #8b4513;
}
.section-name {
  font-size: 20px;
  color: #5d4037;
}

.question-scroll-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-right: 15px;
}

/* 题目文字加大 */
.question-stem-row {
  font-size: 26px;
  line-height: 1.6;
  margin-bottom: 30px;
  display: flex;
  gap: 15px;
}
.q-type-badge {
  background: #efebe9;
  color: #795548;
  font-size: 14px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 6px;
  height: fit-content;
}

.case-description-box,
.b-type-options-box {
  background: #f7f2ea;
  border-left: 5px solid #8b4513;
  padding: 20px;
  margin-bottom: 25px;
  font-size: 20px;
}

.case-label {
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 10px;
  font-size: 18px;
}

/* --- 选项卡片与 Hover 优化 --- */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-card {
  padding: 18px 25px;
  border: 1px solid #d7ccc8;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  position: relative;
}

/* 字体大小提升 */
.opt-key {
  font-weight: bold;
  width: 40px;
  font-size: 24px;
  color: #8b4513;
}
.opt-text {
  flex: 1;
  font-size: 22px;
}

/* Hover 状态逻辑 */
/* 1. 基础 Hover (未选中) */
.option-card:hover:not(.active-selected):not(.readonly) {
  border-color: #8b4513;
  background: #fdf5f2;
}

/* 2. 选中状态 (深色背景，白字) */
.option-card.active-selected {
  background: #8b4513 !important;
  border-color: #8b4513 !important;
  color: #ffffff !important;
}
.option-card.active-selected .opt-key {
  color: #ffffff !important;
}

/* 3. 选中状态下的 Hover：防止文字变色，保持可见性 */
.option-card.active-selected:hover:not(.readonly) {
  background: #6d3510 !important; /* 加深一点点背景 */
  color: #ffffff !important;
}

/* 交卷后的结果样式 */
.option-card.is-correct {
  border: 2px solid #4caf50 !important;
  background: #e8f5e9 !important;
  color: #2e7d32 !important;
}
.option-card.is-wrong {
  border: 2px solid #f44336 !important;
  background: #ffebee !important;
  color: #c62828 !important;
}
.result-icon {
  font-size: 26px;
  margin-left: 15px;
}
.result-icon.success {
  color: #4caf50;
}
.result-icon.error {
  color: #f44336;
}

/* 解析 */
.analysis-card {
  margin-top: 35px;
  padding: 25px;
  background: #efebe9;
  border-radius: 8px;
  border: 1px dashed #8b4513;
  font-size: 20px;
}
.analysis-top {
  border-bottom: 1px solid #d7ccc8;
  padding-bottom: 12px;
  margin-bottom: 15px;
  font-weight: bold;
}

/* --- 底部导航 --- */
.nav-footer {
  height: 80px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.nav-action-btn {
  padding: 10px 30px;
  border-radius: 30px;
  border: 1px solid #8b4513;
  background: white;
  color: #8b4513;
  font-size: 20px;
  cursor: pointer;
}
.nav-action-btn:hover:not(:disabled) {
  background: #8b4513;
  color: white;
}
.nav-action-btn:disabled {
  opacity: 0.3;
}

/* --- 右侧答题卡细节 --- */
.sidebar-inner {
  padding: 25px;
}
.sidebar-title {
  font-size: 18px;
  text-align: center;
  margin-bottom: 20px;
  color: #5d4037;
  border-bottom: 1px solid #d7ccc8;
  padding-bottom: 10px;
}
.category-item {
  margin-bottom: 25px;
}
.category-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.cat-name {
  font-size: 15px;
  font-weight: bold;
  color: #8b4513;
  border-left: 4px solid #8b4513;
  padding-left: 8px;
}
.cat-count {
  font-family: monospace;
  font-size: 13px;
  color: #a1887f;
}

.answer-num-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.num-node {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #d7ccc8;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}
.num-node.has-done {
  background: #efebe9;
  color: #8b4513;
  border-color: #8b4513;
}
.num-node.is-now {
  background: #3e2723;
  color: white;
  transform: scale(1.1);
  z-index: 2;
  border: none;
}
.num-node.result-ok {
  background: #4caf50;
  color: white;
  border: none;
}
.num-node.result-no {
  background: #f44336;
  color: white;
  border: none;
}

/* 分数报告 */
.final-score-box {
  margin-top: 30px;
  background: #3e2723;
  color: #d7ccc8;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}
.score-num {
  font-size: 45px;
  font-weight: bold;
  color: #d4a373;
  margin: 10px 0;
}
.score-tag {
  margin-top: 10px;
  font-weight: bold;
  padding: 4px;
  border-radius: 4px;
}
.score-tag.pass {
  background: rgba(76, 175, 80, 0.2);
  color: #81c784;
}
.score-tag.fail {
  background: rgba(244, 67, 54, 0.2);
  color: #e57373;
}

/* 加载层 */
.loading-full-screen {
  position: fixed;
  inset: 0;
  background: #fdfaf5;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ink-loading-box {
  padding: 30px 50px;
  border: 2px solid #8b4513;
}
.ink-text {
  font-size: 24px;
  color: #8b4513;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: #d7ccc8;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #8b4513;
}
</style>
