<template>
  <div class="daily-evaluation-wrapper">
    <!-- 全局加载遮罩 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-ink">正在溯源研习脉络...</div>
        <div class="loading-sub">焚香、净手、拨云、见日</div>
      </div>
    </div>

    <!-- 仿古大框 -->
    <div class="ancient-frame">
      <!-- 顶部标题栏 -->
      <header class="eval-header">
        <div class="header-left">
          <div class="title-tab">研习日鉴</div>
          <div class="date-text">{{ todayStr }}</div>
        </div>
        <div class="header-right">
          <div class="yesterday-seal">
            <span class="seal-label">昨日功德</span>
            <span class="seal-val">{{ viewStatus === 'ready' ? yesterdayScore : '--' }}</span>
          </div>
        </div>
      </header>

      <!-- 状态分支 -->
      <div v-if="viewStatus === 'ready'" class="main-container">
        <!-- 上部：研习笔谈 + 功课清单（并排） -->
        <div class="top-section">
          <!-- 研习笔谈 -->
          <section class="commentary-section">
            <div class="section-title">〈 研习笔谈 〉</div>
            <div class="commentary-content">
              <p class="summary-line">{{ aiAnalysisText.split('。')[0] || aiAnalysisText }}</p>
              <div class="ai-analysis-text" v-html="formattedAnalysisText"></div>
            </div>
          </section>

          <!-- 功课清单 -->
          <section class="goals-section">
            <div class="section-title">〈 功课清单 〉</div>
            <div class="task-list">
              <div
                v-for="goal in dailyGoals"
                :key="goal.id"
                class="task-item"
                :class="{ 'is-completed': goal.completed }"
              >
                <div class="task-info">
                  <span class="task-seal">{{ goal.index }}</span>
                  <span class="task-name">{{ goal.text }}</span>
                </div>
                <div v-if="goal.completed" class="completion-seal">精进</div>
                <div v-else class="pending-mark">待办</div>
              </div>
            </div>
          </section>
        </div>

        <!-- 下部：图表看板 + 盈亏标签（左右结构） -->
        <div class="bottom-section">
          <div class="chart-area">
            <div class="chart-board">
              <nav class="chart-tabs">
                <button
                  v-for="(name, idx) in chartNames"
                  :key="idx"
                  :class="{ active: activeChart === idx }"
                  @click="switchChart(idx)"
                >
                  {{ name }}
                </button>
              </nav>
              <div class="chart-container">
                <div ref="chartRef" class="chart-canvas"></div>
                <div class="chart-watermark">ACADEMIC RECORD</div>
              </div>
              <div class="chart-caption">〈 {{ chartDescs[activeChart] }} 〉</div>
            </div>
          </div>

          <div class="kp-area">
            <div class="kp-card">
              <div class="kp-header">气旺</div>
              <div class="kp-tags">
                <span v-for="kp in positiveKPs" :key="kp" class="kp-tag positive">{{ kp }}</span>
                <span v-if="!positiveKPs.length" class="empty-tip">暂无</span>
              </div>
            </div>
            <div class="kp-card">
              <div class="kp-header">气虚</div>
              <div class="kp-tags">
                <span v-for="kp in negativeKPs" :key="kp" class="kp-tag negative">{{ kp }}</span>
                <span v-if="!negativeKPs.length" class="empty-tip">暂无</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 生成中状态 -->
      <div v-else-if="viewStatus === 'generating'" class="status-panel">
        <div class="status-box">
          <div class="ink-animation"></div>
          <h2>司天监正于星图演化...</h2>
          <p>
            阁下昨日的研习痕迹已悉数捕获，正在通过"研习大模型"进行命理分析。<br />墨色未干，请稍候片刻。
          </p>
          <div class="progress-bar"><div class="progress-fill"></div></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="viewStatus === 'empty'" class="status-panel">
        <div class="status-box empty-box">
          <div class="empty-icon"></div>
          <h2>无字天书 · 待君落墨</h2>
          <p>
            乾坤初开，研习尚早。由于阁下今日初登此境，或昨日未留下研习踪迹，<br />故"研习日鉴"尚无墨迹可寻。
          </p>
          <div class="action-suggestion">
            <p>【 建议方案 】</p>
            <ul>
              <li>前往"研习幻境"完成至少一次修学</li>
              <li>在"校考"中留下你的知识印记</li>
              <li>明日辰时再来，届时必有真章</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 底部装饰 -->
      <footer class="frame-footer">
        <div class="footer-line"></div>
        <div class="corner-left"></div>
        <div class="corner-right"></div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { getUserId } from '@/utils/storage'
