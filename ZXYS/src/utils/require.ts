// src/utils/request.ts
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY =
  import.meta.env.VITE_DEEPSEEK_API_KEY || 'your_deepseek_api_key'

// 创建本地 API 请求实例（用于项目自己的后端）
const localRequest = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 创建 DeepSeek API 请求实例
const deepseekRequest = axios.create({
  baseURL: DEEPSEEK_API_URL,
  timeout: 60000, // DeepSeek 可能需要更长时间
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
  },
})

// 本地请求拦截器
localRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// DeepSeek 请求拦截器（可添加日志等）
deepseekRequest.interceptors.request.use(
  (config) => {
    console.log('向 DeepSeek API 发送请求:', config.data)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 本地响应拦截器
localRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    // ✅ 只增强，不破坏 AxiosResponse
    ;(response as any).success = true
    ;(response as any).message = '请求成功'
    return response
  },
  (error) => {
    let message = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = error.response.data?.message || `请求错误 ${error.response.status}`
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络'
    } else {
      message = error.message || '请求失败'
    }

    // ❗ 错误也要返回 AxiosResponse 结构
    return Promise.reject({
      ...error,
      success: false,
      message,
    })
  },
)

// DeepSeek 响应拦截器
deepseekRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    // DeepSeek 返回内容
    const content = response.data?.choices?.[0]?.message?.content || ''

    let parsedData: any = content

    try {
      // 尝试提取 JSON 数组
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        parsedData = JSON.parse(content)
      }
    } catch {
      // 解析失败，保留原始文本
      parsedData = content
    }

    // ✅ 关键：挂在 response 上，而不是替换 response
    ;(response as any).parsedData = parsedData
    ;(response as any).success = true
    ;(response as any).rawData = response.data

    return response
  },
  (error) => {
    let message = 'DeepSeek API 请求失败'

    if (error.response) {
      console.error('DeepSeek API 错误响应:', error.response.data)

      switch (error.response.status) {
        case 401:
          message = 'DeepSeek API 密钥无效'
          break
        case 429:
          message = '请求过于频繁，请稍后再试'
          break
        case 500:
          message = 'DeepSeek 服务器错误'
          break
        default:
          message =
            error.response.data?.error?.message || `DeepSeek API 错误: ${error.response.status}`
      }
    } else if (error.request) {
      message = '无法连接到 DeepSeek API，请检查网络'
    } else {
      message = error.message || 'DeepSeek API 请求失败'
    }

    // ❗ 错误也必须返回 Promise.reject
    return Promise.reject({
      success: false,
      data: null,
      message,
      rawError: error,
    })
  },
)

// DeepSeek 专用请求方法
export const deepseekPost = async <T = any>(
  data: {
    model?: string
    messages: Array<{ role: string; content: string }>
    temperature?: number
    max_tokens?: number
    stream?: boolean
  },
  config?: AxiosRequestConfig,
): Promise<{
  success: boolean
  data: T | null
  message: string
  rawData?: any
}> => {
  try {
    const payload = {
      model: data.model || 'deepseek-chat',
      messages: data.messages,
      temperature: data.temperature ?? 0.7,
      max_tokens: data.max_tokens ?? 4000,
      stream: data.stream ?? false,
      ...config?.data,
    }

    const response = await deepseekRequest.post('', payload, config)
    return response as any
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'DeepSeek API 请求失败',
    }
  }
}

// 通用 POST 请求（用于本地 API）
export const apiPost = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<{
  success: boolean
  data: T | null
  message: string
}> => {
  try {
    const response = await localRequest.post(url, data, config)
    return response as any
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '请求失败',
    }
  }
}

// 通用 GET 请求（用于本地 API）
export const apiGet = async <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig,
): Promise<{
  success: boolean
  data: T | null
  message: string
}> => {
  try {
    const response = await localRequest.get(url, { params, ...config })
    return response as any
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '请求失败',
    }
  }
}

// 通用 PUT 请求（用于本地 API）
export const apiPut = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<{
  success: boolean
  data: T | null
  message: string
}> => {
  try {
    const response = await localRequest.put(url, data, config)
    return response as any
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '请求失败',
    }
  }
}

// 通用 DELETE 请求（用于本地 API）
export const apiDelete = async <T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<{
  success: boolean
  data: T | null
  message: string
}> => {
  try {
    const response = await localRequest.delete(url, config)
    return response as any
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '请求失败',
    }
  }
}

// 导出本地请求实例（供特殊情况使用）
export default localRequest

// 导出 DeepSeek 请求实例（供特殊情况使用）
export { deepseekRequest }
