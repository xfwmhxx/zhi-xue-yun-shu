<template>
  <div class="ai-modal-overlay" @click.self="handleClose">
    <div class="ai-modal-container">
      <!-- 头部 -->
      <div class="ai-modal-header">
        <div class="header-icon">
          <i class="fas fa-leaf"></i>
        </div>
        <h2>杏林·AI智能分析</h2>
        <button class="close-btn" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="ai-modal-body">
        <!-- 未分析状态 -->
        <div v-if="!isAnalyzed && !isAnalyzing" class="analyze-prompt">
          <div class="prompt-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <p>AI将为您分析简历的完整性、专业性及亮点，并提供优化建议</p>
          <p class="prompt-note">分析内容包括：简历完整度、技能匹配度、表达专业性、改进建议等</p>
        </div>

        <!-- 加载动画（修复容器抖动问题） -->
        <div
          v-if="isAnalyzing"
          class="analyzing-section"
          :class="{ 'fade-out': isAnalysisComplete }"
        >
          <div class="loading-animation">
            <!-- 固定高度的波纹容器，防止抖动 -->
            <div class="brain-wave-fixed">
              <div class="brain-wave">
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
              </div>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: progress + '%' }">
                <span class="progress-text">{{ Math.floor(progress) }}%</span>
              </div>
            </div>
            <p class="analyzing-text">{{ analyzingText }}</p>
          </div>
        </div>

        <!-- 分析结果 -->
        <div v-if="isAnalyzed && !isAnalyzing" class="analysis-result">
          <!-- 打分区域 -->
          <div class="score-section">
            <div class="score-circle">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e8ddd0" stroke-width="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  :stroke="scoreColor"
                  stroke-width="8"
                  :stroke-dasharray="339.292"
                  :stroke-dashoffset="339.292 * (1 - analysisResult.score / 100)"
                  stroke-linecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div class="score-number">
                <span class="score-value">{{ analysisResult.score }}</span>
                <span class="score-total">/100</span>
              </div>
            </div>
            <div class="score-info">
              <div class="score-level" :style="{ color: scoreColor }">
                <i :class="scoreIconClass"></i>
                {{ scoreLevel }}
              </div>
              <p>{{ scoreDescription }}</p>
            </div>
          </div>

          <!-- 详细分析 -->
          <div class="detail-analysis">
            <div class="analysis-item">
              <div class="item-header">
                <i class="fas fa-check-circle"></i>
                <h4>简历亮点</h4>
              </div>
              <ul>
                <li v-for="(highlight, idx) in analysisResult.highlights" :key="idx">
                  <i class="fas fa-star"></i>
                  <span>{{ highlight }}</span>
                </li>
              </ul>
            </div>

            <div class="analysis-item">
              <div class="item-header">
                <i class="fas fa-lightbulb"></i>
                <h4>优化建议</h4>
              </div>
              <ul>
                <li v-for="(suggestion, idx) in analysisResult.suggestions" :key="idx">
                  <i class="fas fa-pen-fancy"></i>
                  <span>{{ suggestion }}</span>
                </li>
              </ul>
            </div>

            <div class="analysis-item">
              <div class="item-header">
                <i class="fas fa-feather-alt"></i>
                <h4>综合评估</h4>
              </div>
              <p class="summary-text">{{ analysisResult.summary }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="ai-modal-footer">
        <button class="btn-secondary" @click="handleClose">
          {{ isAnalyzed ? '关 闭' : '取 消' }}
        </button>
        <button v-if="!isAnalyzed && !isAnalyzing" class="btn-primary" @click="startAnalysis">
          <i class="fas fa-chart-simple"></i> 开始分析
        </button>
        <button v-if="isAnalyzed" class="btn-primary" @click="exportAnalysis">
          <i class="fas fa-download"></i> 导出报告
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 定义 props
interface TimelineItem {
  main: string
  sub: string
  date: string
  desc: string
}

interface Section {
  title: string
  layout: 'list' | 'timeline'
  items: (string | TimelineItem)[]
}

interface ResumeData {
  name: string
  motto: string
  contact: {
    email: string
    phone: string
    location: string
  }
  sections: Section[]
}

const props = defineProps<{
  resumeData: ResumeData
}>()

const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const isAnalyzing = ref(false)
const isAnalyzed = ref(false)
const isAnalysisComplete = ref(false)
const progress = ref(0)
const analyzingText = ref('AI正在深度分析您的简历...')
const analysisResult = ref({
  score: 0,
  highlights: [] as string[],
  suggestions: [] as string[],
  summary: '',
})

// 监听进度，更新提示文字
watch(progress, (newVal) => {
  if (newVal < 30) {
    analyzingText.value = 'AI正在解析简历结构...'
  } else if (newVal < 60) {
    analyzingText.value = 'AI正在评估内容质量...'
  } else if (newVal < 90) {
    analyzingText.value = 'AI正在生成优化建议...'
  } else {
    analyzingText.value = '分析即将完成，请稍候...'
  }
})

// 计算属性
const scoreColor = computed(() => {
  const score = analysisResult.value.score
  if (score >= 85) return '#52c41a'
  if (score >= 70) return '#d4a574'
  if (score >= 60) return '#c97e5a'
  return '#b85c38'
})

const scoreLevel = computed(() => {
  const score = analysisResult.value.score
  if (score >= 85) return '上工之境'
  if (score >= 70) return '良医之资'
  if (score >= 60) return '可造之材'
  return '勤勉可期'
})

const scoreIconClass = computed(() => {
  const score = analysisResult.value.score
  if (score >= 85) return 'fas fa-crown'
  if (score >= 70) return 'fas fa-star-of-life'
  if (score >= 60) return 'fas fa-seedling'
  return 'fas fa-mortar-board'
})

const scoreDescription = computed(() => {
  const score = analysisResult.value.score
  if (score >= 85) return '君之简历，如良医辨证，精当完备，令人耳目一新！'
  if (score >= 70) return '君之简历，脉络清晰，稍加润色，便可锦上添花！'
  if (score >= 60) return '君之简历，根基已具，依方调养，必成大器！'
  return '君之简历，尚需锤炼，望博采众长，精益求精！'
})

// 关闭弹窗
const handleClose = () => {
  if (!isAnalyzing.value) {
    emit('close')
  }
}

// 模拟AI分析
const simulateAIAnalysis = () => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (progress.value < 100) {
        const increment = Math.random() * 8 + (100 - progress.value) / 20
        progress.value = Math.min(progress.value + increment, 100)
      } else {
        clearInterval(interval)
      }
    }, 150)

    setTimeout(() => {
      const analysis = analyzeResumeData(props.resumeData)
      resolve(analysis)
    }, 2800)
  })
}

