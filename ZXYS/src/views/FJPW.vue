<template>
  <div class="digital-museum-container">
    <BreadcrumbNav
      title="方剂配伍"
      :show-back="true"
      :breadcrumb-items="[
        { name: '首页', url: '/Foundations/homepage' },
        { name: '方剂配伍', url: '' },
      ]"
    />

    <main class="content-wrapper">
      <!-- 居中标题区 -->
      <section class="page-header animate-fade-up">
        <div class="header-main">
          <div class="title-decorator left"></div>
          <div class="title-text-group">
            <h1 class="main-title">方剂配伍实验室</h1>
            <p class="subtitle">AI-POWERED HERBAL ANALYSIS SYSTEM</p>
          </div>
          <div class="title-decorator right"></div>
        </div>
      </section>

      <!-- 模式选择 -->
      <div class="mode-navigator animate-fade-up" style="animation-delay: 0.1s">
        <div
          v-for="mode in ['case', 'free']"
          :key="mode"
          class="mode-tab"
          :class="{ 'is-active': currentMode === mode }"
          @click="handleModeSwitch(mode)"
        >
          <span class="mode-icon">{{ mode === 'case' ? '◈' : '☯' }}</span>
          {{ mode === 'case' ? '医案考校' : '随心研习' }}
        </div>
      </div>

      <!-- 医案展示区：带展开收起动画 -->
      <div class="expand-wrapper" :class="{ 'is-expanded': currentMode === 'case' }">
        <section class="glass-card case-container">
          <Transition name="fade-fast" mode="out-in">
            <!-- 状态一：AI正在生成题目 -->
            <div v-if="isCaseLoading" class="case-loading-state">
              <div class="loading-ink-bar"></div>
              <p class="loading-hint">⧗ 系统正在演算模拟医案，请稍候...</p>
            </div>

            <!-- 状态二：展示题目内容 -->
            <div v-else class="case-content">
              <div class="case-header">
                <div class="case-tag-group">
                  <span class="seal-tag">考</span>
                  <h2 class="case-title">{{ currentCase?.title }}</h2>
                </div>
                <button class="action-link-btn" @click="generateNewCase">
                  <span class="icon-reverse">◯</span> 易一案
                </button>
              </div>
              <p class="case-description">{{ currentCase?.description }}</p>
              <div class="case-requirement">
                【考校要求】请根据上述证候，从左侧库藏中选取 3-6 味药材，并确立君药。
              </div>
            </div>
          </Transition>
        </section>
      </div>

      <div class="grid-layout">
        <!-- 左侧：药材库 -->
        <section class="glass-card herb-library animate-fade-up" style="animation-delay: 0.2s">
          <h2 class="section-title"><span class="title-icon">⚘</span> 本草库藏</h2>
          <div class="library-scroll-area">
            <div v-for="(group, cat) in categorizedHerbs" :key="cat" class="herb-section">
              <h4 class="category-label">
                <span class="cat-icon">{{ getCategoryIcon(String(cat)) }}</span> / {{ cat }} /
              </h4>
              <div class="herb-grid">
                <div
                  v-for="herb in group"
                  :key="herb.name"
                  class="herb-card"
                  :class="{ 'is-picked': isSelected(herb.name) }"
                  @click="toggleHerb(herb)"
                >
                  <div class="herb-name">{{ herb.name }}</div>
                  <div class="herb-meta">{{ herb.nature }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 右侧：配伍操作台 -->
        <section class="glass-card formula-bench animate-fade-up" style="animation-delay: 0.3s">
          <h2 class="section-title"><span class="title-icon">◈</span> 配伍操作台</h2>
          <div class="bench-content">
            <div v-if="selectedHerbsWithDose.length === 0" class="empty-placeholder">
              <div class="ink-logo">☯</div>
              <p>虚位以待，请选取药材</p>
            </div>

            <TransitionGroup name="staggered-list" tag="div" class="picked-list">
              <div
                v-for="(item, idx) in selectedHerbsWithDose"
                :key="item.herb.name"
                class="picked-item"
              >
                <span class="order">{{ idx + 1 }}</span>
                <div class="info">
                  <span class="name">{{ item.herb.name }}</span>
                  <span class="tag">{{ item.herb.category }}</span>
                </div>
                <!-- 剂量控制区域 -->
                <div class="dosage-control">
                  <button
                    class="dose-btn"
                    @click.stop="updateDose(item.herb.name, -1)"
                    :disabled="isAnalyzing"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    class="dose-input"
                    v-model.number="item.dose"
                    @input="validateDose(item)"
                    :disabled="isAnalyzing"
                    step="0.5"
                    min="0.5"
                    max="30"
                  />
                  <button
                    class="dose-btn"
                    @click.stop="updateDose(item.herb.name, 1)"
                    :disabled="isAnalyzing"
                  >
                    +
                  </button>
                  <span class="dose-unit">钱</span>
                </div>
                <button class="del-btn" @click="toggleHerb(item.herb)">✕</button>
              </div>
            </TransitionGroup>
          </div>

          <div class="bench-footer">
            <button
              class="primary-submit-btn"
              :disabled="selectedHerbsWithDose.length < 2 || isAnalyzing"
              @click="startAnalysis"
            >
              <span v-if="!isAnalyzing">◉ 提交配伍分析</span>
              <span v-else>⧗ 正在同步《本草纲目》核心数据...</span>
            </button>
            <div v-if="isAnalyzing" class="analysis-progress-bar">
              <div class="bar-inner" :style="{ width: analysisProgress + '%' }"></div>
            </div>
          </div>
        </section>
      </div>

      <!-- 分析报告层 -->
      <Transition name="report-slide">
        <section v-if="analysisResult && !isAnalyzing" class="glass-card result-report">
          <div class="report-paper">
            <div class="report-ribbon">
              <div class="report-title">
                <span class="title-mark">◈</span>
                {{ currentMode === 'case' ? '考校评价报告' : '研习配伍结论' }}
              </div>
              <div v-if="currentMode === 'case'" class="score-seal">
                <div class="seal-text">{{ analysisResult.score }}</div>
              </div>
              <div v-else class="free-badge">☯ 随 心 研 习 ☯</div>
            </div>

            <!-- 医案模式报告 -->
            <div v-if="currentMode === 'case'" class="report-grid">
              <div class="report-left">
                <div class="info-row">
                  <label>☰ 药证匹配度</label>
                  <div class="mini-progress">
                    <div class="fill" :style="{ width: analysisResult.matchRate + '%' }"></div>
                  </div>
                  <span class="match-value">{{ analysisResult.matchRate }}%</span>
                </div>
                <div class="info-row monarch-row">
                  <label>❖ 君药确立</label>
                  <div class="monarch-card">
                    <span class="monarch-name">{{ analysisResult.monarch.name }}</span>
                    <span class="monarch-dose">剂量: {{ analysisResult.monarch.dose }}钱</span>
                    <span class="monarch-reason">{{ analysisResult.monarch.reason }}</span>
                  </div>
                </div>
                <div class="info-row balance-row">
                  <label>☯ 药性平衡指数</label>
                  <div class="balance-bar">
                    <div
                      class="balance-fill"
                      :style="{
                        width: analysisResult.balanceIndex + '%',
                        background: analysisResult.balanceColor,
                      }"
                    ></div>
                  </div>
                  <span class="balance-desc">{{ analysisResult.balanceDesc }}</span>
                </div>
                <div v-if="analysisResult.conflicts.length > 0" class="danger-box">
                  <span class="label">⨂ 【配伍禁忌】</span>
                  <p>{{ analysisResult.conflicts.join('、') }}</p>
                </div>
                <div class="comment-box">
                  <label>☰ 【学术评议】</label>
                  <p>{{ analysisResult.commentary }}</p>
                </div>
                <div class="comment-box formula-explanation">
                  <label>⚙ 【方解精要】</label>
                  <p>{{ analysisResult.formulaExplanation }}</p>
                </div>
              </div>
              <div class="report-right">
                <label>⊞ 【君臣佐使推演】</label>
                <ul class="role-analysis">
                  <li><span class="role">君：</span>{{ analysisResult.roles.jun }}</li>
                  <li><span class="role">臣：</span>{{ analysisResult.roles.chen }}</li>
                  <li><span class="role">佐使：</span>{{ analysisResult.roles.zuoshi }}</li>
                </ul>
                <div class="dose-analysis">
                  <label>◉ 剂量配比分析</label>
                  <p class="dose-insight">{{ analysisResult.doseInsight }}</p>
                </div>
                <div class="historical-ref">
                  <label>⚛ 历代医家参考</label>
                  <p class="ref-text">{{ analysisResult.historicalRef }}</p>
                </div>
              </div>
            </div>

            <!-- 随心研习模式报告 -->
            <div v-else class="free-report-content">
              <div class="free-intro">
                <div class="free-seal">⨀ 方 诀 ⨀</div>
                <p class="free-formula-name">{{ analysisResult.formulaName }}</p>
              </div>

              <div class="free-grid">
                <div class="free-left">
                  <div class="efficacy-section">
                    <label>⌘ 功 效</label>
                    <p class="efficacy-text">{{ analysisResult.efficacy }}</p>
                  </div>
                  <div class="indication-section">
                    <label>◐ 主 治</label>
                    <p class="indication-text">{{ analysisResult.indications }}</p>
                  </div>
                  <div class="herb-list-section">
                    <label>⚘ 组方药味</label>
                    <div class="free-herb-list">
                      <span
                        v-for="(item, idx) in analysisResult.herbsWithDose"
                        :key="idx"
                        class="free-herb-item"
                      >
                        {{ item.name }} {{ item.dose }}钱
                      </span>
                    </div>
                  </div>
                </div>
                <div class="free-right">
                  <div class="role-free-section">
                    <label>⨀ 君臣佐使</label>
                    <ul class="role-free-list">
                      <li>
                        <span class="role-label">君：</span>{{ analysisResult.freeRoles.jun }}
                      </li>
                      <li>
                        <span class="role-label">臣：</span>{{ analysisResult.freeRoles.chen }}
                      </li>
                      <li>
                        <span class="role-label">佐使：</span>{{ analysisResult.freeRoles.zuoshi }}
                      </li>
                    </ul>
                  </div>
                  <div class="nature-analysis">
                    <label>☯ 药性总览</label>
                    <p class="nature-desc">{{ analysisResult.natureSummary }}</p>
                  </div>
                  <div class="usage-note">
                    <label>● 临证加减</label>
                    <p class="note-text">{{ analysisResult.modificationNote }}</p>
                  </div>
                  <!-- 新增：显示配伍禁忌 -->
                  <div
                    v-if="analysisResult.conflicts && analysisResult.conflicts.length > 0"
                    class="danger-box"
                  >
                    <span class="label">⨂ 【配伍禁忌】</span>
                    <p>{{ analysisResult.conflicts.join('、') }}</p>
                  </div>
                </div>
              </div>

              <div class="free-footer">
                <div class="classical-quote">{{ analysisResult.classicalQuote }}</div>
                <div class="date-stamp">随 心 研 习 · 自 由 组 方</div>
              </div>
            </div>

            <div class="report-bottom" v-if="currentMode === 'case'">
              <div class="date-stamp">公元二〇二五 · 数字化归档</div>
              <div class="digital-seal">⚕ 太医院钦定方剂库</div>
            </div>
          </div>
        </section>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import { FJPWAnalyze } from '@/api/ai'
