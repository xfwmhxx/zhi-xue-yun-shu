<template>
  <BreadcrumbNav title="视频详情" />

  <main class="video-detail-main">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-text">載入視頻詳情中...</div>
      <div class="loading-decoration"></div>
    </div>

    <!-- 视频详情内容 -->
    <div v-else-if="videoData" class="detail-container">
      <!-- 视频播放区域 -->
      <div class="video-player-section">
        <div class="video-player-wrapper">
          <video :src="videoUrl" controls autoplay class="video-player" :poster="videoData.pic">
            <source :src="videoUrl" type="video/mp4" />
            您的浏览器不支持视频播放
          </video>
          <div class="video-duration-badge">{{ videoData.duration }}</div>
        </div>

        <!-- 视频标题和信息 -->
        <div class="video-info-header">
          <h1 class="video-title">{{ videoData.title }}</h1>
          <div class="video-stats">
            <div class="stat-item">
              <i class="fas fa-play-circle"></i>
              <span>{{ videoData.views }} 次播放</span>
            </div>
            <div class="stat-item">
              <i class="far fa-calendar-alt"></i>
              <span>{{ videoData.date }}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <span>{{ videoData.duration }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 视频详情内容区 -->
      <div class="detail-content-wrapper">
        <!-- 左侧：AI题目区域优先 -->
        <div class="content-left">
          <!-- AI 题目区域 - 优先级最高 -->
          <div class="detail-card ai-quiz-card">
            <div class="card-header">
              <div class="header-decoration ai-deco"></div>
              <h2 class="card-title">
                <i class="fas fa-robot"></i>
                AI 課後鞏固 · 杏林問道
              </h2>
              <div class="ai-badge">
                <i class="fas fa-microchip"></i>
                AI 智能生成
              </div>
            </div>
            <div class="card-content">
              <!-- 题目内容 -->
              <div v-if="currentQuiz" class="quiz-content">
                <div class="quiz-progress">
                  <span class="progress-text">
                    <i class="fas fa-tasks"></i>
                    第 {{ currentQuizIndex + 1 }} / {{ quizList.length }} 題
                  </span>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: ((currentQuizIndex + 1) / quizList.length) * 100 + '%' }"
                    ></div>
                  </div>
                </div>

                <div class="quiz-question">
                  <div class="question-icon">
                    <i class="fas fa-question-circle"></i>
                  </div>
                  <h3 class="question-text">{{ currentQuiz.question }}</h3>
                </div>

                <!-- 选项列表 -->
                <div class="quiz-options">
                  <div
                    v-for="(option, idx) in currentQuiz.options"
                    :key="idx"
                    class="quiz-option"
                    :class="{
                      selected: userAnswers[currentQuiz.id] === idx,
                      correct: showAnswer && idx === currentQuiz.correct,
                      wrong:
                        showAnswer &&
                        userAnswers[currentQuiz.id] === idx &&
                        idx !== currentQuiz.correct,
                    }"
                    @click="!showAnswer && selectAnswer(currentQuiz.id, idx)"
                  >
                    <span class="option-prefix">{{ String.fromCharCode(65 + idx) }}.</span>
                    <span class="option-text">{{ option }}</span>
                    <div
                      v-if="showAnswer && idx === currentQuiz.correct"
                      class="option-correct-icon"
                    >
                      <i class="fas fa-check-circle"></i>
                    </div>
                    <div
                      v-if="
                        showAnswer &&
                        userAnswers[currentQuiz.id] === idx &&
                        idx !== currentQuiz.correct
                      "
                      class="option-wrong-icon"
                    >
                      <i class="fas fa-times-circle"></i>
                    </div>
                  </div>
                </div>

                <!-- 题目解析 -->
                <div v-if="showAnswer" class="quiz-explanation">
                  <div class="explanation-icon">
                    <i class="fas fa-book-open"></i>
                  </div>
                  <div class="explanation-text">
                    <strong>解析：</strong>{{ currentQuiz.explanation }}
                  </div>
                </div>

                <!-- 按钮组 -->
                <div class="quiz-actions">
                  <button
                    v-if="!showAnswer && userAnswers[currentQuiz.id] !== undefined"
                    class="quiz-btn submit-btn"
                    @click="submitAnswer"
                  >
                    <i class="fas fa-check"></i>
                    提交答案
                  </button>
                  <button v-if="showAnswer" class="quiz-btn next-btn" @click="nextQuiz">
                    <i class="fas fa-arrow-right"></i>
                    {{ hasNextQuiz ? '下一題' : '完成學習' }}
                  </button>
                  <button
                    v-if="!showAnswer && userAnswers[currentQuiz.id] === undefined"
                    class="quiz-btn disabled-btn"
                    disabled
                  >
                    <i class="fas fa-hand-pointer"></i>
                    請先選擇答案
                  </button>
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-else-if="quizCompleted" class="quiz-completed">
                <div class="completed-icon">
                  <i class="fas fa-trophy"></i>
                </div>
                <h3 class="completed-title">恭喜完成所有題目！</h3>
                <div class="completed-score-wrapper">
                  <div class="score-circle">
                    <span class="score-number">{{ correctRate }}%</span>
                    <span class="score-label">正確率</span>
                  </div>
                  <div class="score-detail">
                    <p><i class="fas fa-check-circle"></i> 答對 {{ correctCount }} 題</p>
                    <p><i class="fas fa-list"></i> 總共 {{ quizList.length }} 題</p>
                  </div>
                </div>
                <button class="quiz-btn restart-btn" @click="restartQuiz">
                  <i class="fas fa-redo-alt"></i>
                  重新答題
                </button>
              </div>
            </div>
          </div>

          <!-- 视频介绍 -->
          <div class="detail-card">
            <div class="card-header">
              <div class="header-decoration"></div>
              <h2 class="card-title">
                <i class="fas fa-info-circle"></i>
                視頻介紹
              </h2>
            </div>
            <div class="card-content">
              <p class="video-description">{{ videoData.description }}</p>
            </div>
          </div>

          <!-- 视频标签 -->
          <div class="detail-card">
            <div class="card-header">
              <div class="header-decoration"></div>
              <h2 class="card-title">
                <i class="fas fa-tags"></i>
                相關標籤
              </h2>
            </div>
            <div class="card-content">
              <div class="tags-container">
                <span v-for="tag in videoData.tags" :key="tag" class="tag-item">
                  <i class="fas fa-hashtag"></i>
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- 互动区 -->
          <div class="detail-card">
            <div class="card-header">
              <div class="header-decoration"></div>
              <h2 class="card-title">
                <i class="fas fa-heart"></i>
                互動區
              </h2>
            </div>
            <div class="card-content">
              <div class="action-buttons">
                <button
                  class="action-btn like-btn"
                  :class="{ active: isLiked }"
                  @click="toggleLike"
                >
                  <i class="fas fa-heart"></i>
                  <span>點讚 {{ likeCount }}</span>
                </button>
                <button
                  class="action-btn collect-btn"
                  :class="{ active: isCollected }"
                  @click="toggleCollect"
                >
                  <i class="fas fa-star"></i>
                  <span>收藏 {{ collectCount }}</span>
                </button>
                <button class="action-btn share-btn" @click="handleShare">
                  <i class="fas fa-share-alt"></i>
                  <span>分享</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：推荐视频列表 -->
        <div class="content-right">
          <div class="detail-card">
            <div class="card-header">
              <div class="header-decoration"></div>
              <h2 class="card-title">
                <i class="fas fa-thumbs-up"></i>
                推薦視頻
              </h2>
            </div>
            <div class="card-content">
              <div class="recommend-list">
                <div
                  v-for="video in recommendVideos"
                  :key="video.id"
                  class="recommend-item"
                  @click="goToVideoDetail(video.id)"
                >
                  <div class="recommend-thumb">
                    <img :src="video.pic" :alt="video.title" />
                    <div class="recommend-duration">{{ video.duration }}</div>
                  </div>
                  <div class="recommend-info">
                    <h4 class="recommend-title">{{ video.title }}</h4>
                    <div class="recommend-stats">
                      <span><i class="fas fa-play"></i> {{ video.views }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>數據加載失敗，請稍後重試</p>
      <button @click="loadVideoData" class="retry-btn">
        <i class="fas fa-sync-alt"></i>
        重新加載
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import { message } from '@/components/Notification'

// 路由
const router = useRouter()
const route = useRoute()

// 数据状态
const loading = ref(true)
const videoId = ref(Number(route.params.id))
const videoData = ref<any>(null)
const videoUrl = ref('')
const error = ref(false)

// 互动数据
const likeCount = ref(0)
const collectCount = ref(0)
const isLiked = ref(false)
const isCollected = ref(false)

// 题目相关数据
interface Quiz {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

const quizList = ref<Quiz[]>([])
const currentQuizIndex = ref(0)
const userAnswers = ref<Record<number, number>>({})
const showAnswer = ref(false)
const quizCompleted = ref(false)

// 推荐视频数据（写死，后续可改为从API读取）
const recommendVideos = ref([
  {
    id: 2,
    title: '舌象辨证 AI 教学：从色泽到苔质的数字化解析',
    views: '15.2万',
    duration: '08:12',
    pic: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    title: '《伤寒论》动态演示：太阳病篇证候演变模拟',
    views: '45.1万',
    duration: '15:20',
    pic: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    title: '针灸实操 AI 引导：足三里穴定位与补泻手法模拟',
    views: '8.9万',
    duration: '05:30',
    pic: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
  },
])

// 当前题目
const currentQuiz = computed(() => {
  if (quizList.value.length === 0) return null
  return quizList.value[currentQuizIndex.value]
})

// 是否有下一题
const hasNextQuiz = computed(() => {
  return currentQuizIndex.value < quizList.value.length - 1
})

// 正确数量
const correctCount = computed(() => {
  let count = 0
  quizList.value.forEach((quiz) => {
    if (userAnswers.value[quiz.id] === quiz.correct) {
      count++
    }
  })
  return count
})

// 正确率
const correctRate = computed(() => {
  if (quizList.value.length === 0) return 0
  return Math.round((correctCount.value / quizList.value.length) * 100)
})

// 加载视频数据
const loadVideoData = async () => {
  try {
    loading.value = true
    error.value = false

    // 构建文件路径
    const basePath = `/AiVideo/data/${videoId.value}`
    const dataUrl = `${basePath}/data.json`
    const mp4Url = `${basePath}/${videoId.value}.mp4`

    // 加载JSON数据
    const response = await fetch(dataUrl)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    videoData.value = data

    // 设置视频URL
    videoUrl.value = mp4Url

    // 加载题目数据
    if (data.quizzes && Array.isArray(data.quizzes)) {
      quizList.value = data.quizzes
    } else {
      // 如果没有题目数据，使用默认题目
      quizList.value = getDefaultQuizzes()
    }

    // 重置答题状态
    currentQuizIndex.value = 0
    userAnswers.value = {}
    showAnswer.value = false
    quizCompleted.value = false

    // 加载互动数据（从localStorage或默认）
    loadInteractionData()
  } catch (err) {
    console.error('加载视频数据出错:', err)
    error.value = true
    message.error('錯誤', {
      note: '加載視頻數據出錯',
      duration: 2000,
    })

    // 使用备用数据
    useFallbackData()
  } finally {
    loading.value = false
  }
}

// 默认题目数据
const getDefaultQuizzes = (): Quiz[] => {
  return [
    {
      id: 1,
      question: '根據視頻內容，面部望診中判斷心氣強弱主要觀察哪個部位？',
      options: ['額頭色澤', '兩眼之間（印堂）', '鼻樑形態', '唇色深淺'],
      correct: 1,
      explanation:
        '視頻中詳細講解，印堂（兩眉之間）是反映心氣盛衰的重要部位，心氣充足則印堂光澤明亮，心氣不足則印堂晦暗。',
    },
    {
      id: 2,
      question: '視頻中提到的 AI 面部望診模擬技術，主要應用了以下哪種算法？',
      options: ['卷積神經網絡 (CNN)', '循環神經網絡 (RNN)', '生成對抗網絡 (GAN)', '強化學習 (RL)'],
      correct: 0,
      explanation:
        '視頻中介紹，AI面部望診主要採用卷積神經網絡（CNN）技術，用於提取面部圖像特徵並進行模式識別。',
    },
    {
      id: 3,
      question: '根據中醫理論，心氣充足者在面部望診中通常會表現出哪些特徵？',
      options: [
        '面色紅潤有光澤，印堂明亮飽滿',
        '面色晦暗無光，印堂發青',
        '面色蒼白，唇色淡白',
        '面色萎黃，面部浮腫',
      ],
      correct: 0,
      explanation:
        '心氣充足的表現包括：面色紅潤、印堂明亮、眼神有神。晦暗、蒼白、萎黃均為氣血不足或其他臟腑問題的表現。',
    },
  ]
}

// 使用备用数据
const useFallbackData = () => {
  videoData.value = {
    id: videoId.value,
    title: '【深度】AI 模拟：如何通过面部望诊判断心气强弱？',
    views: '25.6万',
    duration: '12:45',
    date: '2026-03-25',
    pic: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    tags: ['望诊', 'AI模拟', '心气', '面部诊察', '中医诊断'],
    description:
      '本视频通过深度学习技术，模拟中医面部望诊的全过程。详细讲解如何通过观察面部色泽、神态、五官等特征，判断心气的强弱盛衰。课程包含大量临床案例，结合AI算法分析，帮助学员快速掌握望诊技巧。',
  }
  videoUrl.value = `https://www.w3schools.com/html/mov_bbb.mp4` // 示例视频
  quizList.value = getDefaultQuizzes()
  loadInteractionData()
}

// 加载互动数据
const loadInteractionData = () => {
  const storageKey = `video_${videoId.value}_interaction`
  const savedData = localStorage.getItem(storageKey)
  if (savedData) {
    const data = JSON.parse(savedData)
    likeCount.value = data.likeCount || 0
    collectCount.value = data.collectCount || 0
    isLiked.value = data.isLiked || false
    isCollected.value = data.isCollected || false
  }
}

// 保存互动数据
const saveInteractionData = () => {
  const storageKey = `video_${videoId.value}_interaction`
  const data = {
    likeCount: likeCount.value,
    collectCount: collectCount.value,
    isLiked: isLiked.value,
    isCollected: isCollected.value,
  }
  localStorage.setItem(storageKey, JSON.stringify(data))
}

// 互动方法
const toggleLike = () => {
  if (isLiked.value) {
    likeCount.value--
    isLiked.value = false
    message.info('取消點讚', {
      note: '您已取消點讚',
      duration: 1500,
    })
  } else {
    likeCount.value++
    isLiked.value = true
    message.success('點讚成功', {
      note: '感謝您的支持！',
      duration: 1500,
    })
  }
  saveInteractionData()
}

const toggleCollect = () => {
  if (isCollected.value) {
    collectCount.value--
    isCollected.value = false
    message.info('取消收藏', {
      note: '視頻已從收藏夾移除',
      duration: 1500,
    })
  } else {
    collectCount.value++
    isCollected.value = true
    message.success('收藏成功', {
      note: '視頻已添加到您的收藏夾',
      duration: 1500,
    })
  }
  saveInteractionData()
}

const handleShare = () => {
  message.info('分享', {
    note: '分享功能即將上線',
    duration: 2000,
  })
}

// 答题方法
const selectAnswer = (quizId: number, answerIndex: number) => {
  if (!currentQuiz.value) return
  userAnswers.value[quizId] = answerIndex
  if (showAnswer.value) {
    showAnswer.value = false
  }
}

const submitAnswer = () => {
  if (!currentQuiz.value) {
    message.warning('提示', {
      note: '題目加載中，請稍後',
      duration: 1500,
    })
    return
  }
  if (userAnswers.value[currentQuiz.value.id] === undefined) {
    message.warning('提示', {
      note: '請先選擇答案',
      duration: 1500,
    })
    return
  }

  showAnswer.value = true

  const isCorrect = userAnswers.value[currentQuiz.value.id] === currentQuiz.value.correct
  if (isCorrect) {
    message.success('回答正確！', {
      note: '很棒！繼續加油',
      duration: 2000,
    })
  } else {
    message.error('回答錯誤', {
      note: '別灰心，查看解析學習一下',
      duration: 2000,
    })
  }
}

const nextQuiz = () => {
  if (hasNextQuiz.value) {
    currentQuizIndex.value++
    showAnswer.value = false
  } else {
    quizCompleted.value = true
    message.success('學習完成', {
      note: `恭喜您完成所有題目！正確率：${correctRate.value}%`,
      duration: 3000,
    })
  }
}

const restartQuiz = () => {
  currentQuizIndex.value = 0
  userAnswers.value = {}
  showAnswer.value = false
  quizCompleted.value = false
  message.info('重新開始', {
    note: '已重置所有答案，請重新答題',
    duration: 1500,
  })
}

const goToVideoDetail = (id: number) => {
  router.push(`/AiVedio/introduce/${id}`)
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
.video-detail-main {
  width: 100%;
  min-height: 100vh;
  padding-top: 15vh;
  padding-bottom: 50px;
  font-family: 'NO3', serif;
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

.error-container i {
  font-size: 48px;
  margin-bottom: 20px;
}

.retry-btn {
  margin-top: 20px;
  padding: 10px 30px;
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

/* 详情容器 */
.detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

/* 视频播放区域 */
.video-player-section {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 8px;
  margin-bottom: 40px;
  overflow: hidden;
}

.video-player-wrapper {
  position: relative;
  width: 100%;
  background: #000;
  aspect-ratio: 16 / 9;
}

.video-player {
  width: 100%;
  height: 100%;
  outline: none;
}

.video-duration-badge {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-family: monospace;
}

.video-info-header {
  padding: 30px;
}

.video-title {
  font-size: 28px;
  font-weight: 550;
  color: #2c1e1a;
  margin-bottom: 20px;
  line-height: 1.4;
}

.video-stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8d6e63;
  font-size: 14px;
}

.stat-item i {
  font-size: 16px;
}

/* 详情内容包装器 */
.detail-content-wrapper {
  display: flex;
  gap: 30px;
}

.content-left {
  flex: 2;
}

.content-right {
  flex: 1;
}

/* 通用卡片样式 */
.detail-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 8px;
  margin-bottom: 30px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 25px;
  border-bottom: 1px dashed rgba(166, 124, 82, 0.3);
}

.header-decoration {
  width: 4px;
  height: 24px;
  background: #b71c1c;
}

.header-decoration.ai-deco {
  background: linear-gradient(135deg, #b71c1c, #ff6b6b);
  width: 6px;
  height: 28px;
}

.card-title {
  font-size: 20px;
  color: #5d4037;
  margin: 0;
  font-weight: 550;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title i {
  color: #b71c1c;
}

.ai-badge {
  margin-left: auto;
  font-size: 12px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #b71c1c, #ff6b6b);
  color: #fff;
  border-radius: 20px;
  font-family: '楷体', 'NO3', serif;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-badge i {
  font-size: 11px;
}

.card-content {
  padding: 25px;
}

/* 视频描述 */
.video-description {
  line-height: 1.8;
  color: #4e342e;
  font-size: 16px;
  margin: 0;
  white-space: pre-wrap;
}

/* 标签容器 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  background: rgba(166, 124, 82, 0.12);
  color: #8d6e63;
  border-radius: 30px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'NO3', serif;
  letter-spacing: 1px;
}

.tag-item i {
  font-size: 10px;
}

.tag-item:hover {
  background: rgba(183, 28, 28, 0.15);
  color: #b71c1c;
  transform: translateY(-2px);
}

/* 互动按钮 */
.action-buttons {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: transparent;
  border: 1px solid rgba(166, 124, 82, 0.3);
  border-radius: 40px;
  font-family: 'NO3', serif;
  font-size: 15px;
  color: #5d4037;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.active {
  background: rgba(183, 28, 28, 0.1);
  border-color: #b71c1c;
  color: #b71c1c;
}

.like-btn.active {
  background: rgba(183, 28, 28, 0.1);
  border-color: #b71c1c;
  color: #b71c1c;
}

.collect-btn.active {
  background: rgba(255, 193, 7, 0.1);
  border-color: #ffc107;
  color: #ffc107;
}

.share-btn:hover {
  background: rgba(33, 150, 243, 0.1);
  border-color: #2196f3;
  color: #2196f3;
}

/* AI 题目区域 */
.ai-quiz-card {
  border: 2px solid rgba(183, 28, 28, 0.4);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 25px rgba(183, 28, 28, 0.1);
  margin-bottom: 35px;
}

.quiz-progress {
  margin-bottom: 25px;
}

.progress-text {
  font-size: 13px;
  color: #8d6e63;
  display: block;
  margin-bottom: 8px;
}

.progress-text i {
  margin-right: 6px;
}

.progress-bar {
  height: 6px;
  background: rgba(166, 124, 82, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #b71c1c, #ff6b6b);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.quiz-question {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  padding: 18px;
  background: rgba(183, 28, 28, 0.05);
  border-radius: 12px;
  border-left: 4px solid #b71c1c;
}

.question-icon {
  font-size: 28px;
  color: #b71c1c;
}

.question-text {
  font-size: 18px;
  line-height: 1.6;
  color: #2c1e1a;
  margin: 0;
  flex: 1;
  font-weight: 500;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: rgba(166, 124, 82, 0.05);
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quiz-option:hover:not(.correct):not(.wrong) {
  background: rgba(166, 124, 82, 0.12);
  border-color: #a67c52;
  transform: translateX(5px);
}

.quiz-option.selected {
  background: rgba(183, 28, 28, 0.08);
  border-color: #b71c1c;
  border-width: 1.5px;
}

.quiz-option.correct {
  background: rgba(76, 175, 80, 0.1);
  border-color: #4caf50;
  cursor: default;
}

.quiz-option.wrong {
  background: rgba(244, 67, 54, 0.1);
  border-color: #f44336;
  cursor: default;
}

.option-prefix {
  font-weight: bold;
  color: #8d6e63;
  min-width: 32px;
  font-size: 16px;
}

.option-text {
  flex: 1;
  color: #4a342e;
  font-size: 15px;
  line-height: 1.5;
}

.option-correct-icon,
.option-wrong-icon {
  font-size: 20px;
}

.option-correct-icon {
  color: #4caf50;
}

.option-wrong-icon {
  color: #f44336;
}

.quiz-explanation {
  display: flex;
  gap: 12px;
  padding: 18px;
  background: rgba(33, 150, 243, 0.05);
  border-left: 4px solid #2196f3;
  border-radius: 12px;
  margin-bottom: 25px;
}

.explanation-icon {
  font-size: 20px;
  color: #2196f3;
}

.explanation-text {
  flex: 1;
  line-height: 1.7;
  color: #5d4037;
  font-size: 14px;
}

.explanation-text strong {
  color: #2196f3;
}

.quiz-actions {
  text-align: center;
}

.quiz-btn {
  padding: 12px 40px;
  font-family: 'NO3', serif;
  font-size: 16px;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 1px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.submit-btn,
.next-btn,
.restart-btn {
  background: #b71c1c;
  color: #fff;
}

.submit-btn:hover,
.next-btn:hover,
.restart-btn:hover {
  background: #8b1a1a;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(183, 28, 28, 0.3);
}

.disabled-btn {
  background: #e0d0c5;
  color: #a67c52;
  cursor: not-allowed;
}

/* 完成状态 */
.quiz-completed {
  text-align: center;
  padding: 30px 20px;
}

.completed-icon {
  font-size: 56px;
  margin-bottom: 15px;
  color: #ffc107;
}

.completed-title {
  font-size: 22px;
  color: #2c1e1a;
  margin-bottom: 25px;
  font-weight: 550;
}

.completed-score-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b71c1c, #ff6b6b);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.score-number {
  font-size: 32px;
  font-weight: bold;
}

.score-label {
  font-size: 12px;
  margin-top: 5px;
}

.score-detail {
  text-align: left;
}

.score-detail p {
  margin: 5px 0;
  font-size: 16px;
  color: #5d4037;
}

.score-detail i {
  margin-right: 8px;
}

/* 推荐列表 */
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recommend-item {
  display: flex;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px;
  border-radius: 8px;
}

.recommend-item:hover {
  background: rgba(166, 124, 82, 0.1);
  transform: translateX(5px);
}

.recommend-thumb {
  position: relative;
  width: 120px;
  flex-shrink: 0;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  overflow: hidden;
}

.recommend-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recommend-item:hover .recommend-thumb img {
  transform: scale(1.05);
}

.recommend-duration {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
}

.recommend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.recommend-title {
  font-size: 14px;
  line-height: 1.5;
  color: #2c1e1a;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
}

.recommend-stats {
  font-size: 12px;
  color: #8d6e63;
  display: flex;
  align-items: center;
  gap: 5px;
}

.recommend-stats i {
  font-size: 11px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .detail-container {
    padding: 0 20px;
  }

  .video-title {
    font-size: 24px;
  }

  .detail-content-wrapper {
    flex-direction: column;
  }

  .content-right {
    flex: auto;
  }

  .recommend-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .recommend-item {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .video-detail-main {
    padding-top: 12vh;
  }

  .detail-container {
    padding: 0 15px;
  }

  .video-info-header {
    padding: 20px;
  }

  .video-title {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .video-stats {
    gap: 20px;
  }

  .stat-item {
    font-size: 12px;
  }

  .card-header {
    padding: 15px 20px;
  }

  .card-title {
    font-size: 18px;
  }

  .card-content {
    padding: 20px;
  }

  .video-description {
    font-size: 14px;
  }

  .question-text {
    font-size: 16px;
  }

  .quiz-option {
    padding: 12px 14px;
  }

  .option-text {
    font-size: 14px;
  }

  .quiz-btn {
    padding: 10px 30px;
    font-size: 14px;
  }

  .action-btn {
    padding: 8px 20px;
    font-size: 14px;
  }

  .recommend-list {
    grid-template-columns: 1fr;
  }

  .recommend-thumb {
    width: 100px;
  }

  .recommend-title {
    font-size: 13px;
  }

  .score-circle {
    width: 100px;
    height: 100px;
  }

  .score-number {
    font-size: 28px;
  }
}
</style>
