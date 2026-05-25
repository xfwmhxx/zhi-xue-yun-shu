<template>
  <div class="dialog-container glass-effect">
    <DialogHeader
      :connected="appState?.avatar?.connected || false"
      :ttsEnabled="ttsEnabled"
      :toggleTTS="toggleTTS"
    />

    <div class="dialog-content">
      <div class="messages-area" ref="messagesAreaRef">
        <WelcomeMessage
          v-if="showWelcomeMessage"
          :fullText="welcomeMessageFullText"
          :typedText="welcomeTypedText"
          :isTyped="welcomeMessageTyped"
          :ttsEnabled="ttsEnabled"
          :handleSpeakText="handleSpeakText"
        />

        <div v-if="jobDescription && showJobDescription" class="message-wrapper ai-message">
          <div class="message-bubble ai-bubble shadow-soft">
            <div class="job-description-header">
              <span class="job-icon">💼</span>
              <span class="job-label">匹配职位</span>
            </div>
            <div class="job-description-content">
              {{ jobDescription }}
            </div>
          </div>
        </div>

        <MessageBubble
          v-for="message in props.messages"
          :key="message.id"
          :message="message"
          :ttsEnabled="ttsEnabled"
          :handleSpeakText="handleSpeakText"
        />

        <AnsweredQuestion
          v-for="(question, index) in answeredQuestions"
          :key="'answered-' + question.id"
          :question="question"
          :index="index"
          :ttsEnabled="ttsEnabled"
          :handleSpeakText="handleSpeakText"
        />

        <QuestionMessage
          v-if="currentQuestion && !allQuestionsCompleted"
          :question="currentQuestion"
          :typedText="currentQuestionTypedText"
          :isTyped="currentQuestionTyped"
          :ttsEnabled="ttsEnabled"
          :handleSpeakText="handleSpeakText"
        />

        <div class="message-wrapper ai-message" v-if="appState?.asr?.isListening">
          <div class="message-bubble ai-bubble shadow-soft">
            <div class="listening-indicator">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <span>正在聆听，请开始说话...</span>
          </div>
        </div>

        <div class="message-wrapper ai-message" v-if="appState?.avatar?.isSpeaking">
          <div class="message-bubble ai-bubble shadow-soft">
            <div class="thinking-indicator">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <span>AI 正在思考...</span>
          </div>
        </div>

        <div v-if="isLoadingQuestions" class="message-wrapper ai-message">
          <div class="message-bubble ai-bubble typing-dots">正在从服务器加载题目...</div>
        </div>
      </div>

      <VoiceInputArea
        :showInputArea="showInputArea"
        :allQuestionsCompleted="allQuestionsCompleted"
        :voiceText="voiceText"
        :isListening="appState?.asr?.isListening || false"
        :isSubmitting="isSubmitting"
        :connected="appState?.avatar?.connected || false"
        :ttsEnabled="ttsEnabled"
        :handleVoiceInput="handleVoiceInput"
        :clearVoiceText="clearVoiceText"
        :handleSubmitAnswer="handleSubmitAnswer"
        :handleSpeakText="handleSpeakText"
      />

      <div v-if="allQuestionsCompleted && !showAnalysisLoading" class="download-area">
        <button class="download-btn" @click="downloadAnswerRecord">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3V12M12 12L9 9M12 12L15 9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M5 17V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          下载答题情况
        </button>
      </div>
    </div>

    <AnalysisOverlay :show="showAnalysisLoading" :progress="analysisProgress" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, inject } from 'vue'
import { useRouter } from 'vue-router'
import { PopupPlugin } from '@/components/Popup'
import { completeInterview, saveAnalysisResult } from '@/api/interviewRecord'
import { getUserId } from '@/utils/storage'
import { useAsr, isAsrSupported } from './composables/useAsr'
import { useTTS } from './composables/useTTS'
import { useTypingEffect } from './composables/useTypingEffect'
import { useQuestions } from './composables/useQuestions'
import { useTestSession } from './composables/useTestSession'
import { speakWithAvatar, stopAvatarTTS, setAvatarTTSCallbacks } from '@/services/avatarTTS'
import DialogHeader from './components/DialogHeader.vue'
import WelcomeMessage from './components/WelcomeMessage.vue'
import MessageBubble from './components/MessageBubble.vue'
import AnsweredQuestion from './components/AnsweredQuestion.vue'
import QuestionMessage from './components/QuestionMessage.vue'
import VoiceInputArea from './components/VoiceInputArea.vue'
import AnalysisOverlay from './components/AnalysisOverlay.vue'

