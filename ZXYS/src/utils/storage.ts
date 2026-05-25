// 用户信息类型
export interface UserInfo {
  id: number
  email: string
  username: string
  user_type: number | null
  is_initialized: number
  is_today_registered?: boolean
}

// 存储key常量
const USER_ID_KEY = 'userId'
const USER_INFO_KEY = 'userInfo'
const TODAY_REGISTERED_KEY = 'isTodayRegistered'

export const setTodayRegistered = (isTodayRegistered: boolean): void => {
  localStorage.setItem(TODAY_REGISTERED_KEY, JSON.stringify(isTodayRegistered))
}

// 获取今日注册状态
export const getTodayRegistered = (): boolean | null => {
  const value = localStorage.getItem(TODAY_REGISTERED_KEY)
  return value ? JSON.parse(value) : null
}

// 移除今日注册状态
export const removeTodayRegistered = (): void => {
  localStorage.removeItem(TODAY_REGISTERED_KEY)
}

// 存储用户ID
export const setUserId = (userId: number): void => {
  localStorage.setItem(USER_ID_KEY, userId.toString())
}

// 获取用户ID
export const getUserId = (): string | null => {
  return localStorage.getItem(USER_ID_KEY)
}

// 移除用户ID
export const removeUserId = (): void => {
  localStorage.removeItem(USER_ID_KEY)
}

// 存储用户信息
export const setUserInfo = (userInfo: UserInfo): void => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

// 获取用户信息
export const getUserInfo = (): UserInfo | null => {
  const info = localStorage.getItem(USER_INFO_KEY)
  return info ? JSON.parse(info) : null
}

// 移除用户信息
export const removeUserInfo = (): void => {
  localStorage.removeItem(USER_INFO_KEY)
}

// 清除所有用户数据（退出登录）
export const clearUserData = (): void => {
  removeUserId()
  removeUserInfo()
  removeTodayRegistered()
}
