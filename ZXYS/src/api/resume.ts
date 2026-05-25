import request from '../utils/request'

// 获取用户简历
export const getResume = async (userId: number) => {
  const result = await request({
    url: `/resume/${userId}`,
    method: 'get',
    timeout: 10000,
  })
  return result.data
}

// 更新用户简历
export const updateResume = async (userId: number, data: any) => {
  const result = await request({
    url: `/resume/${userId}`,
    method: 'put',
    data,
    timeout: 10000,
  })
  return result.data
}
