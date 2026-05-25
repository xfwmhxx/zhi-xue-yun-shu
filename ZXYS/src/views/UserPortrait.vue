<template>
  <div class="kg-page-container">
    <PageTransition
      v-if="showTransition"
      mode="leave"
      :show-text="true"
      @animation-end="onEnterAnimationEnd"
    />

    <!-- 装饰性墨粒 -->
    <div class="ink-particles">
      <div v-for="n in 12" :key="n" :class="'particle p' + n"></div>
    </div>

    <!-- 面包屑导航 -->
    <div class="breadcrumb-wrapper">
      <BreadcrumbNav
        title="用户画像"
        :show-back="true"
        :back-to="'/Foundations/userhome'"
        :breadcrumb-items="[
          { name: '个人中心', url: '/Foundations/userhome' },
          { name: '用户画像', url: '' },
        ]"
      />
    </div>

    <!-- 大背景容器（毛玻璃效果） -->
    <div class="main-backdrop">
      <div class="main-content">
        <!-- 背景装饰文字 -->
        <div class="bg-calligraphy">
          <p>阴阳者，天地之道也，万物之纲纪，变化之父母，生杀之本始，神明之府也。</p>
          <p>凡治病必求于本。故积阳为天，积阴为地。</p>
        </div>

        <!-- 三栏布局 - 使用多标签导航避免滚动条 -->
        <div class="three-column-layout">
          <!-- 左侧：综合能力报告 - 使用标签页 -->
          <div class="dashboard dashboard-left">
            <div class="dashboard-header">
              <div class="seal-mark"><i class="fas fa-stamp"></i> 杏林·鉴</div>
              <h2><i class="fas fa-chart-simple"></i> 综合能力报告</h2>
              <div class="sub">COMPREHENSIVE ASSESSMENT · 学研一体</div>
            </div>
            <div class="nav-tabs-left">
              <button class="nav-btn-left active" data-panel-left="panel-basic">
                <i class="fas fa-id-card"></i> 档案
              </button>
              <button class="nav-btn-left" data-panel-left="panel-score">
                <i class="fas fa-chart-line"></i> 能力
              </button>
              <button class="nav-btn-left" data-panel-left="panel-progress">
                <i class="fas fa-tasks"></i> 进度
              </button>
              <button class="nav-btn-left" data-panel-left="panel-dimension">
                <i class="fas fa-cube"></i> 维度
              </button>
            </div>
            <div class="dashboard-content-left">
              <div id="panel-basic" class="panel-left active-panel-left">
                <div class="card">
                  <div class="card-title"><i class="fas fa-id-card"></i> 研习者档案</div>
                  <div class="stat-number" id="userName">—</div>
                  <div class="stat-label">
                    <i class="fas fa-microchip"></i> 杏林 ID · <span id="userId">—</span>
                  </div>
                </div>
                <div class="card">
                  <div class="card-title"><i class="fas fa-chart-pie"></i> 综合能力评分</div>
                  <div class="stat-number" id="overallScore">—</div>
                  <div class="stat-label">百分制 · <span id="overallLevel">—</span></div>
                  <div class="progress-bar-bg" style="margin-top: 16px">
                    <div class="progress-fill-custom" id="overallFill" style="width: 0%"></div>
                  </div>
                </div>
              </div>
              <div id="panel-score" class="panel-left">
                <div class="card">
                  <div class="card-title"><i class="fas fa-chart-line"></i> 核心能力评分</div>
                  <div class="metric-row">
                    <span>经典理论掌握</span><span class="highlight" id="theoryScore">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="theoryFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span>辨证思维能力</span><span class="highlight" id="syndromeScore">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="syndromeFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span>临床实践能力</span><span class="highlight" id="clinicalScore">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="clinicalFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span>科研创新能力</span><span class="highlight" id="researchScore">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="researchFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span>古籍研读能力</span><span class="highlight" id="classicScore">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="classicFill" style="width: 0%"></div>
                  </div>
                </div>
              </div>
              <div id="panel-progress" class="panel-left">
                <div class="card">
                  <div class="card-title"><i class="fas fa-chart-line"></i> 经典研读进度</div>
                  <div class="metric-row">
                    <span><i class="fas fa-book-open"></i> 内经研读</span>
                    <span class="highlight" id="neijingProgress">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="neijingFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span><i class="fas fa-book-open"></i> 伤寒论</span>
                    <span class="highlight" id="shanghanlunProgress">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="shanghanlunFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span><i class="fas fa-book-open"></i> 金匮要略</span>
                    <span class="highlight" id="jinguiyaolueProgress">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="jinguiyaolueFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span><i class="fas fa-book-open"></i> 温病条辨</span>
                    <span class="highlight" id="wenbingtiaobianProgress">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div
                      class="progress-fill-custom"
                      id="wenbingtiaobianFill"
                      style="width: 0%"
                    ></div>
                  </div>
                  <div class="metric-row">
                    <span><i class="fas fa-book-open"></i> 神农本草经</span>
                    <span class="highlight" id="shennongbencaojingProgress">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div
                      class="progress-fill-custom"
                      id="shennongbencaojingFill"
                      style="width: 0%"
                    ></div>
                  </div>
                </div>
              </div>
              <div id="panel-dimension" class="panel-left">
                <div class="card">
                  <div class="card-title"><i class="fas fa-chart-pie"></i> 五维能力分布</div>
                  <div class="metric-row">
                    <span><i class="fas fa-leaf"></i> 藏象学说</span>
                    <span class="highlight" id="zangxiangValue">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="zangxiangFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span><i class="fas fa-project-diagram"></i> 经络理论</span>
                    <span class="highlight" id="jingluoValue">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="jingluoFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span><i class="fas fa-virus"></i> 病因病机</span>
                    <span class="highlight" id="bingyinValue">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="bingyinFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span><i class="fas fa-hand-holding-heart"></i> 治则治法</span>
                    <span class="highlight" id="zhizeValue">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="zhizeFill" style="width: 0%"></div>
                  </div>
                  <div class="metric-row">
                    <span><i class="fas fa-capsules"></i> 方剂学</span>
                    <span class="highlight" id="fangjixueValue">—</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-fill-custom" id="fangjixueFill" style="width: 0%"></div>
                  </div>
                </div>
              </div>
              <div class="footer-note"><i class="fas fa-sync-alt"></i> 数据动态同步 · 实时更新</div>
            </div>
          </div>

          <!-- 中央区域：人物模型子组件 -->
          <div class="central-hero">
            <ModelViewer />
          </div>

          <!-- 右侧：知识图谱分析 - 使用标签页 -->
          <div class="dashboard dashboard-right">
            <div class="dashboard-header">
              <div class="seal-mark"><i class="fas fa-gear"></i> 砭石·智推</div>
              <h2><i class="fas fa-brain"></i> 知识图谱分析</h2>
              <div class="sub">KNOWLEDGE GRAPH · 智能诊断</div>
            </div>
            <div class="nav-tabs-right">
              <button class="nav-btn-right active" data-panel-right="panel-radar">
                <i class="fas fa-chart-pie"></i> 图谱
              </button>
              <button class="nav-btn-right" data-panel-right="panel-strength">
                <i class="fas fa-trophy"></i> 优势
              </button>
              <button class="nav-btn-right" data-panel-right="panel-recommend">
                <i class="fas fa-lightbulb"></i> 推荐
              </button>
              <button class="nav-btn-right" data-panel-right="panel-advice">
                <i class="fas fa-list-check"></i> 建议
              </button>
            </div>
            <div class="dashboard-content-right">
              <div id="panel-radar" class="panel-right active-panel-right">
                <div class="card">
                  <div class="card-title"><i class="fas fa-chart-pie"></i> 五维知识图谱</div>
                  <div class="radar-container">
                    <canvas id="radarCanvas" width="400" height="400"></canvas>
                  </div>
                  <div class="tag-group" style="justify-content: center">
                    <span class="tag">藏象学说</span><span class="tag">经络理论</span>
                    <span class="tag">病因病机</span><span class="tag">治则治法</span
                    ><span class="tag">方剂学</span>
                  </div>
                </div>
              </div>
              <div id="panel-strength" class="panel-right">
                <div class="card">
                  <div class="card-title"><i class="fas fa-trophy"></i> 优势领域</div>
                  <div class="tag-group" id="advantageAreas">
                    <span class="tag">加载中...</span>
                  </div>
                </div>
                <div class="card">
                  <div class="card-title"><i class="fas fa-chart-line"></i> 待提升领域</div>
                  <div class="tag-group" id="weaknessAreas">
                    <span class="tag">加载中...</span>
                  </div>
                </div>
              </div>
              <div id="panel-recommend" class="panel-right">
                <div class="card">
                  <div class="card-title"><i class="fas fa-lightbulb"></i> 智能推荐学习</div>
                  <div class="tag-group" id="recommendLearning">
                    <span class="tag">加载中...</span>
                  </div>
                </div>
                <div class="card">
                  <div class="card-title"><i class="fas fa-video"></i> 推荐课程</div>
                  <div class="tag-group" id="recommendCourses">
                    <span class="tag">加载中...</span>
                  </div>
                </div>
                <div class="card">
                  <div class="card-title"><i class="fas fa-book"></i> 推荐书单</div>
                  <div class="tag-group" id="recommendBooks">
                    <span class="tag">加载中...</span>
                  </div>
                </div>
              </div>
              <div id="panel-advice" class="panel-right">
                <div class="card">
                  <div class="card-title"><i class="fas fa-list-check"></i> 学习建议</div>
                  <div class="advice-text" id="adviceText">加载中...</div>
                </div>
              </div>
              <div class="footer-note">
                <i class="fas fa-chart-line"></i> 砭石引擎 · 基于知识图谱智能分析
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import PageTransition from '@/components/PageTransition.vue'
import ModelViewer from '@/views/UserPortrait/ModelViewer.vue'
import { getUserPortrait, type UserPortraitData } from '@/api/auth'