const props = defineProps({
  interviewStarted: {
    type: Boolean,
    default: false,
  },
  interviewStatus: {
    type: String,
    default: '',
  },
  messages: {
    type: Array,
    default: () => [],
  },
  isAvatarInitializing: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['ai-response-complete', 'answer-selected', 'test-completed'])
const router = useRouter()

const appState = inject('appState')
const appStore = inject('appStore')
const cameraRef = inject('cameraRef')

// ============ 状态变量 ============
const messagesAreaRef = ref(null)
const voiceText = ref('')
let asrInstance = null
const showInputArea = ref(false)
const isSubmitting = ref(false)
const allQuestionsCompleted = ref(false)
const showAnalysisLoading = ref(false)
const analysisProgress = ref(0)
const showWelcomeMessage = ref(true)
const welcomeMessageTyped = ref(false)
const currentQuestionTyped = ref(false)
const showJobDescription = ref(false)
const welcomeMessageFullText =
  '接下来将会进行摸底测试，此次摸底测试将根据您前面所填写的信息匹配对应的情景，后续将根据测试情况设计您的个人画像，辅助后续的个性化学习。'

// ============ Composables ============
const { ttsEnabled, toggleTTS } = useTTS()
const { typedText: welcomeTypedText, startTyping: startWelcomeTyping } = useTypingEffect(25)
const {
  typedText: currentQuestionTypedText,
  startTyping: startQuestionTyping,
  resetTyping: resetQuestionTyping,
} = useTypingEffect(25)

const {
  questionList,
  currentQuestionIndex,
  currentQuestion,
  answeredQuestions,
  isLoadingQuestions,
  jobDescription,
  isGeneratingQuestions,
  interviewId,
  createInterviewRecord,
  loadQuestionsFromBackend,
  loadQuestionsFromJson,
  recordAnswer: recordAnswerToQuestions,
  resetQuestions,
} = useQuestions()

const {
  testSession,
  initSession,
  recordAnswer: recordAnswerToSession,
  completeSession,
  generateExportData: originalGenerateExportData,
  resetSession,
} = useTestSession()

// ============ 辅助函数 ============
const getCurrentUserId = () => {
  const userIdStr = getUserId()
  return userIdStr ? parseInt(userIdStr) : null
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesAreaRef.value) {
      messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight
    }
  })
}

// ============ TTS 相关 ============
const setupTTSCallbacks = () => {
  setAvatarTTSCallbacks({
    onPlayStart: () => {
      console.log('[TTS] 开始播放，触发数字人说话动画')
      if (appState?.avatar) {
        appState.avatar.isSpeaking = true
      }
    },
    onPlayEnd: () => {
      console.log('[TTS] 播放结束，停止数字人说话动画')
      if (appState?.avatar) {
        appState.avatar.isSpeaking = false
      }
    },
    onError: (error) => {
      console.error('[TTS] 播放错误:', error)
      if (appState?.avatar) {
        appState.avatar.isSpeaking = false
      }
    },
  })
}

const handleSpeakText = async (text) => {
  if (!ttsEnabled.value) return
  if (!text || text.trim() === '') return

  if (!appState?.avatar?.connected) {
    console.warn('[TTS] 数字人未连接，无法朗读')
    return
  }

  try {
    await speakWithAvatar(text, {
      voice: 'x4_lingxiaoying_assist',
      speed: 50,
      volume: 80,
      pitch: 50,
    })
  } catch (error) {
    console.error('[TTS] 朗读失败:', error)
  }
}

