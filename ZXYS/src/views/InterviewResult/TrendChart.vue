<template>
  <div class="pane-fade">
    <div class="chart-wrapper">
      <div class="chart-header">
        <h3>【情绪起伏·脉象图】</h3>
        <p>线条的高低代表了面试过程中情感表达的置信深度</p>
      </div>
      <div class="echart-instance" ref="chartRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  records: any[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

const formatDateTime = (ts: string | number) => {
  if (!ts) return '暂无'
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

const initChart = () => {
  if (!chartRef.value || props.records.length === 0) return
  if (myChart) myChart.dispose()

  myChart = echarts.init(chartRef.value)
  const emotionColors: any = {
    happy: '#f39c12',
    neutral: '#95a5a6',
    disgust: '#e74c3c',
    sad: '#3498db',
    angry: '#c0392b',
    fear: '#9b59b6',
    surprise: '#f1c40f',
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fdfaf5',
      borderColor: '#8b5e3c',
      textStyle: { color: '#3e2723' },
      formatter: (params: any) => {
        const index = params[0].dataIndex
        const record = props.records[index]
        return `时间：${formatDateTime(record.datetime)}<br/>情绪：${record.emotionDisplayName}<br/>置信度：${(record.confidence * 100).toFixed(1)}%`
      },
    },
    xAxis: {
      type: 'category',
      data: props.records.map((d) => formatDateTime(d.datetime)),
      axisLine: { lineStyle: { color: '#8b5e3c' } },
    },
    yAxis: {
      type: 'value',
      max: 1,
      min: 0,
      splitLine: { lineStyle: { color: '#e0d8c3', type: 'dashed' } },
      axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: props.records.map((d) => d.confidence),
        lineStyle: { color: '#8b5e3c', width: 2 },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: (params: any) =>
            emotionColors[props.records[params.dataIndex].emotion] || '#95a5a6',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 94, 60, 0.3)' },
            { offset: 1, color: 'rgba(253, 245, 230, 0.05)' },
          ]),
        },
      },
    ],
  }
  myChart.setOption(option)
}

watch(
  () => props.records,
  () => initChart(),
  { deep: true },
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => myChart?.resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => myChart?.resize())
  myChart?.dispose()
})
</script>

<style scoped>
.echart-instance {
  width: 100%;
  height: 400px;
}
.chart-header {
  margin-bottom: 30px;
}
.chart-header h3 {
  color: #3e2723;
  font-size: 30px;
  font-weight: 400;
}
.chart-header p {
  color: #8d6e63;
  font-size: 20px;
}
.pane-fade {
  animation: fadeIn 0.5s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
