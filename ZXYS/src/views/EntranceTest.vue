<template>
  <div class="main-container">
    <BreadcrumbNav title="摸底测试" :show-back="false" />
    <!-- 页面进入动画 -->
    <PageTransition v-if="showTransition" mode="leave" @animation-end="onEnterAnimationEnd" />
    <!-- 生成题目加载 -->
    <div v-if="loadingQuestions" class="loading-section">
      <div class="herb-loader">
        <div class="herb-item"></div>
        <div class="herb-item"></div>
        <div class="herb-item"></div>
        <div class="herb-item"></div>
      </div>
      <div class="loading-text">正在根据您的水平生成题目...</div>
    </div>

    <!-- 答题界面 -->
    <div v-else-if="!showResult" class="quiz-section">
      <div class="quiz-progress">
        第 {{ currentQuestionIndex + 1 }} 题 / 共 {{ questions.length }} 题
      </div>

      <div class="quiz-card">
        <h3 class="question-text">{{ currentQuestion?.text }}</h3>

        <div class="options-container">
          <div
            v-for="(option, index) in currentQuestion?.options"
            :key="index"
            class="option-item"
            :class="{ selected: selectedOption === index }"
            @click="selectOption(index)"
          >
            <span class="option-marker">{{ String.fromCharCode(65 + index) }}</span>
            <span class="option-text">{{ option }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button v-if="currentQuestionIndex > 0" class="btn-prev" @click="goToPreviousQuestion">
            上一题
          </button>

          <button
            v-if="currentQuestionIndex < questions.length - 1"
            class="btn-next"
            :disabled="selectedOption === null"
            @click="goToNextQuestion"
          >
            下一题
          </button>

          <button
            v-if="currentQuestionIndex === questions.length - 1"
            class="btn-submit"
            :disabled="selectedOption === null"
            @click="submitQuiz"
          >
            提交答案
          </button>
        </div>
      </div>
    </div>

    <!-- 提交后加载 -->
    <div v-else-if="submitting" class="loading-section">
      <div class="yin-yang-loader"></div>
      <div class="loading-text">正在分析结果并更新您的学习档案...</div>
    </div>

    <!-- 测试结果 -->
    <div v-else class="result-section">
      <div class="result-card">
        <h2>测试结果</h2>

        <div class="score-display">
          <div class="score-circle">
            <div class="score-text">{{ Math.round((correctCount / questions.length) * 100) }}</div>
            <div class="score-label">正确率%</div>
          </div>
        </div>

        <div class="result-stats">
          <p>答对 {{ correctCount }} 题，共 {{ questions.length }} 题</p>
        </div>

        <div class="result-suggestion">
          <h3>学习建议</h3>
          <p>{{ suggestion }}</p>
        </div>

        <div class="result-actions">
          <button class="btn-continue" @click="continueLearning">开始学习</button>
        </div>
      </div>
    </div>
    <!-- 页面退出动画 -->
    <PageTransition v-if="showTransition2" mode="enter" @animation-end="onLeaveAnimationEnd" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import { getUserId, setUserInfo } from '@/utils/storage'
import { getRandomPoints } from '@/api/knowledge'
import { generateQuiz, type Question } from '@/api/ai'
import { batchAddMastery } from '@/api/knowledge'
import PageTransition from '@/components/PageTransition.vue'
import { initializeUser } from '@/api/auth'
import { message } from '@/components/Notification'

const router = useRouter()
const route = useRoute()
// 控制过渡页面的显示
const showTransition = ref(true)
const showTransition2 = ref(false)
const nextRoute = ref('')

// 获取用户类型（从路由参数）
const userType = computed(() => {
  const type = route.query.id || route.params.id
  return type ? parseInt(type as string) : 1
})

// 状态
const loadingQuestions = ref(true)
const showResult = ref(false)
const submitting = ref(false)
const currentQuestionIndex = ref(0)
const selectedOption = ref<number | null>(null)
const userAnswers = ref<number[]>([])
const questions = ref<Question[]>([])
const sourcePoints = ref<Array<{ id: number; name: string }>>([])

// 当前题目
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

// 答对题数
const correctCount = computed(() => {
  return userAnswers.value.reduce((count, answer, index) => {
    return count + (answer === questions.value[index]?.correctAnswer ? 1 : 0)
  }, 0)
})

// 学习建议
const suggestion = computed(() => {
  const accuracy = (correctCount.value / questions.value.length) * 100
  if (accuracy >= 80) return '基础扎实，可直接进入进阶学习。'
  else if (accuracy >= 60) return '基础尚可，建议按系统推荐路径学习。'
  else return '建议从基础理论开始系统学习，平台已为您生成个性化学习路径。'
})

// 选择答案
const selectOption = (index: number) => {
  selectedOption.value = index
  userAnswers.value[currentQuestionIndex.value] = index
}

// 上一题
const goToPreviousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedOption.value = userAnswers.value[currentQuestionIndex.value] ?? null
  }
}

// 下一题
const goToNextQuestion = () => {
  if (selectedOption.value !== null && currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    selectedOption.value = userAnswers.value[currentQuestionIndex.value] ?? null
  }
}