// ============ 数据导出 ============
const generateExportData = () => {
  const session = testSession.value
  const totalDuration =
    session.endTime && session.startTime
      ? Math.round((session.endTime - session.startTime) / 1000)
      : 0

  const completeQuestionsData = questionList.value.map((q) => {
    const answer = session.answers.find((a) => a.questionId === q.id)
    const answered = answeredQuestions.value.find((aq) => aq.id === q.id)

    const answerLength = answer?.userAnswer?.length || 0
    let quality = '待评估'
    if (answerLength > 100) quality = '优秀'
    else if (answerLength > 50) quality = '良好'
    else if (answerLength > 20) quality = '一般'
    else if (answerLength > 0) quality = '简短'
    else quality = '未回答'

    return {
      type: q.type,
      content: q.content,
      key_points: q.key_points,
      answer_logic: q.answer_logic,
      answer: answer?.userAnswer || answered?.user_answer || '',
      voice_text: answered?.voice_text || answer?.voiceText || '',
      answer_time: answer?.answerTime || answered?.answer_time,
      quality: quality,
    }
  })

  const answeredCount = completeQuestionsData.filter(
    (q) => q.answer && q.answer.trim() !== '',
  ).length

  return {
    sessionId: session.sessionId,
    startTime: new Date(session.startTime).toISOString(),
    endTime: session.endTime ? new Date(session.endTime).toISOString() : null,
    totalDuration: `${Math.floor(totalDuration / 60)}分${totalDuration % 60}秒`,
    totalQuestions: questionList.value.length,
    answeredQuestions: answeredCount,
    completionRate: `${Math.round((answeredCount / questionList.value.length) * 100)}%`,
    jobDescription: jobDescription.value,
    questions: completeQuestionsData,
  }
}

const downloadAsJSON = (exportData) => {
  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  link.download = `interview_answer_${testSession.value.sessionId}_${timestamp}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
  PopupPlugin.showType1({
    title: '下载成功',
    content: [`答题情况已保存为 JSON 文件`],
    onConfirm: () => {},
    onCancel: () => {},
  })
}

const downloadAsCSV = (exportData) => {
  const headers = [
    '题目类型',
    '题目内容',
    '参考答案要点',
    '答题逻辑',
    '用户回答',
    '语音识别文本',
    '回答质量评估',
    '回答时间',
  ]
  const rows = exportData.questions.map((q) => [
    q.type,
    q.content,
    q.key_points || '',
    q.answer_logic || '',
    q.answer || '',
    q.voice_text || '',
    q.quality,
    q.answer_time ? new Date(q.answer_time).toLocaleString() : '未回答',
  ])

  const summaryRows = [
    [],
    ['=== 汇总信息 ==='],
    ['会话ID', exportData.sessionId],
    ['开始时间', exportData.startTime],
    ['结束时间', exportData.endTime || '未完成'],
    ['总时长', exportData.totalDuration],
    ['总题数', exportData.totalQuestions],
    ['已答题数', exportData.answeredQuestions],
    ['完成率', exportData.completionRate],
    ['职位描述', exportData.jobDescription || ''],
  ]

  const allRows = [headers, ...rows, ...summaryRows]
  const csvContent = allRows
    .map((row) =>
      row
        .map((cell) => {
          if (
            typeof cell === 'string' &&
            (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
          ) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        })
        .join(','),
    )
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  link.download = `interview_answer_${testSession.value.sessionId}_${timestamp}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
  PopupPlugin.showType1({
    title: '下载成功',
    content: [`答题情况已保存为 CSV 文件`],
    onConfirm: () => {},
    onCancel: () => {},
  })
}