// 实际分析逻辑
const analyzeResumeData = (data: ResumeData) => {
  let score = 70
  const highlights: string[] = []
  const suggestions: string[] = []

  if (data.name && data.name.trim().length > 0) {
    highlights.push('姓名信息完整，落笔有神')
    score += 3
  } else {
    suggestions.push('建议填写真实姓名，如扁鹊之号，不可不具')
  }

  if (data.motto && data.motto !== '勤求古训，博采众方' && data.motto.trim().length > 4) {
    highlights.push('个人格言彰显个性，如医者之铭')
    score += 2
  } else if (!data.motto || data.motto === '勤求古训，博采众方') {
    suggestions.push('建议修改默认格言，体现个人医道理念')
  }

  let contactComplete = 0
  if (data.contact.email && data.contact.email.includes('@')) {
    highlights.push('邮箱信息规范，如鸿雁传书')
    contactComplete++
    score += 2
  } else {
    suggestions.push('请填写有效邮箱，以便师友联络')
  }
  if (data.contact.phone && data.contact.phone.length >= 11) {
    highlights.push('联系电话完整，如钟鸣相应')
    contactComplete++
    score += 2
  } else {
    suggestions.push('建议填写完整手机号码，便于邀约')
  }
  if (data.contact.location && data.contact.location.trim().length > 0) {
    contactComplete++
    score += 1
  } else {
    suggestions.push('建议填写所在城市/医馆所在地')
  }

  if (contactComplete >= 2) {
    highlights.push('联系方式完备，便于杏林同道联络')
  }

  const sections = data.sections
  const validSections = sections.filter((s) => s.title !== '新模块名称')

  if (validSections.length >= 3) {
    highlights.push(`共设${validSections.length}个模块，如脏腑俱全，条理分明`)
    score += Math.min(validSections.length * 2, 10)
  } else {
    suggestions.push('建议增加更多模块（如临证经验、师承渊源等）')
  }

  sections.forEach((section) => {
    const title = section.title
    const items = section.items

    if (items.length === 0) {
      suggestions.push(`「${title}」模块暂无内容，如药方缺味，望补充`)
    } else if (items.length >= 3) {
      highlights.push(`「${title}」模块内容详实（${items.length}项），如良方配伍`)
      score += 3
    }

    let hasDefaultContent = false
    let hasRichContent = false
    items.forEach((item) => {
      if (typeof item === 'string') {
        if (item === '新条目内容' || item === '新内容' || item === '') {
          hasDefaultContent = true
        } else if (item.length > 15) {
          hasRichContent = true
        }
      } else {
        if (
          item.main === '新项标题' ||
          item.main === '标题' ||
          item.main === '' ||
          item.sub === '副标题/职位' ||
          item.sub === '副标题' ||
          item.date === '时间区间' ||
          item.date === '时间' ||
          item.desc === '详细描述内容' ||
          item.desc === '描述'
        ) {
          hasDefaultContent = true
        }
        if ((item.desc?.length || 0) > 50) {
          hasRichContent = true
        }
      }
    })

    if (hasDefaultContent) {
      suggestions.push(`「${title}」模块中含有未完善内容，如方剂缺量，望详加填充`)
    } else if (hasRichContent && title !== '新模块名称') {
      highlights.push(`「${title}」模块内容充实，见微知著`)
      score += 2
    }
  })

  let totalChars = 0
  sections.forEach((section) => {
    section.items.forEach((item) => {
      if (typeof item === 'string') {
        totalChars += item.length
      } else {
        totalChars += (item.main?.length || 0) + (item.sub?.length || 0) + (item.desc?.length || 0)
      }
    })
  })

  if (totalChars > 500) {
    highlights.push(`内容丰富，约${Math.floor(totalChars / 100) * 100}+字，如医案详实`)
    score += 5
  } else if (totalChars < 200) {
    suggestions.push('内容略显简略，望补充更多临证心得与经历')
  }

  const medicalKeywords = [
    '中医',
    '中药',
    '针灸',
    '推拿',
    '方剂',
    '伤寒',
    '金匮',
    '黄帝内经',
    '本草',
    '杏林',
    '医',
  ]
  const hasMedicalContent = sections.some(
    (s) =>
      medicalKeywords.some((kw) => s.title.includes(kw)) ||
      s.items.some(
        (item) => typeof item === 'string' && medicalKeywords.some((kw) => item.includes(kw)),
      ),
  )

  if (hasMedicalContent) {
    highlights.push('彰显中医专业底蕴，如岐黄之术，薪火相传')
    score += 8
  } else {
    suggestions.push('如为杏林学子，建议突出中医经典与临证经验')
  }

  score = Math.min(score, 98)

  let summary = ''
  if (score >= 85) {
    summary = `君之简历，如良医诊脉，辨证精准，条理分明。${highlights.slice(0, 2).join('、')}等方面尤为出众。若能再依建议稍作润色，必成杏林翘楚，前程似锦。`
  } else if (score >= 70) {
    summary = `君之简历，根基已固，脉络清晰。${highlights.length > 0 ? highlights[0] : '整体结构完整'}。建议重点关注：${suggestions.slice(0, 2).join('、')}等方面加以完善，则更臻上乘。`
  } else {
    summary = `君之简历，尚有精进空间。建议从${suggestions.slice(0, 3).join('、')}等处着手打磨。一份精良的简历，如一方良药，望君悉心调制，必有所成。`
  }

  return {
    score: Math.floor(score),
    highlights: highlights.slice(0, 6),
    suggestions: suggestions.slice(0, 8),
    summary,
  }
}

