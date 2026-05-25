<template>
  <BreadcrumbNav
    title="面试阅心分析"
    :show-back="true"
    :breadcrumb-items="[
      { name: '面试记录', url: '/Foundations/userhome/interview' },
      { name: '面试详情', url: '' },
    ]"
  />

  <main class="analysis-container" v-if="!loading">
    <!-- 顶部总览 -->
    <section class="spirit-header fade-in">
      <div class="seal-container">
        <div class="main-seal">
          <span class="seal-character">{{ dominantEmotionChar }}</span>
          <div class="seal-label">主导心境</div>
        </div>
      </div>

      <div class="spirit-info">
        <h1 class="analysis-title">面试表现·阅心详卷</h1>
        <div class="meta-row">
          <span class="meta-tag">面试标题：{{ interviewTitle }}</span>
          <span class="meta-tag">测评时间：{{ formatDate(analysisData.exportTime) }}</span>
          <span class="meta-tag">全程耗时：{{ formatDuration(totalDuration) }}</span>
        </div>

        <div class="spirit-stats-grid">
          <div class="stat-card">
            <span class="label">心神转折</span>
            <span class="value">{{ totalEmotionChanges }} <small>次</small></span>
          </div>
          <div class="stat-card">
            <span class="label">定力指数</span>
            <span class="value">{{ stability }}<small>%</small></span>
          </div>
          <div class="stat-card">
            <span class="label">反应灵敏</span>
            <span class="value">{{ averageDurationPerEmotion }}<small>s</small></span>
          </div>
        </div>
      </div>
    </section>

    <!-- 交互看板 -->
    <section class="analysis-board">
      <div class="board-tabs">
        <button
          v-for="t in tabs"
          :key="t.id"
          :class="['board-tab-btn', { active: activeTab === t.id }]"
          @click="activeTab = t.id"
        >
          {{ t.name }}
        </button>
      </div>

      <div class="board-content">
        <TrendChart v-if="activeTab === 'trend'" :records="emotionRecords" />
        <SnapshotList v-if="activeTab === 'snapshots'" :snapshots="emotionSnapshots" />
        <RecordDetails v-if="activeTab === 'details'" :records="emotionRecords" />
        <QuestionsPanel v-if="activeTab === 'questions'" :questions="enhancedQuestions" />
        <AnalysisReport
          v-if="activeTab === 'analysis'"
          :result="analysisResult"
          :radarData="radarData"
        />
      </div>
    </section>
  </main>
  <div v-else class="loading-state">正在调取案卷，请稍候...</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getInterviewRecord } from '@/api/interviewRecord'
import { getUserId } from '@/utils/storage'

// 组件导入
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import TrendChart from '@/views/InterviewResult/TrendChart.vue'
import SnapshotList from '@/views/InterviewResult/SnapshotList.vue'
import RecordDetails from '@/views/InterviewResult/RecordDetails.vue'
import QuestionsPanel from '@/views/InterviewResult/QuestionsPanel.vue'
import AnalysisReport from '@/views/InterviewResult/AnalysisReport.vue'

const route = useRoute()
const recordId = ref(route.params.id)
const loading = ref(true)
const activeTab = ref('trend')

// 数据状态
const interviewTitle = ref('')
const totalDuration = ref(0)
const totalEmotionChanges = ref(0)
const averageDurationPerEmotion = ref('0')
const emotionRecords = ref<any[]>([])
const emotionSnapshots = ref<any[]>([])
const analysisResult = ref<any>(null)
const enhancedQuestions = ref<any[]>([])
const analysisData = ref<any>({ exportTime: '', emotionStatistics: {} })

const tabs = [
  { id: 'trend', name: '脉象起伏' },
  { id: 'snapshots', name: '留影存真' },
  { id: 'details', name: '案卷详情' },
  { id: 'questions', name: '面试问答' },
  { id: 'analysis', name: '综合分析' },
]

// 计算属性
const dominantEmotionChar = computed(() => {
  const stats = analysisData.value.emotionStatistics
  let maxKey = 'neutral'
  let maxVal = 0
  for (let key in stats) {
    if (stats[key].totalDuration > maxVal) {
      maxVal = stats[key].totalDuration
      maxKey = key
    }
  }
  const charMap: any = {
    neutral: '平',
    happy: '喜',
    sad: '忧',
    angry: '怒',
    fear: '惧',
    disgust: '厌',
    surprise: '惊',
  }
  return charMap[maxKey] || '平'
})

const stability = computed(() => {
  const neutralTime = analysisData.value.emotionStatistics.neutral?.totalDuration || 0
  if (totalDuration.value === 0) return 0
  return ((neutralTime / totalDuration.value) * 100).toFixed(0)
})

const radarData = computed(() => {
  if (!analysisResult.value?.radar_chart) return []
  const chart = analysisResult.value.radar_chart
  return [
    { name: '专业基础', value: chart.tcm_basis || 0 },
    { name: '辨证能力', value: chart.diagnosis_ability || 0 },
    { name: '临床治法', value: chart.clinical_treatment || 0 },
    { name: '沟通稳定性', value: chart.communication_stability || 0 },
    { name: '职业素养', value: chart.professionalism || 0 },
  ]
})