import { message } from '@/components/Notification'

// --- 基础数据 ---
interface Herb {
  name: string
  nature: string
  category: string
  properties?: string
  flavor?: string
  meridian?: string
}

interface HerbWithDose {
  herb: Herb
  dose: number
}

// --- 基础数据 ---
const herbLibrary = ref<Herb[]>([])
const isLoadingHerbs = ref(true)

// 加载本地 JSON 数据
const loadHerbLibrary = async () => {
  try {
    isLoadingHerbs.value = true
    const response = await fetch('/FJPW/data.json')
    const data = await response.json()
    herbLibrary.value = data.herbs
  } catch (error) {
    console.error('加载本草库藏失败:', error)
    // 降级方案：使用内置默认数据
    herbLibrary.value = getDefaultHerbLibrary()
  } finally {
    isLoadingHerbs.value = false
  }
}

// 降级默认数据（可选，防止网络请求失败）
const getDefaultHerbLibrary = (): Herb[] => {
  return [
    {
      name: '人参',
      nature: '微温',
      category: '补气类',
      properties: '大补元气，复脉固脱',
      flavor: '甘、微苦',
      meridian: '脾、肺、心',
    },
    {
      name: '黄芪',
      nature: '微温',
      category: '补气类',
      properties: '补气升阳，益卫固表',
      flavor: '甘',
      meridian: '脾、肺',
    },
    // ... 其他默认数据
  ]
}

