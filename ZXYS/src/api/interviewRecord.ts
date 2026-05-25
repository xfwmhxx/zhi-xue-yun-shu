import request from '../utils/request'

// 创建面试记录
export const createInterviewRecord = (userId: number) => {
  return request({
    url: '/interview-record/create',
    method: 'post',
    data: { userId },
  })
}

// 完成面试
export const completeInterview = (
  id: number,
  userId: number,
  solveQuestions: any,
  emotionInspect: any,
) => {
  return request({
    url: `/interview-record/${id}/complete`,
    method: 'post',
    data: { solve_questions: solveQuestions, emotion_inspect: emotionInspect, userId },
  })
}

// 上传情绪照片
export const uploadEmotionImage = (id: number, imageFile: File, emotion?: string) => {
  const formData = new FormData()
  formData.append('image', imageFile)
  if (emotion) formData.append('emotion', emotion)

  return request({
    url: `/interview-record/${id}/emotion/upload`,
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 获取面试记录详情
export const getInterviewRecord = (id: number, userId?: number) => {
  return request({
    url: `/interview-record/${id}`,
    method: 'get',
    params: userId ? { userId } : {},
  })
}

// 获取用户面试记录列表
export const getUserInterviewRecords = (userId: number, page = 1, limit = 20, state?: string) => {
  return request({
    url: `/interview-record/user/${userId}/list`,
    method: 'get',
    params: { page, limit, state },
  })
}

// 保存AI分析结果
export const saveAnalysisResult = (id: number, analysisResult: any) => {
  return request({
    url: `/interview-record/${id}/analysis`,
    method: 'post',
    data: { analysis_result: analysisResult },
  })
}