const fetchInterviewDetail = async () => {
  const userId = getUserId()
  if (!userId) {
    console.error('用户未登录')
    loading.value = false
    return
  }

  try {
    const result = await getInterviewRecord(Number(recordId.value), Number(userId))
    if (result.data.code === 200 && result.data.data) {
      const d = result.data.data
      interviewTitle.value = d.jobDescription || '未命名面试'
      analysisResult.value = d.analysisResult

      if (d.emotionInspect) {
        const ins = d.emotionInspect
        emotionRecords.value = ins.records || []
        analysisData.value.exportTime = ins.exportTime || new Date().toISOString()
        totalDuration.value = new Date(ins.endTime).getTime() - new Date(ins.startTime).getTime()

        // 统计情绪时间
        const stats: any = {
          neutral: { totalDuration: 0 },
          happy: { totalDuration: 0 },
          sad: { totalDuration: 0 },
          angry: { totalDuration: 0 },
          fear: { totalDuration: 0 },
          disgust: { totalDuration: 0 },
          surprise: { totalDuration: 0 },
        }
        emotionRecords.value.forEach((r, i) => {
          if (i < emotionRecords.value.length - 1) {
            const dur = emotionRecords.value[i + 1].timestamp - r.timestamp
            if (stats[r.emotion]) stats[r.emotion].totalDuration += dur
          }
        })
        analysisData.value.emotionStatistics = stats
        totalEmotionChanges.value = emotionRecords.value.filter(
          (r, i) => i > 0 && r.emotion !== emotionRecords.value[i - 1].emotion,
        ).length
        averageDurationPerEmotion.value = (
          totalDuration.value /
          (emotionRecords.value.length || 1) /
          1000
        ).toFixed(1)
      }

      // 快照
      emotionSnapshots.value = d.snapshots || []

      // 修改 enhancedQuestions 的构建
      if (d.solveQuestions?.questions) {
        const details = d.analysisResult?.question_details || []
        enhancedQuestions.value = d.solveQuestions.questions.map((q: any, i: number) => {
          const detail = details[i] || {}
          return {
            ...q,
            user_answer: d.solveQuestions.questions[i]?.user_answer || '', // 从 solveQuestions 中获取用户答案
            score: detail.score || 0,
            ai_feedback: detail.ai_feedback || 'AI正在分析中...',
            risk_tag: detail.risk_tag || '正常',
            model_answer: detail.model_answer || '暂无参考答案',
            improvement:
              detail.score < 70
                ? '建议结合中医基础理论加强辨证逻辑。'
                : '表现良好，可进一步提升临床用药的精准度。',
          }
        })
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const formatDate = (s: string) =>
  s
    ? new Date(s).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '暂无'
const formatDuration = (ms: number) => {
  const sec = Math.floor(ms / 1000)
  return sec > 60 ? `${Math.floor(sec / 60)}分${sec % 60}秒` : `${sec}秒`
}

onMounted(fetchInterviewDetail)
</script>

<style scoped>
.analysis-container {
  max-width: 1300px;
  margin: 30px auto 40px;
  padding: 0 20px;
  font-family: 'NO3', serif;
}
.spirit-header {
  display: flex;
  align-items: center;
  gap: 50px;
  background: rgba(253, 245, 230, 0.9);
  padding: 40px;
  border: 1px solid #e0d8c3;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  margin-top: 8vh;
}
.main-seal {
  width: 150px;
  height: 150px;
  border: 6px double #b71c1c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #b71c1c;
  background: #fff;
}
.seal-character {
  font-size: 70px;
  font-weight: bold;
}
.analysis-title {
  font-size: 36px;
  color: #3e2723;
  margin-bottom: 10px;
}
.meta-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}
.meta-tag {
  color: #8b5e3c;
  font-size: 20px;
  border-left: 3px solid #b71c1c;
  padding-left: 10px;
}
.spirit-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.stat-card {
  background: rgba(139, 94, 60, 0.05);
  padding: 15px;
  text-align: center;
  border: 1px solid rgba(139, 94, 60, 0.1);
}
.stat-card .label {
  display: block;
  font-size: 20px;
  color: #8d6e63;
  margin-bottom: 5px;
}
.stat-card .value {
  font-size: 24px;
  font-weight: bold;
  color: #3e2723;
}
.analysis-board {
  background: #fff;
  border: 1px solid #e0d8c3;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}
.board-tabs {
  display: flex;
  background: #fdfaf5;
  border-bottom: 1px solid #e0d8c3;
}
.board-tab-btn {
  padding: 18px 30px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  color: #8d6e63;
  font-family: 'NO3';
  transition: 0.3s;
}
.board-tab-btn.active {
  color: #b71c1c;
  background: #fff;
  box-shadow: 0 -3px 0 #b71c1c inset;
  font-weight: bold;
}
.board-content {
  padding: 30px;
  min-height: 500px;
}
.loading-state {
  text-align: center;
  padding: 100px;
  font-size: 20px;
  color: #8b5e3c;
}
</style>