const mockCases = [
  {
    title: '虚寒泄泻证',
    description: '某病员：脘腹冷痛，下利清谷，肢冷畏寒，脉沉迟无力。此为脾肾阳虚，阴寒内盛之象。',
    keywords: ['附子', '干姜', '甘草'],
    bad: ['金银花', '连翘'],
  },
  {
    title: '温热病初期',
    description: '某病员：发热，微恶风寒，头痛咳嗽，口渴，咽痛。此为风温初起，邪伤肺卫之证。',
    keywords: ['金银花', '连翘', '甘草'],
    bad: ['附子', '干姜'],
  },
]

// --- 状态变量 ---
const currentMode = ref('case')
const isCaseLoading = ref(false)
// 扩展 currentCase 的类型
const currentCase = ref<{
  title: string
  description: string
  keywords: string[]
  expectedHerbs?: string[] // AI返回的预期药材
  bad?: string[] // 保留原有字段兼容
}>(mockCases[0]!)

const selectedHerbsWithDose = ref<HerbWithDose[]>([])
const isAnalyzing = ref(false)
const analysisProgress = ref(0)
const analysisResult = ref<any>(null)

// 获取分类图标
const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    补气类: '⚘',
    补血类: '◈',
    活血类: '☯',
    温里类: '☰',
    化痰类: '◉',
    理气类: '☷',
    清热类: '☲',
    泻下类: '▼',
  }
  return iconMap[category] || '●'
}

// --- 计算属性 ---
const categorizedHerbs = computed(() => {
  return herbLibrary.value.reduce((acc: any, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})
})

// --- 剂量与选择逻辑 ---
const isSelected = (name: string) => selectedHerbsWithDose.value.some((h) => h.herb.name === name)

const handleModeSwitch = (mode: string) => {
  currentMode.value = mode
  selectedHerbsWithDose.value = []
  analysisResult.value = null
  if (mode === 'case') generateNewCase()
}

// 替换原来的 generateNewCase 函数
const generateNewCase = async () => {
  isCaseLoading.value = true
  selectedHerbsWithDose.value = []
  analysisResult.value = null

  try {
    console.log('尝试生成题目')
    // 调用 AI 接口生成医案
    const res = await FJPWAnalyze(`请生成一道中医方剂配伍的医案考题。

要求：
1. 生成一个具有典型中医证候的医案
2. 包含完整的临床症状、舌象、脉象
3. 给出该证候的预期用药（3-5味核心药材）

请严格按照以下JSON格式返回，不要包含任何其他内容：
{
  "title": "证候名称（4-8个字）",
  "description": "详细的临床症状描述，包含舌脉",
  "expectedHerbs": ["药材1", "药材2", "药材3"]
}

示例：
{
  "title": "虚寒泄泻证",
  "description": "脘腹冷痛，下利清谷，肢冷畏寒，舌淡胖苔白滑，脉沉迟无力",
  "expectedHerbs": ["附子", "干姜", "甘草"]
}`)

    if (res.code === 200) {
      // AI 生成成功，使用返回的数据
      currentCase.value = {
        title: res.data.title || '暂缺证候',
        description: res.data.description || '信息不全，请重试',
        keywords: Array.isArray(res.data.expectedHerbs) ? res.data.expectedHerbs : [], // 兼容原有 keywords 字段
        expectedHerbs: Array.isArray(res.data.expectedHerbs) ? res.data.expectedHerbs : [],
        bad: Array.isArray(res.data.bad) ? res.data.bad : [],
      }
      console.log('AI生成医案成功:', currentCase.value.title)
    } else {
      // 失败时降级使用本地数据
      throw new Error('AI返回数据异常')
    }
  } catch (error) {
    console.error('AI生成医案失败，使用本地数据:', error)
    // 降级：使用本地 mock 数据
    const mockIndex = Math.floor(Math.random() * mockCases.length)
    const mock = mockCases[mockIndex]
    currentCase.value = {
      title: String(mock?.title),
      description: String(mock?.description),
      keywords: mock?.keywords || [],
      expectedHerbs: mock?.keywords || [],
      bad: mock?.bad || [],
    }
  } finally {
    isCaseLoading.value = false
  }
}

const toggleHerb = (herb: Herb) => {
  if (isAnalyzing.value) return
  const idx = selectedHerbsWithDose.value.findIndex((h) => h.herb.name === herb.name)
  if (idx > -1) {
    selectedHerbsWithDose.value.splice(idx, 1)
  } else if (selectedHerbsWithDose.value.length < 6) {
    selectedHerbsWithDose.value.push({ herb, dose: 6.0 })
  }
}

const updateDose = (herbName: string, delta: number) => {
  const target = selectedHerbsWithDose.value.find((h) => h.herb.name === herbName)
  if (target) {
    let newDose = target.dose + delta
    if (newDose < 0.5) newDose = 0.5
    if (newDose > 30) newDose = 30
    target.dose = Math.round(newDose * 10) / 10
  }
}

const validateDose = (item: HerbWithDose) => {
  if (isNaN(item.dose) || item.dose < 0.5) item.dose = 0.5
  if (item.dose > 30) item.dose = 30
  item.dose = Math.round(item.dose * 10) / 10
}

