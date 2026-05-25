import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

// 响应数据统一结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const BackendUrl = import.meta.env.VITE_API_URL

// 创建axios实例
const request: AxiosInstance = axios.create({
  // baseURL: 'https://gooddemo.top/api',
  baseURL: `${BackendUrl}`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取用户ID
    const userId = localStorage.getItem('userId')
    if (userId && config.headers) {
      config.headers['X-User-Id'] = userId
    }

    // 可选：添加loading状态
    if ((config as any).showLoading) {
      // 可以在这里添加loading显示逻辑
    }

    return config
  },
  (error: any) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    // 根据后端返回的code判断
    // 允许 102（生成中）和 202（无数据）通过，不当作错误处理
    if (
      res.code !== 200 &&
      res.code !== 102 &&
      res.code !== 201 &&
      res.code !== 202 &&
      res.code !== 204 &&
      res.code !== 204
    ) {
      // 401未授权
      if (res.code === 401) {
        localStorage.removeItem('userId')
        localStorage.removeItem('userInfo')
        window.location.href = '/'
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return response
  },
  (error: any) => {
    // 网络错误处理
    if (error.message?.includes('Network Error')) {
      console.error('网络连接失败，请检查网络')
    } else if (error.message?.includes('timeout')) {
      console.error('请求超时，请重试')
    } else {
      console.error(error.message || '服务器错误')
    }

    return Promise.reject(error)
  },
)

export default request