const showTransition = ref(true)
const userId = ref<number>(1) // 从store或localStorage获取实际用户ID

// 存储画像数据
let portraitData: UserPortraitData | null = null

// 左侧标签页导航
const initLeftNavigation = () => {
  document.querySelectorAll('.nav-btn-left').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetPanel = btn.getAttribute('data-panel-left')
      const parent = btn.closest('.dashboard-left')
      if (parent) {
        parent
          .querySelectorAll('.panel-left')
          .forEach((panel) => panel.classList.remove('active-panel-left'))
        parent.querySelectorAll('.nav-btn-left').forEach((nav) => nav.classList.remove('active'))
        btn.classList.add('active')
        const activePanel = parent.querySelector(`#${targetPanel}`)
        if (activePanel) activePanel.classList.add('active-panel-left')
      }
    })
  })
}

// 右侧标签页导航
const initRightNavigation = () => {
  document.querySelectorAll('.nav-btn-right').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetPanel = btn.getAttribute('data-panel-right')
      const parent = btn.closest('.dashboard-right')
      if (parent) {
        parent
          .querySelectorAll('.panel-right')
          .forEach((panel) => panel.classList.remove('active-panel-right'))
        parent.querySelectorAll('.nav-btn-right').forEach((nav) => nav.classList.remove('active'))
        btn.classList.add('active')
        const activePanel = parent.querySelector(`#${targetPanel}`)
        if (activePanel) activePanel.classList.add('active-panel-right')
      }
    })
  })
}