// --- 分析逻辑 ---
// --- 分析逻辑 ---
const startAnalysis = async () => {
  if (selectedHerbsWithDose.value.length < 2) return

  isAnalyzing.value = true
  analysisProgress.value = 0

  // 模拟进度条动画
  const timer = setInterval(() => {
    analysisProgress.value += 4
    if (analysisProgress.value >= 100) {
      clearInterval(timer)
    }
  }, 50)

  try {
    // 准备用户组方数据
    const selectedHerbs = selectedHerbsWithDose.value.map((h) => ({
      name: h.herb.name,
      dose: h.dose,
      nature: h.herb.nature,
      category: h.herb.category,
    }))

    let prompt = ''

    if (currentMode.value === 'case') {
      // 医案模式：让 AI 评价配伍是否对症
      prompt = `请分析以下中医方剂配伍是否适合该医案。

【十八反十九畏知识】
十八反：乌头（附子、川乌、草乌）反半夏、瓜蒌、贝母、白蔹、白及；甘草反甘遂、大戟、海藻、芫花；藜芦反人参、沙参、丹参、玄参、细辛、芍药。
十九畏：硫黄畏朴硝，水银畏砒霜，狼毒畏密陀僧，巴豆畏牵牛，丁香畏郁金，川乌、草乌畏犀角，牙硝畏三棱，官桂畏赤石脂，人参畏五灵脂。

【医案信息】
证候名称：${currentCase.value.title}
临床症状：${currentCase.value.description}
预期核心药材：${currentCase.value.expectedHerbs?.join('、') || '未提供'}

【用户组方】
${selectedHerbs.map((h) => `${h.name}：${h.dose}钱（${h.nature}，${h.category}）`).join('\n')}

请严格按照以下JSON格式返回分析结果，不要包含任何其他内容：
{
  "score": "甲上/乙等/丙级",
  "matchRate": 85,
  "commentary": "学术评语（50字以内）",
  "roles": {
    "jun": "君药分析（30字以内）",
    "chen": "臣药分析（30字以内）",
    "zuoshi": "佐使药分析（30字以内）"
  },
  "formulaExplanation": "方解精要（50字以内）",
  "conflicts": ["配伍禁忌1", "配伍禁忌2"]
}

注意：conflicts字段用于返回十八反十九畏等配伍禁忌，如果没有禁忌则为空数组[]。`
    } else {
      // 自由模式：让 AI 分析方剂功效
      prompt = `请分析以下中药方剂的功效和主治。

【十八反十九畏知识】
十八反：乌头（附子、川乌、草乌）反半夏、瓜蒌、贝母、白蔹、白及；甘草反甘遂、大戟、海藻、芫花；藜芦反人参、沙参、丹参、玄参、细辛、芍药。
十九畏：硫黄畏朴硝，水银畏砒霜，狼毒畏密陀僧，巴豆畏牵牛，丁香畏郁金，川乌、草乌畏犀角，牙硝畏三棱，官桂畏赤石脂，人参畏五灵脂。

【组方】
${selectedHerbs.map((h) => `${h.name}：${h.dose}钱（${h.nature}，${h.category}）`).join('\n')}

请严格按照以下JSON格式返回，不要包含任何其他内容：
{
  "formulaName": "方剂名称（根据药材自动命名，如：参芪益气汤）",
  "efficacy": "功效描述（30字以内）",
  "indications": "主治症状（40字以内）",
  "natureSummary": "药性分析（30字以内）",
  "classicalQuote": "经典引用（可选，20字以内）",
  "conflicts": ["配伍禁忌1", "配伍禁忌2"]
}

注意：conflicts字段用于返回十八反十九畏等配伍禁忌，如果没有禁忌则为空数组[]。`
    }

    // 调用 AI 接口
    const res = await FJPWAnalyze(prompt)

    if (res.code === 200) {
      if (currentMode.value === 'case') {
        // 医案模式：组装完整报告数据
        const items = selectedHerbsWithDose.value
        const names = items.map((i) => i.herb.name)

        // ========== 修改1：使用 AI 返回的 conflicts，不再用本地逻辑 ==========
        const conflicts = res.data.conflicts || []

        // 确定君药（剂量最大的）
        let monarchItem = items[0]
        if (!monarchItem) {
          message.error('错误', {
            note: '请保证有君药！',
            duration: 3000,
          })
          return
        }
        for (const item of items) {
          if (item.dose > monarchItem.dose) monarchItem = item
        }

        // 计算药性平衡指数（本地逻辑）
        let warmCount = 0,
          coldCount = 0
        items.forEach((i) => {
          const nature = i.herb.nature
          if (nature.includes('温') || nature.includes('热')) warmCount++
          if (nature.includes('寒') || nature.includes('凉')) coldCount++
        })
        let balanceIndex = 50,
          balanceDesc = '',
          balanceColor = '#8b5e3c'
        if (warmCount > coldCount + 1) {
          balanceIndex = 30
          balanceDesc = '方剂偏于温燥，恐伤阴液'
          balanceColor = '#b71c1c'
        } else if (coldCount > warmCount + 1) {
          balanceIndex = 70
          balanceDesc = '方剂偏于寒凉，中病即止'
          balanceColor = '#2c6e9e'
        } else {
          balanceIndex = 85
          balanceDesc = '寒热均衡，阴阳调和'
          balanceColor = '#2e7d32'
        }

        // 剂量配比分析（本地逻辑）
        const maxDose = Math.max(...items.map((i) => i.dose), 1)
        const doseInsight = items
          .map(
            (i) => `${i.herb.name} ${i.dose}钱 (${((i.dose / maxDose) * 100).toFixed(0)}%相对强度)`,
          )
          .join('；')

        // 君药理由（本地逻辑）
        const monarchReason = getMonarchReason(monarchItem.herb.name, currentCase.value.title)

        // 历代医家参考（本地逻辑）
        if (!items[0]) {
          message.error('错误', {
            note: 'items[0]未定义！',
            duration: 3000,
          })
          return
        }
        const historicalRef =
          items.length > 0
            ? `《本草纲目》载：${items[0].herb.name}“主诸病”，后世医家常以此为基础加减。`
            : '待组方后考据。'

        // ========== 修改2：如果有禁忌，调整评语和匹配度 ==========
        let finalMatchRate = res.data.matchRate || 70
        let finalCommentary = res.data.commentary || '组方思路基本正确'
        let finalScore =
          res.data.score || (finalMatchRate > 80 ? '甲上' : finalMatchRate > 60 ? '乙等' : '丙级')

        if (conflicts.length > 0) {
          finalMatchRate = Math.max(0, finalMatchRate - 20)
          finalCommentary = `⚠️ 存在配伍禁忌：${conflicts.join('、')}。${finalCommentary}`
          // 如果有严重禁忌，直接降为丙级
          if (conflicts.length > 0) {
            finalScore = '丙级'
          }
        }

        analysisResult.value = {
          score: finalScore,
          matchRate: finalMatchRate,
          conflicts: conflicts, // ========== 使用 AI 返回的 conflicts ==========
          commentary: finalCommentary,
          monarch: {
            name: monarchItem.herb.name,
            dose: monarchItem.dose + '钱',
            reason: monarchReason,
          },
          balanceIndex,
          balanceDesc,
          balanceColor,
          roles: {
            jun: res.data.roles?.jun || `${monarchItem.herb.name}为君`,
            chen: res.data.roles?.chen || '待定',
            zuoshi: res.data.roles?.zuoshi || '待定',
          },
          doseInsight,
          formulaExplanation:
            res.data.formulaExplanation ||
            generateFormulaExplanation(names, currentCase.value.title),
          historicalRef,
          suggestions: res.data.suggestions || '',
        }
      } else {
        // 自由模式：直接使用 AI 返回的数据
        const items = selectedHerbsWithDose.value

        // ========== 修改3：获取 AI 返回的 conflicts ==========
        const conflicts = res.data.conflicts || []

        // 计算君臣佐使（本地逻辑作为备用）
        const sorted = [...items].sort((a, b) => b.dose - a.dose)
        const junFree = sorted[0]?.herb.name + ` (${sorted[0]?.dose}钱) 为君，主病所向。`
        const chenFree = sorted[1]
          ? sorted[1].herb.name + ` (${sorted[1].dose}钱) 助君药之力。`
          : '（可再添臣药辅之）'
        const zuoshiFree =
          sorted
            .slice(2)
            .map((i) => `${i.herb.name}(${i.dose}钱)`)
            .join('、') || '（佐使药未备，酌情增损）'

        // ========== 修改4：如果有禁忌，在功效中添加警告 ==========
        let finalEfficacy = res.data.efficacy || '调和气血'
        let finalIndications = res.data.indications || '适用于相应症状'

        if (conflicts.length > 0) {
          finalEfficacy = `⚠️ 配伍禁忌：${conflicts.join('、')}。${finalEfficacy}`
        }

        analysisResult.value = {
          formulaName: res.data.formulaName || `${items[0]?.herb.name}合剂`,
          efficacy: finalEfficacy,
          indications: finalIndications,
          herbsWithDose: items.map((i) => ({ name: i.herb.name, dose: i.dose })),
          freeRoles: {
            jun: res.data.roles?.jun || junFree,
            chen: res.data.roles?.chen || chenFree,
            zuoshi: res.data.roles?.zuoshi || zuoshiFree,
          },
          natureSummary: res.data.natureSummary || '药性平和',
          modificationNote: res.data.modificationNote || '随证加减',
          classicalQuote: res.data.classicalQuote || '方从法出，法随证立',
          conflicts: conflicts, // ========== 保存 AI 返回的 conflicts，供模板显示 ==========
        }
      }
    }
  } catch (error) {
    console.error('AI分析失败，使用本地分析:', error)
    // 降级：使用原有的本地分析函数
    if (currentMode.value === 'case') {
      showCaseReport()
    } else {
      showFreeReport()
    }
  } finally {
    clearInterval(timer)
    isAnalyzing.value = false
  }
}
const showCaseReport = () => {
  const items = selectedHerbsWithDose.value
  const names = items.map((i) => i.herb.name)

  const conflicts: string[] = []
  if (names.includes('甘草') && names.includes('甘遂')) conflicts.push('甘草反甘遂 (十八反)')
  if (names.includes('附子') && names.includes('半夏')) conflicts.push('乌头反半夏 (十八反)')

  let matchRate = 0
  const hits = names.filter((n) => currentCase.value.keywords.includes(n)).length
  matchRate = Math.round((hits / currentCase.value.keywords.length) * 100)

  let monarchItem = items[0]
  if (!monarchItem) {
    message.error('错误', {
      note: 'monarchItem未定义！',
      duration: 3000,
    })
    return
  }
  for (const item of items) {
    if (item.dose > monarchItem.dose) monarchItem = item
  }
  const monarch = {
    name: monarchItem.herb.name,
    dose: monarchItem.dose,
    reason: getMonarchReason(monarchItem.herb.name, currentCase.value.title),
  }

  const sorted = [...items].sort((a, b) => b.dose - a.dose)
  const jun = sorted[0]?.herb.name + ` (${sorted[0]?.dose}钱) 为君，统领全方。`
  const chen = sorted[1]
    ? sorted[1].herb.name + ` (${sorted[1].dose}钱) 辅助君药增强疗效。`
    : '（尚未明确，建议补充臣药）'
  const zuoshi =
    sorted
      .slice(2)
      .map((i) => `${i.herb.name}(${i.dose}钱)`)
      .join('、') || '（佐使药暂缺，可酌情增加调和之品）'

  let warmCount = 0,
    coldCount = 0
  items.forEach((i) => {
    const nature = i.herb.nature
    if (nature.includes('温') || nature.includes('热')) warmCount++
    if (nature.includes('寒') || nature.includes('凉')) coldCount++
  })
  let balanceIndex = 50,
    balanceDesc = '',
    balanceColor = '#8b5e3c'
  if (warmCount > coldCount + 1) {
    balanceIndex = 30
    balanceDesc = '方剂偏于温燥，恐伤阴液'
    balanceColor = '#b71c1c'
  } else if (coldCount > warmCount + 1) {
    balanceIndex = 70
    balanceDesc = '方剂偏于寒凉，中病即止'
    balanceColor = '#2c6e9e'
  } else {
    balanceIndex = 85
    balanceDesc = '寒热均衡，阴阳调和'
    balanceColor = '#2e7d32'
  }

  const maxDose = Math.max(...items.map((i) => i.dose), 1)
  const doseInsight = items
    .map((i) => `${i.herb.name} ${i.dose}钱 (${((i.dose / maxDose) * 100).toFixed(0)}%相对强度)`)
    .join('；')
  const formulaExplanation = generateFormulaExplanation(names, currentCase.value.title)
  if (!items[0]) {
    message.error('错误', {
      note: 'items[0]未定义！',
      duration: 3000,
    })
    return
  }
  const historicalRef =
    items.length > 0
      ? `《本草纲目》载：${items[0].herb.name}“主诸病”，后世医家常以此为基础加减。`
      : '待组方后考据。'
  const scoreValue = matchRate > 80 ? '甲上' : matchRate > 60 ? '乙等' : '丙级'
  const commentary =
    matchRate > 80
      ? '选药精准，剂量考究，深得经方神髓。'
      : matchRate > 50
        ? '组方思路清晰，可再斟酌君药权重及配伍比例。'
        : '方药与证候关联欠紧密，建议重修君臣架构。'

  analysisResult.value = {
    score: scoreValue,
    matchRate,
    conflicts,
    commentary,
    monarch: { ...monarch, dose: monarch.dose + '钱' },
    balanceIndex,
    balanceDesc,
    balanceColor,
    roles: { jun, chen, zuoshi },
    doseInsight,
    formulaExplanation,
    historicalRef,
  }
  isAnalyzing.value = false
}

