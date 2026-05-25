<template>
  <div class="pane-fade">
    <div class="mental-insight-container">
      <!-- 1. 顶部：心相格局（情绪统计汇总） -->
      <section class="mental-composition">
        <div class="section-head">
          <i class="fas fa-th-large"></i>
          <span>心相格局汇总</span>
        </div>
        <div class="composition-grid">
          <div
            v-for="(stat, key) in emotionStats"
            :key="key"
            class="stat-seal-card"
            :class="{ inactive: stat.count === 0 }"
          >
            <div class="seal-rank">{{ getEmotionRank(stat.count) }}</div>
            <div class="seal-char" :class="String(key)">{{ getEmotionChar(String(key)) }}</div>
            <div class="seal-info">
              <span class="name">{{ getEmotionDisplayName(String(key)) }}</span>
              <span class="count">{{ stat.count }} <small>次</small></span>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. 下部：瞬时洞察（带语义解析的关键记录） -->
      <section class="insight-timeline">
        <div class="section-head">
          <i class="fas fa-eye"></i>
          <span>瞬时洞察笔记</span>
        </div>

        <div class="timeline-body">
          <div
            v-for="(log, i) in processedInsights"
            :key="i"
            class="insight-card"
            :class="log.emotion"
          >
            <div class="insight-time">
              <i class="far fa-clock"></i>
              {{ formatDateTime(log.datetime) }}
            </div>

            <div class="insight-main">
              <div class="emotion-indicator">
                <span class="char-icon">{{ getEmotionChar(log.emotion) }}</span>
                <span class="name">{{ log.emotionDisplayName }}</span>
              </div>

              <div class="semantic-analysis">
                <div class="analysis-tag"><i class="fas fa-pen-nib"></i> 阅心笔记</div>
                <p class="analysis-text">{{ generateSemanticText(log) }}</p>
              </div>

              <div class="confidence-meter">
                <span class="meter-label">心神定力</span>
                <div class="meter-bar">
                  <div class="meter-fill" :style="{ width: log.confidence * 100 + '%' }"></div>
                </div>
                <span class="meter-value">{{ (log.confidence * 100).toFixed(0) }}%</span>
              </div>
            </div>

            <!-- 装饰背景 -->
            <div class="card-bg-icon">
              <i :class="getEmotionFAIcon(log.emotion)"></i>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  records: any[]
}>()

/**
 * 情绪中文字符映射
 */
const getEmotionChar = (e: string) => {
  const map: any = {
    neutral: '平',
    happy: '喜',
    sad: '忧',
    angry: '嗔',
    fear: '悸',
    disgust: '厌',
    surprise: '愕',
  }
  return map[e] || '现'
}

const getEmotionDisplayName = (e: string) => {
  const map: any = {
    neutral: '中性',
    happy: '愉悦',
    sad: '忧郁',
    angry: '愤怒',
    fear: '恐惧',
    disgust: '厌恶',
    surprise: '惊讶',
  }
  return map[e] || e
}

const getEmotionFAIcon = (e: string) => {
  const map: any = {
    neutral: 'fas fa-dot-circle',
    happy: 'fas fa-smile-beam',
    sad: 'fas fa-cloud-showers-heavy',
    angry: 'fas fa-fire',
    fear: 'fas fa-wind',
    disgust: 'fas fa-low-vision',
    surprise: 'fas fa-bolt',
  }
  return map[e] || 'fas fa-info-circle'
}

/**
 * 统计全局情绪分布
 */
const emotionStats = computed(() => {
  const stats: any = {
    neutral: { count: 0 },
    happy: { count: 0 },
    sad: { count: 0 },
    angry: { count: 0 },
    fear: { count: 0 },
    disgust: { count: 0 },
    surprise: { count: 0 },
  }
  props.records.forEach((r) => {
    if (stats[r.emotion]) stats[r.emotion].count++
  })
  return stats
})

/**
 * 处理关键洞察点（筛选重要变动或高置信度点）
 */
const processedInsights = computed(() => {
  // 只展示前 15 条或根据逻辑筛选关键点
  return props.records.slice(-15).reverse()
})

/**
 * 生成语义化解析文本（将冰冷的数据转化为文学性描述）
 */