// 雷达图
const drawRadar = () => {
  const canvas = document.getElementById('radarCanvas') as HTMLCanvasElement
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = 260
  canvas.width = size
  canvas.height = size
  canvas.style.width = '260px'
  canvas.style.height = '260px'

  const centerX = size / 2,
    centerY = size / 2,
    radius = size * 0.38
  ctx.clearRect(0, 0, size, size)

  const angles = [
    -Math.PI / 2,
    -Math.PI / 2 + (72 * Math.PI) / 180,
    -Math.PI / 2 + (144 * Math.PI) / 180,
    -Math.PI / 2 + (216 * Math.PI) / 180,
    -Math.PI / 2 + (288 * Math.PI) / 180,
  ]
  const labels = ['藏象学说', '经络理论', '病因病机', '治则治法', '方剂学']
  const values = portraitData?.radarValues || [75, 75, 75, 75, 75]

  for (let level = 1; level <= 4; level++) {
    ctx.beginPath()
    const r = (radius * level) / 4
    for (let i = 0; i < 5; i++) {
      const x = centerX + r * Math.cos(angles[i] as number)
      const y = centerY + r * Math.sin(angles[i] as number)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = '#c6a15b'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    const x = centerX + radius * Math.cos(angles[i] as number)
    const y = centerY + radius * Math.sin(angles[i] as number)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#dbb88c'
    ctx.stroke()

    ctx.fillStyle = '#78461f'
    ctx.font = '13px "STKaiti", "Segoe UI"'
    const tx = centerX + (radius + 18) * Math.cos(angles[i] as number)
    const ty = centerY + (radius + 14) * Math.sin(angles[i] as number)
    ctx.fillText(labels[i] as string, tx - 14, ty - 6)
  }

  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const val = Math.min(100, Math.max(0, values[i] as number)) / 100
    const r = radius * val
    const x = centerX + r * Math.cos(angles[i] as number)
    const y = centerY + r * Math.sin(angles[i] as number)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(193, 123, 66, 0.35)'
  ctx.fill()
  ctx.strokeStyle = '#c17b42'
  ctx.lineWidth = 2.5
  ctx.stroke()
}

// 渲染左侧档案数据
const renderBasicInfo = () => {
  if (!portraitData) return
  const userNameEl = document.getElementById('userName')
  const userIdEl = document.getElementById('userId')
  const overallScoreEl = document.getElementById('overallScore')
  const overallLevelEl = document.getElementById('overallLevel')
  const overallFillEl = document.getElementById('overallFill')

  if (userNameEl) userNameEl.innerText = portraitData.name
  if (userIdEl) userIdEl.innerText = String(portraitData.userId)
  if (overallScoreEl) overallScoreEl.innerText = String(portraitData.overallScore)
  if (overallLevelEl) overallLevelEl.innerText = portraitData.overallLevel
  if (overallFillEl) overallFillEl.style.width = `${portraitData.overallScore}%`
}

// 渲染核心能力评分
const renderCoreScores = () => {
  if (!portraitData) return
  const { coreScores } = portraitData

  const theoryEl = document.getElementById('theoryScore')
  const syndromeEl = document.getElementById('syndromeScore')
  const clinicalEl = document.getElementById('clinicalScore')
  const researchEl = document.getElementById('researchScore')
  const classicEl = document.getElementById('classicScore')
  const theoryFill = document.getElementById('theoryFill')
  const syndromeFill = document.getElementById('syndromeFill')
  const clinicalFill = document.getElementById('clinicalFill')
  const researchFill = document.getElementById('researchFill')
  const classicFill = document.getElementById('classicFill')

  if (theoryEl) theoryEl.innerText = String(coreScores.theoryScore)
  if (syndromeEl) syndromeEl.innerText = String(coreScores.syndromeScore)
  if (clinicalEl) clinicalEl.innerText = String(coreScores.clinicalScore)
  if (researchEl) researchEl.innerText = String(coreScores.researchScore)
  if (classicEl) classicEl.innerText = String(coreScores.classicScore)
  if (theoryFill) theoryFill.style.width = `${coreScores.theoryScore}%`
  if (syndromeFill) syndromeFill.style.width = `${coreScores.syndromeScore}%`
  if (clinicalFill) clinicalFill.style.width = `${coreScores.clinicalScore}%`
  if (researchFill) researchFill.style.width = `${coreScores.researchScore}%`
  if (classicFill) classicFill.style.width = `${coreScores.classicScore}%`
}

// 渲染研读进度
const renderProgress = () => {
  if (!portraitData) return
  const { progressData } = portraitData

  const neijingEl = document.getElementById('neijingProgress')
  const shanghanlunEl = document.getElementById('shanghanlunProgress')
  const jinguiyaolueEl = document.getElementById('jinguiyaolueProgress')
  const wenbingtiaobianEl = document.getElementById('wenbingtiaobianProgress')
  const shennongbencaojingEl = document.getElementById('shennongbencaojingProgress')
  const neijingFill = document.getElementById('neijingFill')
  const shanghanlunFill = document.getElementById('shanghanlunFill')
  const jinguiyaolueFill = document.getElementById('jinguiyaolueFill')
  const wenbingtiaobianFill = document.getElementById('wenbingtiaobianFill')
  const shennongbencaojingFill = document.getElementById('shennongbencaojingFill')

  if (neijingEl) neijingEl.innerText = `${progressData.neijing}%`
  if (shanghanlunEl) shanghanlunEl.innerText = `${progressData.shanghanlun}%`
  if (jinguiyaolueEl) jinguiyaolueEl.innerText = `${progressData.jinguiyaolue}%`
  if (wenbingtiaobianEl) wenbingtiaobianEl.innerText = `${progressData.wenbingtiaobian}%`
  if (shennongbencaojingEl) shennongbencaojingEl.innerText = `${progressData.shennongbencaojing}%`
  if (neijingFill) neijingFill.style.width = `${progressData.neijing}%`
  if (shanghanlunFill) shanghanlunFill.style.width = `${progressData.shanghanlun}%`
  if (jinguiyaolueFill) jinguiyaolueFill.style.width = `${progressData.jinguiyaolue}%`
  if (wenbingtiaobianFill) wenbingtiaobianFill.style.width = `${progressData.wenbingtiaobian}%`
  if (shennongbencaojingFill)
    shennongbencaojingFill.style.width = `${progressData.shennongbencaojing}%`
}

// 渲染五维能力分布
const renderDimension = () => {
  if (!portraitData) return
  const { dimensionData } = portraitData

  const zangxiangEl = document.getElementById('zangxiangValue')
  const jingluoEl = document.getElementById('jingluoValue')
  const bingyinEl = document.getElementById('bingyinValue')
  const zhizeEl = document.getElementById('zhizeValue')
  const fangjixueEl = document.getElementById('fangjixueValue')
  const zangxiangFill = document.getElementById('zangxiangFill')
  const jingluoFill = document.getElementById('jingluoFill')
  const bingyinFill = document.getElementById('bingyinFill')
  const zhizeFill = document.getElementById('zhizeFill')
  const fangjixueFill = document.getElementById('fangjixueFill')

  if (zangxiangEl) zangxiangEl.innerText = String(dimensionData.zangxiang)
  if (jingluoEl) jingluoEl.innerText = String(dimensionData.jingluo)
  if (bingyinEl) bingyinEl.innerText = String(dimensionData.bingyin)
  if (zhizeEl) zhizeEl.innerText = String(dimensionData.zhize)
  if (fangjixueEl) fangjixueEl.innerText = String(dimensionData.fangjixue)
  if (zangxiangFill) zangxiangFill.style.width = `${dimensionData.zangxiang}%`
  if (jingluoFill) jingluoFill.style.width = `${dimensionData.jingluo}%`
  if (bingyinFill) bingyinFill.style.width = `${dimensionData.bingyin}%`
  if (zhizeFill) zhizeFill.style.width = `${dimensionData.zhize}%`
  if (fangjixueFill) fangjixueFill.style.width = `${dimensionData.fangjixue}%`
}

// 渲染右侧优势/待提升领域
const renderStrengthAreas = () => {
  if (!portraitData) return

  const advantageContainer = document.getElementById('advantageAreas')
  const weaknessContainer = document.getElementById('weaknessAreas')

  if (advantageContainer) {
    advantageContainer.innerHTML = portraitData.advantageAreas
      .map((area) => `<span class="tag">${area}</span>`)
      .join('')
  }

  if (weaknessContainer) {
    weaknessContainer.innerHTML = portraitData.weaknessAreas
      .map((area) => `<span class="tag">${area}</span>`)
      .join('')
  }
}

// 渲染推荐内容
const renderRecommendations = () => {
  if (!portraitData) return

  const recommendLearning = portraitData.recommendLearning || [
    '《脾胃论》精读',
    '补土派专题',
    '李东垣学术思想',
  ]
  const recommendCourses = portraitData.recommendCourses || [
    '中医基础理论进阶',
    '方剂学精讲',
    '中医内科学案例',
  ]
  const recommendBooks = portraitData.recommendBooks || [
    '《脾胃论》',
    '《内外伤辨惑论》',
    '《兰室秘藏》',
  ]
  const adviceText =
    portraitData.adviceText || '根据您的学习情况和知识图谱分析，建议您重点关注脾脏学说的学习。'

  const learningContainer = document.getElementById('recommendLearning')
  const coursesContainer = document.getElementById('recommendCourses')
  const booksContainer = document.getElementById('recommendBooks')
  const adviceContainer = document.getElementById('adviceText')

  if (learningContainer) {
    learningContainer.innerHTML = recommendLearning
      .map((item) => `<span class="tag">${item}</span>`)
      .join('')
  }
  if (coursesContainer) {
    coursesContainer.innerHTML = recommendCourses
      .map((item) => `<span class="tag">${item}</span>`)
      .join('')
  }
  if (booksContainer) {
    booksContainer.innerHTML = recommendBooks
      .map((item) => `<span class="tag">${item}</span>`)
      .join('')
  }
  if (adviceContainer) {
    adviceContainer.innerText = adviceText
  }
}

// 加载用户画像数据
const loadUserPortrait = async () => {
  try {
    const response = await getUserPortrait(userId.value)
    if (response.code === 200 && response.data) {
      portraitData = response.data.portrait

      // 渲染所有数据
      renderBasicInfo()
      renderCoreScores()
      renderProgress()
      renderDimension()
      renderStrengthAreas()
      renderRecommendations()
      drawRadar()
    } else if (response.code === 204) {
      console.log('暂无画像数据')
      // 显示暂无数据提示
      const userNameEl = document.getElementById('userName')
      if (userNameEl) userNameEl.innerText = '暂无数据'
    }
  } catch (error) {
    console.error('加载用户画像失败:', error)
  }
}

// 监听子组件传来的模型数据
const setupModelDataListener = () => {
  window.addEventListener('model-data-update', (event: any) => {
    // 可以在这里处理模型数据更新
  })
}

const onEnterAnimationEnd = () => {
  showTransition.value = false
}

onMounted(async () => {
  await nextTick()
  initLeftNavigation()
  initRightNavigation()
  setupModelDataListener()
  await loadUserPortrait()
})

onUnmounted(() => {
  window.removeEventListener('model-data-update', () => {})
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.kg-page-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family: 'STKaiti', 'Noto Serif SC', 'Segoe UI', serif;
  background: transparent;
}

.breadcrumb-wrapper {
  position: relative;
  z-index: 100;
  flex-shrink: 0;
}

.ink-particles .particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(97, 67, 47, 0.08);
  pointer-events: none;
  animation: inkFloat 18s infinite linear;
  z-index: 0;
}

.p1 {
  width: 40px;
  height: 40px;
  left: 3%;
  top: 15%;
  animation-delay: 0s;
}
.p2 {
  width: 65px;
  height: 65px;
  left: 85%;
  top: 10%;
  animation-delay: -3s;
}
.p3 {
  width: 25px;
  height: 25px;
  left: 35%;
  top: 75%;
  animation-delay: -7s;
}
.p4 {
  width: 55px;
  height: 55px;
  left: 12%;
  top: 55%;
  animation-delay: -5s;
}
.p5 {
  width: 35px;
  height: 35px;
  left: 75%;
  top: 80%;
  animation-delay: -2s;
}
.p6 {
  width: 45px;
  height: 45px;
  left: 92%;
  top: 35%;
  animation-delay: -9s;
}
.p7 {
  width: 30px;
  height: 30px;
  left: 48%;
  top: 20%;
  animation-delay: -12s;
}
.p8 {
  width: 50px;
  height: 50px;
  left: 60%;
  top: 88%;
  animation-delay: -6s;
}
.p9 {
  width: 20px;
  height: 20px;
  left: 18%;
  top: 40%;
  animation-delay: -4s;
}
.p10 {
  width: 38px;
  height: 38px;
  left: 70%;
  top: 28%;
  animation-delay: -8s;
}
.p11 {
  width: 28px;
  height: 28px;
  left: 5%;
  top: 68%;
  animation-delay: -10s;
}
.p12 {
  width: 48px;
  height: 48px;
  left: 88%;
  top: 58%;
  animation-delay: -1s;
}

@keyframes inkFloat {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-120vh) rotate(360deg);
    opacity: 0;
  }
}