const showFreeReport = () => {
  const items = selectedHerbsWithDose.value
  const names = items.map((i) => i.herb.name)

  let formulaName = ''
  if (names.includes('人参') && names.includes('黄芪')) formulaName = '参芪益气汤'
  else if (names.includes('金银花') && names.includes('连翘')) formulaName = '银翘散加减'
  else if (names.includes('当归') && names.includes('川芎')) formulaName = '佛手散化裁'
  else if (names.length > 0) formulaName = `${names[0]}${names[1] ? names[1] : ''}合剂`
  else formulaName = '新制方'

  let efficacy = ''
  let indications = ''
  let natureSummary = ''
  let modificationNote = ''
  let classicalQuote = ''

  const hasTonifying = items.some((i) => i.herb.category.includes('补'))
  const hasHeatClear = items.some((i) => i.herb.category.includes('清热'))
  const hasWarming = items.some((i) => i.herb.nature.includes('温') || i.herb.nature.includes('热'))
  const hasCooling = items.some((i) => i.herb.nature.includes('寒') || i.herb.nature.includes('凉'))
  const hasQiRegulating = items.some((i) => i.herb.category.includes('理气'))
  const hasBloodActivating = items.some((i) => i.herb.category.includes('活血'))

  if (hasTonifying && !hasHeatClear && !hasCooling) {
    efficacy = '益气健脾，扶正固本'
    indications = '适用于气虚乏力、食少便溏、神疲懒言等脾肺气虚诸证。'
    natureSummary = '本方以甘温补益为主，药性平和，重在培补后天之本。'
    modificationNote = '若兼湿滞可加茯苓、白术；若阴虚内热者慎用。'
    classicalQuote = '《黄帝内经》云：“形不足者，温之以气；精不足者，补之以味。”此方得补气之要旨。'
  } else if (hasHeatClear) {
    efficacy = '清热解毒，疏风散邪'
    indications = '适用于风热感冒、咽喉肿痛、发热微恶风寒等温病初起之证。'
    natureSummary = '药性偏寒凉，辛凉透热，清热解毒之力较著。'
    modificationNote = '热毒重者可加板蓝根、蒲公英；脾胃虚寒者减量或佐以护胃之品。'
    classicalQuote = '《温病条辨》谓：“治上焦如羽，非轻不举。”此方轻清宣透，契合温病卫分证治。'
  } else if (hasWarming && !hasCooling) {
    efficacy = '温中散寒，回阳通脉'
    indications = '适用于脘腹冷痛、四肢不温、脉沉迟等里寒证。'
    natureSummary = '辛热温通，直散阴寒，为温里之峻剂。'
    modificationNote = '中病即止，不可久服；阴虚火旺者忌用。'
    classicalQuote = '《伤寒论》以姜附辈救逆回阳，此方深得温阳之奥义。'
  } else if (hasBloodActivating) {
    efficacy = '活血化瘀，通络止痛'
    indications = '适用于血瘀所致之胸胁刺痛、经闭痛经、癥瘕痞块等。'
    natureSummary = '辛散温通，走而不守，善行血分。'
    modificationNote = '孕妇忌用；气血虚弱者需配补益药同用。'
    classicalQuote = '“血实宜决之”，此方通瘀启闭，使气血复归平和。'
  } else {
    efficacy = '调和气血，疏理气机'
    indications = '适用于气机不畅、气血失和所致之胸胁胀闷、脘腹不适等。'
    natureSummary = '辛开苦降，升降相因，复中焦转输之能。'
    modificationNote = '随证加减，气滞甚者增行气之品，血瘀明显加活血药。'
    classicalQuote = '方从法出，法随证立，此方为调气活血之基础。'
  }

  const sorted = [...items].sort((a, b) => b.dose - a.dose)
  const junFree = sorted[0]?.herb.name + ` (${sorted[0]?.dose}钱) 为君，主病所向。`
  const chenFree = sorted[1]
    ? sorted[1].herb.name + ` (${sorted[1].dose}钱) 助君药之力。`
    : '（可再添臣药辅之）'
  const zuoshiFree =
    sorted
      .slice(2)
      .map((i) => `${i.herb.name}(${i.dose}钱)`)
      .join('、') || '（佐使药未备，酌情增损）'

  analysisResult.value = {
    formulaName,
    efficacy,
    indications,
    herbsWithDose: items.map((i) => ({ name: i.herb.name, dose: i.dose })),
    freeRoles: { jun: junFree, chen: chenFree, zuoshi: zuoshiFree },
    natureSummary,
    modificationNote,
    classicalQuote,
  }
  isAnalyzing.value = false
}

