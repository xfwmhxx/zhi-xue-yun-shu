<template>
  <div class="interview-section">
    <!-- 顶部概览统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-microchip"></i></div>
        <div class="stat-info">
          <span class="label">累计模拟面试</span>
          <span class="value">{{ totalInterviews }} <small>场</small></span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-hourglass-half"></i></div>
        <div class="stat-info">
          <span class="label">正在分析中</span>
          <span class="value">{{ analyzingCount }} <small>场</small></span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-award"></i></div>
        <div class="stat-info">
          <span class="label">平均表现分</span>
          <span class="value">{{ avgScore }} <small>分</small></span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fas fa-exclamation-triangle"></i></div>
        <div class="stat-info">
          <span class="label">分析失败</span>
          <span class="value">{{ failedCount }} <small>场</small></span>
        </div>
      </div>
    </div>

    <!-- 日历筛选区域 + 查看全部按钮 -->
    <div class="calendar-filter-card">
      <div class="calendar-header">
        <div class="header-left">
          <h4 class="filter-title"><i class="far fa-calendar-alt"></i> 快速日期筛选</h4>
          <span class="selected-label">{{ formatDateLabel(String(selectedDate)) }}</span>
        </div>
        <div class="header-buttons">
          <button class="view-all-btn" @click="viewAllRecords">
            <i class="fas fa-list-ul"></i> 查看全部记录
          </button>
          <button class="full-calendar-btn" @click="showCalendarModal = true">
            <i class="fas fa-calendar-check"></i> 全部日期
          </button>
        </div>
      </div>

      <div class="week-strip">
        <div
          v-for="date in weekDates"
          :key="date.full"
          :class="['week-day-pill', { active: selectedDate === date.full && !isViewingAll }]"
          @click="selectWeekDate(date.full)"
        >
          <span class="w-name">{{ date.week }}</span>
          <span class="w-num">{{ date.day }}</span>
          <!-- 数据小点提示 -->
          <span v-if="hasDataOnDate(date.full)" class="data-dot"></span>
        </div>
      </div>
    </div>

    <!-- 面试记录列表 -->
    <div class="record-container">
      <div class="record-header">
        <h3 class="title">
          <i class="fas fa-history"></i>
          {{ isViewingAll ? '全部面试记录' : 'AI 面试记录详情' }}
        </h3>

        <!-- 自定义下拉框 -->
        <div class="custom-select-wrapper" v-click-outside="closeDropdown">
          <div class="custom-select-trigger" @click="toggleDropdown">
            <span>{{ currentStatusLabel }}</span>
            <i class="fas fa-chevron-down" :class="{ rotate: isDropdownOpen }"></i>
          </div>
          <Transition name="select-fade">
            <div class="custom-options" v-if="isDropdownOpen">
              <div
                v-for="opt in statusOptions"
                :key="opt.value"
                class="option-item"
                :class="{ selected: filterStatus === opt.value }"
                @click="selectStatus(opt.value)"
              >
                <i :class="opt.icon"></i> {{ opt.label }}
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <TransitionGroup name="list-reorder" tag="div" class="record-list">
        <div v-for="item in filteredList" :key="item.id" class="interview-item">
          <!-- 分数展示 (仅已分析) -->
          <div class="item-score-box" v-if="item.status === 'analyzed'">
            <div class="score-circle">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path
                  class="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <!-- 修改：动态绑定圆环颜色 -->
                <path
                  class="circle"
                  :stroke-dasharray="`${item.score}, 100`"
                  :style="{ stroke: getScoreColor(item.score) }"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="score-text">
                <!-- 修改：动态绑定分数文字颜色 -->
                <span class="num" :style="{ color: getScoreColor(item.score) }">{{
                  item.score
                }}</span>
                <span class="unit">分</span>
              </div>
            </div>
          </div>

          <!-- 占位展示 (分析中或失败) -->
          <div class="item-score-box placeholder" v-else>
            <div class="status-icon-large" :class="item.status">
              <i :class="item.statusIcon"></i>
            </div>
          </div>

          <!-- 内容主体 -->
          <div class="item-content">
            <div class="item-info">
              <div class="meta-top">
                <span class="interview-tag">AI 数字人模拟面试</span>
                <span class="time-stamp">{{ item.date }} {{ item.time }}</span>
                <!-- 新增：快照数量提示 -->
                <span class="snapshot-tag" v-if="item.snapshot_count">
                  <i class="far fa-image"></i> {{ item.snapshot_count }} 张快照
                </span>
              </div>
              <h4>{{ item.title }}</h4>
            </div>

            <div class="item-actions">
              <div :class="['status-text', item.status]">
                {{ item.statusText }}
              </div>
              <button
                class="main-btn"
                :disabled="item.status === 'analyzing'"
                :class="{
                  'btn-view': item.status === 'analyzed',
                  'btn-retry': item.status === 'failed',
                }"
                @click="
                  item.status === 'analyzed'
                    ? handleViewReport(item.id)
                    : item.status === 'failed'
                      ? handleRetryAnalysis(item.id)
                      : null
                "
              >
                {{
                  item.status === 'analyzed'
                    ? '查阅分析报告'
                    : item.status === 'failed'
                      ? '重新触发分析'
                      : '分析计算中...'
                }}
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- 无数据 -->
      <div v-if="filteredList.length === 0" class="empty-state">
        <div class="empty-img"><i class="fas fa-feather-alt"></i></div>
        <p>暂无记录，请尝试其他日期或状态</p>
      </div>
    </div>

    <!-- 大日历模态框 (固定高度，逐年切换，禁用滚动条) -->
    <Transition name="modal-fade">
      <div class="calendar-modal" v-if="showCalendarModal" @wheel.prevent>
        <div class="calendar-modal-overlay" @click="closeCalendarModal"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>选择查询日期</h3>
            <button class="close-btn" @click="closeCalendarModal">&times;</button>
          </div>
          <div class="calendar-picker-body">
            <div class="picker-ctrl">
              <div class="year-ctrl">
                <button @click="changeYear(-1)"><i class="fas fa-chevron-left"></i> 上年</button>
                <span class="current-year">{{ currentYear }}年</span>
                <button @click="changeYear(1)">下年 <i class="fas fa-chevron-right"></i></button>
              </div>
              <div class="month-ctrl">
                <button @click="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                <span class="current-month">{{ currentMonth + 1 }}月</span>
                <button @click="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
              </div>
            </div>
            <div class="picker-grid">
              <div
                class="grid-head"
                v-for="w in ['日', '一', '二', '三', '四', '五', '六']"
                :key="w"
              >
                {{ w }}
              </div>
              <div
                v-for="(d, idx) in calendarDays"
                :key="idx"
                :class="[
                  'grid-day',
                  {
                    'other-month': !d.isCurrentMonth,
                    selected: d.full === selectedDate && !isViewingAll,
                    today: d.isToday,
                  },
                ]"
                @click="selectDateFromPicker(String(d.full))"
              >
                {{ d.day }}
                <span v-if="hasDataOnDate(String(d.full))" class="calendar-dot"></span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-view-all-btn" @click="viewAllFromModal">查看全部记录</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getUserInterviewRecords } from '@/api/interviewRecord'