// 手动提交处理函数
const handleManualSubmit = async (text) => {
  console.log('[DialogArea] 手动提交答案:', text)
  console.log(
    '[DialogArea] 当前题目索引:',
    currentQuestionIndex.value,
    '总题目数:',
    questionList.value.length,
  )

  if (!currentQuestion.value || !text?.trim() || isSubmitting.value) {
    console.log('[DialogArea] 手动提交条件不满足')
    return
  }

  isSubmitting.value = true
  const answer = text.trim()
  const questionSnapshot = {
    id: currentQuestion.value.id,
    type: currentQuestion.value.type,
    content: currentQuestion.value.content,
    key_points: currentQuestion.value.key_points,
    answer_logic: currentQuestion.value.answer_logic,
  }

  console.log('[DialogArea] 手动记录答案快照:', questionSnapshot)

  recordAnswerToQuestions(questionSnapshot, answer, '')
  recordAnswerToSession(questionSnapshot, answer, '')
  if (currentQuestion.value) currentQuestion.value.voice_text = ''

  emit('answer-selected', {
    questionId: currentQuestion.value.id,
    questionType: currentQuestion.value.type,
    answer: answer,
    voiceText: '',
    timestamp: Date.now(),
  })

  if (appState?.asr?.isListening && asrInstance?.stop) {
    asrInstance.stop()
    appStore?.stopVoiceInput()
  }

  await new Promise((r) => setTimeout(r, 800))

  // 关键：增加索引
  currentQuestionIndex.value++
  console.log('[DialogArea] 索引已增加，新索引:', currentQuestionIndex.value)

  // 清空当前题目
  currentQuestion.value = null

  isSubmitting.value = false

  // 显示下一题
  console.log('[DialogArea] 准备显示下一题')
  showNextQuestionWithTyping()
}

const downloadAnswerRecord = () => {
  const exportData = generateExportData()
  if (exportData.questions.length === 0) {
    PopupPlugin.showType3({
      title: '下载失败',
      content: ['暂无答题数据'],
      onConfirm: () => {},
      onCancel: () => {},
    })
    return
  }

  PopupPlugin.showType2({
    title: '选择下载格式',
    content: ['请选择要下载的文件格式：'],
    confirmText: 'JSON',
    cancelText: 'CSV',
    onConfirm: () => downloadAsJSON(exportData),
    onCancel: () => downloadAsCSV(exportData),
  })
}

// ============ 面试完成提交 ============
const submitInterviewComplete = async () => {
  if (!interviewId.value) {
    console.error('[DialogArea] 面试ID不存在')
    return false
  }

  try {
    const solveQuestions = {
      sessionId: testSession.value.sessionId,
      startTime: testSession.value.startTime,
      endTime: testSession.value.endTime,
      totalQuestions: questionList.value.length,
      answeredQuestions: answeredQuestions.value.length,
      completionRate: `${Math.round((answeredQuestions.value.length / questionList.value.length) * 100)}%`,
      questions: questionList.value.map((q) => ({
        id: q.id,
        type: q.type,
        content: q.content,
        user_answer: answeredQuestions.value.find((aq) => aq.id === q.id)?.user_answer || '',
        voice_text: answeredQuestions.value.find((aq) => aq.id === q.id)?.voice_text || '',
      })),
      jobDescription: jobDescription.value,
    }

    let emotionInspect = null
    if (cameraRef?.value) {
      emotionInspect = cameraRef.value.getEmotionAnalysisJson?.()
    }

    const result = await completeInterview(
      interviewId.value,
      getCurrentUserId(),
      solveQuestions,
      emotionInspect,
    )

    if (result.data.code === 200) {
      console.log('[DialogArea] 面试完成提交成功:', result)
      return true
    } else {
      throw new Error(result.data.message || '提交失败')
    }
  } catch (error) {
    console.error('[DialogArea] 提交面试完成失败:', error)
    return false
  }
}