function getMonarchReason(herbName: string, caseTitle: string): string {
  if (caseTitle.includes('虚寒')) return '针对脾肾阳虚核心病机，温补命门'
  if (caseTitle.includes('温热')) return '针对风热邪气，辛凉透热'
  if (herbName === '人参') return '大补元气，复脉固脱为君'
  if (herbName === '金银花') return '清热解毒为君，直折热邪'
  return '根据病症主次，确立为君药以制方'
}

function generateFormulaExplanation(names: string[], caseContext: string | null): string {
  if (!names.length) return '待选药后推演方义。'
  const base = `本方以 ${names.slice(0, 3).join('、')} 为核心，`
  if (caseContext && caseContext.includes('虚寒'))
    return base + '温中散寒，补火助阳，使阳气复而泄泻止。'
  if (caseContext && caseContext.includes('温热')) return base + '辛凉解表，清热解毒，卫气同治。'
  return base + '共奏调和气血，扶正祛邪之功。'
}

// 在组件挂载时加载数据
onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  loadHerbLibrary()
})
</script>

<style scoped>
/* 核心视觉规范 - 复古风格 */
.digital-museum-container {
  --cinnabar: #b71c1c;
  --dark-brown: #3e2723;
  --bronze: #8b5e3c;
  --silk-bg: #fdf5e0;
  min-height: 100vh;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', serif;
  color: var(--dark-brown);
}