import { getUserId } from '@/utils/storage'
import { useRouter } from 'vue-router'
const router = useRouter()
const getCurrentUserId = (): number | null => {
  const userIdStr = getUserId()
  return userIdStr ? parseInt(userIdStr) : null
}
// --- 状态与筛选器逻辑 ---
const isDropdownOpen = ref(false)
const filterStatus = ref('all')
const statusOptions = [
  { label: '全部记录', value: 'all', icon: 'fas fa-th-list' },
  { label: '已生成分析', value: 'analyzed', icon: 'fas fa-check-circle' },
  { label: '正在分析中', value: 'analyzing', icon: 'fas fa-spinner' },
  { label: '分析失败', value: 'failed', icon: 'fas fa-exclamation-circle' },
]

const currentStatusLabel = computed(() => {
  return statusOptions.find((o) => o.value === filterStatus.value)?.label
})

const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value)
const closeDropdown = () => (isDropdownOpen.value = false)
const selectStatus = (val: string) => {
  filterStatus.value = val
  isDropdownOpen.value = false
}

// --- 全部记录模式 ---
const isViewingAll = ref(false)

const viewAllRecords = () => {
  isViewingAll.value = true
}

const viewAllFromModal = () => {
  viewAllRecords()
  closeCalendarModal()
}