// ============ 测试完成 ============
const completeTest = async () => {
  console.log('[DialogArea] completeTest 调用')
  allQuestionsCompleted.value = true
  showInputArea.value = false
  completeSession()

  if (appState?.asr?.isListening && asrInstance?.stop) {
    asrInstance.stop()
    appStore?.stopVoiceInput()
  }

  const exportData = generateExportData()
  let emotionRecords = null
  if (cameraRef?.value) {
    emotionRecords = cameraRef.value.getEmotionRecordsForUpload?.() || []
    console.log('[DialogArea] 情绪记录数:', emotionRecords.length)
  }

  const finalRecord = {
    questions: questionList.value,
    answers: testSession.value.answers,
    sessionId: testSession.value.sessionId,
    totalCount: testSession.value.totalCount,
    jobDescription: jobDescription.value,
    emotionRecords,
  }

  const progressPercentage = computed(() => {
    if (testSession.value.totalCount === 0) return 0
    return Math.round((testSession.value.answers.length / testSession.value.totalCount) * 100)
  })

  PopupPlugin.showType1({
    title: '摸底测试已结束！',
    content: [
      `您已完成 ${testSession.value.totalCount} 道题目`,
      `完成率: ${progressPercentage.value}%`,
      emotionRecords?.length ? `已记录 ${emotionRecords.length} 次情绪` : '',
      '分析并初始化您的用户画像中...',
      '完成后将会传送至个人中心。',
    ].filter(Boolean),
    onConfirm: async () => {
      showAnalysisLoading.value = true
      analysisProgress.value = 0
      const progressPromise = new Promise((resolve) => {
        const duration = 5000
        const stepTime = 50
        const increment = 100 / (duration / stepTime)
        const interval = setInterval(() => {
          if (analysisProgress.value < 100) analysisProgress.value += increment
          else {
            clearInterval(interval)
            resolve()
          }
        }, stepTime)
      })

      const userId = getCurrentUserId()
      try {
        await submitInterviewComplete()
        // 先保存分析结果到后端
        // 注意：这里需要根据你的实际 AI 分析接口来调整
        // 如果后端有分析接口就调用，没有的话可以暂时跳过
        try {
          // 如果有 AI 分析接口，调用它
          // 例如：const analysisResult = await callAIAnalysis(finalRecord, exportData, emotionRecords)
          // 然后保存结果
          // await saveAnalysisResult(interviewId.value, analysisResult)

          console.log('[DialogArea] AI分析完成')
        } catch (analysisError) {
          console.error('[DialogArea] AI分析失败:', analysisError)
        }
        cameraRef?.value?.clearData?.()
        router.push('/Foundations/userhome/interview')
      } catch (error) {
        console.error('分析失败:', error)
        showAnalysisLoading.value = false
        PopupPlugin.showType3({
          title: '分析异常',
          content: ['请检查网络连接或稍后再试', error.message || ''],
          onConfirm: () => {},
          onCancel: () => {},
        })
      }
    },
    onCancel: () => {},
  })
}

// ============ 题目流程 ============
const showNextQuestionWithTyping = () => {
  console.log('========== [DialogArea] showNextQuestionWithTyping ==========')
  console.log('[DialogArea] currentQuestionIndex:', currentQuestionIndex.value)
  console.log('[DialogArea] questionList 长度:', questionList.value.length)
  console.log(
    '[DialogArea] questionList 内容:',
    questionList.value.map((q) => ({ type: q.type, content: q.content?.substring(0, 30) })),
  )
  console.log('[DialogArea] isAvatarInitializing:', props.isAvatarInitializing)

  // 等待数字人初始化完成
  if (props.isAvatarInitializing) {
    console.log('[DialogArea] 数字人初始化中，等待...')
    setTimeout(() => {
      if (!props.isAvatarInitializing) {
        showNextQuestionWithTyping()
      } else {
        setTimeout(() => {
          showNextQuestionWithTyping()
        }, 500)
      }
    }, 500)
    return
  }

  // 检查是否还有题目
  if (currentQuestionIndex.value >= questionList.value.length) {
    console.log('[DialogArea] 所有题目已完成，调用 completeTest')
    completeTest()
    return
  }

  // 获取当前题目
  const nextQuestion = questionList.value[currentQuestionIndex.value]
  if (!nextQuestion) {
    console.log('[DialogArea] 没有找到题目，等待...')
    setTimeout(() => {
      showNextQuestionWithTyping()
    }, 500)
    return
  }

  // 设置当前题目
  currentQuestion.value = nextQuestion
  console.log('[DialogArea] 设置当前题目:', currentQuestion.value)
  console.log('[DialogArea] 当前题目类型:', currentQuestion.value?.type)
  console.log('[DialogArea] 当前题目内容:', currentQuestion.value?.content?.substring(0, 100))

  // 重置状态
  voiceText.value = ''
  showInputArea.value = false
  currentQuestionTyped.value = false
  isSubmitting.value = false

  // 停止语音识别
  if (appState?.asr?.isListening && asrInstance?.stop) {
    asrInstance.stop()
    appStore?.stopVoiceInput()
  }

  // 重置打字效果
  resetQuestionTyping()

  // 开始打字效果
  console.log('[DialogArea] 开始打字效果，内容:', currentQuestion.value.content)
  startQuestionTyping(currentQuestion.value.content, () => {
    console.log('[DialogArea] 题目打字完成，显示输入区域')
    currentQuestionTyped.value = true
    showInputArea.value = true
  })

  // 立即开始朗读题目
  if (ttsEnabled.value && currentQuestion.value?.content) {
    console.log('[TTS] 立即开始朗读题目:', currentQuestion.value.content?.substring(0, 50))
    setTimeout(() => {
      handleSpeakText(currentQuestion.value.content)
    }, 100)
  }
}