.content-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
  position: relative;
  z-index: 10;
}

/* 居中标题与装饰 */
.page-header {
  margin-top: 5vh;
  margin-bottom: 30px;
  text-align: center;
}
.header-main {
  display: inline-flex;
  align-items: center;
  gap: 30px;
}
.title-decorator {
  width: 80px;
  height: 1px;
  background: linear-gradient(to var(--direction, right), var(--bronze), transparent);
}
.title-decorator.left {
  --direction: left;
}
.main-title {
  font-size: 2.2rem;
  letter-spacing: 10px;
  margin: 0;
  color: var(--dark-brown);
}
.subtitle {
  font-size: 0.75rem;
  letter-spacing: 4px;
  color: var(--bronze);
  margin-top: 5px;
}

/* 模式切换 */
.mode-navigator {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
  gap: 15px;
}
.mode-tab {
  padding: 8px 30px;
  border: 1px solid var(--bronze);
  cursor: pointer;
  transition: 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(253, 245, 224, 0.5);
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.mode-icon {
  font-size: 1rem;
}
.mode-tab.is-active {
  background: var(--cinnabar);
  color: #fff;
  border-color: var(--cinnabar);
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.2);
}

/* 医案展开收起动效 */
.expand-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  margin-bottom: 0;
}
.expand-wrapper.is-expanded {
  max-height: 400px;
  opacity: 1;
  margin-bottom: 30px;
}

/* 医案容器样式 */
.glass-card {
  background: rgba(253, 245, 224, 0.7);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(139, 94, 60, 0.35);
  padding: 25px;
  border-radius: 4px;
}

.case-loading-state {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.loading-ink-bar {
  width: 40px;
  height: 2px;
  background: var(--cinnabar);
  animation: inkLoading 1.5s infinite ease-in-out;
}
@keyframes inkLoading {
  0% {
    transform: scaleX(0.1);
    opacity: 0.3;
  }
  50% {
    transform: scaleX(1.5);
    opacity: 1;
  }
  100% {
    transform: scaleX(0.1);
    opacity: 0.3;
  }
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(139, 94, 60, 0.2);
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.case-tag-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.seal-tag {
  background: var(--cinnabar);
  color: #fff;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-size: 0.8rem;
}
.case-title {
  font-size: 1.25rem;
  margin: 0;
}
.action-link-btn {
  background: none;
  border: none;
  color: var(--bronze);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
}
.icon-reverse {
  display: inline-block;
  font-size: 1rem;
  margin-right: 4px;
}

.case-description {
  line-height: 1.8;
  font-size: 1.1rem;
  text-indent: 2em;
  color: #5d4037;
}
.case-requirement {
  margin-top: 15px;
  font-size: 0.85rem;
  color: var(--bronze);
  font-style: italic;
}

/* 布局网格 */
.grid-layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 25px;
  margin-bottom: 30px;
}

/* 药材库滚动条优化 */
.library-scroll-area {
  max-height: 450px;
  overflow-y: auto;
  padding-right: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 94, 60, 0.2) transparent;
}
.library-scroll-area::-webkit-scrollbar {
  width: 5px;
  background: transparent;
}
.library-scroll-area::-webkit-scrollbar-track {
  background: transparent;
  margin-block: 4px;
}
.library-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(139, 94, 60, 0.25);
  border-radius: 10px;
}
.library-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 94, 60, 0.4);
}

