// import request, { type ApiResponse } from '../utils/request'
// import { type UserInfo } from '../utils/storage'

// // ========== 类型定义 ==========

// // 更新用户信息请求参数
// export interface UpdateUserParams {
//   username?: string
//   user_type?: number
// }

// // 初始化请求参数
// export interface InitializeParams {
//   user_type: number // 1-中医学者, 2-中医求职者, 3-中医通识者
// }

// // ========== API函数 ==========

// // 获取用户信息
// export const getUserInfo = async (userId: number): Promise<ApiResponse<UserInfo>> => {
//   const result = await request({
//     url: '/user/info',
//     method: 'get',
//     params: { userId },
//   })
//   return result.data
// }

// // 更新用户信息
// export const updateUserInfo = async (
//   data: UpdateUserParams,
// ): Promise<ApiResponse<{ message: string }>> => {
//   const result = await request({
//     url: '/user/update',
//     method: 'put',
//     data,
//   })
//   return result.data
// }

// // 完成初始化（设置用户类型）
// export const initializeUser = async (
//   data: InitializeParams,
// ): Promise<ApiResponse<{ is_initialized: number }>> => {
//   const result = await request({
//     url: '/user/initialize',
//     method: 'post',
//     data,
//   })
//   return result.data
// }