const selectWeekDate = (dateFull: string) => {
  isViewingAll.value = false
  selectedDate.value = dateFull
}

// --- 统计指标 ---
const interviewList = ref<any[]>([]) // 存放后端返回的原始记录
const loading = ref(false)

// 后端数据映射
const mapStateToUI = (state: string) => {
  switch (state) {
    case 'completed':
      return 'analyzed'
    case 'analyzing':
    case 'pending':
      return 'analyzing'
    case 'failed':
      return 'failed'
    default:
      return 'analyzing'
  }
}

const getStatusIcon = (state: string) => {
  const uiState = mapStateToUI(state)
  if (uiState === 'analyzed') return 'fas fa-check-circle'
  if (uiState === 'analyzing') return 'fas fa-cog fa-spin'
  return 'fas fa-exclamation-triangle'
}

const getStatusText = (item: any) => {
  if (item.state === 'completed') return '报告已生成'
  if (item.state === 'failed') return '分析失败'
  if (item.state === 'analyzing') return 'AI 深度分析中'
  return '排队等待中'
}

// --- 核心修改：分级评分颜色逻辑 ---
const getScoreColor = (score: number) => {
  if (score >= 80) return '#27ae60' // 高分：绿色 (Green)
  if (score >= 60) return '#f39c12' // 中等：橙黄色 (Orange/Yellow)
  if (score <= 0) return '#95a5a6' // 无分数：灰色 (Gray)
  return '#e74c3c' // 低分：红色 (Red)
}

// 获取数据
const fetchInterviews = async () => {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('用户未登录')
    return
  }

  loading.value = true
  try {
    const res = await getUserInterviewRecords(userId, 1, 100)
    if (res.data.code === 200 && res.data.data) {
      const records = res.data.data.records || []
      interviewList.value = records.map((item: any) => {
        // 正确解析 ISO 日期格式
        let date = '',
          time = ''
        if (item.createdAt) {
          const d = new Date(item.createdAt)
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const hours = String(d.getHours()).padStart(2, '0')
          const minutes = String(d.getMinutes()).padStart(2, '0')
          date = `${year}-${month}-${day}`
          time = `${hours}:${minutes}`
        }

        return {
          ...item,
          id: item.id,
          score: item.score || 0,
          title: item.jobDescription || '面试记录',
          date: date,
          time: time,
          total_questions: item.total_questions || 0,
          answered_questions: item.answered_questions || 0,
          completion_rate: item.completion_rate || '0%',
          match_status: item.match_status || '',
          snapshot_count: item.snapshot_count || 0,
          state: item.state,
          status: mapStateToUI(item.state),
          statusText: getStatusText(item),
          statusIcon: getStatusIcon(item.state),
        }
      })
    }
  } catch (error) {
    console.error('获取面试记录失败:', error)
  } finally {
    loading.value = false
  }
}

const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

const totalInterviews = computed(() => interviewList.value.length)
const analyzingCount = computed(
  () => interviewList.value.filter((i) => i.state === 'analyzing' || i.state === 'pending').length,
)
const failedCount = computed(() => interviewList.value.filter((i) => i.state === 'failed').length)
const avgScore = computed(() => {
  const analyzedList = interviewList.value.filter((i) => i.state === 'completed' && i.score > 0)
  if (analyzedList.length === 0) return 0
  const sum = analyzedList.reduce((acc, cur) => acc + (cur.score || 0), 0)
  return (sum / analyzedList.length).toFixed(1)
})

const hasDataOnDate = (dateStr: string) => {
  return interviewList.value.some((item) => item.date === dateStr)
}
// 日期格式化
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 列表过滤
const filteredList = computed(() => {
  return interviewList.value.filter((item) => {
    const matchStatus = filterStatus.value === 'all' || item.status === filterStatus.value
    if (isViewingAll.value) {
      return matchStatus
    } else {
      const matchDate = item.date === selectedDate.value
      return matchDate && matchStatus
    }
  })
})

