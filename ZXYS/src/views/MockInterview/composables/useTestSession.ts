// composables/useTestSession.ts
import { ref } from 'vue'
import type { TestSession, AnswerRecord, Question, ExportData } from '../types'

export function useTestSession() {
  const testSession = ref<TestSession>({
    sessionId: '',
    startTime: Date.now(),
    endTime: null,
    isCompleted: false,
    questions: [],
    answers: [],
    totalCount: 0,
    correctCount: 0,
    totalScore: 0
  })

  const generateSessionId = () => {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const initSession = () => {
    testSession.value.sessionId = generateSessionId()
    testSession.value.startTime = Date.now()
  }

  const recordAnswer = (question: Question, answer: string, voiceText?: string) => {
    const answerRecord: AnswerRecord = {
      questionId: question.id || 0,
      questionType: question.type,
      content: question.content,
      userAnswer: answer,
      voiceText: voiceText || '',
      keyPoints: question.key_points,
      answerLogic: question.answer_logic,
      answerTime: Date.now(),
      timestamp: Date.now()
    }
    
    testSession.value.answers.push(answerRecord)
    testSession.value.totalCount = testSession.value.answers.length
  }

  const completeSession = () => {
    testSession.value.endTime = Date.now()
    testSession.value.isCompleted = true
  }

  const generateExportData = (jobDescription: string, questionList: Question[], answeredQuestions: Question[]): ExportData => {
    const session = testSession.value
    const totalDuration = session.endTime && session.startTime 
      ? Math.round((session.endTime - session.startTime) / 1000) 
      : 0
    
    // 构建完整的题目数据，包含用户回答和语音文字
    const completeQuestionsData = questionList.map((q, index) => {
      // 查找对应的答案
      const answer = session.answers.find(a => a.questionId === q.id)
      // 查找已回答的问题
      const answered = answeredQuestions.find(aq => aq.id === q.id)
      
      const answerLength = answer?.userAnswer?.length || 0
      let quality = '待评估'
      if (answerLength > 100) quality = '优秀'
      else if (answerLength > 50) quality = '良好'
      else if (answerLength > 20) quality = '一般'
      else if (answerLength > 0) quality = '简短'
      else quality = '未回答'
      
      return {
        id: q.id || 0,
        type: q.type,
        content: q.content,
        key_points: q.key_points,
        answer_logic: q.answer_logic,
        user_answer: answer?.userAnswer || answered?.user_answer || '',
        voice_text: answered?.voice_text || answer?.voiceText || '',
        answer_time: answer?.answerTime || answered?.answer_time || null,
        answer_length: answerLength,
        quality: quality,
        has_answered: !!answer || !!answered?.user_answer
      }
    })
    
    // 统计答题情况
    const answeredCount = completeQuestionsData.filter(q => q.has_answered).length
    const unansweredQuestions = completeQuestionsData.filter(q => !q.has_answered).map(q => ({
      id: q.id,
      type: q.type,
      content: q.content
    }))
    
    return {
      sessionId: session.sessionId,
      startTime: new Date(session.startTime).toISOString(),
      endTime: session.endTime ? new Date(session.endTime).toISOString() : null,
      totalDuration: `${Math.floor(totalDuration / 60)}分${totalDuration % 60}秒`,
      totalQuestions: questionList.length,
      answeredQuestions: answeredCount,
      unansweredQuestions: unansweredQuestions.length,
      completionRate: `${Math.round((answeredCount / questionList.length) * 100)}%`,
      jobDescription: jobDescription,
      questions: completeQuestionsData,
      answers: session.answers,
      summary: {
        totalAnswers: session.answers.length,
        averageAnswerLength: Math.round(
          session.answers.reduce((sum, a) => sum + a.userAnswer.length, 0) / session.answers.length
        ) || 0,
        answeredQuestionsList: completeQuestionsData.filter(q => q.has_answered).map(q => ({
          type: q.type,
          content: q.content,
          user_answer: q.user_answer,
          voice_text: q.voice_text
        }))
      }
    }
  }

  const resetSession = () => {
    testSession.value = {
      sessionId: '',
      startTime: Date.now(),
      endTime: null,
      isCompleted: false,
      questions: [],
      answers: [],
      totalCount: 0,
      correctCount: 0,
      totalScore: 0
    }
  }

  return {
    testSession,
    initSession,
    recordAnswer,
    completeSession,
    generateExportData,
    resetSession
  }
}