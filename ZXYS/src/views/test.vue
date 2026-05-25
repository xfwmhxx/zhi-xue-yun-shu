<template>
  <div class="persona-dashboard-wrapper">
    <!-- 仿古大背景与动态网格 -->
    <div class="ancient-grid-bg"></div>

    <div class="main-frame glass-container">
      <!-- 1. 顶部标题栏：仿古籍签条 + 数字化信息 -->
      <header class="dashboard-header">
        <div class="title-tab">
          <span class="tab-text">杏林·学子画像</span>
        </div>
        <div class="system-status">
          <div class="status-item">
            <i class="fas fa-microchip"></i>
            <span>逻辑引擎：正常</span>
          </div>
          <div class="status-item">
            <i class="fas fa-fingerprint"></i>
            <span>身份编码：TCM-00892</span>
          </div>
        </div>
        <div class="header-seal">壹号案</div>
      </header>

      <!-- 2. 画像核心：用户信息与五行能力 (2栏布局) -->
      <div class="core-profile-section">
        <!-- 左侧：用户基础与标签 (Glass Card) -->
        <div class="profile-card inner-glass">
          <div class="avatar-scanner">
            <div class="scan-line"></div>
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Jade" alt="avatar" />
          </div>
          <div class="user-id-group">
            <h2 class="user-name">慕容针灸 <i class="fas fa-leaf seal-color"></i></h2>
            <p class="user-rank">【阶位：灵枢中阶 · 寻方使】</p>
          </div>
          <div class="tag-cloud">
            <span class="persona-tag"><i class="fas fa-brain"></i> 辩证逻辑强</span>
            <span class="persona-tag"><i class="fas fa-book-open"></i> 经典深耕</span>
            <span class="persona-tag"><i class="fas fa-flask"></i> 实验先锋</span>
          </div>
        </div>

        <!-- 右侧：五行能力雷达图 (ECharts) -->
        <div class="capability-radar inner-glass">
          <div class="chart-label">〈 五维医力模型 〉</div>
          <div ref="radarChartRef" class="echart-box"></div>
        </div>
      </div>

      <!-- 3. 中间：关键修习数据 (4列统计) -->
      <section class="stat-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-icon"><i :class="stat.icon"></i></div>
          <div class="stat-content">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-val"
              >{{ stat.val }}<small>{{ stat.unit }}</small></span
            >
          </div>
        </div>
      </section>

      <!-- 4. 底部图表区：经络掌握度 & 动态日志 -->
      <div class="bottom-flex-layout">
        <!-- 十二经脉掌握柱状图 -->
        <div class="meridian-section inner-glass">
          <div class="chart-label">〈 十二经脉掌握度对比 〉</div>
          <div ref="barChartRef" class="echart-box"></div>
        </div>

        <!-- 实时修习动态 -->
        <div class="log-section inner-glass">
          <div class="log-header">今日功课日志</div>
          <div class="log-list">
            <div class="log-row" v-for="(log, index) in logs" :key="index">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-text">{{ log.text }}</span>
              <span class="log-status" :class="log.type">{{ log.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 装饰角标 -->
      <div class="frame-footer">
        <div class="footer-line"></div>
        <div class="seal-mark-bottom"><i class="fas fa-stamp"></i> 杏林内苑</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const radarChartRef = ref(null)
const barChartRef = ref(null)

const stats = ref([
  { label: '悟道时长', val: '1280', unit: '刻', icon: 'fas fa-hourglass-half' },
  { label: '识药总数', val: '428', unit: '味', icon: 'fas fa-mortar-pestle' },
  { label: '收纳方剂', val: '156', unit: '首', icon: 'fas fa-scroll' },
  { label: '辩证准确', val: '94.2', unit: '%', icon: 'fas fa-check-double' },
])

const logs = ref([
  { time: '10:15', text: '研读《伤寒论》白虎汤证', status: '精进', type: 'pos' },
  { time: '14:20', text: '经穴识别：足三里偏差校验', status: '修正', type: 'neg' },
  { time: '16:50', text: '模拟开方：理中丸加减', status: '达成', type: 'pos' },
  { time: '昨日', text: '本草考勤：黄芪药性辨识', status: '全勤', type: 'pos' },
])

const initRadarChart = () => {
  const myChart = echarts.init(radarChartRef.value)
  const option = {
    radar: {
      indicator: [
        { name: '药理', max: 100 },
        { name: '方剂', max: 100 },
        { name: '经络', max: 100 },
        { name: '脉诊', max: 100 },
        { name: '经典', max: 100 },
      ],
      axisLine: { lineStyle: { color: 'rgba(166, 124, 82, 0.4)' } },
      splitLine: { lineStyle: { color: 'rgba(166, 124, 82, 0.2)' } },
      splitArea: { show: false },
      shape: 'circle',
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [85, 72, 94, 60, 88],
            name: '能力画像',
            itemStyle: { color: '#B22222' },
            areaStyle: { color: 'rgba(178, 34, 34, 0.3)' },
          },
        ],
      },
    ],
  }
  myChart.setOption(option)
}