// --- 日历逻辑 ---
const selectedDate = ref(formatLocalDate(new Date()))
const showCalendarModal = ref(false)
const weekDates = ref<any[]>([])
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

watch(showCalendarModal, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const closeCalendarModal = () => {
  showCalendarModal.value = false
}

const formatDate = (isoString: string) => {
  if (!isoString) return { date: '', time: '' }
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  }
}

const generateWeek = () => {
  const today = new Date()
  const list = []
  const weekNames = ['日', '一', '二', '三', '四', '五', '六']
  for (let i = -3; i <= 3; i++) {
    const d = new Date()
    d.setDate(today.getDate() + i)
    list.push({
      full: formatLocalDate(d),
      day: d.getDate(),
      week: weekNames[d.getDay()],
    })
  }
  weekDates.value = list
}

// 固定网格为6行42格，确保容器高度不变
const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDir = firstDay.getDay()
  const days = []
  const todayStr = formatLocalDate(new Date()) // 改为使用 formatLocalDate

  // 填充上月末尾
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = startDir - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const date = new Date(currentYear.value, currentMonth.value - 1, dayNum)
    const fullDate = formatLocalDate(date) // 改为使用 formatLocalDate
    days.push({
      day: dayNum,
      isCurrentMonth: false,
      full: fullDate,
      isToday: fullDate === todayStr,
    })
  }

  // 填充本月
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const fullDate = formatLocalDate(date) // 改为使用 formatLocalDate
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday: fullDate === todayStr,
      full: fullDate,
    })
  }

  // 固定填充至42格（6行）
  const totalCells = 42
  let nextMonthDay = 1
  while (days.length < totalCells) {
    const date = new Date(currentYear.value, currentMonth.value + 1, nextMonthDay)
    const fullDate = formatLocalDate(date) // 改为使用 formatLocalDate
    days.push({
      day: nextMonthDay,
      isCurrentMonth: false,
      full: fullDate,
      isToday: fullDate === todayStr,
    })
    nextMonthDay++
  }
  return days
})

const changeMonth = (step: number) => {
  let newMonth = currentMonth.value + step
  let newYear = currentYear.value
  if (newMonth > 11) {
    newMonth = 0
    newYear++
  } else if (newMonth < 0) {
    newMonth = 11
    newYear--
  }
  currentMonth.value = newMonth
  currentYear.value = newYear
}

const changeYear = (step: number) => {
  currentYear.value += step
}

const selectDateFromPicker = (full: string) => {
  isViewingAll.value = false
  selectedDate.value = full
  closeCalendarModal()
}

// 自定义指令
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: any) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}

const handleViewReport = (id: number) => {
  router.push(`/Hina/interviewResult/${id}`)
}

/**
 * 重新触发分析逻辑 (点击“重新触发分析”按钮时)
 */
const handleRetryAnalysis = async (id: number) => {
  console.log('重新触发分析，ID:', id)
  // TODO: 调用后端重新分析接口
  // 暂时先重新加载列表
  await fetchInterviews()
}

onMounted(() => {
  generateWeek()
  fetchInterviews()
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})
</script>

<style scoped>
/* 核心变量复用 */
.interview-section {
  --apricot-primary: #a67c52;
  --apricot-bg: #fdf5e6;
  --text-dark: #4a342e;
  --text-light: #8d6e63;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: rgba(253, 245, 230, 0.85);
  border: 1.5px solid var(--apricot-primary);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  backdrop-filter: blur(10px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  background: rgba(166, 124, 82, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--apricot-primary);
}

.stat-icon.orange {
  color: #e67e22;
}
.stat-icon.green {
  color: #27ae60;
}
.stat-icon.red {
  color: #c0392b;
}

.stat-info .label {
  display: block;
  font-size: 20px;
  color: var(--text-light);
}
.stat-info .value {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-dark);
}
.stat-info .value small {
  font-size: 14px;
  font-weight: normal;
  margin-left: 4px;
}