const generateSemanticText = (log: any) => {
  const conf = log.confidence
  if (log.emotion === 'neutral') {
    return conf > 0.8
      ? '其心如止水，神情泰然自若，处于极佳的思考状态。'
      : '神态平稳，未见明显情绪起伏。'
  }
  if (log.emotion === 'happy') {
    return conf > 0.8
      ? '眉间舒展，神采飞扬，展现出极强的自信与亲和力。'
      : '面带笑意，心境颇为愉悦。'
  }
  if (log.emotion === 'angry') {
    return '气息微乱，眉头紧锁，似乎在特定话题上感到了抵触。'
  }
  if (log.emotion === 'sad') {
    return '神色黯然，语速可能有所放缓，表现出一定的沉思或压力。'
  }
  if (log.emotion === 'surprise') {
    return '目露惊愕，心神瞬时震荡，似是对提问感到意料之外。'
  }
  return `此时心神表现为${getEmotionDisplayName(log.emotion)}，定力指数为${(conf * 100).toFixed(0)}。`
}

const getEmotionRank = (count: number) => {
  if (count > 10) return '主导'
  if (count > 5) return '频发'
  if (count > 0) return '偶见'
  return '未见'
}

const formatDateTime = (ts: string | number) => {
  if (!ts) return '暂无'
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.mental-insight-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  font-family: 'NO3', serif;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  color: #3e2723;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0d8c3;
}

.section-head i {
  color: #b71c1c;
}

/* 顶部格局卡片布局 */
.composition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
}

.stat-seal-card {
  background: #fff;
  border: 1px solid #e0d8c3;
  padding: 15px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
}

.stat-seal-card.inactive {
  opacity: 0.5;
  background: #f9f9f9;
}

.seal-rank {
  font-size: 10px;
  color: #8b5e3c;
  position: absolute;
  top: 5px;
  left: 5px;
  border: 1px solid #e0d8c3;
  padding: 0 4px;
}

.seal-char {
  font-size: 32px;
  font-weight: bold;
  margin: 5px 0;
  color: #3e2723;
}

.seal-char.happy {
  color: #f39c12;
}
.seal-char.neutral {
  color: #7f8c8d;
}
.seal-char.angry {
  color: #c0392b;
}
.seal-char.sad {
  color: #3498db;
}
.seal-char.fear {
  color: #9b59b6;
}

.seal-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.seal-info .name {
  font-size: 14px;
  color: #5d4037;
}
.seal-info .count {
  font-size: 16px;
  font-weight: bold;
  color: #b71c1c;
}

/* 洞察笔记时间轴样式 */
.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.insight-card {
  background: #fff;
  border: 1px solid #e0d8c3;
  border-left: 5px solid #8b5e3c;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s;
}

.insight-card:hover {
  transform: translateX(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.insight-time {
  font-size: 13px;
  color: #8d6e63;
  margin-bottom: 12px;
}

.insight-main {
  display: grid;
  grid-template-columns: 100px 1fr 200px;
  gap: 30px;
  align-items: center;
}

.emotion-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.char-icon {
  width: 50px;
  height: 50px;
  border: 2px solid currentColor;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.emotion-indicator .name {
  font-size: 14px;
  font-weight: bold;
}

.semantic-analysis {
  border-left: 1px dashed #e0d8c3;
  padding-left: 25px;
}

.analysis-tag {
  font-size: 12px;
  color: #b71c1c;
  margin-bottom: 5px;
}

.analysis-text {
  font-size: 15px;
  color: #3e2723;
  line-height: 1.6;
  margin: 0;
}

.confidence-meter {
  text-align: right;
}

.meter-label {
  font-size: 12px;
  color: #8d6e63;
  display: block;
  margin-bottom: 5px;
}

.meter-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.meter-fill {
  height: 100%;
  background: #b71c1c;
  transition: width 1s ease-out;
}

.meter-value {
  font-size: 18px;
  font-weight: bold;
  color: #3e2723;
}

/* 卡片背景装饰图标 */
.card-bg-icon {
  position: absolute;
  right: -10px;
  bottom: -15px;
  font-size: 80px;
  color: rgba(139, 94, 60, 0.03);
  pointer-events: none;
  transform: rotate(-15deg);
}

/* 针对不同情绪的色调微调 */
.insight-card.happy {
  border-left-color: #f39c12;
}
.insight-card.happy .char-icon {
  color: #f39c12;
}
.insight-card.angry {
  border-left-color: #c0392b;
}
.insight-card.angry .char-icon {
  color: #c0392b;
}
.insight-card.surprise {
  border-left-color: #f1c40f;
}
.insight-card.surprise .char-icon {
  color: #f1c40f;
}

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

@media (max-width: 900px) {
  .insight-main {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  .semantic-analysis {
    border-left: none;
    padding-left: 0;
    border-top: 1px dashed #e0d8c3;
    padding-top: 15px;
  }
  .confidence-meter {
    text-align: left;
  }
}
</style>
