import request, { type ApiResponse } from '../utils/request'

// 题目类型
export interface Question {
  text: string
  options: string[]
  correctAnswer: number
  pointId: number
}

// 生成题目响应
export interface GenerateQuizResponse {
  questions: Question[]
  sourcePoints: Array<{
    id: number
    name: string
    description: string
  }>
}

// 生成题目参数
export interface GenerateQuizParams {
  userType: number
  pointIds: number[]
}

// 生成题目
export const generateQuiz = async (
  params: GenerateQuizParams,
): Promise<ApiResponse<GenerateQuizResponse>> => {
  const result = await request({
    url: '/ai/generate-quiz',
    method: 'post',
    data: params,
  })
  return result.data
}

// 生成AI学习总结
export const getAISummary = async (userId: number): Promise<ApiResponse<any>> => {
  const result = await request({
    url: '/ai/summary',
    method: 'post',
    data: { user_id: userId },
  })
  return result.data
}

// 中医AI分析接口
export const FJPWAnalyze = async (prompt: any) => {
  const result = await request({
    url: '/ai/FJPW/analyze',
    method: 'post',
    data: { prompt },
    timeout: 60000, // AI接口需要较长超时时间
  })
  return result.data // 返回 { code, data }
}

// ===============以下是 基于知识图谱的智能问答助手 的功能
// 知识图谱相关类型定义
export interface KnowledgeGraphNode {
  id: string
  name: string
  type: string
  desc: string
}

export interface KnowledgeGraphLink {
  source: string
  target: string
  relation: string
  type: string
  color: string
}

export interface NodeTypeDefinition {
  name: string
  color: string
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[]
  links: KnowledgeGraphLink[]
  nodeTypes: Record<string, NodeTypeDefinition>
  centerNodeId?: string
}

export interface ChatQAResponse {
  reply: string
  knowledgeGraph: KnowledgeGraph
}

// 中医问答接口（返回文本+知识图谱）
export const chatQA = async (question: string): Promise<ApiResponse<ChatQAResponse>> => {
  const result = await request({
    url: '/ai/chat-qa',
    method: 'post',
    data: { question },
    timeout: 60000,
  })
  return result.data
}