// 开始分析
const startAnalysis = async () => {
  isAnalyzing.value = true
  isAnalysisComplete.value = false
  progress.value = 0

  try {
    const result: any = await simulateAIAnalysis()
    analysisResult.value = result

    isAnalysisComplete.value = true

    setTimeout(() => {
      isAnalyzing.value = false
      isAnalyzed.value = true
      isAnalysisComplete.value = false
    }, 500)
  } catch (error) {
    console.error('AI分析失败:', error)
    isAnalyzing.value = false
    analysisResult.value = analyzeResumeData(props.resumeData)
    isAnalyzed.value = true
  }
}

// 导出分析报告
const exportAnalysis = () => {
  const report = `
╔══════════════════════════════════════════════════════════════╗
║                      杏林·AI简历分析报告                       ║
╚══════════════════════════════════════════════════════════════╝

【求学者】${props.resumeData.name}
【综合评分】${analysisResult.value.score}/100
【品级评定】${scoreLevel.value}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【简历亮点】
${analysisResult.value.highlights.map((h) => `  • ${h}`).join('\n')}

【优化建议】
${analysisResult.value.suggestions.map((s) => `  • ${s}`).join('\n')}

【综合评估】
${analysisResult.value.summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  报告生成时间：${new Date().toLocaleString()}
  杏林春暖，愿君前程似锦

╔══════════════════════════════════════════════════════════════╗
║                        杏林精选·敬呈                          ║
╚══════════════════════════════════════════════════════════════╝
  `

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.resumeData.name}_杏林简历分析报告.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* 全局字体设置 - 适配连笔字特殊字体 */
.ai-modal-overlay,
.ai-modal-container,
.ai-modal-header h2,
.ai-modal-body,
.analyze-prompt p,
.prompt-note,
.analyzing-text,
.score-info p,
.item-header h4,
.analysis-item li,
.summary-text,
.btn-secondary,
.btn-primary {
  font-family: 'No3', 'STKaiti', '楷体', 'Microsoft YaHei', 'PingFang SC', serif;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 标题字体稍重但不过分 */
.ai-modal-header h2 {
  font-weight: 500;
  letter-spacing: 2px;
}

.ai-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(61, 43, 31, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.ai-modal-container {
  background: linear-gradient(135deg, #fffdf7 0%, #fef6ed 100%);
  border-radius: 24px;
  width: 90%;
  max-width: 720px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(61, 43, 31, 0.35);
  animation: slideUp 0.3s ease;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-modal-header {
  padding: 20px 28px;
  border-bottom: 2px solid rgba(139, 69, 19, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(139, 69, 19, 0.02) 100%);
  border-radius: 24px 24px 0 0;
}

.header-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fffdf7;
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

.ai-modal-header h2 {
  flex: 1;
  margin: 0;
  font-size: 30px;
  color: #5c3317;
  letter-spacing: 2px;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(139, 69, 19, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #8b4513;
}

.close-btn:hover {
  background: rgba(139, 69, 19, 0.15);
  transform: rotate(90deg);
}

.ai-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  max-height: 60vh;
}

/* 未分析状态 */
.analyze-prompt {
  text-align: center;
  padding: 30px 20px;
}

.prompt-icon {
  font-size: 64px;
  color: #8b4513;
  margin-bottom: 20px;
  opacity: 0.7;
}

.analyze-prompt p {
  font-size: 30px;
  color: #5c3317;
  margin: 10px 0;
  line-height: 1.7;
}

.prompt-note {
  font-size: 15px;
  color: #a67c52;
  background: rgba(139, 69, 19, 0.06);
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 20px;
  border-left: 3px solid #8b4513;
}

/* 加载动画区域 - 修复容器抖动问题 */
.analyzing-section {
  text-align: center;
  padding: 20px;
  transition: opacity 0.5s ease;
}

.analyzing-section.fade-out {
  opacity: 0;
}

.loading-animation {
  max-width: 360px;
  margin: 0 auto;
}

/* 固定高度的波纹容器，防止抖动 */
.brain-wave-fixed {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.brain-wave {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  height: 70px;
}

.wave {
  width: 8px;
  height: 35px;
  background: linear-gradient(180deg, #8b4513 0%, #c97e5a 100%);
  border-radius: 4px;
  animation: wave 1.2s ease-in-out infinite;
  will-change: height;
}

.wave:nth-child(1) {
  animation-delay: 0s;
}
.wave:nth-child(2) {
  animation-delay: 0.2s;
}
.wave:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes wave {
  0%,
  100% {
    height: 35px;
  }
  50% {
    height: 65px;
  }
}

.progress-bar-container {
  background: #ede0d4;
  border-radius: 30px;
  overflow: hidden;
  height: 46px;
  margin: 16px 0;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  background: linear-gradient(90deg, #8b4513 0%, #c97e5a 50%, #d4a574 100%);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  transition: width 0.2s linear;
  border-radius: 30px;
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-text {
  color: white;
  font-weight: 500;
  padding-right: 14px;
  z-index: 1;
  font-size: 15px;
  letter-spacing: 1px;
}

.analyzing-text {
  color: #8b4513;
  font-size: 24px;
  margin-top: 16px;
  font-style: normal;
  min-height: 48px;
  line-height: 1.5;
}

/* 分析结果区域 */
.analysis-result {
  animation: fadeInResult 0.5s ease;
}

@keyframes fadeInResult {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.score-section {
  display: flex;
  gap: 30px;
  align-items: center;
  padding: 22px;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.06) 0%, rgba(139, 69, 19, 0.02) 100%);
  border-radius: 20px;
  margin-bottom: 28px;
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.score-circle {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.score-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-value {
  font-size: 42px;
  font-weight: 500;
  color: #5c3317;
}

.score-total {
  font-size: 17px;
  color: #a67c52;
}

.score-info {
  flex: 1;
}

.score-level {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-info p {
  margin: 0;
  color: #6b4c3a;
  line-height: 1.65;
  font-size: 20px;
}

/* 详细分析卡片 */
.detail-analysis {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-item {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(139, 69, 19, 0.06);
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.3s;
}

.analysis-item:hover {
  box-shadow: 0 4px 16px rgba(139, 69, 19, 0.12);
  border-color: rgba(139, 69, 19, 0.2);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(139, 69, 19, 0.12);
}

.item-header i {
  font-size: 22px;
  color: #8b4513;
}

.item-header h4 {
  margin: 0;
  font-size: 24px;
  color: #5c3317;
  font-weight: 500;
  letter-spacing: 1px;
}

.analysis-item ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.analysis-item li {
  margin: 14px 0;
  color: #6b4c3a;
  line-height: 1.7;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 20px;
}

.analysis-item li i {
  font-size: 14px;
  color: #c97e5a;
  margin-top: 3px;
  flex-shrink: 0;
}

.analysis-item li span {
  flex: 1;
}

.summary-text {
  margin: 0;
  color: #6b4c3a;
  line-height: 1.85;
  font-size: 20px;
  text-align: justify;
}

/* 底部按钮 */
.ai-modal-footer {
  padding: 18px 28px;
  border-top: 1px solid rgba(139, 69, 19, 0.12);
  display: flex;
  justify-content: space-between; /* ✅ 左右分开 */
  align-items: center; /* ✅ 垂直居中 */
  gap: 12px;
  background: rgba(139, 69, 19, 0.02);
  border-radius: 0 0 24px 24px;
}

.btn-secondary,
.btn-primary {
  padding: 10px 28px;
  border-radius: 40px;
  font-size: 24px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-family: inherit;
  letter-spacing: 1px;
}

.btn-secondary {
  background: rgba(139, 69, 19, 0.08);
  color: #8b4513;
}

.btn-secondary:hover {
  background: rgba(139, 69, 19, 0.15);
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 69, 19, 0.35);
  background: linear-gradient(135deg, #9b5523 0%, #b0623d 100%);
}

.btn-primary:active {
  transform: translateY(0);
}

/* 滚动条样式 */
.ai-modal-body::-webkit-scrollbar {
  width: 6px;
}

.ai-modal-body::-webkit-scrollbar-track {
  background: #ede0d4;
  border-radius: 3px;
}

.ai-modal-body::-webkit-scrollbar-thumb {
  background: #c97e5a;
  border-radius: 3px;
}

.ai-modal-body::-webkit-scrollbar-thumb:hover {
  background: #8b4513;
}

/* 响应式适配 */
@media (max-width: 640px) {
  .ai-modal-container {
    width: 95%;
    max-height: 90vh;
  }

  .ai-modal-header {
    padding: 16px 20px;
  }

  .ai-modal-header h2 {
    font-size: 20px;
  }

  .ai-modal-body {
    padding: 20px;
  }

  .score-section {
    flex-direction: column;
    text-align: center;
  }

  .score-info {
    text-align: center;
  }

  .score-level {
    justify-content: center;
  }

  .btn-secondary,
  .btn-primary {
    padding: 8px 20px;
    font-size: 14px;
  }

  .analyze-prompt p {
    font-size: 15px;
  }

  .prompt-note {
    font-size: 13px;
  }

  .score-value {
    font-size: 36px;
  }

  .score-level {
    font-size: 20px;
  }

  .item-header h4 {
    font-size: 17px;
  }

  .analysis-item li {
    font-size: 14px;
  }

  .summary-text {
    font-size: 14px;
  }
}
</style>