import { generateSummary, getTodaySummary } from '@/api/summary'

// ========== 类型定义 ==========
type ViewStatus = 'loading' | 'ready' | 'generating' | 'empty'

// ========== 响应式数据 ==========
const viewStatus = ref<ViewStatus>('loading')
const loading = ref(true)
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let resizeObserver: ResizeObserver | null = null

const todayStr = ref('甲辰年 · 研习中')
const yesterdayScore = ref(0)
const aiAnalysisText = ref('')
const dailyGoals = ref<Array<{ id: number; index: string; text: string; completed: boolean }>>([])
const positiveKPs = ref<string[]>([])
const negativeKPs = ref<string[]>([])

const activeChart = ref(0)
const chartNames = ['五维辨证', '研习归经', '增长排行', '薄弱预警']
const chartDescs = [
  '五维辨证：今日研习领域平衡性分析',
  '研习归经：精力在各模块的投入占比',
  '增长排行：今日掌握度提升最快的知识点',
  '薄弱预警：根据错误分布侦测出的待补强区域',
]

const chartData = ref({
  radar: [0, 0, 0, 0, 0],
  rose: [] as any[],
  growth: [] as any[],
  weakness: [] as any[],
})

// 格式化分析文本：添加首行缩进两格
const formattedAnalysisText = computed(() => {
  if (!aiAnalysisText.value) return ''
  const paragraphs = aiAnalysisText.value.split(/\n+/)
  const indentedParagraphs = paragraphs
    .filter((p) => p.trim())
    .map((p) => `<p style="text-indent: 2em; margin: 0 0 0.5em 0;">${p}</p>`)
  return indentedParagraphs.join('')
})

// ========== 辅助函数 ==========
const getChineseNum = (num: number): string => {
  const ch = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  return ch[num - 1] || String(num)
}

// ========== API 交互 ==========
const initRequest = async () => {
  const userId = getUserId()
  if (!userId) {
    viewStatus.value = 'empty'
    loading.value = false
    return
  }

  try {
    const res = await getTodaySummary(parseInt(userId))
    if (res.code === 200 && res.data) {
      handleDataSuccess(res.data)
    } else if (res.code === 102) {
      viewStatus.value = 'generating'
      startPolling()
    } else if ([201, 202].includes(res.code)) {
      viewStatus.value = 'empty'
    } else if (res.code === 204) {
      await requestGenerate(userId)
    } else {
      await requestGenerate(userId)
    }
  } catch (error) {
    console.error('Init error:', error)
    viewStatus.value = 'empty'
  } finally {
    loading.value = false
  }
}

const requestGenerate = async (userId: string) => {
  try {
    const res = await generateSummary(parseInt(userId))
    if (res.code === 102) {
      viewStatus.value = 'generating'
      startPolling()
    } else if (res.code === 200 && res.data) {
      handleDataSuccess(res.data)
    } else {
      viewStatus.value = 'empty'
    }
  } catch (e) {
    viewStatus.value = 'empty'
  }
}

const handleDataSuccess = (data: any) => {
  const { summary, tasks } = data
  todayStr.value = summary.report_info.today_str
  yesterdayScore.value = summary.report_info.yesterday_score
  aiAnalysisText.value = summary.narrative.ai_analysis_content
  positiveKPs.value = summary.knowledge_status.positive_kps
  negativeKPs.value = summary.knowledge_status.negative_kps

  chartData.value = {
    radar: summary.charts.radar_values,
    rose: summary.charts.rose_values,
    growth: summary.charts.growth_values,
    weakness: summary.charts.weakness_values,
  }

  dailyGoals.value = tasks.map((task: any, idx: number) => ({
    id: task.id,
    index: getChineseNum(idx + 1),
    text: task.task_name,
    completed: task.status === 1,
  }))

  viewStatus.value = 'ready'
  nextTick(() => renderChart())
}

