import request, { type ApiResponse } from '../utils/request'

// ========== 类型定义 ==========

// 发送验证码请求参数
export interface SendCodeParams {
  email: string
}

// 发送验证码响应
export interface SendCodeResponse {
  message: string
}

// 登录请求参数
export interface LoginParams {
  email: string
  password: string
}

// 登录响应数据
export interface LoginData {
  id: number
  email: string
  username: string
  user_type: number | null
  is_initialized: number
  is_today_registered: boolean
}

// 注册请求参数
export interface RegisterParams {
  email: string
  username: string
  password: string
  code: string
}

// 注册响应数据
export interface RegisterData {
  id: number
  email: string
  username: string
  is_initialized: number
}

// 初始化用户参数
export interface InitializeUserParams {
  user_id: number
  user_type: number
}

// 用户画像数据类型
export interface UserPortraitData {
  name: string
  userId: number
  overallScore: number
  overallLevel: string
  coreScores: {
    theoryScore: number
    syndromeScore: number
    clinicalScore: number
    researchScore: number
    classicScore: number
  }
  progressData: {
    neijing: number
    shanghanlun: number
    jinguiyaolue: number
    wenbingtiaobian: number
    shennongbencaojing: number
  }
  dimensionData: {
    zangxiang: number
    jingluo: number
    bingyin: number
    zhize: number
    fangjixue: number
  }
  radarValues: number[]
  advantageAreas: string[]
  weaknessAreas: string[]
  recommendLearning: string[] // 新增
  recommendCourses: string[] // 新增
  recommendBooks: string[] // 新增
  adviceText: string // 新增
  generatedAt: string
}

// 获取用户画像响应
export interface UserPortraitResponse {
  portrait: UserPortraitData
  updatedAt: string
}

// ========== API函数 ==========

// 发送验证码
export const sendCode = async (email: string): Promise<ApiResponse<SendCodeResponse>> => {
  const result = await request({
    url: '/auth/send-code',
    method: 'post',
    data: { email },
  })
  return result.data
}

// 登录
export const login = async (data: LoginParams): Promise<ApiResponse<LoginData>> => {
  const result = await request({
    url: '/auth/login',
    method: 'post',
    data,
  })
  return result.data
}

// 注册
export const register = async (data: RegisterParams): Promise<ApiResponse<RegisterData>> => {
  const result = await request({
    url: '/auth/register',
    method: 'post',
    data,
  })
  return result.data
}

// 初始化用户
export const initializeUser = async (
  params: InitializeUserParams,
): Promise<
  ApiResponse<{
    id: number
    email: string
    username: string
    user_type: number
    is_initialized: number
  }>
> => {
  const result = await request({
    url: '/auth/initialize',
    method: 'post',
    data: params,
  })
  return result.data
}

// 获取用户画像
export const getUserPortrait = async (
  userId: number,
): Promise<ApiResponse<UserPortraitResponse>> => {
  const result = await request({
    url: `/summary/portrait/${userId}`,
    method: 'get',
  })
  return result.data
}