// 提交答案函数 - 确保索引正确递增
const handleSubmitAnswer = async () => {
  console.log('[DialogArea] handleSubmitAnswer 调用, voiceText:', voiceText.value)
  console.log(
    '[DialogArea] 当前题目索引:',
    currentQuestionIndex.value,
    '总题目数:',
    questionList.value.length,
  )

  if (!currentQuestion.value || !voiceText.value.trim() || isSubmitting.value) {
    console.log('[DialogArea] 提交条件不满足')
    return
  }

  isSubmitting.value = true

  const answer = voiceText.value.trim()
  console.log('[DialogArea] 提交答案:', answer.substring(0, 100))

  const questionSnapshot = {
    id: currentQuestion.value.id,
    type: currentQuestion.value.type,
    content: currentQuestion.value.content,
    key_points: currentQuestion.value.key_points,
    answer_logic: currentQuestion.value.answer_logic,
  }

  // 记录答案
  // 使用快照记录答案
  recordAnswerToQuestions(questionSnapshot, answer, voiceText.value)
  recordAnswerToSession(questionSnapshot, answer, voiceText.value)

  if (currentQuestion.value) {
    currentQuestion.value.voice_text = voiceText.value
  }

  emit('answer-selected', {
    questionId: currentQuestion.value.id,
    questionType: currentQuestion.value.type,
    answer: answer,
    voiceText: voiceText.value,
    timestamp: Date.now(),
  })

  if (appState?.asr?.isListening && asrInstance?.stop) {
    asrInstance.stop()
    appStore?.stopVoiceInput()
  }

  // 等待一下再进入下一题
  await new Promise((r) => setTimeout(r, 800))

  // 关键：增加索引
  currentQuestionIndex.value++
  console.log('[DialogArea] 索引已增加，新索引:', currentQuestionIndex.value)

  // 清空当前题目，准备加载下一题
  currentQuestion.value = null

  // 重置提交状态
  isSubmitting.value = false

  // 显示下一题
  console.log('[DialogArea] 准备显示下一题')
  showNextQuestionWithTyping()
}

// ============ 语音识别 ============
const handleVoiceInput = () => {
  if (!isAsrSupported()) {
    PopupPlugin.showType3({
      title: '语音识别不支持',
      content: ['请使用 Chrome 或 Edge 浏览器'],
      onConfirm: () => {},
      onCancel: () => {},
    })
    return
  }

  if (appState?.asr?.isListening) {
    if (asrInstance) asrInstance.stop()
    if (appStore) appStore.stopVoiceInput()
  } else {
    voiceText.value = ''
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => startRecognition())
        .catch(() => {
          PopupPlugin.showType3({
            title: '麦克风权限',
            content: ['请允许麦克风权限以使用语音输入'],
            onConfirm: () => {},
            onCancel: () => {},
          })
        })
    } else {
      startRecognition()
    }
  }
}

