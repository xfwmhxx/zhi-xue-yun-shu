<template>
  <BreadcrumbNav
    title="题目详情"
    :breadcrumb-items="[
      { name: from === 'bookshelf' ? '我的书架' : '经典书城', url: returnPath },
      { name: '书籍详情', url: `/Hina/BookIntroduce/${route.params.id}` },
      {
        name: '题目列表',
        url: `/Hina/BookProblemList/${route.params.id}/${route.params.chapterid}`,
      },
      { name: '题目详情', url: '' },
    ]"
  ></BreadcrumbNav>
  <main class="problem-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-feather-alt fa-spin"></i> 正在研磨润笔...
    </div>

    <div v-else-if="chapterData" class="detail-container fade-in">
      /

      <!-- 2. 主体答题区 -->
      <div class="main-layout">
        <section class="question-section">
          <div class="question-card" :key="currentQuestion.id">
            <!-- 题目头部元数据 -->
            <div class="q-header">
              <div class="q-badges">
                <span class="badge type">{{ currentQuestion.type }}</span>
                <div class="difficulty-stars">
                  <i
                    v-for="n in 5"
                    :key="n"
                    :class="[n <= (currentQuestion.rating || 0) ? 'fas fa-star' : 'far fa-star']"
                  ></i>
                </div>
              </div>
              <div class="q-score">分值：{{ currentQuestion.score }}分</div>
            </div>

            <!-- 题干 -->
            <h2 class="q-stem">
              <span class="q-index-tag">问：</span>
              {{ currentQuestion.stem }}
            </h2>

            <!-- 选项区 (如果是选择题) -->
            <div
              v-if="currentQuestion.options && Object.keys(currentQuestion.options).length > 0"
              class="options-list"
            >
              <div
                v-for="(text, key) in currentQuestion.options"
                :key="key"
                :class="[
                  'option-item',
                  {
                    selected: userAnswers[currentIndex]?.includes(String(key)),
                    correct: isSubmitted && currentQuestion.answer.includes(key),
                    wrong:
                      isSubmitted &&
                      userAnswers[currentIndex]?.includes(String(key)) &&
                      !currentQuestion.answer.includes(key),
                    disabled: isSubmitted,
                  },
                ]"
                @click="handleSelect(String(key))"
              >
                <div class="opt-key">{{ key }}</div>
                <div class="opt-text">{{ text }}</div>
                <div class="opt-status-icon" v-if="isSubmitted">
                  <i v-if="currentQuestion.answer.includes(key)" class="fas fa-check"></i>
                  <i
                    v-else-if="userAnswers[currentIndex]?.includes(String(key))"
                    class="fas fa-times"
                  ></i>
                </div>
              </div>
            </div>

            <!-- 填空输入区 (如果是填空题) -->
            <div v-else class="blank-input-area">
              <input
                v-model="userAnswers[currentIndex]"
                :disabled="isSubmitted"
                placeholder="请在此输入您的见解..."
                class="blank-input"
              />
            </div>

            <!-- 操作按钮 -->
            <div class="action-footer">
              <button class="control-btn" :disabled="currentIndex === 0" @click="currentIndex--">
                <i class="fas fa-arrow-left"></i> 前一题
              </button>

              <div class="center-actions">
                <button
                  v-if="!isSubmitted"
                  class="submit-btn"
                  :disabled="isSubmitting"
                  @click="submitAnswer"
                >
                  <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                  {{ isSubmitting ? '提交中...' : '确认提交' }}
                </button>
                <button v-else class="next-btn" @click="goNext">
                  {{ currentIndex === chapterData.problems.length - 1 ? '完成研读' : '下一考点' }}
                </button>
              </div>

              <button
                class="control-btn"
                :disabled="currentIndex === chapterData.problems.length - 1"
                @click="currentIndex++"
              >
                后一题 <i class="fas fa-arrow-right"></i>
              </button>
            </div>

            <!-- 解析区 (提交后显示) -->
            <transition name="expand">
              <div v-if="isSubmitted" class="analysis-box">
                <div class="analysis-header"><i class="fas fa-scroll"></i> 典籍批注与解析</div>
                <div class="analysis-body">
                  <div class="answer-row">
                    <span class="lab">正确答案：</span>
                    <span class="val">{{ currentQuestion.answer }}</span>
                  </div>
                  <div class="text-row">
                    <span class="lab">【解析说明】</span>
                    <p>{{ currentQuestion.analysis }}</p>
                  </div>
                  <div class="page-ref">
                    —— 参阅《{{ chapterData.bookName }}》正文第 {{ currentQuestion.pageRef }} 页
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </section>
      </div>
    </div>
    <!-- 添加提示气泡 -->
    <!-- 掌握度动效容器 -->
    <div class="mastery-effects-container">
      <transition-group name="effect-float">
        <div
          v-for="effect in activeEffects"
          :key="effect.id"
          class="effect-item"
          :style="{ left: effect.x + '%', top: effect.y + '%' }"
        >
          <div class="effect-content" :class="effect.type">
            <i
              class="fas"
              :class="effect.type === 'positive' ? 'fa-medal' : 'fa-exclamation-circle'"
            ></i>
            <span class="effect-kp-name">{{ effect.name }}</span>
            <span class="effect-value">{{ effect.value >= 0 ? '+' : '' }}{{ effect.value }}%</span>
          </div>
        </div>
      </transition-group>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getChapterDetail, submitQuiz } from '@/api/book'