const startPolling = () => {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = setInterval(async () => {
    const userId = getUserId()
    if (!userId) return
    try {
      const res = await getTodaySummary(parseInt(userId))
      if (res.code === 200 && res.data) {
        clearInterval(pollTimer!)
        pollTimer = null
        handleDataSuccess(res.data)
      } else if (res.code !== 102) {
        clearInterval(pollTimer!)
        pollTimer = null
        viewStatus.value = 'empty'
      }
    } catch (e) {
      console.error('Poll error:', e)
    }
  }, 3000)
}

// ========== 图表渲染 ==========
const renderChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)

  const woodBrown = '#8b4513'
  const woodLight = 'rgba(139, 69, 19, 0.15)'
  const woodDark = '#5d4037'

  const tooltipConfig = {
    backgroundColor: 'rgba(253, 250, 245, 0.96)',
    borderColor: woodBrown,
    borderWidth: 1,
    textStyle: { color: woodDark, fontFamily: 'NO3', fontSize: 14 },
  }

  let option: any = {}

  switch (activeChart.value) {
    case 0: // 雷达图
      option = {
        tooltip: { ...tooltipConfig, trigger: 'item' },
        radar: {
          indicator: [
            { name: '理论', max: 100 },
            { name: '方剂', max: 100 },
            { name: '穴位', max: 100 },
            { name: '病机', max: 100 },
            { name: '诊法', max: 100 },
          ],
          axisName: { color: '#8d6e63', fontSize: 18, fontFamily: 'NO3' },
          splitArea: { show: false },
          splitLine: { lineStyle: { color: woodLight } },
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: chartData.value.radar,
                areaStyle: { color: 'rgba(139, 69, 19, 0.25)' },
                lineStyle: { color: woodBrown, width: 2 },
                itemStyle: { color: woodBrown },
              },
            ],
          },
        ],
      }
      break

    case 1: // 玫瑰图
      option = {
        tooltip: {
          ...tooltipConfig,
          trigger: 'item',
          formatter: (p: any) => `${p.name}<br/>占比：${p.percent}%<br/>数值：${p.value}`,
        },
        series: [
          {
            type: 'pie',
            radius: ['35%', '65%'],
            roseType: 'area',
            label: { show: true, fontFamily: 'NO3', fontSize: 16, color: woodBrown },
            data: chartData.value.rose.map((item, idx) => ({
              ...item,
              itemStyle: { color: `rgba(139, 69, 19, ${0.85 - idx * 0.12})` },
            })),
          },
        ],
      }
      break

    case 2: // 增长排行
      option = {
        tooltip: {
          ...tooltipConfig,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (p: any) => `${p[0].name}<br/>增长值：+${p[0].value}`,
        },
        grid: { left: '22%', right: '8%', top: 40, bottom: 20, containLabel: true },
        xAxis: { type: 'value', axisLabel: { fontSize: 14, color: woodDark } },
        yAxis: {
          type: 'category',
          data: chartData.value.growth.map((g: any) => g.name),
          axisLabel: { fontFamily: 'NO3', fontSize: 18, color: woodDark },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: 'bar',
            barWidth: '35%',
            data: chartData.value.growth.map((g: any) => g.value),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: 'rgba(139, 69, 19, 0.3)' },
                { offset: 1, color: woodBrown },
              ]),
              borderRadius: [0, 8, 8, 0],
            },
            label: {
              show: true,
              position: 'right',
              fontFamily: 'NO3',
              fontSize: 16,
              formatter: '+{c}',
            },
            emphasis: {
              scale: false,
              itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.2)' },
            },
          },
        ],
      }
      break

    case 3: // 薄弱预警
      if (!chartData.value.weakness.length) {
        option = {
          title: {
            text: '暂无数据',
            left: 'center',
            top: 'center',
            textStyle: { color: '#8d6e63' },
          },
        }
      } else {
        option = {
          tooltip: {
            ...tooltipConfig,
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (p: any) => `${p[0].name}<br/>薄弱程度：${p[0].value}%`,
          },
          grid: { left: '15%', right: '8%', top: 30, bottom: 20, containLabel: true },
          xAxis: {
            type: 'value',
            max: 100,
            axisLabel: { formatter: '{value}%', fontSize: 14, color: woodDark },
          },
          yAxis: {
            type: 'category',
            data: chartData.value.weakness.map((w: any) => w.name),
            axisLabel: { fontFamily: 'NO3', fontSize: 18, color: woodDark },
            axisLine: { show: false },
            axisTick: { show: false },
          },
          series: [
            {
              name: '薄弱程度',
              type: 'bar',
              barWidth: '30%',
              data: chartData.value.weakness.map((w: any) => w.value),
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: '#ffcc80' },
                  { offset: 1, color: '#d84315' },
                ]),
                borderRadius: [0, 8, 8, 0],
              },
              label: {
                show: true,
                position: 'right',
                fontFamily: 'NO3',
                fontSize: 16,
                formatter: '{c}%',
              },
            },
            {
              type: 'bar',
              barWidth: '30%',
              data: chartData.value.weakness.map(() => 100),
              itemStyle: { color: '#f5f0e8', borderRadius: [0, 8, 8, 0] },
              barGap: '-100%',
              z: -1,
              tooltip: { show: false },
            },
          ],
        }
      }
      break
  }

  chartInstance.setOption(option)
}