const startRecognition = () => {
  // 不要自己创建 asrInstance，让 AppStore 管理
  appStore.startVoiceInput({
    onStart: () => {
      console.log('[DialogArea] 语音识别已启动')
      // 确保 appState.asr.isListening 已更新，由 AppStore 负责
    },
    onResult: (text, isFinal) => {
      if (isFinal) {
        voiceText.value = text
        console.log('[DialogArea] 语音识别结果:', text)
      } else {
        // 临时识别结果可以显示，但不提交
        console.log('[DialogArea] 临时识别:', text)
      }
    },
    onError: (error) => {
      console.error('[DialogArea] 语音识别错误:', error)
      PopupPlugin.showType3({
        title: '语音识别失败',
        content: [error.message || '请重试'],
        onConfirm: () => {},
        onCancel: () => {},
      })
    },
    onStop: () => {
      console.log('[DialogArea] 语音识别已停止')
    },
  })
}

const clearVoiceText = () => {
  voiceText.value = ''
}

// ============ 启动测试 ============
const startTest = async () => {
  if (questionList.value.length > 0) {
    if (!props.isAvatarInitializing && !currentQuestion.value) showNextQuestionWithTyping()
    return
  }

  if (
    welcomeMessageTyped.value &&
    !isLoadingQuestions.value &&
    !isGeneratingQuestions.value &&
    questionList.value.length === 0
  ) {
    const userId = getCurrentUserId()
    if (!userId) {
      PopupPlugin.showType3({
        title: '用户信息缺失',
        content: ['请先登录后再进行测试'],
        onConfirm: () => router.push('/'),
        onCancel: () => {},
      })
      return
    }

    try {
      await createInterviewRecord(userId)
      if (interviewId.value && cameraRef?.value) {
        cameraRef.value.setInterviewId?.(interviewId.value)
      }

      const result = await loadQuestionsFromBackend(userId)
      if (result.success && result.questions.length > 0) {
        testSession.value.questions = questionList.value
        testSession.value.jobDescription = jobDescription.value
        if (jobDescription.value) {
          showJobDescription.value = true
          setTimeout(() => {
            showJobDescription.value = false
          }, 5000)
        }
        if (!props.isAvatarInitializing) showNextQuestionWithTyping()
      } else {
        throw new Error('无可用的测试题目')
      }
    } catch (error) {
      console.error('启动测试失败:', error)
      try {
        await loadQuestionsFromJson()
        if (questionList.value.length > 0) {
          testSession.value.questions = questionList.value
          if (!props.isAvatarInitializing) showNextQuestionWithTyping()
        }
      } catch (localError) {
        console.error('本地加载失败:', localError)
        PopupPlugin.showType3({
          title: '加载失败',
          content: ['无法加载测试题目，请检查网络连接后重试'],
          onConfirm: () => {},
          onCancel: () => {},
        })
      }
    }
  } else {
    setTimeout(() => {
      if (
        welcomeMessageTyped.value &&
        !isLoadingQuestions.value &&
        !isGeneratingQuestions.value &&
        questionList.value.length === 0
      ) {
        startTest()
      }
    }, 1000)
  }
}

// 添加全局调试方法
if (typeof window !== 'undefined') {
  window.__debugDialogArea = {
    getQuestionList: () => {
      console.log('当前题目列表:')
      questionList.value.forEach((q, idx) => {
        console.log(`  [${idx + 1}] ${q.type}: ${q.content?.substring(0, 50)}`)
      })
      return questionList.value
    },
    getCurrentQuestion: () => currentQuestion.value,
    getCurrentIndex: () => currentQuestionIndex.value,
    getAnsweredQuestions: () => answeredQuestions.value,
  }
  console.log(
    '[DialogArea] 调试方法已挂载，可使用 window.__debugDialogArea.getQuestionList() 查看题目',
  )
}

