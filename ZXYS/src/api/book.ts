import request, { type ApiResponse } from '../utils/request'

// ========== 类型定义 ==========

// 书籍类型
export interface BookDetail {
  id: number
  name: string
  author: string
  type: 'classic' | 'textbook'
  introduce: string
  volume: string
  tag_count: number
  metadata: Array<{ label: string; value: string }>
  cover_url: string
  doc_path: string
  created_at?: string
  updated_at?: string
}

// 书籍列表项（精简版）
export interface BookListItem {
  id: number
  name: string
  author: string
  type: string
  volume: string
  tag_count: number
  cover_url: string
  introduce: string
}

// 书籍详情（含关联知识点）
export interface BookDetailWithPoints extends BookDetail {
  knowledge_points: Array<{
    id: number
    name: string
    type: number
    description: string
  }>
}

// 书籍章节
export interface BookChapter {
  id: number
  chapter_idx: string
  chapter_name: string
  suggest_time: string
  difficulty_star: string
  key_points_count: number
}

// 题目选项
export interface ProblemOptions {
  A: string
  B: string
  C: string
  D: string
}

// 题目
export interface Problem {
  id: number
  chapter_id: number
  type: string
  stem: string
  difficulty_text: string
  rating: number
  score: number
  tags: string[]
  page_ref: string
  options: ProblemOptions
  answer: string
  analysis: string
  related_kp_ids: string
}

// 章节详情（含题目）
export interface ChapterDetail {
  chapter: {
    id: number
    chapter_idx: string
    chapter_name: string
    suggest_time: string
    difficulty_star: string
    key_points_count: number
    book_name: string
  }
  problems: Problem[]
  user_progress: {
    is_completed: boolean
    quiz_score: number
  } | null
}

// 提交答案参数
export interface SubmitQuizParams {
  user_id: number
  chapter_id: number
  answers: Record<number, string>
}

// 提交答案响应
export interface SubmitQuizResponse {
  earned_score: number
  total_score: number
  percentage: number
  mastery_updates: Array<{
    point_id: number
    mastery_score: number
    improvement: number
  }>
}

// 用户书架项
export interface UserBookshelfItem {
  id: number
  book_id: number
  book: BookListItem
  current_chapter: number
  progress: number
  added_date: string
}

// 添加书架参数
export interface AddToBookshelfParams {
  user_id: number
  book_id: number
}

// 更新阅读进度参数
export interface UpdateProgressParams {
  user_id: number
  book_id: number
  chapter_id: number
  progress: number
}

// 书籍列表查询参数
export interface GetBookListParams {
  type?: string
  page?: number
  limit?: number
}

// 书籍列表响应
export interface BookListResponse {
  total: number
  page: number
  limit: number
  list: BookListItem[]
}

// 从书架移除参数
export interface RemoveFromBookshelfParams {
  user_id: number
  book_id: number
}

// ========== API 函数 ==========

// 获取书籍列表
export const getBookList = async (
  params?: GetBookListParams,
): Promise<ApiResponse<BookListResponse>> => {
  const result = await request({
    url: '/book/books',
    method: 'get',
    params,
  })
  return result.data
}

// 获取书籍详情
export const getBookDetail = async (id: number): Promise<ApiResponse<BookDetailWithPoints>> => {
  const result = await request({
    url: `/book/books/${id}`,
    method: 'get',
  })
  return result.data
}

// 获取书籍章节列表
export const getBookChapters = async (bookId: number): Promise<ApiResponse<BookChapter[]>> => {
  const result = await request({
    url: `/book/books/${bookId}/chapters`,
    method: 'get',
  })
  return result.data
}

// 获取章节详情（含题目）
// 获取章节详情（含题目）- 使用书籍ID和章节序号
export const getChapterDetail = async (
  bookId: number,
  chapterIdx: string,
  userId?: number,
): Promise<ApiResponse<ChapterDetail>> => {
  const result = await request({
    url: `/book/books/${bookId}/chapters/${chapterIdx}`,
    method: 'get',
    params: userId ? { userId } : {},
  })
  return result.data
}

// 提交章节测验答案
export const submitQuiz = (params: SubmitQuizParams): Promise<ApiResponse<SubmitQuizResponse>> => {
  return request({
    url: '/book/quiz/submit',
    method: 'post',
    data: params,
  })
}

// 获取用户书架
export const getUserBookshelf = async (
  userId: number,
): Promise<ApiResponse<UserBookshelfItem[]>> => {
  const result = await request({
    url: `/book/bookshelf/${userId}`,
    method: 'get',
  })
  return result.data
}

// 添加到书架
export const addToBookshelf = async (
  params: AddToBookshelfParams,
): Promise<ApiResponse<UserBookshelfItem>> => {
  const result = await request({
    url: '/book/bookshelf/add',
    method: 'post',
    data: params,
  })
  return result.data
}

// 更新阅读进度
export const updateReadingProgress = (
  params: UpdateProgressParams,
): Promise<ApiResponse<UserBookshelfItem>> => {
  return request({
    url: '/book/bookshelf/progress',
    method: 'put',
    data: params,
  })
}

// 从书架移除
export const removeFromBookshelf = async (
  params: RemoveFromBookshelfParams,
): Promise<ApiResponse<null>> => {
  const result = await request({
    url: '/book/bookshelf/remove',
    method: 'delete',
    data: params,
  })
  return result.data
}