/* 日历筛选 */
.calendar-filter-card {
  background: rgba(253, 245, 230, 0.85);
  border: 1.5px solid var(--apricot-primary);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 25px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-buttons {
  display: flex;
  gap: 12px;
}

.filter-title {
  margin: 0;
  font-size: 24px;
  color: var(--text-dark);
}
.selected-label {
  font-size: 20px;
  color: var(--apricot-primary);
  font-weight: bold;
}

.full-calendar-btn,
.view-all-btn {
  background: white;
  border: 1px solid var(--apricot-primary);
  color: var(--apricot-primary);
  padding: 6px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.full-calendar-btn:hover,
.view-all-btn:hover {
  background: var(--apricot-primary);
  color: white;
}

.week-strip {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  position: relative;
}

.week-day-pill {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 5px;
  border-radius: 12px;
  cursor: pointer;
  background: white;
  border: 1px solid transparent;
  transition: all 0.3s;
  position: relative;
}

.week-day-pill.active {
  background: var(--apricot-primary);
  color: white;
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(166, 124, 82, 0.2);
}

.w-name {
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 5px;
}
.w-num {
  font-size: 18px;
  font-weight: bold;
}

.data-dot {
  position: absolute;
  bottom: 4px;
  width: 5px;
  height: 5px;
  background-color: var(--apricot-primary);
  border-radius: 50%;
  display: inline-block;
}

/* 列表容器与自定义选择框 */
.record-container {
  background: rgba(253, 245, 230, 0.85);
  border: 1.5px solid var(--apricot-primary);
  border-radius: 20px;
  padding: 25px;
  min-height: 400px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 24px;
}

.custom-select-wrapper {
  position: relative;
  width: 160px;
  z-index: 100;
}

.custom-select-trigger {
  background: white;
  border: 1.5px solid var(--apricot-primary);
  padding: 8px 15px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-dark);
}

.custom-select-trigger i {
  transition: transform 0.3s;
  font-size: 12px;
}

.custom-select-trigger i.rotate {
  transform: rotate(180deg);
}

.custom-options {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1.5px solid var(--apricot-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.option-item {
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-light);
}

.option-item i {
  width: 20px;
  margin-right: 8px;
}

.option-item:hover {
  background: var(--apricot-bg);
  color: var(--apricot-primary);
}
.option-item.selected {
  background: var(--apricot-primary);
  color: white;
}

/* 面试项目样式 */
.interview-item {
  display: flex;
  background: white;
  border-radius: 18px;
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid rgba(166, 124, 82, 0.1);
  transition: all 0.3s;
}

.interview-item:hover {
  transform: scale(1.01);
  box-shadow: 0 10px 30px rgba(74, 52, 46, 0.08);
  border-color: var(--apricot-primary);
}

/* 分数圆环 */
.item-score-box {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px dashed rgba(166, 124, 82, 0.2);
  margin-right: 25px;
  padding-right: 20px;
}

.score-circle {
  position: relative;
  width: 70px;
  height: 70px;
}

.circular-chart {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  max-height: 100%;
}
.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 2.8;
}
.circle {
  fill: none;
  stroke-width: 2.8;
  stroke-linecap: round;
  stroke: #27ae60;
  transition: stroke-dasharray 1s ease;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-text .num {
  font-size: 20px;
  font-weight: bold;
  color: #27ae60;
  display: block;
}
.score-text .unit {
  font-size: 10px;
  color: #999;
}

.status-icon-large {
  font-size: 32px;
}
.status-icon-large.analyzing {
  color: #e67e22;
}
.status-icon-large.failed {
  color: #c0392b;
}

/* 项目内容 */
.item-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-top {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.interview-tag {
  font-size: 11px;
  background: var(--apricot-bg);
  color: var(--apricot-primary);
  padding: 2px 8px;
  border-radius: 4px;
}
.time-stamp {
  font-size: 12px;
  color: var(--text-light);
}

.item-info h4 {
  margin: 0 0 10px 0;
  font-size: 30px;
  color: var(--text-dark);
}

.item-actions {
  text-align: right;
  min-width: 160px;
}
.status-text {
  font-size: 20px;
  margin-bottom: 12px;
  font-weight: bold;
}
.status-text.analyzed {
  color: #27ae60;
}
.status-text.analyzing {
  color: #e67e22;
}
.status-text.failed {
  color: #c0392b;
}

.main-btn {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.btn-view {
  background: var(--apricot-primary);
  color: white;
}
.btn-view:hover {
  background: var(--text-dark);
}
.btn-retry {
  background: rgba(192, 57, 43, 0.1);
  color: #c0392b;
  border: 1px solid #c0392b;
}
.btn-retry:hover {
  background: #c0392b;
  color: white;
}

.main-btn:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

/* 日历模态框 - 固定高度版本 */
.calendar-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: -1;
}

.modal-content {
  position: relative;
  background: white;
  width: 550px;
  max-width: 90vw;
  border-radius: 32px;
  padding: 28px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-dark);
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}
.close-btn:hover {
  color: var(--apricot-primary);
}

/* 双行控制区域：年份切换 + 月份切换 */
.picker-ctrl {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.year-ctrl {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background: #f9f3e9;
  padding: 10px 16px;
  border-radius: 40px;
}

.year-ctrl button {
  background: white;
  border: 1px solid var(--apricot-primary);
  border-radius: 30px;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  color: var(--apricot-primary);
}

.year-ctrl button:hover {
  background: var(--apricot-primary);
  color: white;
}

.current-year {
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--text-dark);
  min-width: 80px;
  text-align: center;
}

.month-ctrl {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 8px 12px;
  border-radius: 40px;
  border: 1px solid #e5d5c0;
}

.month-ctrl button {
  background: none;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.month-ctrl button:hover {
  background: var(--apricot-bg);
  color: var(--apricot-primary);
}

.current-month {
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--text-dark);
  min-width: 60px;
  text-align: center;
}

/* 固定6行日历网格，高度固定 */
.picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  min-height: 380px;
}

.grid-head {
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-dark);
  padding-bottom: 12px;
}