// ============ 监听器 ============
watch(
  () => appState?.avatar?.connected,
  (val) => console.log('[DialogArea] connected:', val),
)
watch(
  () => props.isAvatarInitializing,
  (val) => {
    if (
      !val &&
      welcomeMessageTyped.value &&
      questionList.value.length > 0 &&
      !currentQuestion.value
    ) {
      showNextQuestionWithTyping()
    }
  },
)
watch([welcomeMessageTyped, () => questionList.value.length], ([isTyped, length]) => {
  if (isTyped && length > 0 && !props.isAvatarInitializing && !currentQuestion.value) {
    showNextQuestionWithTyping()
  }
})
watch(
  [
    () => props.messages,
    welcomeTypedText,
    currentQuestionTypedText,
    isLoadingQuestions,
    showInputArea,
    answeredQuestions,
    voiceText,
    () => appState?.asr?.isListening,
    showJobDescription,
  ],
  () => scrollToBottom(),
  { deep: true },
)
watch(
  () => props.interviewStarted,
  (started) => {
    if (started) startTest()
  },
)

// ============ 生命周期 ============
onMounted(() => {
  setupTTSCallbacks()
  initSession()
  if (navigator.mediaDevices?.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {})
  }
  startWelcomeTyping(welcomeMessageFullText, () => {
    welcomeMessageTyped.value = true
    if (props.interviewStarted) startTest()
  })
})

onUnmounted(() => {
  if (appState?.asr?.isListening && asrInstance?.stop) asrInstance.stop()
  stopAvatarTTS()
  if (!testSession.value.isCompleted && testSession.value.answers.length > 0) completeSession()
})
</script>

<style scoped>
.dialog-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  font-family: 'STKaiti', 'SimSun', serif;
  position: relative;
}

.glass-effect {
  background: rgba(255, 253, 247, 0.85);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(166, 124, 82, 0.4);
  box-shadow: 0 15px 35px rgba(90, 57, 33, 0.12);
}

.dialog-container::after {
  content: '';
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(166, 124, 82, 0.15);
  border-radius: 18px;
  pointer-events: none;
  z-index: 0;
}

.dialog-content {
  flex: 1;
  padding: 25px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 5;
}

.messages-area {
  flex: 1;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid rgba(166, 124, 82, 0.1);
  scroll-behavior: smooth;
}

.message-wrapper {
  max-width: 85%;
  animation: messageIn 0.5s ease;
}

.ai-message {
  align-self: flex-start;
}

.message-bubble {
  padding: 14px 20px;
  font-size: 20px;
  line-height: 1.6;
  position: relative;
  border-radius: 20px;
}

.ai-bubble {
  background: #fff;
  border: 1px solid rgba(166, 124, 82, 0.3);
  color: #3d2b1f;
  border-bottom-left-radius: 4px;
}

.job-description-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.2);
}

.job-icon {
  font-size: 18px;
}
.job-label {
  font-size: 14px;
  font-weight: bold;
  color: #a67c52;
}
.job-description-content {
  font-size: 15px;
  line-height: 1.6;
  color: #5a3921;
  background: rgba(166, 124, 82, 0.05);
  padding: 12px;
  border-radius: 12px;
  font-style: italic;
}

.listening-indicator,
.thinking-indicator {
  display: inline-flex;
  gap: 4px;
  margin-right: 8px;
}
.listening-indicator .dot,
.thinking-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a67c52;
  animation: bounce 1.4s infinite ease-in-out both;
}
.listening-indicator .dot:nth-child(1),
.thinking-indicator .dot:nth-child(1) {
  animation-delay: -0.32s;
}
.listening-indicator .dot:nth-child(2),
.thinking-indicator .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-dots::after {
  content: '...';
  animation: dots 1.5s infinite;
}
@keyframes dots {
  0% {
    content: '.';
  }
  33% {
    content: '..';
  }
  66% {
    content: '...';
  }
}

.debug-warning {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 15px;
  color: #856404;
  font-size: 14px;
  text-align: center;
}

.debug-info {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 15px;
  color: #2e7d32;
  font-size: 14px;
  text-align: center;
}

.download-area {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}
.download-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #5a3921, #3d2b1f);
  color: #fff;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(90, 57, 33, 0.2);
}
.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(90, 57, 33, 0.3);
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}
.messages-area::-webkit-scrollbar-thumb {
  background: rgba(166, 124, 82, 0.2);
  border-radius: 10px;
}
</style>
