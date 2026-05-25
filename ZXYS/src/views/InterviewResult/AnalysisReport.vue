<template>
  <div class="pane-fade">
    <div class="traditional-report-container">
      <!-- 1. 顶部：评分与总结（大印与奏章） -->
      <section class="report-header">
        <div class="overall-score-seal">
          <div class="main-seal-border">
            <div class="seal-content">
              <span class="seal-label">综合评分</span>
              <span class="seal-number">{{ result?.overall_score || 0 }}</span>
            </div>
          </div>
          <div class="match-ribbon">
            <i class="fas fa-handshake"></i>
            <span>匹配度：{{ result?.match_status || '暂无' }}</span>
          </div>
        </div>

        <div class="summary-scroll">
          <div class="scroll-inner">
            <div class="summary-title">
              <i class="fas fa-feather-alt"></i>
              <h4>面试详述总结</h4>
            </div>
            <p class="summary-text">{{ result?.summary?.text || '暂无总结' }}</p>
            <div class="summary-tags">
              <span class="trad-tag persona">
                <i class="fas fa-user-tag"></i> 角色：{{ result?.summary?.persona || '未知' }}
              </span>
              <span class="trad-tag risk" :class="getRiskClass(result?.summary?.risk_level)">
                <i class="fas fa-exclamation-circle"></i> 风险：{{
                  result?.summary?.risk_level || '未知'
                }}
              </span>
              <span class="trad-tag weakness">
                <i class="fas fa-bullseye"></i> 弱点：{{ result?.summary?.core_weakness || '无' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. 中间：雷达图与详评（五味辨证图） -->
      <section class="radar-section">
        <div class="radar-container">
          <div class="section-title">
            <i class="fas fa-atom"></i>
            <span>能力五维图</span>
          </div>
          <div class="radar-chart" ref="radarChartRef"></div>
        </div>

        <div class="radar-detail-panel" v-if="selectedDimension">
          <div
            class="detail-header"
            :style="{ borderLeftColor: getDimensionColor(selectedDimension.name) }"
          >
            <i
              :class="getDimensionIcon(selectedDimension.name)"
              :style="{ color: getDimensionColor(selectedDimension.name) }"
            ></i>
            <span class="detail-title">{{ selectedDimension.name }}</span>
            <span class="detail-score">{{ selectedDimension.value }}<small>分</small></span>
          </div>
          <div class="detail-content">
            <div class="ink-brush-bg"></div>
            <p>{{ getDimensionDescription(selectedDimension.name) }}</p>
          </div>
        </div>
        <div class="radar-hint" v-else>
          <i class="fas fa-fingerprint"></i> 点击左侧图谱点位，阅览维度详解
        </div>
      </section>

      <!-- 3. 底部：维度网格（案卷分目） -->
      <section class="dimensions-section">
        <div class="section-title">
          <i class="fas fa-list-ol"></i>
          <span>维度深度剖析</span>
        </div>
        <div class="dimensions-grid">
          <div
            v-for="(value, key) in result?.dimension_details"
            :key="key"
            class="dimension-card-trad"
            :class="{ active: selectedDimension?.name === key }"
            @click="selectDimension(key)"
          >
            <div class="card-header">
              <div class="header-left">
                <i :class="getDimensionIcon(key)"></i>
                <span class="dim-name">{{ key }}</span>
              </div>
              <span class="dim-value">{{ getDimensionScore(key) }}分</span>
            </div>
            <div class="card-body">
              {{ value }}
            </div>
            <div class="card-footer-line"></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  result: any
  radarData: any[]
}>()

const radarChartRef = ref<HTMLElement | null>(null)
let radarChart: echarts.ECharts | null = null
const selectedDimension = ref<any>(null)

/**
 * 风险等级样式映射（盖戳效果）
 */
const getRiskClass = (risk: string) => {
  if (risk === '低') return 'risk-low-stamp'
  if (risk === '中') return 'risk-medium-stamp'
  return 'risk-high-stamp'
}

const getDimensionScore = (name: any) => {
  const item = props.radarData.find((d) => d.name === name)
  return item ? item.value : 0
}

/**
 * Font Awesome 图标映射
 */
const getDimensionIcon = (name: any) => {
  const icons: any = {
    专业基础: 'fas fa-book-open',
    辨证能力: 'fas fa-eye',
    临床治法: 'fas fa-mortar-pestle',
    沟通稳定性: 'fas fa-comments',
    职业素养: 'fas fa-user-graduate',
  }
  return icons[name] || 'fas fa-star'
}

const getDimensionColor = (name: any) => {
  const colors: any = {
    专业基础: '#d35400', // 赭石
    辨证能力: '#2980b9', // 靛青
    临床治法: '#27ae60', // 石绿
    沟通稳定性: '#8e44ad', // 绛紫
    职业素养: '#c0392b', // 朱砂
  }
  return colors[name] || '#b71c1c'
}

const getDimensionDescription = (name: any) => {
  return props.result?.dimension_details?.[name] || '此项维度尚待进一步辨证分析。'
}

/**
 * 选中维度并更新图表
 */
const selectDimension = (name: any) => {
  const found = props.radarData.find((d) => d.name === name)
  if (found) {
    selectedDimension.value = found
    updateRadarHighlight(name)
  }
}

/**
 * 更新雷达图高亮效果
 */
const updateRadarHighlight = (name: string) => {
  if (!radarChart) return
  const index = props.radarData.findIndex((d) => d.name === name)

  radarChart.setOption({
    series: [
      {
        data: [
          {
            value: props.radarData.map((d) => d.value),
            name: '能力评分',
            symbolSize: (val: any, params: any) => {
              // 只放大选中的那个点
              return params.dataIndex === index ? 14 : 8
            },
            itemStyle: {
              color: (params: any) => {
                return params.dataIndex === index ? getDimensionColor(name) : '#b71c1c'
              },
            },
          },
        ],
      },
    ],
  })
}

const initRadar = () => {
  if (!radarChartRef.value || props.radarData.length === 0) return
  if (radarChart) radarChart.dispose()
  radarChart = echarts.init(radarChartRef.value)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      backgroundColor: 'rgba(253, 245, 230, 0.9)',
      borderColor: '#8b5e3c',
      textStyle: { color: '#3e2723', fontFamily: 'NO3' },
    },
    radar: {
      indicator: props.radarData.map((d) => ({ name: d.name, max: 100 })),
      shape: 'circle',
      radius: '65%',
      axisLine: { lineStyle: { color: '#8b5e3c', opacity: 0.5 } },
      splitLine: { lineStyle: { color: '#e0d8c3', width: 1 } },
      splitArea: {
        areaStyle: {
          color: ['rgba(139, 94, 60, 0.02)', 'rgba(139, 94, 60, 0.08)'],
        },
      },
      name: {
        textStyle: {
          color: '#5d4037',
          fontFamily: 'NO3',
          fontSize: 14,
          padding: [3, 5],
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: props.radarData.map((d) => d.value),
            name: '能力评分',
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: 'rgba(183, 28, 28, 0.1)' },
                { offset: 1, color: 'rgba(183, 28, 28, 0.4)' },
              ]),
            },
            lineStyle: { color: '#b71c1c', width: 2 },
            itemStyle: { color: '#b71c1c', borderWidth: 2 },
            symbol: 'circle',
            symbolSize: 8,
          },
        ],
      },
    ],
  }

  radarChart.setOption(option)

  // 图表点击交互
  radarChart.on('click', (params: any) => {
    if (params.componentType === 'series') {
      // 找到点击的维度索引
      const dimIndex = params.event.target.__dimIdx // ECharts内部属性获取
      if (dimIndex !== undefined) {
        const dimName = props.radarData[dimIndex].name
        selectDimension(dimName)
      }
    }
  })
}