.grid-day {
  height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
  background-color: #fefaf5;
}

.grid-day:hover {
  background: var(--apricot-bg);
  transform: scale(1.02);
}

.grid-day.other-month {
  opacity: 0.4;
  background-color: #f9f3e9;
}

.grid-day.selected {
  background: var(--apricot-primary);
  color: white;
}

.grid-day.today {
  border: 2px solid var(--apricot-primary);
  color: var(--apricot-primary);
  font-weight: bold;
}

.calendar-dot {
  position: absolute;
  bottom: 6px;
  width: 5px;
  height: 5px;
  background-color: var(--apricot-primary);
  border-radius: 50%;
  display: inline-block;
}

.modal-footer {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.modal-view-all-btn {
  background: white;
  border: 1.5px solid var(--apricot-primary);
  color: var(--apricot-primary);
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-view-all-btn:hover {
  background: var(--apricot-primary);
  color: white;
}

/* 动画定义 */
.select-fade-enter-active,
.select-fade-leave-active {
  transition: all 0.3s;
}
.select-fade-enter-from,
.select-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.4s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 列表重排动画 - 解决删除后向上移动无动画的问题 */
.list-reorder-move {
  transition: transform 0.5s ease;
}
.list-reorder-enter-active {
  transition: all 0.5s ease;
}
.list-reorder-leave-active {
  transition: all 0.4s ease;
  position: absolute;
  z-index: 0;
}
.list-reorder-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.list-reorder-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.list-reorder-leave-active {
  position: absolute;
  width: calc(100% - 50px);
}

.record-list {
  position: relative;
  /*min-height: 300px;*/
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-light);
  font-size: 30px;
}
.empty-img {
  font-size: 50px;
  opacity: 0.7;
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  .interview-item {
    flex-direction: column;
  }
  .item-score-box {
    width: 100%;
    border-right: none;
    border-bottom: 1px dashed #eee;
    padding: 0 0 20px 0;
    margin: 0 0 20px 0;
  }
  .item-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .item-actions {
    width: 100%;
    margin-top: 20px;
    text-align: left;
  }
  .week-strip {
    flex-wrap: wrap;
  }
  .week-day-pill {
    min-width: 60px;
  }
  .picker-grid {
    min-height: 320px;
  }
  .grid-day {
    height: 42px;
    font-size: 13px;
  }
  .year-ctrl button {
    padding: 4px 12px;
    font-size: 12px;
  }
}
</style>