import { getUserId } from '@/utils/storage'
import { updateMastery } from '@/api/knowledge'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

const route = useRoute()
const router = useRouter()

// 来源信息
const from = ref('bookhouse')
const returnPath = ref('/Foundations/BookHouse')

const loading = ref(true)
const chapterData = ref<any>(null)
const currentIndex = ref(0)
const userAnswers = ref<Record<number, string>>({})
const submittedStatus = ref<Record<number, boolean>>({})

const userId = ref<number | null>(null)
const bookId = ref<string>('')
const submitting = ref(false)
const masteryUpdates = ref<any[]>([])

const isSubmitting = computed(() => submitting.value)

// 动态气泡
// 特效系统变量
const activeEffects = ref<any[]>([])
let effectIdCounter = 0

// 触发特效的方法
const triggerMasteryEffect = (name: string, value: number) => {
  const id = effectIdCounter++
  // 随机位置：水平 20%-70% 之间，垂直 40%-60% 之间
  const x = Math.floor(Math.random() * 50) + 20
  const y = Math.floor(Math.random() * 20) + 40

  const newEffect = {
    id,
    name,
    value,
    x,
    y,
    type: value >= 0 ? 'positive' : 'negative',
  }
  activeEffects.value.push(newEffect)

  // 3.5秒后自动清理
  setTimeout(() => {
    activeEffects.value = activeEffects.value.filter((e) => e.id !== id)
  }, 3500)
}