const initBarChart = () => {
  const myChart = echarts.init(barChartRef.value)
  const option = {
    grid: { top: '10%', bottom: '20%', left: '10%', right: '5%' },
    xAxis: {
      type: 'category',
      data: ['肺', '大肠', '胃', '脾', '心', '小肠'],
      axisLabel: { color: '#5d4037', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(166, 124, 82, 0.3)' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: 'rgba(166, 124, 82, 0.1)' } },
      axisLabel: { show: false },
    },
    series: [
      {
        data: [90, 75, 88, 64, 95, 45],
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#A67C52' },
            { offset: 1, color: 'rgba(166, 124, 82, 0.1)' },
          ]),
        },
        barWidth: '40%',
      },
    ],
  }
  myChart.setOption(option)
}

onMounted(async () => {
  await nextTick()
  initRadarChart()
  initBarChart()
})
</script>

<style scoped>
/* 全局字体：引用类似古籍的 Serif 字体 */
.persona-dashboard-wrapper {
  font-family: 'Noto Serif SC', 'PingFang SC', serif;
  min-height: 100vh;
  background-color: #fdf6ed;
  padding: 20px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 数字化背景网格 */
.ancient-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(166, 124, 82, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(166, 124, 82, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
}

/* 主框架：毛玻璃 + 仿古边框 */
.main-frame {
  width: 1000px;
  max-width: 95vw;
  background: rgba(253, 245, 230, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid #a67c52;
  border-radius: 4px; /* 硬朗边缘更具科技感 */
  padding: 30px;
  box-shadow: 0 15px 50px rgba(74, 52, 46, 0.15);
  position: relative;
  z-index: 1;
}

/* 内部通用的浅色毛玻璃容器 */
.inner-glass {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 4px;
  padding: 15px;
}

/* 标题签条 */
.dashboard-header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.3);
  padding-bottom: 15px;
}

.title-tab {
  background: #b22222;
  color: #fff;
  padding: 6px 25px;
  font-size: 18px;
  clip-path: polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%);
  margin-right: 20px;
}

.system-status {
  flex: 1;
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #8b4513;
  font-family: monospace;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.header-seal {
  border: 1px solid #b22222;
  color: #b22222;
  padding: 2px 5px;
  font-size: 12px;
  writing-mode: vertical-rl;
  font-weight: bold;
}

/* 画像核心区 */
.core-profile-section {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 20px;
  margin-bottom: 25px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-scanner {
  position: relative;
  width: 100px;
  height: 100px;
  border: 2px solid #a67c52;
  padding: 5px;
  background: #fff;
  margin-bottom: 15px;
}

.avatar-scanner img {
  width: 100%;
  height: 100%;
}

.scan-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: #b22222;
  box-shadow: 0 0 8px #b22222;
  animation: scan 3s infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  50% {
    top: 100%;
  }
  100% {
    top: 0;
  }
}

.user-name {
  margin: 0;
  font-size: 1.5rem;
  color: #3e2723;
}
.seal-color {
  color: #b22222;
  font-size: 1.2rem;
}
.user-rank {
  font-size: 0.8rem;
  color: #a67c52;
  margin: 5px 0 15px;
}

.persona-tag {
  display: inline-block;
  background: rgba(178, 34, 34, 0.05);
  border: 1px solid rgba(178, 34, 34, 0.2);
  color: #b22222;
  font-size: 11px;
  padding: 2px 8px;
  margin: 3px;
  border-radius: 2px;
}

/* 统计网格 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 1px solid rgba(166, 124, 82, 0.15);
  background: rgba(166, 124, 82, 0.03);
}

.stat-icon {
  font-size: 1.5rem;
  color: #a67c52;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #8d6e63;
}
.stat-val {
  font-size: 1.4rem;
  font-weight: bold;
  color: #3e2723;
}
.stat-val small {
  font-size: 12px;
  margin-left: 2px;
}

/* 底部布局 */
.bottom-flex-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
}

.chart-label {
  font-size: 13px;
  color: #a67c52;
  text-align: center;
  margin-bottom: 10px;
}

.echart-box {
  width: 100%;
  height: 200px;
}

/* 日志区 */
.log-header {
  font-size: 15px;
  color: #b22222;
  border-bottom: 1px dashed rgba(178, 34, 34, 0.3);
  padding-bottom: 8px;
  margin-bottom: 10px;
}

.log-row {
  display: flex;
  font-size: 12px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.log-time {
  color: #a67c52;
  width: 50px;
}
.log-text {
  flex: 1;
  color: #3e2723;
}
.log-status {
  width: 40px;
  text-align: right;
}
.log-status.pos {
  color: #b22222;
  font-weight: bold;
}
.log-status.neg {
  color: #78909c;
}

/* 底部修饰 */
.frame-footer {
  margin-top: 25px;
  position: relative;
  text-align: center;
}
.footer-line {
  height: 3px;
  border-top: 1px solid #a67c52;
  border-bottom: 1px solid #a67c52;
}
.seal-mark-bottom {
  display: inline-block;
  background: #fdf6ed;
  padding: 0 15px;
  position: relative;
  top: -12px;
  font-size: 12px;
  color: #b22222;
  font-weight: bold;
}
</style>
