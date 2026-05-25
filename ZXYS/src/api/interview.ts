import request from '../utils/request'

// 生成面试题
export const generateInterviewQuestions = async (userId: number, jobTitle: string) => {
  const result = await request({
    url: '/interview/generate',
    method: 'post',
    data: { user_id: userId, job_title: jobTitle },
    timeout: 60000,
  })
  return result.data
}

// 获取用户已生成的面试题
export const getInterviewQuestions = (userId: number) => {
  return request({
    url: `/interview/${userId}`,
    method: 'get',
    timeout: 10000,
  })
}

// 删除面试准备记录
export const deleteInterviewPreparation = (userId: number) => {
  return request({
    url: `/interview/${userId}`,
    method: 'delete',
    timeout: 10000,
  })
}