// 1. 数据加载逻辑 (与列表页路径一致)
const fetchData = async () => {
  loading.value = true
  const { id, chapterid, probId } = route.params
  bookId.value = id as string

  const uid = getUserId()
  if (uid) {
    userId.value = parseInt(uid)
  }
  console.log(
    '正在加载章节详情，书籍ID:',
    bookId.value,
    '章节ID:',
    chapterid,
    '用户ID:',
    userId.value,
  )

  try {
    // 调用后端接口获取章节详情（同时传书籍ID和章节ID）
    console.log('章节详情数据')
    const res = await getChapterDetail(
      parseInt(id as string), // bookId
      String(chapterid), // chapterId
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

      // 如果路由指定了起始题目ID，定位到该题
      if (probId) {
        const idx = chapterData.value.problems.findIndex((p: any) => p.id === Number(probId))
        if (idx !== -1) currentIndex.value = idx
      }
    } else {
      throw new Error(res.message || '读取资源失败')
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 2. 计算属性
const currentQuestion = computed(() => chapterData.value?.problems[currentIndex.value])
const isSubmitted = computed(() => submittedStatus.value[currentIndex.value] || false)
const progressWidth = computed(() => {
  if (!chapterData.value) return '0%'
  return ((currentIndex.value + 1) / chapterData.value.problems.length) * 100 + '%'
})

// 3. 交互方法
const handleSelect = (key: string) => {
  if (isSubmitted.value || submitting.value) return

  if (currentQuestion.value.type === '多选题') {
    let currentArr = userAnswers.value[currentIndex.value]?.split('') || []
    if (currentArr.includes(key)) {
      currentArr = currentArr.filter((k) => k !== key)
    } else {
      currentArr.push(key)
    }
    // 多选题答案按字母排序后存储
    userAnswers.value[currentIndex.value] = currentArr.sort().join('')
  } else {
    userAnswers.value[currentIndex.value] = key
  }
}

const submitAnswer = async () => {
  const currentAnswer = userAnswers.value[currentIndex.value]
  if (!currentAnswer) {
    alert('请先完成作答')
    return
  }

  if (submittedStatus.value[currentIndex.value]) {
    alert('本题已提交过')
    return
  }

  submitting.value = true
  masteryUpdates.value = []

  try {
    const currentProb = currentQuestion.value

    // 判断答案是否正确
    let isCorrect = false
    if (currentProb.type === '填空题') {
      // 填空题：忽略大小写和首尾空格进行比较
      isCorrect = currentAnswer.trim().toLowerCase() === currentProb.answer.trim().toLowerCase()
    } else {
      // 选择题：比较答案字符串
      isCorrect = currentAnswer === currentProb.answer
    }

    // 更新知识点掌握度（如果题目关联了知识点）
    if (currentProb.related_kp_ids && userId.value) {
      const pointIds = currentProb.related_kp_ids
        .split(',')
        .map((id: string) => parseInt(id.trim()))

      // 为每个关联的知识点更新掌握度
      for (const pointId of pointIds) {
        try {
          const updateRes = await updateMastery({
            user_id: userId.value,
            point_id: pointId,
            problem_id: currentProb.id, // 新增：传入题目ID
            is_correct: isCorrect,
          })
          if (updateRes.code === 200) {
            const kpName = updateRes.data.point_name || '相关知识点'
            const improvement = updateRes.data.improvement || 0
            console.log(improvement)

            // 2. 触发气泡特效
            triggerMasteryEffect(kpName, improvement as number)

            // 清空上一次的掌握度更新记录
            masteryUpdates.value = []
            masteryUpdates.value.push({
              point_id: pointId,
              ...updateRes.data,
            })
          }
        } catch (e) {
          console.error('更新掌握度失败', e)
        }
      }
    }

    // 记录用户答案
    submittedStatus.value[currentIndex.value] = true

    // 显示掌握度更新提示（可选）
    if (masteryUpdates.value.length > 0) {
      const improvementMsg = masteryUpdates.value
        .map((m) => `知识点掌握度${m.improvement}`)
        .join('；')
      console.log(`掌握度更新：${improvementMsg}`)
    }
  } catch (error) {
    console.error('提交失败', error)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const goNext = async () => {
  if (currentIndex.value < chapterData.value.problems.length - 1) {
    currentIndex.value++
  } else {
    // 所有题目已完成，可以提交章节测验结果
    if (userId.value && chapterData.value) {
      try {
        // 构建所有答案
        const allAnswers: Record<number, string> = {}
        for (let i = 0; i < chapterData.value.problems.length; i++) {
          if (userAnswers.value[i]) {
            allAnswers[chapterData.value.problems[i].id] = String(userAnswers.value[i])
          }
        }

        // 提交章节测验
        const res = await submitQuiz({
          user_id: userId.value,
          chapter_id: chapterData.value.chapterId,
          answers: allAnswers,
        })

        if (res.code === 200) {
          alert(
            `本章测验完成！得分：${res.data.earned_score}/${res.data.total_score}分 (${res.data.percentage}%)`,
          )
        }
      } catch (error) {
        console.error('提交章节测验失败', error)
      }
    }

    alert('本卷已研读完毕！')
    router.back()
  }
}
const goBackToList = () => router.back()

// 切换题目时自动清空提交状态（如果不需要保留的话）
// watch(currentIndex, () => { showAnalysis.value = false })

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
  fetchData()
})
</script>

<style scoped>
/* 气泡特效 */
/* 特效容器：固定在屏幕最前方，不干扰点击 */
.mastery-effects-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}

.effect-item {
  position: absolute;
  pointer-events: none;
}

.effect-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: rgba(255, 252, 245, 0.95);
  border: 1px solid #8b5e3c;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(139, 94, 60, 0.25);
  backdrop-filter: blur(4px);
  white-space: nowrap;
  animation: float-up-fade 3.5s forwards cubic-bezier(0.16, 1, 0.3, 1);
}

/* 成功提升为绿色，下降为红色 */
.effect-content.positive {
  border-left: 6px solid #2e7d32;
  color: #2e7d32;
}
.effect-content.negative {
  border-left: 6px solid #b71c1c;
  color: #b71c1c;
}

.effect-kp-name {
  font-family: 'NO3';
  font-size: 18px;
  font-weight: bold;
}
.effect-value {
  font-family: 'Georgia', serif;
  font-size: 20px;
  font-weight: bold;
}

/* 向上漂浮并消失的动画 */
@keyframes float-up-fade {
  0% {
    transform: translateY(20px) scale(0.6);
    opacity: 0;
  }
  15% {
    transform: translateY(0) scale(1.1);
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    transform: translateY(-180px) scale(1);
    opacity: 0;
  }
}

.problem-detail-page {
  min-height: 100vh;
  padding: 40px 0;
  font-family: 'NO3', serif;
  color: #3e2723;
  position: relative;
  z-index: 1;
}

.loading-state {
  text-align: center;
  padding: 150px;
  font-size: 24px;
  color: #8b5e3c;
}

.detail-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 40px;
}

