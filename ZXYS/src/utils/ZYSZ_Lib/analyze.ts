// analyze.ts - 舌象解析模块（添加详细日志）

import { BASE_DRINKS, getDrinks } from './rules'
import { buildMessages } from './prompts'
import { callQwen } from './qwenClient'

// ==================== 日志工具函数 ====================
function logWithTimestamp(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [舌象分析]`

  switch (level) {
    case 'info':
      console.log(`${prefix} ℹ️ ${message}`)
      if (data) console.log(`${prefix} 📦 数据:`, data)
      break
    case 'warn':
      console.warn(`${prefix} ⚠️ ${message}`)
      if (data) console.warn(`${prefix} 📦 数据:`, data)
      break
    case 'error':
      console.error(`${prefix} ❌ ${message}`)
      if (data) console.error(`${prefix} 📦 数据:`, data)
      break
    case 'debug':
      console.debug(`${prefix} 🔍 ${message}`)
      if (data) console.debug(`${prefix} 📦 数据:`, data)
      break
  }
}

function extractJsonFromContent(content: string) {
  if (!content) return null
  const m = content.trim().match(/(\{[\s\S]*\})\s*$/)
  if (!m) return null
  const cand = m[1]
  try {
    return JSON.parse(cand as string)
  } catch {
    try {
      const cleaned = cand?.replace(/[\x00-\x1f]/g, ' ')
      return JSON.parse(cleaned as string)
    } catch {
      return null
    }
  }
}

function stripTrailingJsonText(content: string, summary: any) {
  if (!content || !summary) return content
  const text = String(content)
  let jsText: string | null = null
  try {
    jsText = JSON.stringify(summary)
  } catch {
    jsText = null
  }
  if (jsText && text.includes(jsText)) return text.replace(jsText, '').trim()
  const m = text.trim().match(/(\{[\s\S]*\})\s*$/)
  if (m) return text.slice(0, text.lastIndexOf(m[1] as string)).trim()
  return text
}

/**
 * 清理文本中的Markdown和特殊字符
 */
function cleanText(text: string): string {
  if (!text) return ''

  let cleaned = text

  // 移除数字序号如 "1.", "2." 开头的行首数字
  cleaned = cleaned.replace(/^\d+\.\s*/gm, '')

  // 移除星号标记如 "**text**" 或 "*text*"
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1')
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1')

  // 移除HTML标签
  cleaned = cleaned.replace(/<[^>]+>/g, '')

  // 将多个换行符合并为两个
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n')

  // 移除行首行尾空格
  cleaned = cleaned.trim()

  return cleaned
}

/**
 * 根据【】拆分文本为段落数组 - 改进版
 */
function splitTextByBrackets(text: string): string[] {
  if (!text) return []

  const paragraphs: string[] = []

  // 方法1：匹配【xxx】内容
  const bracketRegex = /【([^】]+)】([\s\S]*?)(?=【|$)/g
  let match
  let hasBracket = false

  while ((match = bracketRegex.exec(text)) !== null) {
    hasBracket = true
    const title = match[1]?.trim()
    let content = match[2]?.trim()
    // 清理内容中的多余换行和空格
    content = content?.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
    if (title && content) {
      paragraphs.push(`【${title}】${content}`)
    } else if (title) {
      paragraphs.push(`【${title}】`)
    }
  }

  // 如果找到了【】格式，直接返回
  if (hasBracket && paragraphs.length > 0) {
    return paragraphs
  }

  // 方法2：匹配带序号的格式如 "一、xxx" 或 "1. xxx"
  const numberedRegex =
    /(?:一、|二、|三、|四、|五、|1[\.、]|2[\.、]|3[\.、]|4[\.、]|5[\.、])([^\n]+)\n([\s\S]*?)(?=(?:一、|二、|三、|四、|五、|1[\.、]|2[\.、]|3[\.、]|4[\.、]|5[\.、])|$)/g
  let numberedMatch

  while ((numberedMatch = numberedRegex.exec(text)) !== null) {
    const title = numberedMatch[1]?.trim()
    let content = numberedMatch[2]?.trim()
    content = content?.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
    if (title && content) {
      paragraphs.push(`${title}：${content}`)
    }
  }

  if (paragraphs.length > 0) {
    return paragraphs
  }

  // 方法3：按双换行拆分
  const parts = text.split(/\n\s*\n/)
  for (const part of parts) {
    const cleaned = part.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    if (cleaned && cleaned.length > 10) {
      paragraphs.push(cleaned)
    }
  }

  // 如果还是没有，返回整个文本作为单个段落
  if (paragraphs.length === 0 && text) {
    const cleaned = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    if (cleaned) {
      paragraphs.push(cleaned)
    }
  }

  return paragraphs
}

/**
 * 从详细文本中提取舌象分析内容并分段
 */
function extractAnalysisFromDetailedText(content: string): { text: string; paragraphs: string[] } {
  logWithTimestamp('debug', '开始提取舌象分析内容')

  if (!content) return { text: '', paragraphs: [] }

  const analysisParts: string[] = []

  // 提取舌苔特征部分
  const tongueCoatingMatch = content.match(
    /[1|一][\.、]?\s*舌苔特征\s*\n([\s\S]*?)(?=\n[2|二][\.、]?\s*舌体特征|\n[2|二][\.、]|\n###|$)/i,
  )
  if (tongueCoatingMatch) {
    let text = tongueCoatingMatch[1]?.trim()
    text = text?.replace(/^[\d]+\.\s*/gm, '')
    text = text?.replace(/^[-\•]\s*/gm, '')
    text = text?.replace(/\n+/g, ' ').replace(/\s+/g, ' ')
    analysisParts.push(`【舌苔特征】${text}`)
    logWithTimestamp('debug', '提取到舌苔特征', { text: text?.substring(0, 100) })
  }

  // 提取舌体特征部分
  const tongueBodyMatch = content.match(
    /[2|二][\.、]?\s*舌体特征\s*\n([\s\S]*?)(?=\n[3|三][\.、]?\s*临床意义|\n[3|三][\.、]|\n###|$)/i,
  )
  if (tongueBodyMatch) {
    let text = tongueBodyMatch[1]?.trim()
    text = text?.replace(/^[\d]+\.\s*/gm, '')
    text = text?.replace(/^[-\•]\s*/gm, '')
    text = text?.replace(/\n+/g, ' ').replace(/\s+/g, ' ')
    analysisParts.push(`【舌体特征】${text}`)
    logWithTimestamp('debug', '提取到舌体特征', { text: text?.substring(0, 100) })
  }

  // 提取临床意义部分
  const clinicalMatch = content.match(
    /[3|三][\.、]?\s*临床意义\s*\n([\s\S]*?)(?=\n[4|四][\.、]?\s*注意事项|\n[4|四][\.、]|\n###|$)/i,
  )
  if (clinicalMatch) {
    let text = clinicalMatch[1]?.trim()
    text = text?.replace(/^[\d]+\.\s*/gm, '')
    text = text?.replace(/^[-\•]\s*/gm, '')
    text = text?.replace(/\n+/g, ' ').replace(/\s+/g, ' ')
    analysisParts.push(`【临床意义】${text}`)
    logWithTimestamp('debug', '提取到临床意义', { text: text?.substring(0, 100) })
  }

  // 提取综合判断部分
  const summaryMatch = content.match(
    /[4|四][\.、]?\s*综合判断\s*\n([\s\S]*?)(?=\n[5|五][\.、]|\n###|$)/i,
  )
  if (summaryMatch) {
    let text = summaryMatch[1]?.trim()
    text = text?.replace(/^[\d]+\.\s*/gm, '')
    text = text?.replace(/\n+/g, ' ').replace(/\s+/g, ' ')
    analysisParts.push(`【综合判断】${text}`)
    logWithTimestamp('debug', '提取到综合判断', { text: text?.substring(0, 100) })
  }

  // 如果没有找到标准格式，尝试从文本中提取带【】的内容
  if (analysisParts.length === 0) {
    const bracketMatches = content.match(/【[^】]+】[^【]*/g)
    if (bracketMatches) {
      for (const match of bracketMatches) {
        const cleaned = match.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
        if (cleaned) {
          analysisParts.push(cleaned)
        }
      }
    }
  }

  if (analysisParts.length > 0) {
    const fullText = analysisParts.join('\n\n')
    logWithTimestamp('info', `提取到 ${analysisParts.length} 个分析段落`)
    return { text: fullText, paragraphs: analysisParts }
  }

  // 如果都没有，返回清理后的原始内容
  const cleaned = content.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
  logWithTimestamp('warn', '未提取到结构化分析内容，使用原始文本', { length: cleaned.length })
  return { text: cleaned, paragraphs: [cleaned] }
}

/**
 * 从文本中提取体质类型
 */
function extractConstitutionFromText(content: string): string | null {
  if (!content) return null

  const patterns = [
    /综合判断[：:]\s*([^\n。]+)/,
    /初步判断[：:]\s*([^\n。]+)/,
    /体质偏向于\s*([^\n。]+)/,
    /体质[为是]\s*([^\n。]+)/,
    /偏向于\s*([^\n。]+)/,
    /判断[为是]\s*([^\n。]+)/,
    /【综合判断】([^\n。]+)/,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) {
      let result = match[1]?.trim()
      result = result?.replace(/[\[\]【】]/g, '')
      result = result?.replace(/^\*\*|\*\*$/g, '')
      if (result && result.length < 50) {
        logWithTimestamp('info', '提取到体质类型', { constitution: result })
        return result
      }
    }
  }

  const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/)
  if (jsonMatch) {
    try {
      const json = JSON.parse(jsonMatch[1] as string)
      if (json.constitution) {
        logWithTimestamp('info', '从JSON中提取到体质类型', { constitution: json.constitution })
        return json.constitution
      }
    } catch (e) {}
  }

  logWithTimestamp('warn', '未能提取到体质类型')
  return null
}

/**
 * 从文本中提取养生建议
 */
function extractLifestyleAdviceFromText(content: string): Record<string, string> {
  const advice: Record<string, string> = {
    diet: '',
    sleep: '',
    exercise: '',
  }

  if (!content) return advice

  const noticeMatch = content.match(/[4|四][\.、]?\s*注意事项\s*\n([\s\S]*?)(?=\n---|\n```|$)/i)
  if (noticeMatch) {
    const noticeText = noticeMatch[1]

    const dietMatch = noticeText?.match(/饮食[调理调整][：:]\s*([^\n]+)/i)
    if (dietMatch) advice.diet = dietMatch[1]?.replace(/\n/g, ' ').trim() as string

    const sleepMatch = noticeText?.match(/(?:生活|作息)[习惯调整]?[：:]\s*([^\n]+)/i)
    if (sleepMatch) advice.sleep = sleepMatch[1]?.replace(/\n/g, ' ').trim() as string

    const exerciseMatch = noticeText?.match(/(?:运动|情绪)[调节调理]?[：:]\s*([^\n]+)/i)
    if (exerciseMatch) advice.exercise = exerciseMatch[1]?.replace(/\n/g, ' ').trim() as string

    if (!advice.diet && !advice.sleep && !advice.exercise) {
      const items = noticeText?.match(/[•\-\*]\s*([^\n]+)/g)
      if (items) {
        advice.diet = items.map((i) => i.replace(/^[•\-\*]\s*/, '')).join('；')
      }
    }
  }

  const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/)
  if (jsonMatch) {
    try {
      const json = JSON.parse(jsonMatch[1] as string)
      if (json.lifestyle_advice) {
        if (json.lifestyle_advice.diet) advice.diet = json.lifestyle_advice.diet
        if (json.lifestyle_advice.sleep) advice.sleep = json.lifestyle_advice.sleep
        if (json.lifestyle_advice.exercise) advice.exercise = json.lifestyle_advice.exercise
      }
    } catch (e) {}
  }

  if (!advice.diet) advice.diet = '饮食清淡，避免生冷、辛辣刺激性食物。'
  if (!advice.sleep) advice.sleep = '保证充足睡眠，避免熬夜。'
  if (!advice.exercise) advice.exercise = '每日适量运动，如散步或太极拳，以增强体质。'

  logWithTimestamp('info', '提取到养生建议', advice)
  return advice
}

