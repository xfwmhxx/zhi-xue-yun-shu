<template>
  <div class="study-pulse-subpage-wrapper">
    <!-- 仿古大框 -->
    <div class="ancient-frame">
      <!-- 1. 顶部标题栏：仿古籍签条 -->
      <div class="study-top-header">
        <div class="title-tab">
          <span class="tab-text">研习脉络</span>
        </div>
        <div class="header-decoration-line"></div>
        <div class="header-seal">精进</div>
      </div>

      <!-- 2. 核心数据汇总区 -->
      <section class="study-info-grid">
        <div class="info-card-mini">
          <span class="label">【今日净悟】</span>
          <span class="val"
            >{{ totalFloat >= 0 ? '+' : '' }}{{ totalFloat.toFixed(2) }}<small>点</small></span
          >
        </div>
        <div class="info-card-mini">
          <span class="label">【交互强度】</span>
          <span class="val">{{ totalInteractions }}<small>次</small></span>
        </div>
        <div class="info-card-mini tips">
          <p class="wisdom-quote">“方证相应 · 气机调达”</p>
        </div>
      </section>

      <!-- 3. 图表区：每日知识盈亏轨迹 -->
      <div class="chart-inner-container">
        <div class="chart-header">
          <span class="sub-title">〈 每日知识盈亏轨迹 〉</span>
        </div>
        <div ref="pulseChartRef" class="pulse-chart"></div>
      </div>

      <!-- 4. 知识点动态日志区 -->
      <div class="kp-dynamic-section">
        <div class="log-header">今日功课要闻</div>
        <div class="log-list-viewport">
          <div class="fade-mask top"></div>
          <div class="log-list-content">
            <div v-if="dailyLogs.length === 0" class="empty-log">
              <div class="ink-seal-small">未录</div>
              <p>今日尚未触发知识点交互</p>
            </div>
            <div v-for="item in dailyLogs" :key="item.name" class="log-row">
              <div class="kp-info">
                <span class="kp-name">{{ item.name }}</span>
                <span class="kp-type">〔{{ item.typeName }}〕</span>
              </div>
              <div class="kp-progress-bar">
                <div
                  class="fill"
                  :style="{
                    width: Math.min(Math.abs(item.float * 100), 100) + '%',
                    background: item.float > 0 ? 'rgba(139, 69, 19, 0.8)' : '#78909c',
                  }"
                ></div>
              </div>
              <span class="kp-val" :class="item.float > 0 ? 'pos' : 'neg'">
                {{ item.float > 0 ? '+' : '' }}{{ item.float }}
              </span>
            </div>
          </div>
          <div class="fade-mask bottom"></div>
        </div>
      </div>

      <!-- 5. 底部角标 -->
      <div class="frame-footer">
        <div class="footer-line"></div>
        <div class="corner-mark-left"></div>
        <div class="corner-mark-right"></div>
      </div>
    </div>

    <!-- 加载遮罩层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-ink-seal">笔墨筹备中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getUserId } from '@/utils/storage'
import { getUserFloatStats, getTodayActivity, getTodayKpDetails } from '@/api/knowledge'

const pulseChartRef = ref<HTMLElement | null>(null)
const userId = ref<number | null>(null)
const totalFloat = ref(0)
const totalInteractions = ref(0)
const dailyLogs = ref<any[]>([])
const loading = ref(true)

// 计算近7天日期逻辑
const getLast7Days = () => {
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    dates.push(`${year}-${month}-${day}`)
  }
  return dates
}