// 提交答题并更新掌握度
const submitQuiz = async () => {
  if (selectedOption.value === null) return

  // 记录最后一题答案
  userAnswers.value[currentQuestionIndex.value] = selectedOption.value

  submitting.value = true

  // 计算每个知识点的答题结果
  const userId = getUserId()
  if (!userId) {
    console.error('用户未登录')
    submitting.value = false
    return
  }

  // 统计每个知识点的答题正确情况
  const pointResults: Map<number, boolean> = new Map()

  questions.value.forEach((question, index) => {
    const isCorrect = userAnswers.value[index] === question.correctAnswer
    const pointId = question.pointId

    // 如果一个知识点有多道题，只要有一道答对就算掌握
    if (pointResults.has(pointId)) {
      if (isCorrect) pointResults.set(pointId, true)
    } else {
      pointResults.set(pointId, isCorrect)
    }
  })

  // 转换为API需要的格式
  const results = Array.from(pointResults.entries()).map(([point_id, is_correct]) => ({
    point_id,
    is_correct,
  }))

  try {
    // 调用后端更新掌握度（只加分）
    await batchAddMastery(parseInt(userId), results)

    // 显示结果
    setTimeout(() => {
      submitting.value = false
      showResult.value = true
    }, 1000)
  } catch (error) {
    message.error('错误', {
      note: '更新掌握度失败',
      duration: 1000,
    })
    console.error('更新掌握度失败', error)
    submitting.value = false
    showResult.value = true
  }
}

// 继续学习（完成初始化）
const continueLearning = async () => {
  const userId = getUserId()
  if (!userId) {
    router.push('/')
    return
  }

  try {
    // 调用初始化接口，设置用户类型和初始化状态
    const res = await initializeUser({
      user_id: parseInt(userId),
      user_type: userType.value, // 2或3，来自路由参数
    })

    if (res.code === 200) {
      // 更新本地存储的用户信息
      setUserInfo({
        id: res.data.id,
        email: res.data.email,
        username: res.data.username,
        user_type: res.data.user_type,
        is_initialized: res.data.is_initialized,
      })

      message.success('成功', {
        note: '已完成初始化',
        duration: 1000,
      })

      // 跳转到个人中心
      showTransition2.value = true
    } else {
      message.error('错误', {
        note: '初始化失败',
        duration: 2000,
      })
      console.error('初始化失败', res.message)
    }
  } catch (error) {
    console.error('初始化请求失败', error)
  }
}

// 动画结束回调
const onEnterAnimationEnd = () => {
  showTransition.value = false
}

const onLeaveAnimationEnd = () => {
  nextRoute.value = '/Foundations/userhome'
  router.push(nextRoute.value)
  setTimeout(() => {
    showTransition2.value = false
  }, 100)
}

// 初始化：获取知识点并生成题目
onMounted(async () => {
  const userId = getUserId()
  if (!userId) {
    router.push('/')
    return
  }

  try {
    // 1. 根据用户类型随机获取5个知识点
    const pointsRes = await getRandomPoints(userType.value, 5)
    console.log('获取的知识点:', pointsRes.data)
    if (pointsRes.code !== 200) {
      console.error('获取知识点失败')
      loadingQuestions.value = false
      return
    }

    const pointIds = pointsRes.data.map((p: any) => p.id)
    sourcePoints.value = pointsRes.data

    // 2. 调用AI生成题目
    const quizRes = await generateQuiz({
      userType: userType.value,
      pointIds: pointIds,
    })

    if (quizRes.code === 200) {
      questions.value = quizRes.data.questions
      userAnswers.value = Array(questions.value.length).fill(-1)
    } else {
      // 如果AI生成失败，使用备用题目
      console.error('AI生成题目失败，使用备用题目')
      useFallbackQuestions()
    }
  } catch (error) {
    console.error('初始化失败', error)
    useFallbackQuestions()
  } finally {
    loadingQuestions.value = false
  }
})

// 备用题目（AI失败时使用）
const useFallbackQuestions = () => {
  questions.value = [
    {
      text: "中医的'整体观念'主要是指什么？",
      options: ['人体是一个有机整体', '人与自然界的统一性', '以上都是', '疾病是局部的表现'],
      correctAnswer: 2,
      pointId: sourcePoints.value[0]?.id || 1,
    },
    {
      text: "下列哪个不属于中医的'四诊'？",
      options: ['望诊', '闻诊', '问诊', '测诊'],
      correctAnswer: 3,
      pointId: sourcePoints.value[1]?.id || 1,
    },
    {
      text: '阴阳学说的核心思想是？',
      options: ['阴阳对立', '阴阳互根', '阴阳消长', '以上都是'],
      correctAnswer: 3,
      pointId: sourcePoints.value[2]?.id || 1,
    },
    {
      text: "下列哪个是'补气'的常用药物？",
      options: ['人参', '大黄', '黄连', '石膏'],
      correctAnswer: 0,
      pointId: sourcePoints.value[3]?.id || 1,
    },
    {
      text: "中医认为'脾'的主要功能是？",
      options: ['主运化', '主统血', '以上都是', '主疏泄'],
      correctAnswer: 2,
      pointId: sourcePoints.value[4]?.id || 1,
    },
  ]
  userAnswers.value = Array(questions.value.length).fill(-1)
}
</script>