/* 顶部进度条 */
.quiz-header {
  background: rgba(253, 245, 230, 0.95);
  padding: 20px 40px;
  border-radius: 4px;
  border: 1px solid rgba(139, 94, 60, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.back-btn {
  background: none;
  border: 1px solid #8b5e3c;
  color: #8b5e3c;
  padding: 6px 15px;
  cursor: pointer;
  margin-right: 20px;
  font-family: 'NO3';
}

.book-tag {
  font-size: 14px;
  color: #8d6e63;
  display: block;
}
.chapter-tag {
  font-size: 18px;
  font-weight: bold;
}

.header-right {
  width: 300px;
}
.progress-info {
  font-size: 13px;
  text-align: right;
  margin-bottom: 5px;
}
.progress-info span {
  color: #b71c1c;
  font-weight: bold;
}

.progress-bar-bg {
  height: 4px;
  background: #e0d8c3;
  border-radius: 2px;
}
.progress-bar-fill {
  height: 100%;
  background: #b71c1c;
  transition: 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

/* 布局 */
.main-layout {
  grid-template-columns: 280px 1fr;
  gap: 30px;
  margin-bottom: 50px;
}

/* 侧边导航 */
.side-nav {
  background: rgba(253, 245, 230, 0.8);
  padding: 30px;
  border: 1px solid rgba(139, 94, 60, 0.2);
  border-radius: 4px;
  height: fit-content;
}

.nav-title {
  font-size: 18px;
  border-bottom: 1px solid #3e2723;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.num-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.num-item {
  height: 45px;
  border: 1px solid #e0d8c3;
  background: #fff;
  cursor: pointer;
  font-family: 'NO3';
  transition: 0.3s;
}
.num-item.active {
  background: #3e2723;
  color: #fff;
  border-color: #3e2723;
}
.num-item.finished {
  border-color: #8b5e3c;
  color: #8b5e3c;
  background: #fdf5e6;
}

/* 题目卡片 */
.question-section {
  min-height: 600px;
}
.question-card {
  background: #fff;
  padding: 60px;
  border: 1px solid rgba(139, 94, 60, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  position: relative;
}

.q-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}
.q-badges {
  display: flex;
  gap: 15px;
  align-items: center;
}
.badge.type {
  background: #3e2723;
  color: #fff;
  font-size: 20px;
  padding: 2px 10px;
}
.difficulty-stars {
  color: #fbc02d;
  font-size: 12px;
}
.q-score {
  color: #8d6e63;
  font-size: 16px;
  border: 1px dashed #ddd;
  padding: 2px 10px;
}

.q-stem {
  font-size: 28px;
  line-height: 1.6;
  color: #3e2723;
  margin-bottom: 40px;
}
.q-index-tag {
  color: #b71c1c;
  font-weight: bold;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.option-item {
  display: flex;
  align-items: center;
  padding: 20px 30px;
  border: 1px solid #eee;
  background: #fafafa;
  cursor: pointer;
  transition: 0.3s;
  position: relative;
}

.option-item:hover:not(.disabled) {
  background: #fdf5e6;
  border-color: #8b5e3c;
}
.option-item.selected {
  border-color: #3e2723;
  border-width: 2px;
  background: #fdfaf5;
}
.option-item.correct {
  border-color: #2e7d32;
  background: #e8f5e9;
}
.option-item.wrong {
  border-color: #b71c1c;
  background: #ffebee;
}

.opt-key {
  font-size: 20px;
  font-weight: bold;
  color: #8b5e3c;
  width: 40px;
}
.opt-text {
  font-size: 24px;
  flex: 1;
}
.opt-status-icon {
  font-size: 20px;
  margin-left: 15px;
}

.blank-input {
  width: 100%;
  padding: 20px;
  font-size: 20px;
  font-family: 'NO3';
  border: 1px solid #ddd;
  background: #fafafa;
  outline: none;
}

/* 操作脚部 */
.action-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.control-btn {
  background: none;
  border: none;
  color: #8d6e63;
  cursor: pointer;
  font-family: 'NO3';
  font-size: 24px;
}
.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.submit-btn,
.next-btn {
  padding: 12px 50px;
  font-family: 'NO3';
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
}
.submit-btn {
  background: #b71c1c;
  color: #fff;
  border: none;
}
.next-btn {
  background: #3e2723;
  color: #fff;
  border: none;
}

/* 解析区 */
.analysis-box {
  margin-top: 40px;
  background: #fdfaf5;
  border: 1px dashed #8b5e3c;
  padding: 30px;
}
.analysis-header {
  color: #b71c1c;
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 24px;
  font-weight: 400;
}
.answer-row {
  margin-bottom: 15px;
  font-size: 20px;
}
.answer-row .val {
  color: #2e7d32;
  font-weight: bold;
}
.text-row .lab {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
  font-weight: 400;
  font-size: 20px;
}
.text-row p {
  font-size: 24px;
  line-height: 1.8;
  color: #5d4037;
  text-align: justify;
}
.page-ref {
  text-align: right;
  margin-top: 20px;
  font-style: italic;
  color: #8d6e63;
  font-size: 20px;
}

/* 艺术分割线 */
.divider-section {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
.divider-line {
  width: 80%;
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
  font-size: 20px;
}
.divider-line::before {
  left: -25px;
}
.divider-line::after {
  right: -25px;
}

/* 底部文本竖排 */
.foot-text-container {
  display: flex;
  justify-content: center;
  padding-bottom: 100px;
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
  font-size: 24px;
}
.foot-text p {
  margin: 0;
  padding: 15px 0;
}

/* 过渡动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.5s ease;
  max-height: 1000px;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
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
  .main-layout {
    grid-template-columns: 1fr;
  }
  .side-nav {
    order: 2;
  }
  .question-card {
    padding: 30px;
  }
  .q-stem {
    font-size: 22px;
  }
  .foot-text {
    font-size: 18px;
  }
}
</style>
