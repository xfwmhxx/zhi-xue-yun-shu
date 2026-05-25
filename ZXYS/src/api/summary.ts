import request, { type ApiResponse } from '../utils/request'

// 任务类型
export interface DailyTask {
  id: number
  task_name: string
  task_type: string
  goal_value: number
  current_value: number
  status: number
}

// 总结数据
export interface SummaryData {
  summary: {
    report_info: {
      today_str: string
      yesterday_score: number
    }
    narrative: {
      summary_line: string
      ai_analysis_content: string
    }
    knowledge_status: {
      positive_kps: string[]
      negative_kps: string[]
    }
    charts: {
      radar_values: number[]
      rose_values: Array<{ name: string; value: number }>
      growth_values: Array<{ name: string; value: number }>
      weakness_values: Array<{ name: string; value: number }>
    }
  }
  tasks: DailyTask[]
}

// 请求生成总结
export const generateSummary = async (userId: number): Promise<ApiResponse<null>> => {
  const result = await request({
    url: '/summary/generate',
    method: 'post',
    data: { user_id: userId },
  })
  return result.data
}

// 获取今日总结（轮询）
export const getTodaySummary = async (userId: number): Promise<ApiResponse<SummaryData>> => {
  const result = await request({
    url: `/summary/today/${userId}`,
    method: 'get',
  })
  return result.data
}

// 更新任务进度
export const updateTaskProgress = async (
  taskId: number,
  userId: number,
  currentValue: number,
): Promise<ApiResponse<DailyTask>> => {
  const result = await request({
    url: `/summary/task/${taskId}`,
    method: 'put',
    data: { user_id: userId, current_value: currentValue },
  })
  return result.data
}