<style scoped>
/* 你的原有样式保持不变，只需添加以下新样式 */

* {
  font-family: 'No3', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 加载动画 */
.loading-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.herb-loader {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.herb-item {
  width: 12px;
  height: 40px;
  background: #a67c52;
  border-radius: 6px;
  animation: herbFloat 1.2s ease-in-out infinite;
}

.herb-item:nth-child(2) {
  animation-delay: 0.2s;
}
.herb-item:nth-child(3) {
  animation-delay: 0.4s;
}
.herb-item:nth-child(4) {
  animation-delay: 0.6s;
}

@keyframes herbFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.yin-yang-loader {
  width: 60px;
  height: 60px;
  margin-bottom: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5a3921 50%, #8b7355 50%);
  position: relative;
  animation: rotate 2s linear infinite;
}

.yin-yang-loader::before,
.yin-yang-loader::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 5px solid;
}

.yin-yang-loader::before {
  background: #5a3921;
  border-color: #8b7355;
  top: 5px;
  left: 15px;
}

.yin-yang-loader::after {
  background: #8b7355;
  border-color: #5a3921;
  bottom: 5px;
  right: 15px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 18px;
  color: #5a3921;
  font-weight: 500;
}

/* 答题区域 */
.quiz-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.quiz-progress {
  color: #8b7355;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.quiz-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 100%;
  box-shadow: 0 5px 20px rgba(90, 57, 33, 0.08);
  border: 1px solid rgba(212, 180, 131, 0.2);
  max-height: calc(100vh - 180px);
}

.question-text {
  font-size: 20px;
  color: #333;
  margin-bottom: 30px;
  font-weight: 500;
  line-height: 1.5;
  flex-shrink: 0;
}

.options-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-right: 5px;
  margin-bottom: 20px;
}

/* 隐藏滚动条但保持可滚动 */
.options-container::-webkit-scrollbar {
  width: 4px;
}

.options-container::-webkit-scrollbar-thumb {
  background: rgba(166, 124, 82, 0.3);
  border-radius: 2px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f5f1;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  min-height: 60px;
}

.option-item:hover {
  background: #f0e9df;
}

.option-item.selected {
  background: rgba(166, 124, 82, 0.1);
  border-color: #a67c52;
}

.option-marker {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  color: #5a3921;
  margin-right: 15px;
  flex-shrink: 0;
  border: 1px solid rgba(212, 180, 131, 0.3);
}

.option-item.selected .option-marker {
  background: #a67c52;
  color: white;
  border-color: #a67c52;
}

.option-text {
  flex: 1;
  font-size: 15px;
  color: #333;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-buttons button {
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;
}

.btn-prev {
  background: transparent;
  color: #5a3921;
  border: 1px solid #a67c52 !important;
}

.btn-next,
.btn-submit {
  background: #5a3921;
  color: white;
  margin-left: auto;
}

.btn-next:hover:not(:disabled),
.btn-submit:hover:not(:disabled) {
  background: #4a3111;
  transform: translateY(-1px);
}

.action-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* 结果页面 */
.result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

.result-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 100%;
  box-shadow: 0 5px 20px rgba(90, 57, 33, 0.08);
  border: 1px solid rgba(212, 180, 131, 0.2);
  text-align: center;
}

.result-card h2 {
  font-size: 24px;
  color: #5a3921;
  margin-bottom: 30px;
  font-weight: 600;
}

.score-display {
  margin-bottom: 30px;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a67c52, #8b5a2e);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 20px;
  box-shadow: 0 5px 15px rgba(166, 124, 82, 0.2);
}

.score-text {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 3px;
}

.result-suggestion h3 {
  font-size: 16px;
  color: #5a3921;
  margin-bottom: 10px;
  font-weight: 600;
}

.result-suggestion p {
  color: #666;
  line-height: 1.5;
  font-size: 14px;
  padding: 12px;
  background: #f8f5f1;
  border-radius: 8px;
  border-left: 3px solid #a67c52;
}

.result-actions {
  margin-top: 30px;
}

.btn-continue {
  width: 100%;
  padding: 12px 24px;
  background: #5a3921;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-continue:hover {
  background: #4a3111;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(90, 57, 33, 0.2);
}

/* 响应式 */
@media (max-width: 768px) {
  .quiz-card {
    padding: 20px;
  }

  .question-text {
    font-size: 18px;
  }

  .option-item {
    padding: 12px;
    min-height: 55px;
  }

  .option-marker {
    width: 28px;
    height: 28px;
    margin-right: 12px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons button {
    width: 100%;
  }

  .btn-next,
  .btn-submit {
    margin-left: 0;
  }
}
.result-stats {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.result-stats p {
  padding: 8px;
  background: #f8f5f1;
  border-radius: 8px;
}

.score-circle .score-text {
  font-size: 28px;
  font-weight: 700;
}
</style>