.main-backdrop {
  position: relative;
  flex: 1;
  margin-top: 50px;
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
  background: rgba(253, 245, 230, 0.25);
  backdrop-filter: blur(12px);
  border-radius: 48px;
  border: 1px solid rgba(166, 124, 82, 0.4);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 5;
}

.main-content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bg-calligraphy {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 180px;
  writing-mode: vertical-rl;
  pointer-events: none;
  opacity: 0.05;
  font-size: 20px;
  line-height: 2;
  color: #3d2b1f;
  z-index: 1;
  font-family: 'STKaiti', cursive;
}

.three-column-layout {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  gap: 16px;
  padding: 20px;
  position: relative;
  z-index: 10;
}

.dashboard {
  width: 420px;
  flex-shrink: 0;
  background: rgba(253, 245, 230, 0.35);
  backdrop-filter: blur(16px);
  color: #4a342e;
  border-radius: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(166, 124, 82, 0.4);
  overflow: hidden;
  height: 100%;
  font-size: 20px;
}

.dashboard-header {
  text-align: center;
  padding: 20px 16px 16px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.3);
  position: relative;
  flex-shrink: 0;
}
.dashboard-header h2 {
  margin: 0;
  font-size: 26px;
  letter-spacing: 4px;
  color: #4a342e;
  font-weight: 600;
}
.dashboard-header .sub {
  font-size: 11px;
  color: #8d6e63;
  letter-spacing: 1px;
  margin-top: 6px;
}
.seal-mark {
  position: absolute;
  right: 18px;
  top: 16px;
  font-size: 10px;
  background: #c23b22;
  color: #fef0e0;
  padding: 4px 10px;
  border-radius: 24px;
  font-weight: 500;
}