// 渲染 ECharts 图表
const renderChart = (chartData: { dates: string[]; values: number[] }) => {
  if (!pulseChartRef.value) return
  const myChart = echarts.init(pulseChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 252, 247, 0.95)',
      borderColor: 'rgba(139, 69, 19, 0.6)',
      borderWidth: 1,
      padding: [10, 15],
      textStyle: {
        color: 'rgba(139, 69, 19, 1)',
        fontFamily: 'NO3',
        fontSize: 14,
      },
      formatter: (params: any) => {
        const item = params[0]
        const color = item.value >= 0 ? 'rgba(139, 69, 19, 1)' : '#78909c'
        return `<div style="font-family: NO3;">
                  <div style="margin-bottom:4px; font-size:12px; opacity:0.7">${item.name} · 研习反馈</div>
                  <div style="color: ${color}; font-size:18px;">
                    悟性增量：<b>${item.value > 0 ? '+' : ''}${item.value}</b>
                  </div>
                </div>`
      },
      axisPointer: {
        type: 'shadow',
        shadowStyle: { color: 'rgba(139, 69, 19, 0.05)' },
      },
    },
    grid: { top: '15%', left: '10%', right: '5%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: chartData.dates.map((d) => d.slice(5)),
      axisLine: { lineStyle: { color: 'rgba(139, 69, 19, 0.3)' } },
      axisTick: { show: false },
      axisLabel: { fontFamily: 'NO3', color: '#5d4037' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#e0d8c3' } },
      axisLabel: { fontFamily: 'NO3', color: '#5d4037' },
    },
    series: [
      {
        name: '掌握度浮动',
        type: 'bar',
        data: chartData.values,
        barWidth: '40%',
        itemStyle: {
          color: (params: any) => {
            if (params.value >= 0) {
              return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(139, 69, 19, 0.9)' },
                { offset: 1, color: 'rgba(139, 69, 19, 0.1)' },
              ])
            } else {
              return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(120, 144, 156, 0.1)' },
                { offset: 1, color: 'rgba(120, 144, 156, 0.9)' },
              ])
            }
          },
          borderRadius: [2, 2, 0, 0],
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(139, 69, 19, 0.4)',
          },
        },
      },
    ],
  }

  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}

const getTypeName = (type: number) => {
  const map: Record<number, string> = { 1: '理论', 2: '方剂', 3: '穴位', 4: '病机' }
  return map[type] || '其他'
}

