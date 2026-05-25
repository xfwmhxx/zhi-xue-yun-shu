import request, { type ApiResponse } from '../utils/request'

// ========== 类型定义 ==========

// 知识点类型枚举
export enum KnowledgePointType {
  THEORY = 1, // 理论
  PRESCRIPTION = 2, // 方剂
  ACUPOINT = 3, // 穴位/中药
  PATHOGENESIS = 4, // 病机
}

// 知识点
export interface KnowledgePoint {
  id: number
  name: string
  type: number
  description: string
  created_at: string
  updated_at: string
}

// 知识点关系边
export interface KnowledgeRelation {
  source_id: number
  target_id: number
  relation: string
}

// 完整图谱数据
export interface KnowledgeGraph {
  nodes: KnowledgePoint[]
  edges: KnowledgeRelation[]
}

// 知识点详情（包含关联关系）
export interface KnowledgePointDetail extends KnowledgePoint {
  relations: {
    outgoing: Array<{
      relation: string
      target: KnowledgePoint
    }>
    incoming: Array<{
      relation: string
      source: KnowledgePoint
    }>
  }
}

// 关联知识点
export interface RelatedPoint {
  id: number
  name: string
  type: number
}

// 掌握度记录
export interface UserMastery {
  id?: number
  user_id: number
  point_id: number
  mastery_score: number
  error_count: number
  last_update: string | null
  KnowledgePoint?: KnowledgePoint
}

// 更新掌握度参数
export interface UpdateMasteryParams {
  user_id: number
  point_id: number
  problem_id?: number // 新增：题目ID
  is_correct: boolean
}

// 批量更新掌握度参数
export interface BatchUpdateMasteryParams {
  user_id: number
  results: Array<{
    point_id: number
    is_correct: boolean
  }>
}

// 知识点列表查询参数
export interface GetPointsParams {
  type?: number
  page?: number
  limit?: number
}

// 知识点列表响应
export interface PointsListResponse {
  total: number
  page: number
  limit: number
  list: KnowledgePoint[]
}

// ========== API 函数 ==========

// 获取所有知识点列表
export const getKnowledgePoints = (
  params?: GetPointsParams,
): Promise<ApiResponse<PointsListResponse>> => {
  return request({
    url: '/knowledge/points',
    method: 'get',
    params,
  })
}

// 获取单个知识点详情
export const getKnowledgePointById = (id: number): Promise<ApiResponse<KnowledgePointDetail>> => {
  return request({
    url: `/knowledge/points/${id}`,
    method: 'get',
  })
}

// 获取完整知识图谱（节点+边）
export const getKnowledgeGraph = async (): Promise<ApiResponse<KnowledgeGraph>> => {
  const result = await request({
    url: '/knowledge/graph',
    method: 'get',
  })
  return result.data
}

// 获取某个知识点的关联知识点
export const getRelationsByPoint = async (
  pointId: number,
): Promise<ApiResponse<KnowledgeRelation[]>> => {
  const result = await request({
    url: `/knowledge/relations/${pointId}`,
    method: 'get',
  })
  return result.data
}

// ========== 掌握度相关 API ==========

// 获取用户所有知识点掌握度
export const getUserMastery = async (userId: number): Promise<ApiResponse<UserMastery[]>> => {
  const result = await request({
    url: `/knowledge/mastery/user/${userId}`,
    method: 'get',
  })
  return result.data
}

// 获取用户对单个知识点的掌握度
export const getPointMastery = (
  userId: number,
  pointId: number,
): Promise<ApiResponse<UserMastery>> => {
  return request({
    url: `/knowledge/mastery/${userId}/${pointId}`,
    method: 'get',
  })
}

// 更新单个知识点掌握度（答题后调用）
export const updateMastery = async (
  params: UpdateMasteryParams,
): Promise<
  ApiResponse<{
    mastery_score: number
    error_count: number
    improvement: string
    point_name: string
  }>
> => {
  const result = await request({
    url: '/knowledge/mastery/update',
    method: 'post',
    data: params,
  })
  return result.data
}

// 批量更新掌握度（一次答题涉及多个知识点）
export const batchUpdateMastery = (
  params: BatchUpdateMasteryParams,
): Promise<
  ApiResponse<
    Array<{
      point_id: number
      mastery_score: number
      error_count: number
    }>
  >
> => {
  return request({
    url: '/knowledge/mastery/batch-update',
    method: 'post',
    data: params,
  })
}

// 根据用户类型随机获取知识点
export const getRandomPoints = async (
  userType: number,
  count: number = 5,
): Promise<ApiResponse<KnowledgePoint[]>> => {
  const result = await request({
    url: '/knowledge/random-points',
    method: 'get',
    params: { userType, count },
  })
  return result.data
}

// 摸底测试批量更新掌握度（只加分）
export const batchAddMastery = (
  userId: number,
  results: Array<{ point_id: number; is_correct: boolean }>,
): Promise<
  ApiResponse<
    Array<{
      point_id: number
      mastered: boolean
      mastery_score: number
    }>
  >
> => {
  return request({
    url: '/knowledge/mastery/batch-add',
    method: 'post',
    data: {
      user_id: userId,
      results,
    },
  })
}

// 获取用户某段时间内的知识点浮动统计
export const getUserFloatStats = async (
  userId: number,
  startDate: string,
  endDate: string,
): Promise<ApiResponse<any[]>> => {
  const result = await request({
    url: `/knowledge/float-stats/${userId}`,
    method: 'get',
    params: { startDate, endDate },
  })
  return result.data
}

// 获取用户今日学习活跃度
export const getTodayActivity = async (
  userId: number,
): Promise<ApiResponse<{ date: string; total_interactions: number }>> => {
  const result = await request({
    url: `/knowledge/today-activity/${userId}`,
    method: 'get',
  })
  return result.data
}

// 获取今日所有知识点的浮动详情（用于日志列表）
export const getTodayKpDetails = async (userId: number) => {
  const result = await request({
    url: `/knowledge/today-details/${userId}`,
    method: 'get',
  })
  return result.data
}