/* 左侧标签页样式 - 字体调小避免换行 */
.nav-tabs-left {
  display: flex;
  justify-content: space-around;
  padding: 10px 16px 0;
  gap: 8px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.3);
  flex-shrink: 0;
}
.nav-btn-left {
  background: rgba(166, 124, 82, 0.15);
  border: none;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 16px !important;
  font-weight: 500;
  color: #8d6e63;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}
.nav-btn-left.active {
  background: #a67c52;
  color: white;
}
.dashboard-content-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  gap: 16px;
  overflow-y: auto;
}
/* 自定义细滚动条 */
.dashboard-content-left::-webkit-scrollbar {
  width: 4px;
}
.dashboard-content-left::-webkit-scrollbar-track {
  background: rgba(166, 124, 82, 0.1);
  border-radius: 4px;
}
.dashboard-content-left::-webkit-scrollbar-thumb {
  background: rgba(166, 124, 82, 0.4);
  border-radius: 4px;
}
.dashboard-content-left::-webkit-scrollbar-thumb:hover {
  background: rgba(166, 124, 82, 0.6);
}
.panel-left {
  display: none;
}
.panel-left.active-panel-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 右侧标签页样式 - 字体调小避免换行 */
.nav-tabs-right {
  display: flex;
  justify-content: space-around;
  padding: 10px 16px 0;
  gap: 8px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.3);
  flex-shrink: 0;
}
.nav-btn-right {
  background: rgba(166, 124, 82, 0.15);
  border: none;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 16px !important;
  font-weight: 500;
  color: #8d6e63;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}
.nav-btn-right.active {
  background: #a67c52;
  color: white;
}
.dashboard-content-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  gap: 16px;
  overflow-y: auto;
}
/* 自定义细滚动条 */
.dashboard-content-right::-webkit-scrollbar {
  width: 4px;
}
.dashboard-content-right::-webkit-scrollbar-track {
  background: rgba(166, 124, 82, 0.1);
  border-radius: 4px;
}
.dashboard-content-right::-webkit-scrollbar-thumb {
  background: rgba(166, 124, 82, 0.4);
  border-radius: 4px;
}
.dashboard-content-right::-webkit-scrollbar-thumb:hover {
  background: rgba(166, 124, 82, 0.6);
}
.panel-right {
  display: none;
}
.panel-right.active-panel-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: rgba(255, 255, 255, 0.85);
  margin: 0 18px;
  padding: 18px 22px;
  border-radius: 24px;
  border: 1px solid rgba(166, 124, 82, 0.2);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 20px !important;
  font-weight: 700;
  color: #a67c52;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 4px solid #a67c52;
  padding-left: 14px;
}