/**
 * 从文本中提取茶饮推荐
 */
function extractDrinksFromText(content: string): string[] {
  const drinks: string[] = []

  if (!content) return drinks

  const noticeMatch = content.match(/[4|四][\.、]?\s*注意事项\s*\n([\s\S]*?)(?=\n---|\n```|$)/i)
  if (noticeMatch) {
    const noticeText = noticeMatch[1]
    const teaMatch = noticeText?.match(/(?:茶饮|饮品|推荐茶饮)[：:]\s*([^\n]+)/i)
    if (teaMatch) {
      const teaText = teaMatch[1]
      const teaItems = teaText?.split(/[、，,]/)
      teaItems?.forEach((item) => {
        const clean = item.trim()
        if (clean && clean.length < 30) {
          drinks.push(clean)
        }
      })
    }
  }

  const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/)
  if (jsonMatch) {
    try {
      const json = JSON.parse(jsonMatch[1] as string)
      if (json.drink_recommendation && Array.isArray(json.drink_recommendation)) {
        logWithTimestamp('info', '从JSON中提取到茶饮推荐', { drinks: json.drink_recommendation })
        return json.drink_recommendation
      }
    } catch (e) {}
  }

  if (drinks.length === 0) {
    const constitution = extractConstitutionFromText(content)
    if (constitution && constitution.includes('湿热')) {
      drinks.push('薏米红豆茶', '荷叶茶')
    } else if (constitution && constitution.includes('气滞')) {
      drinks.push('玫瑰花茶', '陈皮茶')
    } else if (constitution && constitution.includes('血瘀')) {
      drinks.push('山楂红糖水', '三七花茶')
    } else {
      drinks.push('生姜红枣茶', '陈皮茯苓茶')
    }
  }

  logWithTimestamp('info', '提取到茶饮推荐', { drinks: drinks.slice(0, 3) })
  return drinks.slice(0, 3)
}

/**
 * 提取置信度
 */
function extractConfidence(content: string): number {
  const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/)
  if (jsonMatch) {
    try {
      const json = JSON.parse(jsonMatch[1] as string)
      if (json.confidence) return Number(json.confidence)
    } catch (e) {}
  }

  const confidenceMatch = content.match(/置信度[：:]\s*(\d+\.?\d*)/)
  if (confidenceMatch) {
    const val = parseFloat(confidenceMatch[1] as string)
    if (!isNaN(val) && val > 0 && val <= 1) return val
  }

  return 0.65
}

export type AnalyzeResult = {
  analysis_text: string
  analysis_paragraphs: string[] // 按【】拆分的段落数组
  constitution: string | null
  suggestions: string | null
  confidence: number
  lifestyle_advice: Record<string, string>
  drink_recommendation: string[]
  note: string | null
  raw_ai_response: any
}

/**
 * 模拟数据模式
 */
function getMockAnalysisResult(params: any): AnalyzeResult {
  logWithTimestamp('warn', '使用模拟数据模式（无舌象图片或API失败）')

  const symptoms = params.voice_text || ''
  const goal = params.user_goal || 'general'

  let constitution = '平和质（兼有轻微气滞血瘀）'
  const paragraphs = [
    '【舌苔特征】舌苔整体偏白，略带淡黄色，舌苔较薄，舌面湿润，无明显干燥或黏腻感。提示体内可能存在轻度湿热。',
    '【舌体特征】舌体颜色正常，呈淡红色，舌体大小适中，边缘无齿痕，表面光滑。气血运行基本正常。',
    '【临床意义】整体来看，患者的体质偏向于气滞血瘀兼有轻度湿热，属于亚健康状态，需要通过调理改善。',
  ]

  let lifestyleAdvice: Record<string, string> = {
    diet: '饮食清淡，避免生冷、辛辣刺激性食物。多吃温性食物如姜汤、红枣粥。',
    sleep: '保证充足睡眠，避免熬夜。注意保暖，尤其是腹部和下肢。',
    exercise: '每日适量运动，如散步或太极拳，以增强体质，促进气血运行。',
  }
  let drinkRecommendation: string[] = ['生姜红枣茶', '陈皮茯苓茶']

  const hasFatigue = symptoms.includes('乏') || symptoms.includes('累') || symptoms.includes('倦')
  const hasBloating = symptoms.includes('腹胀') || symptoms.includes('胃胀')

  if (hasFatigue && hasBloating) {
    constitution = '脾虚湿盛型'
    const newParagraphs = [
      '【舌苔特征】舌苔白腻，中部较厚，提示湿浊内停。',
      '【舌体特征】舌质淡胖，边缘有明显的齿痕，提示脾气虚弱。',
      '【临床意义】脾虚湿困，运化失职，建议健脾祛湿。',
    ]
    paragraphs.splice(0, paragraphs.length, ...newParagraphs)
    lifestyleAdvice = {
      diet: '多食山药、薏米、白扁豆、茯苓等健脾祛湿之品；忌生冷、油腻、甜食。',
      sleep: '规律作息，避免熬夜，饭后不宜立即躺卧。',
      exercise: '适度运动如散步、八段锦、太极，以微微出汗为宜。',
    }
    drinkRecommendation = ['参苓白术散', '陈皮茯苓茶', '薏米红豆水']
  }

  if (goal === 'weight_loss') {
    lifestyleAdvice.diet += ' 减重建议：配合祛湿化痰的饮食，减少精制碳水和糖分摄入。'
    drinkRecommendation.push('荷叶茶', '冬瓜皮茶')
  } else if (goal === 'sleep') {
    lifestyleAdvice.sleep += ' 安眠建议：睡前1小时避免使用电子设备，可泡温水脚15分钟。'
    drinkRecommendation.push('酸枣仁茶', '百合莲子汤')
  }

  const result = {
    analysis_text: paragraphs.join('\n\n'),
    analysis_paragraphs: paragraphs,
    constitution,
    confidence: 0.75,
    suggestions: null,
    lifestyle_advice: lifestyleAdvice,
    drink_recommendation: drinkRecommendation.slice(0, 3),
    note: null,
    raw_ai_response: null,
  }

  logWithTimestamp('info', '模拟数据生成完成', { constitution, confidence: result.confidence })
  return result
}

/**
 * 主分析函数
 */
export async function analyzeInBrowser(params: {
  voice_text?: string
  questionnaire?: unknown
  user_goal?: string
  age?: string | number | null
  gender?: string | null
  tongue_image_dataurl?: string | null
}): Promise<AnalyzeResult> {
  const startTime = Date.now()
  logWithTimestamp('info', '========== 开始舌象分析 ==========')
  logWithTimestamp('info', '输入参数', {
    voice_text: params.voice_text ? `${params.voice_text.substring(0, 100)}...` : '(无)',
    user_goal: params.user_goal || 'general',
    age: params.age || '(未提供)',
    gender: params.gender || '(未提供)',
    has_tongue_image: !!params.tongue_image_dataurl,
  })

  const profile = {
    voice_text: params.voice_text || '',
    questionnaire: params.questionnaire || {},
    user_goal: params.user_goal || 'general',
    age: params.age ?? null,
    gender: params.gender ?? null,
    tongue_image_url: null,
    tongue_image_dataurl: params.tongue_image_dataurl ?? null,
  }

  if (!profile.tongue_image_dataurl) {
    logWithTimestamp('warn', '无舌象图片，使用模拟数据')
    const mockResult = getMockAnalysisResult(profile)
    const duration = Date.now() - startTime
    logWithTimestamp('info', `========== 分析完成（模拟数据）耗时: ${duration}ms ==========`)
    console.groupCollapsed('[舌象分析] 最终结果详情')
    console.log('体质类型:', mockResult.constitution)
    console.log('置信度:', mockResult.confidence)
    console.log('分析段落:', mockResult.analysis_paragraphs)
    console.log('养生建议:', mockResult.lifestyle_advice)
    console.log('茶饮推荐:', mockResult.drink_recommendation)
    console.groupEnd()
    return mockResult
  }
  // AI辅助生成： Qwen-v1-plus，2026/4/10
  try {
    logWithTimestamp('info', '开始构建AI提示词并调用通义千问')
    const messages = buildMessages(profile)
    logWithTimestamp('debug', '提示词构建完成', { messages_count: messages.length })

    const aiStartTime = Date.now()
    const aiResp = await callQwen(messages, {
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '', // 请替换为你自己的API Key
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      model: 'qwen-vl-plus',
    })
    const aiDuration = Date.now() - aiStartTime
    logWithTimestamp('info', `AI调用完成，耗时: ${aiDuration}ms`)

    let contentText: string | null = null
    if (aiResp && typeof aiResp === 'object') {
      const choices = (aiResp as any).choices
      if (Array.isArray(choices) && choices.length > 0) {
        const first = choices[0]
        const message = first?.message || {}
        contentText = message?.content || first?.text
      }
      if (contentText == null)
        contentText = (aiResp as any).content || (aiResp as any).analysis || String(aiResp)
    } else {
      contentText = String(aiResp)
    }

    if (!contentText) {
      logWithTimestamp('error', 'AI返回内容为空，使用模拟数据')
      const mockResult = getMockAnalysisResult(profile)
      const duration = Date.now() - startTime
      logWithTimestamp(
        'info',
        `========== 分析完成（降级到模拟数据）耗时: ${duration}ms ==========`,
      )
      return mockResult
    }

    logWithTimestamp('info', 'AI返回原始内容', {
      content_length: contentText.length,
      content_preview: contentText.substring(0, 500),
    })

    // 提取分析内容和段落
    logWithTimestamp('info', '开始提取舌象分析内容')
    const { text: analysisText, paragraphs: extractedParagraphs } =
      extractAnalysisFromDetailedText(contentText)
    const constitution = extractConstitutionFromText(contentText)
    const lifestyleAdvice = extractLifestyleAdviceFromText(contentText)
    const drinkRecommendation = extractDrinksFromText(contentText)
    const confidence = extractConfidence(contentText)

    // 确保有段落
    let finalParagraphs = extractedParagraphs
    if (finalParagraphs.length === 0 && analysisText) {
      finalParagraphs = splitTextByBrackets(analysisText)
    }
    if (finalParagraphs.length === 0) {
      finalParagraphs = [analysisText || '分析完成']
    }

    const result: AnalyzeResult = {
      analysis_text: analysisText || contentText.substring(0, 500),
      analysis_paragraphs: finalParagraphs,
      constitution: constitution || '平和质',
      confidence: confidence,
      lifestyle_advice: lifestyleAdvice,
      drink_recommendation: drinkRecommendation,
      note: null,
      suggestions: null,
      raw_ai_response: aiResp,
    }

    const duration = Date.now() - startTime
    logWithTimestamp('info', `========== 分析完成（AI）耗时: ${duration}ms ==========`)

    // 详细打印最终结果
    console.groupCollapsed('[舌象分析] 最终结果详情')
    console.log('📊 体质类型:', result.constitution)
    console.log('📈 置信度:', result.confidence)
    console.log('📝 分析段落:', result.analysis_paragraphs)
    console.log('🥗 饮食建议:', result.lifestyle_advice.diet)
    console.log('😴 作息建议:', result.lifestyle_advice.sleep)
    console.log('🏃 运动建议:', result.lifestyle_advice.exercise)
    console.log('🍵 茶饮推荐:', result.drink_recommendation)
    console.log('📦 原始AI响应:', result.raw_ai_response)
    console.groupEnd()

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logWithTimestamp('error', `API调用失败，耗时: ${duration}ms`, error)
    const mockResult = getMockAnalysisResult(profile)
    logWithTimestamp('info', `========== 分析完成（降级到模拟数据）耗时: ${duration}ms ==========`)
    return mockResult
  }
}