const switchChart = (idx: number) => {
  activeChart.value = idx
  renderChart()
}

// ========== 生命周期 ==========
const setupResizeObserver = () => {
  if (!chartRef.value) return
  resizeObserver = new ResizeObserver(() => chartInstance?.resize())
  resizeObserver.observe(chartRef.value)
}

onMounted(() => {
  initRequest()
  window.addEventListener('resize', () => chartInstance?.resize())
  setupResizeObserver()
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  window.removeEventListener('resize', () => chartInstance?.resize())
  resizeObserver?.disconnect()
  chartInstance?.dispose()
})

watch(
  () => chartData.value,
  () => {
    if (viewStatus.value === 'ready') renderChart()
  },
  { deep: true },
)
</script>

<style scoped>
/* 全局样式 */
.daily-evaluation-wrapper,
.daily-evaluation-wrapper * {
  font-family: 'NO3', serif !important;
}

.daily-evaluation-wrapper {
  padding: 10px;
  background: #fdfaf5;
}

/* 仿古大框 */
.ancient-frame {
  border: 2px solid rgba(139, 69, 19, 0.9);
  padding: 25px;
  margin: 0px;
  background: #fdfaf5;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  animation: fadeInFrame 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes fadeInFrame {
  from {
    opacity: 0;
    transform: scale(0.99);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 头部 */
.eval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 0;
  border-bottom: none;
}

.title-tab {
  background: rgba(139, 69, 19, 0.95);
  color: #fff;
  padding: 8px 30px;
  font-size: 20px;
  clip-path: polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%);
}

.date-text {
  font-size: 20px;
  color: #8d6e63;
  margin-top: 8px;
}

.yesterday-seal {
  border: 3px double #b71c1c;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #b71c1c;
  transform: rotate(12deg);
}

.seal-label {
  font-size: 13px;
  border-bottom: 1px solid #b71c1c;
}

.seal-val {
  font-size: 32px;
  font-weight: bold;
}

/* 主布局 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 上部：笔谈 + 清单 并排 */
.top-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

/* 研习笔谈 */
.commentary-section {
  background: rgba(139, 69, 19, 0.02);
  border: 1px solid rgba(139, 69, 19, 0.1);
  padding: 28px;
}

.section-title {
  font-size: 26px;
  color: #8b4513;
  text-align: center;
  letter-spacing: 4px;
  margin-bottom: 24px;
}

.summary-line {
  font-size: 26px;
  color: #8b4513;
  border-bottom: 2px solid rgba(139, 69, 19, 0.2);
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.ai-analysis-text {
  font-size: 22px;
  color: #3e2723;
  line-height: 1.7;
  text-align: justify;
}

/* 功课清单 */
.goals-section {
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.1);
  padding: 28px;
  overflow-y: auto;
  max-height: 400px;
}

.goals-section::-webkit-scrollbar {
  width: 5px;
}
.goals-section::-webkit-scrollbar-thumb {
  background: rgba(139, 69, 19, 0.25);
  border-radius: 3px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: #fefcf8;
  border: 1px solid #e0d8c3;
}