onMounted(async () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  const uid = getUserId()
  if (!uid) {
    loading.value = false
    return
  }
  userId.value = parseInt(uid)

  try {
    const activityRes = await getTodayActivity(userId.value)
    if (activityRes.code === 200) {
      totalInteractions.value = activityRes.data.total_interactions
    }

    const dates = getLast7Days()
    const statsRes = await getUserFloatStats(userId.value, dates[0] as string, dates[6] as string)

    let processedValues: number[] = []
    if (statsRes.code === 200) {
      const valueMap = new Map()
      statsRes.data.forEach((item: any) => valueMap.set(item.study_date, item.float_value))
      processedValues = dates.map((date) => {
        const val = valueMap.get(date)
        return val ? parseFloat(val.toFixed(2)) : 0
      })
      totalFloat.value = processedValues[6] as number
    }

    const detailsRes = await getTodayKpDetails(userId.value)
    if (detailsRes.code === 200) {
      dailyLogs.value = detailsRes.data.map((item: any) => ({
        name: item.KnowledgePoint?.name || '未知点',
        typeName: getTypeName(item.KnowledgePoint?.type),
        float: parseFloat(item.float_value.toFixed(2)),
      }))
    }

    await nextTick()
    renderChart({ dates, values: processedValues })
  } catch (error) {
    console.error('研习数据加载失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 全局字体强制统一 */
.study-pulse-subpage-wrapper,
.study-pulse-subpage-wrapper * {
  font-family: 'NO3', serif !important;
}

/* 外层包裹层：与书架页面保持一致 */
.study-pulse-subpage-wrapper {
  padding: 10px;
  background: #fdfaf5;
  position: relative;
  min-height: 600px;
}

/* 加载遮罩层 - 印章风格 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(253, 250, 245, 0.9);
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-ink-seal {
  border: 2px double rgba(139, 69, 19, 0.6);
  color: rgba(139, 69, 19, 0.7);
  padding: 12px 28px;
  font-size: 18px;
  letter-spacing: 4px;
  background: rgba(253, 250, 245, 0.8);
  transform: rotate(-3deg);
}

/* 仿古大框 - 与书架页面完全一致 */
.ancient-frame {
  border: 2px solid rgba(139, 69, 19, 0.9);
  padding: 25px;
  position: relative;
  min-height: 600px;
  background: #fdfaf5;
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

/* 顶部标题签条 - 与书架页面一致 */
.study-top-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.title-tab {
  background: rgba(139, 69, 19, 0.95);
  color: #fff;
  padding: 8px 30px;
  font-size: 20px;
  clip-path: polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%);
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.header-decoration-line {
  flex: 1;
  height: 1px;
  background: rgba(139, 69, 19, 0.2);
  margin: 0 15px;
}

.header-seal {
  border: 1px solid rgba(139, 69, 19, 0.8);
  color: rgba(139, 69, 19, 0.8);
  padding: 2px 4px;
  font-size: 12px;
  writing-mode: vertical-rl;
}

/* 统计卡片区 - 与书架页面一致 */
.study-info-grid {
  display: grid;
  grid-template-columns: 180px 180px 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.info-card-mini {
  border: 1px solid rgba(139, 69, 19, 0.3);
  align-items: center;
  padding: 15px;
  background: rgba(139, 69, 19, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-card-mini .label {
  font-size: 20px;
  color: #8d6e63;
  margin-bottom: 5px;
}

.info-card-mini .val {
  font-size: 24px;
  color: rgba(139, 69, 19, 1);
}

.info-card-mini .val small {
  font-size: 12px;
  margin-left: 4px;
}

.wisdom-quote {
  font-style: italic;
  color: rgba(139, 69, 19, 0.6);
  font-size: 20px;
  text-align: right;
  margin: 0;
  line-height: 40px;
}

/* 图表区容器 - 与书架内层容器一致 */
.chart-inner-container {
  border: 1px solid rgba(139, 69, 19, 0.15);
  padding: 20px;
  position: relative;
  background: #fff;
  margin-bottom: 25px;
}

.chart-header {
  text-align: center;
  margin-bottom: 15px;
}

.sub-title {
  font-size: 20px;
  color: rgba(139, 69, 19, 0.7);
}

.pulse-chart {
  width: 100%;
  height: 220px;
}

/* 知识点动态日志区 */
.kp-dynamic-section {
  position: relative;
}

.log-header {
  font-size: 20px;
  color: rgba(139, 69, 19, 0.9);
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.2);
  padding-bottom: 8px;
  display: inline-block;
}

.log-list-viewport {
  position: relative;
  height: 240px;
  overflow: hidden;
  border: 1px solid rgba(139, 69, 19, 0.1);
  background: #fff;
}

.log-list-content {
  height: 100%;
  overflow-y: auto;
  padding: 10px 12px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.log-list-content::-webkit-scrollbar {
  display: none;
}

/* 渐变消隐遮罩层 */
.fade-mask {
  position: absolute;
  left: 0;
  right: 0;
  height: 40px;
  z-index: 2;
  pointer-events: none;
}

.fade-mask.top {
  top: 0;
  background: linear-gradient(to bottom, #fff 0%, rgba(255, 255, 255, 0) 100%);
}

.fade-mask.bottom {
  bottom: 0;
  background: linear-gradient(to top, #fff 0%, rgba(255, 255, 255, 0) 100%);
}

/* 日志行样式 */
.log-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed rgba(139, 69, 19, 0.1);
}

.log-row:last-child {
  border-bottom: none;
}

.kp-info {
  width: 150px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.kp-name {
  font-size: 20px;
  color: #3e2723;
  font-weight: 500;
}

.kp-type {
  font-size: 16px;
  color: #8d6e63;
}

.kp-progress-bar {
  flex: 1;
  height: 8px;
  background: #f0ebe0;
  margin: 0 15px;
  border-radius: 4px;
  overflow: hidden;
}

.kp-progress-bar .fill {
  height: 100%;
  transition: width 0.6s ease-out;
  border-radius: 4px;
}

.kp-val {
  width: 65px;
  flex-shrink: 0;
  text-align: right;
  font-weight: bold;
  font-size: 14px;
}

.pos {
  color: rgba(139, 69, 19, 1);
}

.neg {
  color: #78909c;
}

/* 空状态 - 印章风格 */
.empty-log {
  text-align: center;
  padding: 60px 20px;
  color: #a1887f;
}

.ink-seal-small {
  display: inline-block;
  border: 1.5px double rgba(139, 69, 19, 0.5);
  color: rgba(139, 69, 19, 0.6);
  padding: 6px 20px;
  font-size: 16px;
  margin-bottom: 15px;
  transform: rotate(-5deg);
}

.empty-log p {
  font-style: italic;
  margin: 0;
  font-size: 20px;
}

/* 底部装饰 - 与书架页面一致 */
.frame-footer {
  margin-top: 30px;
  position: relative;
}

.footer-line {
  height: 4px;
  border-top: 1px solid rgba(139, 69, 19, 0.9);
  border-bottom: 1px solid rgba(139, 69, 19, 0.9);
}

.corner-mark-left,
.corner-mark-right {
  position: absolute;
  bottom: -5px;
  width: 15px;
  height: 15px;
  border: 2px solid rgba(139, 69, 19, 0.9);
}

.corner-mark-left {
  left: -5px;
  border-right: none;
  border-top: none;
}

.corner-mark-right {
  right: -5px;
  border-left: none;
  border-top: none;
}
</style>