.stat-number {
  font-size: 44px;
  font-weight: 800;
  color: #c23b22;
  margin: 10px 0;
  line-height: 1.2;
}

.stat-label {
  font-size: 16px;
  color: #8d6e63;
  margin-top: 6px;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.tag {
  background: rgba(166, 124, 82, 0.12);
  border-radius: 30px;
  padding: 6px 14px;
  font-size: 16px;
  color: #a67c52;
  border: 0.5px solid rgba(166, 124, 82, 0.3);
  font-weight: 500;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  font-size: 20px;
  color: #4a342e;
}

.highlight {
  color: #c23b22;
  font-weight: bold;
  font-size: 16px;
}

.progress-bar-bg {
  background: rgba(166, 124, 82, 0.15);
  border-radius: 20px;
  height: 6px;
  margin: 8px 0;
  overflow: hidden;
}
.progress-fill-custom {
  background: linear-gradient(90deg, #a67c52, #c23b22);
  width: 0%;
  height: 100%;
  border-radius: 20px;
  transition: width 0.4s ease;
}

.radar-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 8px 0;
}
#radarCanvas {
  width: 260px;
  height: 260px;
}

.footer-note {
  text-align: center;
  font-size: 11px;
  color: #8d6e63;
  margin: 12px 0 16px;
  opacity: 0.7;
}

.central-hero {
  flex: 1;
  position: relative;
  min-width: 0;
  height: 100%;
}

.advice-text {
  font-size: 20px !important;
  line-height: 1.8;
  color: #4a342e;
  text-align: justify;
  padding: 8px 0;
}

@media (max-width: 1600px) {
  .dashboard {
    width: 380px;
  }
}
@media (max-width: 1400px) {
  .dashboard {
    width: 360px;
  }
  .three-column-layout {
    gap: 14px;
    padding: 16px;
  }
  .nav-btn-left,
  .nav-btn-right {
    padding: 5px 12px;
    font-size: 12px;
  }
  .stat-number {
    font-size: 38px;
  }
  .card-title {
    font-size: 16px;
  }
  .advice-text {
    font-size: 14px;
  }
}
@media (max-width: 1200px) {
  .dashboard {
    width: 340px;
  }
  .three-column-layout {
    gap: 12px;
    padding: 14px;
  }
  .stat-number {
    font-size: 34px;
  }
  .metric-row {
    font-size: 14px;
  }
  .highlight {
    font-size: 15px;
  }
  .advice-text {
    font-size: 13px;
  }
}
</style>