onMounted(() => {
  nextTick(() => {
    initRadar()
    if (props.radarData.length > 0) selectDimension(props.radarData[0].name)
  })
  window.addEventListener('resize', () => radarChart?.resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => radarChart?.resize())
  radarChart?.dispose()
})

watch(
  () => props.radarData,
  () => {
    initRadar()
  },
  { deep: true },
)
</script>

<style scoped>
.traditional-report-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  font-family: 'NO3', serif;
}

/* 顶部：印章与详评 */
.report-header {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  align-items: center;
}

.overall-score-seal {
  position: relative;
  text-align: center;
}

.main-seal-border {
  width: 160px;
  height: 160px;
  border: 4px double #b71c1c;
  padding: 5px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-5deg);
}

.seal-content {
  width: 100%;
  height: 100%;
  border: 2px solid #b71c1c;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(183, 28, 28, 0.02);
}

.seal-label {
  font-size: 14px;
  color: #b71c1c;
  border-bottom: 1px solid #b71c1c;
  margin: 0 20px 5px;
  padding-bottom: 5px;
}

.seal-number {
  font-size: 56px;
  font-weight: bold;
  color: #b71c1c;
  line-height: 1;
}

.match-ribbon {
  margin-top: 15px;
  background: #8b5e3c;
  color: #fff;
  padding: 5px 15px;
  font-size: 14px;
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.summary-scroll {
  background: #fdfaf5;
  border: 1px solid #e0d8c3;
  padding: 25px;
  position: relative;
  box-shadow: inset 0 0 20px rgba(139, 94, 60, 0.05);
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #3e2723;
  margin-bottom: 15px;
}

.summary-title h4 {
  font-size: 30px;
  margin: 0;
  letter-spacing: 1px;
}

.summary-text {
  line-height: 1.8;
  color: #5d4037;
  font-size: 24px;
  margin-bottom: 20px;
}

.summary-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.trad-tag {
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #e0d8c3;
  font-size: 20px;
  color: #8b5e3c;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 风险盖戳样式 */
.risk-low-stamp {
  color: #2e7d32;
  border-color: #2e7d32;
  background: rgba(46, 125, 50, 0.05);
}
.risk-medium-stamp {
  color: #f39c12;
  border-color: #f39c12;
  background: rgba(243, 156, 18, 0.05);
}
.risk-high-stamp {
  color: #c62828;
  border-color: #c62828;
  background: rgba(198, 40, 40, 0.05);
}

/* 雷达图区域 */
.radar-section {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 30px;
  background: rgba(253, 245, 230, 0.5);
  padding: 30px;
  border-radius: 4px;
  border: 1px solid #e0d8c3;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 30px;
  color: #3e2723;
  margin-bottom: 20px;
  font-weight: bold;
}

.radar-chart {
  width: 100%;
  height: 380px;
}

.radar-detail-panel {
  background: #fff;
  border: 1px solid #e0d8c3;
  border-left: 6px solid #b71c1c;
  padding: 25px;
  position: relative;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.03);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #eee;
}

.detail-header i {
  font-size: 24px;
}

.detail-title {
  font-size: 24px;
  font-weight: bold;
  flex: 1;
  color: #3e2723;
}

.detail-score {
  font-size: 28px;
  font-weight: bold;
  color: #b71c1c;
}

.detail-score small {
  font-size: 14px;
  margin-left: 2px;
}

.detail-content {
  position: relative;
  z-index: 1;
}

.detail-content p {
  line-height: 1.8;
  color: #5d4037;
  font-size: 24px;
}

.radar-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #8d6e63;
  font-style: italic;
  background: #fff;
  border: 1px dashed #e0d8c3;
}

/* 维度网格 */
.dimensions-section {
  margin-top: 10px;
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.dimension-card-trad {
  background: #fff;
  border: 1px solid #e0d8c3;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.dimension-card-trad:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(139, 94, 60, 0.1);
}

.dimension-card-trad.active {
  border-color: #b71c1c;
  background: #fdf5e6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #3e2723;
  font-weight: 400;
  font-size: 24px;
}

.dim-value {
  color: #b71c1c;
  font-weight: bold;
}

.card-body {
  font-size: 20px;
  color: #795548;
  line-height: 1.6;
  height: 4.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-footer-line {
  height: 2px;
  background: #e0d8c3;
  margin-top: 15px;
  width: 40px;
  transition: width 0.3s;
}

.dimension-card-trad.active .card-footer-line {
  width: 100%;
  background: #b71c1c;
}

/* 动画 */
.pane-fade {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