.section-title {
  font-size: 1.3rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 3px solid var(--cinnabar);
  padding-left: 12px;
}
.title-icon {
  font-size: 1.2rem;
  color: var(--cinnabar);
}
.category-label {
  font-size: 0.85rem;
  color: var(--bronze);
  margin: 15px 0 10px;
  text-align: center;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.cat-icon {
  font-size: 0.9rem;
}
.herb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}
.herb-card {
  padding: 10px 5px;
  border: 1px solid rgba(139, 94, 60, 0.2);
  text-align: center;
  cursor: pointer;
  transition: 0.3s;
  background: rgba(253, 245, 224, 0.4);
}
.herb-card:hover {
  border-color: var(--bronze);
}
.herb-card.is-picked {
  background: var(--cinnabar);
  color: #fff;
  border-color: var(--cinnabar);
}
.herb-name {
  font-weight: 600;
  font-size: 0.95rem;
}
.herb-meta {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* 配伍操作台 */
.bench-content {
  min-height: 320px;
  border: 1px dashed rgba(139, 94, 60, 0.3);
  margin-bottom: 20px;
  padding: 15px;
}
.empty-placeholder {
  text-align: center;
  padding: 40px 0;
  color: var(--bronze);
}
.ink-logo {
  font-size: 2.5rem;
  margin-bottom: 12px;
  opacity: 0.5;
}
.picked-item {
  display: flex;
  align-items: center;
  background: rgba(139, 94, 60, 0.05);
  margin-bottom: 12px;
  padding: 10px;
  flex-wrap: wrap;
  gap: 8px;
}
.order {
  color: var(--cinnabar);
  font-weight: bold;
  width: 30px;
}
.info .name {
  font-weight: 600;
  margin-right: 10px;
}
.info .tag {
  font-size: 0.75rem;
  color: var(--bronze);
}
.dosage-control {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0.03);
  padding: 4px 8px;
  border-radius: 24px;
  margin-left: auto;
  margin-right: 10px;
}
.dose-btn {
  background: none;
  border: 1px solid var(--bronze);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  color: var(--bronze);
  transition: 0.2s;
  font-family: monospace;
}
.dose-btn:hover:not(:disabled) {
  background: var(--bronze);
  color: white;
}
.dose-input {
  width: 45px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  background: white;
}
.dose-unit {
  font-size: 0.7rem;
  color: var(--bronze);
}
.del-btn {
  margin-left: 0;
  background: none;
  border: none;
  color: var(--cinnabar);
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
}
.primary-submit-btn {
  width: 100%;
  padding: 15px;
  background: var(--dark-brown);
  color: #fff;
  border: none;
  letter-spacing: 2px;
  cursor: pointer;
  transition: 0.4s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.primary-submit-btn:hover:not(:disabled) {
  background: var(--cinnabar);
}
.primary-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analysis-progress-bar {
  height: 2px;
  background: #eee;
  margin-top: 15px;
}
.bar-inner {
  height: 100%;
  background: var(--cinnabar);
  transition: width 0.1s;
}

/* 报告单通用样式 */
.result-report {
  margin-top: 30px;
  animation: fadeInUp 0.8s forwards;
}
.report-paper {
  border: 1px solid var(--bronze);
  padding: 30px;
  position: relative;
}
.report-ribbon {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--dark-brown);
  padding-bottom: 15px;
  margin-bottom: 25px;
}
.report-title {
  font-size: 1.5rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-mark {
  font-size: 1.3rem;
}
.score-seal {
  border: 2px solid var(--cinnabar);
  color: var(--cinnabar);
  padding: 5px 15px;
  transform: rotate(-5deg);
}
.free-badge {
  background: var(--bronze);
  color: #fff;
  padding: 4px 12px;
  font-size: 0.8rem;
  letter-spacing: 2px;
}
.seal-text {
  font-size: 1.8rem;
  font-weight: 900;
}

/* 医案模式报告样式 */
.report-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
}
.info-row {
  margin-bottom: 24px;
}
.mini-progress {
  height: 6px;
  background: #eee;
  margin-top: 8px;
  width: 90%;
  display: inline-block;
}
.mini-progress .fill {
  height: 100%;
  background: var(--bronze);
}
.match-value {
  margin-left: 12px;
  font-weight: bold;
  font-size: 0.9rem;
}
.monarch-card {
  background: rgba(183, 28, 28, 0.05);
  padding: 12px;
  border-left: 4px solid var(--cinnabar);
  margin-top: 8px;
}
.monarch-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-right: 15px;
}
.monarch-dose {
  font-family: monospace;
  background: #fff0e0;
  padding: 2px 8px;
  border-radius: 12px;
}
.monarch-reason {
  display: block;
  font-size: 0.8rem;
  color: #5d4037;
  margin-top: 6px;
}
.balance-bar {
  height: 8px;
  background: #e0cfb1;
  margin: 12px 0 6px;
  width: 100%;
  border-radius: 4px;
}
.balance-fill {
  height: 100%;
  border-radius: 4px;
}
.balance-desc {
  font-size: 0.8rem;
}
.danger-box {
  color: var(--cinnabar);
  margin-bottom: 20px;
  border-left: 3px solid var(--cinnabar);
  padding-left: 10px;
}
.comment-box {
  margin-bottom: 20px;
  background: rgba(139, 94, 60, 0.05);
  padding: 12px;
}
.comment-box label {
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}
.formula-explanation {
  background: #f9efdf;
}
.role-analysis {
  list-style: none;
  padding: 0;
}
.role-analysis li {
  margin-bottom: 12px;
}
.role {
  color: var(--cinnabar);
  font-weight: bold;
  margin-right: 6px;
}
.dose-analysis,
.historical-ref {
  margin-top: 24px;
  border-top: 1px dotted rgba(139, 94, 60, 0.3);
  padding-top: 16px;
}
.dose-insight,
.ref-text {
  font-size: 0.85rem;
  line-height: 1.5;
  margin-top: 8px;
}
.report-bottom {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--bronze);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 16px;
}

/* 随心研习模式报告专用样式 */
.free-report-content {
  padding: 8px 0;
}
.free-intro {
  text-align: center;
  margin-bottom: 32px;
  border-bottom: 1px solid rgba(139, 94, 60, 0.3);
  padding-bottom: 20px;
}
.free-seal {
  font-size: 1.2rem;
  color: var(--cinnabar);
  letter-spacing: 6px;
  margin-bottom: 12px;
}
.free-formula-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: var(--dark-brown);
}
.free-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}
.free-left label,
.free-right label {
  display: block;
  font-weight: bold;
  font-size: 1rem;
  border-left: 3px solid var(--cinnabar);
  padding-left: 12px;
  margin-bottom: 16px;
  color: var(--dark-brown);
}
.efficacy-section,
.indication-section,
.herb-list-section {
  margin-bottom: 28px;
}
.efficacy-text,
.indication-text {
  line-height: 1.7;
  font-size: 1rem;
  background: rgba(139, 94, 60, 0.05);
  padding: 12px;
  border-radius: 4px;
}
.free-herb-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.free-herb-item {
  background: #fff0e0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  border: 1px solid rgba(139, 94, 60, 0.3);
}
.role-free-list {
  list-style: none;
  padding: 0;
}
.role-free-list li {
  margin-bottom: 12px;
  line-height: 1.6;
}
.role-label {
  color: var(--cinnabar);
  font-weight: bold;
  margin-right: 8px;
}
.nature-analysis,
.usage-note {
  margin-top: 24px;
}
.nature-desc,
.note-text {
  font-size: 0.9rem;
  line-height: 1.6;
  background: rgba(0, 0, 0, 0.02);
  padding: 10px;
}
.free-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(139, 94, 60, 0.2);
}
.classical-quote {
  font-style: italic;
  color: var(--bronze);
  margin-bottom: 12px;
  font-size: 0.85rem;
}

/* 动效 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-up {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.3s;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
.staggered-list-enter-active,
.staggered-list-leave-active {
  transition: all 0.4s;
}
.staggered-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.staggered-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.report-slide-enter-active,
.report-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.report-slide-enter-from {
  opacity: 0;
  transform: translateY(50px);
}
.report-slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
@media (max-width: 900px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
  .report-grid,
  .free-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .dosage-control {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
