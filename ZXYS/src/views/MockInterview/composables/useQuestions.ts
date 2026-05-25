// src/components/MockInterview/composables/useQuestions.ts
import { ref } from 'vue'
import { PopupPlugin } from '@/components/Popup'
import type { Question } from '../types'
import { createInterviewRecord as createRecordAPI } from '@/api/interviewRecord'
import { getInterviewQuestions } from '@/api/interview'

export function useQuestions() {
  const questionList = ref<Question[]>([])
  const currentQuestionIndex = ref(0)
  const currentQuestion = ref<Question | null>(null)
  const answeredQuestions = ref<Question[]>([])
  const isLoadingQuestions = ref(false)
  const jobDescription = ref('')
  const isGeneratingQuestions = ref(false)
  const interviewId = ref<number | null>(null)
  const hasCreatedRecord = ref(false)
  const hasLoadedQuestions = ref(false)

  /**
   * 创建面试记录
   */
  const createInterviewRecord = async (userId: number): Promise<boolean> => {
    if (hasCreatedRecord.value) {
      console.log('[useQuestions] 面试记录已存在，跳过创建')
      return true
    }

    if (isGeneratingQuestions.value) return false

    isGeneratingQuestions.value = true

    try {
      const result = await createRecordAPI(userId)
      if (result.data.code === 200 && result.data.data) {
        interviewId.value = result.data.data.id
        jobDescription.value = result.data.data.jobDescription || ''
        hasCreatedRecord.value = true
        console.log('[useQuestions] 面试记录创建成功，面试ID:', interviewId.value)
        return true
      } else {
        throw new Error(result.data.message || '创建面试记录失败')
      }
    } catch (error) {
      console.error('[useQuestions] 创建面试记录失败:', error)
      return false
    } finally {
      isGeneratingQuestions.value = false
    }
  }
  /**
   * 从后端加载题目
   */
  const loadQuestionsFromBackend = async (userId: number) => {
    if (hasLoadedQuestions.value && questionList.value.length > 0) {
      console.log('[useQuestions] 题目已加载，跳过重复加载')
      return {
        success: true,
        questions: questionList.value,
        jobDescription: jobDescription.value,
        questionCount: questionList.value.length,
        hasRecord: true,
      }
    }

    isLoadingQuestions.value = true

    try {
      const result = await getInterviewQuestions(userId)

      if (result.data.code === 200 && result.data.data) {
        const data = result.data.data

        if (!jobDescription.value) {
          jobDescription.value = data.jobDescription || ''
        }

        let questions: Question[] = data.questions.map((q: any, index: number) => ({
          id: index + 1,
          type: q.type,
          content: q.content,
          key_points: q.key_points || '',
          answer_logic: q.answer_logic || '',
          user_answer: undefined,
          answer_time: undefined,
          voice_text: undefined,
        }))

        if (!hasLoadedQuestions.value) {
          const selfIntroductionQuestion: Question = {
            id: questions.length + 1,
            type: '自我介绍',
            content:
              '同学你好，欢迎参加本次面试。我是本次的主考官。所谓‘望闻问切’，今日便是我们相互了解的过程。首先，请你用 2-3 分钟时间​ 简要介绍一下你自己，包括你的教育背景、专业特长以及为什么选择我们这个岗位。',
            key_points: '表达清晰、逻辑完整、突出个人优势',
            answer_logic: '建议包含：个人基本信息、专业背景、工作经验、个人优势、职业目标等',
            user_answer: undefined,
            answer_time: undefined,
            voice_text: undefined,
          }
          questions = [selfIntroductionQuestion, ...questions]
        }

        questionList.value = questions
        hasLoadedQuestions.value = true

        isLoadingQuestions.value = false

        return {
          success: true,
          questions: questionList.value,
          jobDescription: jobDescription.value,
          questionCount: data.questionCount,
          hasRecord: data.hasRecord,
        }
      } else {
        throw new Error(result.data.message || '加载题目失败')
      }
    } catch (error: any) {
      console.error('[useQuestions] 加载题目失败:', error)
      isLoadingQuestions.value = false
      throw error
    }
  }

  /**
   * 从本地 JSON 文件加载题目（备用方案）
   */
  const loadQuestionsFromJson = async () => {
    if (hasLoadedQuestions.value && questionList.value.length > 0) {
      console.log('[useQuestions] 题目已加载，跳过')
      return
    }

    isLoadingQuestions.value = true

    try {
      const response = await fetch('/questions.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('[useQuestions] 本地JSON数据:', data)

      const questions = Array.isArray(data) ? data : [data]
      questionList.value = questions.map((q: any, index: number) => ({
        ...q,
        id: index + 1,
        user_answer: undefined,
        answer_time: undefined,
        voice_text: undefined,
      }))
      hasLoadedQuestions.value = true

      console.log(`[useQuestions] 成功从本地加载 ${questionList.value.length} 道题目:`)
      questionList.value.forEach((q, idx) => {
        console.log(`  第${idx + 1}题: ${q.type} - ${q.content?.substring(0, 50)}`)
      })
    } catch (error) {
      console.error('加载题目失败:', error)
      throw error
    } finally {
      isLoadingQuestions.value = false
    }
  }

  /**
   * 记录答案
   */
  const recordAnswer = (question: Question, answer: string, voiceText?: string) => {
    console.log('[useQuestions] recordAnswer 被调用', {
      questionId: question.id,
      questionType: question.type,
      answerLength: answer.length,
      voiceTextLength: voiceText?.length || 0,
    })

    // 🔴 关键修复：不要依赖传入的 question 对象引用，而是从 questionList 中根据 ID 获取原始题目
    const originalQuestion = questionList.value.find((q) => q.id === question.id)

    if (!originalQuestion) {
      console.error('[useQuestions] 找不到原始题目，ID:', question.id)
      return
    }

    const updatedQuestion = {
      ...question,
      user_answer: answer,
      answer_time: Date.now(),
      voice_text: voiceText || '',
    }

    const existingIndex = answeredQuestions.value.findIndex((q) => q.id === question.id)

    if (existingIndex !== -1) {
      // 更新已有记录
      answeredQuestions.value[existingIndex] = updatedQuestion
      console.log('[useQuestions] 更新已有答案，索引:', existingIndex, '题目ID:', question.id)
    } else {
      // 添加新记录
      answeredQuestions.value.push(updatedQuestion)
      console.log(
        '[useQuestions] 添加新答案，当前已回答数量:',
        answeredQuestions.value.length,
        '题目ID:',
        question.id,
      )
    }
  }

  const resetQuestions = () => {
    console.log('[useQuestions] 重置所有题目数据')
    questionList.value = []
    currentQuestionIndex.value = 0
    currentQuestion.value = null
    answeredQuestions.value = []
    isLoadingQuestions.value = false
    jobDescription.value = ''
    isGeneratingQuestions.value = false
    interviewId.value = null
    hasCreatedRecord.value = false
    hasLoadedQuestions.value = false
  }

  return {
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
    recordAnswer,
    resetQuestions,
    totalQuestions: questionList,
  }
}