.task-item.is-completed {
  opacity: 0.6;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 序号印章样式 */
.task-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(139, 69, 19, 0.1);
  border: 2px solid rgba(139, 69, 19, 0.5);
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  color: #8b4513;
  transform: rotate(-5deg);
  transition: all 0.2s ease;
}

.task-item.is-completed .task-seal {
  opacity: 0.5;
  transform: rotate(0deg);
  background: rgba(139, 69, 19, 0.05);
}

.task-name {
  font-size: 20px;
  color: #3e2723;
}

.task-item.is-completed .task-name {
  text-decoration: line-through;
}

.completion-seal {
  border: 2px solid #b71c1c;
  color: #b71c1c;
  padding: 2px 12px;
  transform: rotate(-8deg);
  font-size: 16px;
}

.pending-mark {
  color: #bdb7aa;
  font-size: 16px;
}

/* 下部：图表 + 盈亏标签 */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 40px;
  align-items: start;
}

.chart-area {
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.1);
  padding: 24px;
}

.chart-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.chart-tabs button {
  background: #fdfaf5;
  border: 1px solid #e0d8c3;
  padding: 6px 18px;
  font-size: 24px;
  cursor: pointer;
  color: #8d6e63;
  transition: 0.2s;
}

.chart-tabs button.active {
  background: #8b4513;
  color: #fff;
}

.chart-container {
  position: relative;
  min-height: 420px;
}

.chart-canvas {
  width: 100%;
  height: 420px;
}

.chart-watermark {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 40px;
  color: rgba(0, 0, 0, 0.03);
  font-weight: bold;
  pointer-events: none;
}

.chart-caption {
  text-align: center;
  font-size: 20px;
  color: #8d6e63;
  margin-top: 16px;
}

/* 盈亏标签区域 */
.kp-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.kp-card {
  background: rgba(139, 69, 19, 0.03);
  border: 1px solid #e0d8c3;
  padding: 20px;
}

.kp-header {
  font-size: 22px;
  color: #8b4513;
  border-left: 4px solid #8b4513;
  padding-left: 12px;
  margin-bottom: 16px;
}

.kp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.kp-tag {
  padding: 4px 14px;
  background: #fff;
  border: 1px solid #e0d8c3;
  font-size: 18px;
}

.kp-tag.positive {
  color: #8b4513;
}

.kp-tag.negative {
  color: #90a4ae;
}

.empty-tip {
  color: #bdb7aa;
  font-size: 18px;
  padding: 4px 0;
}

/* 状态页面 */
.status-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
}

.status-box {
  text-align: center;
  max-width: 600px;
}

.status-box h2 {
  font-size: 40px;
  color: #5d4037;
  margin-bottom: 20px;
}

.status-box p {
  font-size: 22px;
  color: #8d6e63;
  line-height: 1.8;
  margin-bottom: 30px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  width: 40%;
  height: 100%;
  background: #8b4513;
  animation: moveProgress 1.5s infinite ease;
}

@keyframes moveProgress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(300%);
  }
}

.empty-box {
  border: 1px dashed #8b4513;
  padding: 40px;
}

.action-suggestion {
  text-align: left;
  display: inline-block;
  padding: 16px 32px;
  border: 1px solid #e0d8c3;
  background: #fff;
}

.action-suggestion p {
  font-size: 20px;
  color: #8b4513;
  margin-bottom: 12px;
}

.action-suggestion li {
  font-size: 18px;
  color: #5d4037;
  margin-bottom: 6px;
  list-style: circle;
}

/* 底部装饰 */
.frame-footer {
  margin-top: 30px;
  position: relative;
}

.footer-line {
  height: 3px;
  border-top: 1px solid #8b4513;
  border-bottom: 1px solid #8b4513;
}

.corner-left,
.corner-right {
  position: absolute;
  bottom: -5px;
  width: 12px;
  height: 12px;
  border: 2px solid #8b4513;
}

.corner-left {
  left: -5px;
  border-right: none;
  border-top: none;
}

.corner-right {
  right: -5px;
  border-left: none;
  border-top: none;
}

/* 加载遮罩 */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: #fdfaf5;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-content {
  text-align: center;
}

.loading-ink {
  font-size: 34px;
  color: #3e2723;
  margin-bottom: 12px;
}

.loading-sub {
  font-size: 18px;
  color: #8d6e63;
  letter-spacing: 3px;
}
</style>
