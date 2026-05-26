<template>
  <div class="tongue-diagnosis-page">
    <!-- 导航与背景组件 -->
    <BreadcrumbNav title="AI 舌诊" />

    <div class="tongue-container">
      <!-- 1. 隐私授权悬浮窗 -->
      <Transition name="zen-fade">
        <div v-if="!consented" class="privacy-overlay">
          <div class="zen-modal">
            <div class="modal-decoration"></div>
            <div class="modal-content">
              <h3 class="huge-text-red"><i class="fa-solid fa-file-shield"></i> 医患协议</h3>
              <p class="zen-p-large">
                「医不叩门，道不虚传。」为确保舌诊之精确，系统需调用您的相机权限。
                您的舌像数据仅于此时辨证使用，本系统不留存任何原始影像。
              </p>
              <div class="modal-footer">
                <label class="zen-checkbox-huge">
                  <input v-model="consentedLocal" type="checkbox" />
                  <span>我已阅读并同意</span>
                </label>
                <button :disabled="!consentedLocal" class="zen-btn-enter" @click="confirmConsent">
                  开始辨证
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 2. 顶部意境与介绍区 -->
      <header class="hero-section">
        <h1 class="zen-title-huge">智能中医 · 舌诊辨证</h1>
        <div class="title-divider">
          <span class="ink-line"></span>
          <p class="zen-subtitle-huge">观舌质 · 察苔色 · 辨虚实</p>
          <span class="ink-line"></span>
        </div>

        <div class="intro-grid">
          <div class="intro-item">
            <div class="intro-icon"><i class="fa-solid fa-scroll"></i></div>
            <h4 class="large-text">舌诊源流</h4>
            <p>舌为心之苗，外通五脏。观舌质可辨脏腑虚实，察舌苔可知邪气深浅。</p>
          </div>
          <div class="intro-item">
            <div class="intro-icon"><i class="fa-solid fa-microchip"></i></div>
            <h4 class="large-text">AI 赋能</h4>
            <p>融合数万例临床数据，精准识别齿痕、裂纹及苔色，实现秒级体质解析。</p>
          </div>
          <div class="intro-item">
            <div class="intro-icon"><i class="fa-solid fa-wand-sparkles"></i></div>
            <h4 class="large-text">采集须知</h4>
            <p>请在自然光下拍摄，舌体自然平展。避免进食染色食物，以免干扰辨证。</p>
          </div>
        </div>
      </header>

      <!-- 3. 基础信息填写卡片 -->
      <section class="info-card-zen">
        <div class="zen-card-inner">
          <div class="zen-form-grid">
            <div class="zen-form-group">
              <label class="zen-label-large"
                ><i class="fa-solid fa-user-clock"></i> 年龄 (岁)</label
              >
              <input
                v-model.number="userAge"
                type="number"
                class="zen-input-huge"
                placeholder="请输入"
              />
            </div>
            <div class="zen-form-group">
              <label class="zen-label-large"><i class="fa-solid fa-venus-mars"></i> 性别</label>
              <select v-model="userGender" class="zen-input-huge">
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div class="zen-form-group">
              <label class="zen-label-large"
                ><i class="fa-solid fa-heart-pulse"></i> 调理目标</label
              >
              <select v-model="userGoal" class="zen-input-huge">
                <option value="general">日常保健</option>
                <option value="weight_loss">减重调理</option>
                <option value="sleep">改善睡眠</option>
                <option value="energy">提升精力</option>
              </select>
            </div>
          </div>
          <div class="zen-form-group full-width">
            <label class="zen-label-large"
              ><i class="fa-solid fa-comment-medical"></i> 身体主诉 (当前症状)</label
            >
            <textarea
              v-model="userSymptoms"
              class="zen-input-huge"
              rows="2"
              placeholder="如：乏力、口苦、失眠、饭后腹胀..."
            ></textarea>
          </div>
        </div>
      </section>

      <!-- 4. 核心采集与分析区 -->
      <main class="diagnosis-layout">
        <!-- 上方：影像采集区域 -->
        <div class="collection-area">
          <div class="ink-frame">
            <div v-if="isCameraOpen" class="camera-container">
              <video ref="videoRef" autoplay playsinline class="video-preview"></video>
              <div class="camera-overlay-mask">
                <div class="tongue-guide-oval"></div>
                <p class="guide-text-huge">请将舌体对准朱砂框</p>
              </div>
            </div>
            <div v-else-if="imagePreview" class="preview-container">
              <img :src="imagePreview" alt="舌像预览" class="captured-img" />
              <div class="cinnabar-seal">
                <div class="seal-border">
                  <span class="seal-inner-text">准</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-placeholder" @click="triggerFileInput">
              <div class="ph-icon-box">
                <i class="fa-solid fa-camera-retro"></i>
              </div>
              <p class="huge-text">点击采集影像</p>
              <span class="sub-text-large">支持拍照或本地上传</span>
            </div>
          </div>
          <div class="action-bar-zen">
            <button class="zen-btn-action main" @click="handleMainAction">
              <template v-if="isCameraOpen">
                <i class="fa-solid fa-fingerprint"></i> <span>确认拍照</span>
              </template>
              <template v-else-if="imagePreview">
                <i class="fa-solid fa-rotate-right"></i> <span>重新采集</span>
              </template>
              <template v-else>
                <i class="fa-solid fa-video"></i> <span>开启摄像头</span>
              </template>
            </button>
            <button class="zen-btn-action sub" @click="handleSecondaryAction">
              <template v-if="isCameraOpen">
                <i class="fa-solid fa-xmark"></i> <span>取消</span>
              </template>
              <template v-else> <i class="fa-solid fa-images"></i> <span>照片上传</span> </template>
            </button>
          </div>
        </div>

        <!-- 下方：诊断报告区域 -->
        <div class="report-area">
          <div class="ancient-scroll">
            <div class="scroll-header">
              <span class="scroll-stamp">辨证报告</span>
              <div class="confidence-box" v-if="analysisResult">
                匹配度：{{ formatConfidence(analysisResult.confidence) }}
              </div>
            </div>

            <div v-if="analyzing" class="report-loading">
              <div class="ink-spinner"></div>
              <p class="huge-text">AI 医师辨证中...</p>
            </div>

            <div v-else-if="analysisResult" class="report-content">
              <h2 class="constitution-huge">
                {{ formatConstitution(analysisResult.constitution as string) }}
              </h2>

              <div class="scroll-body">
                <section class="report-item">
                  <h4 class="item-title-large">
                    <i class="fa-solid fa-magnifying-glass"></i> 舌象解析
                  </h4>
                  <!-- 按段落遍历显示 -->
                  <div
                    v-for="(paragraph, idx) in analysisResult.analysis_paragraphs"
                    :key="idx"
                    class="analysis-paragraph"
                  >
                    <p class="item-p-large">{{ paragraph }}</p>
                  </div>
                </section>

                <section class="report-item">
                  <h4 class="item-title-large">
                    <i class="fa-solid fa-mortar-pestle"></i> 养生建议
                  </h4>
                  <p class="item-p-large">
                    {{ formatText(analysisResult.suggestions || '暂无建议') }}
                  </p>
                </section>

                <!-- 详细报告按钮 -->
                <button class="btn-view-detailed" @click="showDetailedReport = true">
                  <i class="fa-solid fa-file-lines"></i> 查看详细中医分析报告
                </button>
              </div>
            </div>

            <div v-else class="report-empty-state">
              <i class="fa-solid fa-brush"></i>
              <p class="huge-text">待采集舌像后生成报告</p>
            </div>
          </div>
        </div>
      </main>

      <!-- 5. 提交按钮 -->
      <div class="submit-section-zen">
        <button
          class="zen-btn-submit-huge"
          :disabled="analyzing || !imagePreview || isCameraOpen"
          @click="analyzeImage"
        >
          <i class="fa-solid fa-yin-yang" :class="{ 'fa-spin': analyzing }"></i>
          {{ analyzing ? '辨证中...' : '开始 AI 辨证' }}
        </button>
      </div>

      <!-- 6. 历史记录 -->
      <footer v-if="historyList.length > 0" class="history-section-zen">
        <div class="history-header-huge">
          <span>🕒 往期记录</span>
          <button class="btn-clear-text" @click="clearHistory">清空</button>
        </div>
        <div class="history-scroll-row">
          <div
            v-for="item in historyList"
            :key="item.id"
            class="history-card-zen"
            @click="loadHistoryResult(item)"
          >
            <span class="h-date">{{ formatDate(item.timestamp) }}</span>
            <span class="h-name-huge">{{ formatConstitution(item.constitution as string) }}</span>
          </div>
        </div>
      </footer>
    </div>

    <!-- 详细报告弹窗 -->
    <Teleport to="body">
      <div
        v-if="showDetailedReport"
        class="detailed-report-modal"
        @click.self="showDetailedReport = false"
      >
        <div class="detailed-report-container">
          <div class="detailed-report-header">
            <h3><i class="fa-solid fa-file-lines"></i> 详细中医分析报告</h3>
            <button class="close-detailed-btn" @click="showDetailedReport = false">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="detailed-analysis-content">
            <!-- 免责声明 -->
            <div class="disclaimer-banner">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>以下分析基于舌象照片与用户提供信息，仅供参考，不能替代专业医师面诊。</span>
            </div>

            <!-- 一、舌苔特征 -->
            <div class="report-section">
              <div class="section-title">
                <span class="title-number">一</span>
                <span class="title-text">舌苔特征</span>
                <span
                  class="title-status"
                  :class="tongueCoatingStatus.includes('无法') ? 'warning' : 'ok'"
                >
                  {{ tongueCoatingStatus.includes('无法') ? '⚠️ 待评估' : '✓ 已识别' }}
                </span>
              </div>
              <div class="section-content">
                <p>{{ tongueCoatingStatus }}</p>
                <ul
                  class="feature-list"
                  v-if="tongueCoatingStatus.includes('白') || tongueCoatingStatus.includes('黄')"
                >
                  <li><span class="list-marker">•</span> 白腻苔多主寒湿或痰饮</li>
                  <li><span class="list-marker">•</span> 黄腻苔多主湿热</li>
                  <li><span class="list-marker">•</span> 少苔或剥苔可能提示阴虚或气阴两伤</li>
                  <li><span class="list-marker">•</span> 润苔为津液未伤，燥苔为津亏或热盛</li>
                </ul>
              </div>
            </div>

            <!-- 二、舌体特征 -->
            <div class="report-section">
              <div class="section-title">
                <span class="title-number">二</span>
                <span class="title-text">舌体特征</span>
                <span
                  class="title-status"
                  :class="tongueBodyStatus.includes('正常') ? 'ok' : 'warning'"
                >
                  {{ tongueBodyStatus.includes('正常') ? '✓ 大致正常' : '⚠️ 需关注' }}
                </span>
              </div>
              <div class="section-content">
                <p>{{ tongueBodyStatus }}</p>
                <div class="observation-box" v-if="!tongueBodyStatus.includes('正常')">
                  <p class="observation-label">舌诊要点：</p>
                  <ul class="observation-list">
                    <li><i class="fa-regular fa-circle-check"></i> 齿痕舌 → 脾虚湿盛</li>
                    <li><i class="fa-regular fa-circle-check"></i> 胖大舌 → 阳虚水泛</li>
                    <li><i class="fa-regular fa-circle-check"></i> 瘦小舌 → 阴血不足</li>
                    <li><i class="fa-regular fa-circle-check"></i> 瘀斑/紫暗 → 血瘀证</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 三、临床意义 -->
            <div class="report-section">
              <div class="section-title">
                <span class="title-number">三</span>
                <span class="title-text">临床意义</span>
              </div>
              <div class="section-content">
                <div class="clinical-inference">
                  <div class="inference-card">
                    <div class="inference-icon"><i class="fa-solid fa-stethoscope"></i></div>
                    <div class="inference-text">
                      <strong>辨证推断</strong>
                      <p>{{ clinicalInference }}</p>
                    </div>
                  </div>
                </div>
                <div class="warning-box">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  <div>
                    <strong>重要提醒：</strong>
                    <p>
                      中医辨证讲究「四诊合参」（望闻问切），单凭舌象无法确诊。现代人常见复合体质（如脾虚夹湿、肝郁脾虚、气阴两虚等），需动态观察。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 四、日常调养建议 -->
            <div class="report-section">
              <div class="section-title">
                <span class="title-number">四</span>
                <span class="title-text">日常调养建议</span>
              </div>
              <div class="section-content">
                <div class="daily-advice">
                  <p style="white-space: pre-line">{{ dailyAdvice }}</p>
                </div>
              </div>
            </div>

            <!-- 五、注意事项 -->
            <div class="report-section">
              <div class="section-title">
                <span class="title-number">五</span>
                <span class="title-text">注意事项</span>
              </div>
              <div class="section-content">
                <div class="notice-grid">
                  <div class="notice-item">
                    <div class="notice-icon"><i class="fa-solid fa-camera"></i></div>
                    <div class="notice-text">
                      <strong>拍摄要点</strong>
                      <p>自然光下，张口伸舌，舌尖轻抵上颚，避免染苔</p>
                    </div>
                  </div>
                  <div class="notice-item">
                    <div class="notice-icon"><i class="fa-solid fa-prescription-bottle"></i></div>
                    <div class="notice-text">
                      <strong>切勿自行服药</strong>
                      <p>误将脾虚当湿热而用苦寒药，反伤脾胃</p>
                    </div>
                  </div>
                  <div class="notice-item">
                    <div class="notice-icon"><i class="fa-solid fa-hospital-user"></i></div>
                    <div class="notice-text">
                      <strong>建议就医</strong>
                      <p>持续不适（>2周），请至正规中医院面诊</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 报告尾部 -->
            <div class="report-footer">
              <div class="footer-divider"></div>
              <div class="footer-content">
                <div class="footer-icon"><i class="fa-solid fa-code"></i></div>
                <div class="footer-text">
                  <p class="footer-label">AI 辨证摘要</p>
                  <pre class="json-preview">{{ JSON.stringify(jsonSummary, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 隐藏的 Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />
    <canvas ref="canvasRef" style="display: none"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import { analyzeInBrowser, type AnalyzeResult } from '../utils/ZYSZ_Lib/analyze'

const router = useRouter()

// 核心狀態
const consented = ref(true)
const consentedLocal = ref(false)
const isCameraOpen = ref(false)
const analyzing = ref(false)
const analysisResult = ref<AnalyzeResult | null>(null)
const showDetailedReport = ref(false)

// 用戶數據
const userAge = ref<number | null>(null)
const userGender = ref<string>('')
const userSymptoms = ref<string>('')
const userGoal = ref<string>('general')

// 媒體引用
const fileInput = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const imagePreview = ref<string | null>(null)
const stream = ref<MediaStream | null>(null)

// 歷史記錄
interface HistoryItem extends AnalyzeResult {
  id: string
  timestamp: number
  imagePreview?: string
}
const historyList = ref<HistoryItem[]>([])

// 格式化函數 - 處理特殊字符和過長文本
const formatText = (text: string): string => {
  if (!text) return '暂无数据'
  // 移除多余的换行符和空格
  let cleaned = text.replace(/\s+/g, ' ').trim()
  // 处理可能存在的HTML实体
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
  return cleaned
}

const formatConstitution = (constitution: string): string => {
  if (!constitution) return '待识别'
  // 移除多余的符号和空格
  return constitution.replace(/[\[\]{}]/g, '').trim()
}

const formatConfidence = (confidence: number): string => {
  if (confidence === undefined || confidence === null) return '待评估'
  return `${Math.round(confidence * 100)}%`
}

// 詳細報告計算屬性
const tongueCoatingStatus = computed(() => {
  const text = analysisResult.value?.analysis_text || ''
  if (text.includes('白') && text.includes('膩')) return '白膩苔（提示寒濕或痰飲）'
  if (text.includes('黃') && text.includes('膩')) return '黃膩苔（提示濕熱）'
  if (text.includes('剝') || text.includes('裂')) return '剝苔/裂紋（提示陰虛或氣陰兩傷）'
  if (text.includes('紅')) return '紅舌（提示熱證）'
  return '需進一步觀察'
})

const tongueBodyStatus = computed(() => {
  const text = analysisResult.value?.analysis_text || ''
  if (text.includes('齒痕')) return '齒痕舌（提示脾虛濕盛）'
  if (text.includes('胖大')) return '胖大舌（提示陽虛水泛）'
  if (text.includes('瘦小')) return '瘦小舌（提示陰血不足）'
  if (text.includes('瘀')) return '瘀斑/紫暗（提示血瘀證）'
  return '舌體大致正常'
})

const clinicalInference = computed(() => {
  const constitution = analysisResult.value?.constitution || ''
  if (constitution.includes('脾虛')) {
    return '脾虛濕困傾向：運化無力，水濕內停。常見於飲食不節、久坐少動、熬夜人群。'
  }
  if (constitution.includes('濕熱')) {
    return '濕熱內蘊傾向：濕與熱結，困阻中焦。常見於嗜食肥甘厚味、菸酒過度者。'
  }
  if (constitution.includes('氣虛')) {
    return '氣虛傾向：元氣不足，臟腑功能減退。常見於勞倦過度、久病體弱者。'
  }
  if (constitution.includes('陰虛')) {
    return '陰虛傾向：陰液虧損，虛熱內生。常見於熬夜、勞神過度者。'
  }
  return '體質傾向不明確，需結合更多四診信息綜合判斷。'
})

const dailyAdvice = computed(() => {
  const constitution = analysisResult.value?.constitution || ''
  const suggestions = analysisResult.value?.suggestions || ''
  if (suggestions) return formatText(suggestions)
  if (constitution.includes('脾虛')) {
    return '飲食：宜食山藥、薏米、白扁豆、茯苓等健脾祛濕之品；忌生冷油膩。\n作息：規律作息，避免熬夜，適度運動如散步、八段錦。'
  }
  if (constitution.includes('濕熱')) {
    return '飲食：宜食綠豆、赤小豆、冬瓜、苦瓜等清熱利濕之品；忌辛辣油膩、菸酒。\n作息：保持環境通風乾燥，避免暑濕侵襲。'
  }
  if (constitution.includes('氣虛')) {
    return '飲食：宜食黃耆、黨參、山藥、大棗等補氣之品；忌耗氣食物如蘿蔔、濃茶。\n作息：避免過勞，適度休息，可練習太極拳。'
  }
  return '飲食均衡，三餐定時；適度運動，保持心情舒暢；避免熬夜，保證充足睡眠。'
})

const jsonSummary = computed(() => {
  return {
    status: analysisResult.value ? '已分析' : '待分析',
    confidence: analysisResult.value?.confidence
      ? `${Math.round(analysisResult.value.confidence * 100)}%`
      : '待評估',
    inferred_tongue_coating: tongueCoatingStatus.value,
    inferred_tongue_body: tongueBodyStatus.value,
    possible_tendency: formatConstitution(analysisResult.value?.constitution || '待確認'),
    recommendation: '請結合四診合參，必要時至中醫院面診',
  }
})

function confirmConsent() {
  if (consentedLocal.value) {
    consented.value = true
    localStorage.setItem('tongueConsented', 'true')
  }
}

async function handleMainAction() {
  if (isCameraOpen.value) takePhoto()
  else openCamera()
}

function handleSecondaryAction() {
  if (isCameraOpen.value) stopCamera()
  else triggerFileInput()
}

async function openCamera() {
  if (!consented.value) return
  try {
    isCameraOpen.value = true
    imagePreview.value = null
    analysisResult.value = null
    showDetailedReport.value = false
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
    if (videoRef.value) videoRef.value.srcObject = stream.value
  } catch (err) {
    alert('无法访问相机，请检查浏览器授权。')
    isCameraOpen.value = false
  }
}

function takePhoto() {
  if (!videoRef.value || !canvasRef.value) return
  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    imagePreview.value = canvas.toDataURL('image/jpeg', 0.9)
    stopCamera()
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
  }
  isCameraOpen.value = false
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
    analysisResult.value = null
    showDetailedReport.value = false
  }
  reader.readAsDataURL(file)
}

async function analyzeImage() {
  console.log('===== analyzeImage 开始执行 =====', new Date().toISOString())
  console.log('imagePreview 存在?', !!imagePreview.value)
  console.log('userGoal:', userGoal.value)
  console.log('userSymptoms:', userSymptoms.value)

  if (!imagePreview.value) {
    console.warn('没有图片，跳过分析')
    return
  }

  analyzing.value = true

  try {
    console.log('调用 analyzeInBrowser...')
    const result = await analyzeInBrowser({
      tongue_image_dataurl: imagePreview.value,
      user_goal: userGoal.value,
      voice_text: userSymptoms.value,
      questionnaire: { age: userAge.value, gender: userGender.value, symptoms: userSymptoms.value },
    })

    console.log('analyzeInBrowser 返回结果:', result)
    analysisResult.value = result

    const newItem = {
      ...result,
      id: Date.now().toString(),
      timestamp: Date.now(),
      imagePreview: imagePreview.value,
    }
    historyList.value.unshift(newItem)
    localStorage.setItem('tongueHistoryList', JSON.stringify(historyList.value.slice(0, 10)))
    localStorage.setItem('tongueAnalysisResult', JSON.stringify(result))

    console.log('分析完成，结果已保存')
  } catch (e) {
    console.error('分析失败:', e)
    alert('辨證失敗，請重新提交。')
  } finally {
    analyzing.value = false
    console.log('===== analyzeImage 执行结束 =====')
  }
}

const recommendedMusicType = computed(() => {
  // const c = analysisResult.value?.constitution || ''
  // if (c.includes('肝')) return '角調 · 疏肝'
  // if (c.includes('心')) return '徵調 · 養心'
  // if (c.includes('脾')) return '宮調 · 健脾'
  // if (c.includes('肺')) return '商調 · 潤肺'
  // if (c.includes('腎')) return '羽調 · 補腎'
  return '肝'
})

// function goToMusicHealing() { router.push('/FiveHealing') }
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
function loadHistoryResult(item: HistoryItem) {
  analysisResult.value = item
  imagePreview.value = item.imagePreview || null
  showDetailedReport.value = false
  localStorage.setItem('tongueAnalysisResult', JSON.stringify(item))
}
function clearHistory() {
  if (confirm('清空歷史？')) {
    historyList.value = []
    localStorage.removeItem('tongueHistoryList')
  }
}

onMounted(() => {
  const hasConsented = localStorage.getItem('tongueConsented')
  if (hasConsented === 'true') {
    consented.value = true
    consentedLocal.value = true
  } else {
    consented.value = false
    consentedLocal.value = false
  }
  const h = localStorage.getItem('tongueHistoryList')
  if (h) historyList.value = JSON.parse(h)
  const r = localStorage.getItem('tongueAnalysisResult')
  if (r) analysisResult.value = JSON.parse(r)

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})

onBeforeUnmount(() => stopCamera())
</script>

<style scoped>
/* 基礎樣式 */
.tongue-diagnosis-page {
  width: 100%;
  min-height: 100vh;
  color: #4a342e;
  font-family: 'NO3', 'Noto Serif SC', serif;
  background-color: transparent;
}

.tongue-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px;
  position: relative;
  z-index: 10;
}

/* 在 style 中添加 */
.analysis-paragraph {
  margin-bottom: 20px;
}

.analysis-paragraph:last-child {
  margin-bottom: 0;
}

.analysis-paragraph p {
  margin: 0;
  line-height: 1.8;
}

/* 標題區域 */
.hero-section {
  text-align: center;
  margin-bottom: 60px;
}
.zen-title-huge {
  font-size: 72px;
  letter-spacing: 12px;
  margin-bottom: 15px;
  font-weight: 200;
}
.title-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}
.ink-line {
  width: 60px;
  height: 2px;
  background: #a67c52;
}
.zen-subtitle-huge {
  font-size: 28px;
  color: #8d6e63;
  letter-spacing: 6px;
}

.intro-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;
}
.intro-item {
  padding: 30px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 4px;
}
.intro-icon {
  font-size: 36px;
  color: #b71c1c;
  margin-bottom: 15px;
}
.intro-item p {
  font-size: 24px;
  color: #6d4c41;
  line-height: 1.6;
}

/* 基礎信息 */
.info-card-zen {
  margin-bottom: 50px;
}
.zen-card-inner {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  padding: 40px;
  border: 1px solid #e8d9cc;
}
.zen-form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 25px;
}
.zen-label-large {
  font-size: 20px;
  font-weight: bold;
  color: #5d4037;
  margin-bottom: 10px;
  display: block;
}
.zen-input-huge {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid #5d4037;
  font-size: 20px;
  font-family: 'NO3', 'Noto Serif SC', serif;
  padding: 10px 0;
  outline: none;
  color: #4a342e;
}
textarea.zen-input-huge {
  border: 2px solid #5d4037;
  padding: 12px;
  resize: vertical;
  border-radius: 4px;
}

/* 採集區域 */
.diagnosis-layout {
  display: flex;
  flex-direction: column;
  gap: 50px;
}
.collection-area {
  width: 100%;
}
.ink-frame {
  width: 100%;
  aspect-ratio: 1.2;
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid #d6c2b2;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}
.camera-container,
.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.video-preview,
.captured-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.camera-overlay-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}
.tongue-guide-oval {
  width: 180px;
  height: 260px;
  border: 3px dashed #b71c1c;
  border-radius: 50%;
  box-shadow: 0 0 0 1000px rgba(255, 252, 240, 0.3);
}
.guide-text-huge {
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  margin-top: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
.cinnabar-seal {
  position: absolute;
  top: 30px;
  right: 30px;
  transform: rotate(15deg);
}
.seal-border {
  width: 70px;
  height: 70px;
  border: 4px solid #b71c1c;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
}
.seal-border::after {
  content: '';
  position: absolute;
  inset: 2px;
  border: 1px solid #b71c1c;
}
.seal-inner-text {
  font-size: 44px;
  color: #b71c1c;
  font-weight: 900;
  font-family: 'STKaiti', serif;
}
.empty-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(250, 245, 235, 0.6);
}
.ph-icon-box {
  font-size: 50px;
  color: #a67c52;
  margin-bottom: 15px;
}
.action-bar-zen {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  justify-content: center;
}
.zen-btn-action {
  flex: 0 1 200px;
  padding: 16px;
  font-weight: 200;
  font-size: 18px;
  font-family: 'NO3', 'Noto Serif SC', serif;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 40px;
  transition: all 0.2s;
}
.zen-btn-action.main {
  background: #5d4037;
  color: white;
}
.zen-btn-action.main:hover {
  background: #7a5548;
  transform: translateY(-2px);
}
.zen-btn-action.sub {
  background: transparent;
  border: 2px solid #5d4037;
  color: #5d4037;
}
.zen-btn-action.sub:hover {
  background: rgba(93, 64, 55, 0.1);
  transform: translateY(-2px);
}

/* 報告區域 */
.report-area {
  width: 100%;
}
.ancient-scroll {
  background: #fdfaf5;
  border: 1px solid #d6c2b2;
  padding: 40px;
  position: relative;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.05);
  width: 100%;
  border-radius: 4px;
}
.scroll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #5d4037;
  padding-bottom: 15px;
  margin-bottom: 30px;
}
.scroll-stamp {
  border: 2px solid #b71c1c;
  color: #b71c1c;
  padding: 3px 10px;
  font-weight: bold;
  font-size: 18px;
  border-radius: 2px;
}
.confidence-box {
  background: #e8ddd0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  color: #5d4037;
}
.constitution-huge {
  font-size: 48px;
  text-align: center;
  color: #b71c1c;
  margin: 30px 0;
  font-weight: 500;
  letter-spacing: 4px;
  word-break: break-word;
}
.item-title-large {
  font-size: 30px;
  color: #8d6e63;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.item-p-large {
  font-size: 24px;
  line-height: 1.8;
  color: #4e342e;
  margin-bottom: 25px;
  word-break: break-word;
  white-space: normal;
}
.music-banner-zen {
  background: #5d4037;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 12px;
}
.m-name-huge {
  font-size: 20px;
  font-weight: bold;
  display: block;
}
.m-btn-large {
  background: white;
  border: none;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 30px;
  transition: all 0.2s;
}
.m-btn-large:hover {
  transform: scale(1.02);
}
.btn-view-detailed {
  margin-top: 24px;
  width: 100%;
  padding: 14px;
  background: #e8ddd0;
  border: 1px solid #c9b696;
  color: #5d4037;
  font-size: 16px;
  font-family: 'NO3', 'Noto Serif SC', serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 40px;
  transition: all 0.2s;
}
.btn-view-detailed:hover {
  background: #dac8b4;
  transform: translateY(-2px);
}
.report-empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #a0815c;
}
.report-loading {
  text-align: center;
  padding: 60px 20px;
}

/* 詳細報告彈窗 */
.detailed-report-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow-y: auto;
}
.detailed-report-container {
  position: relative;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: #fef9f0;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
.detailed-report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: #e8ddd0;
  border-bottom: 1px solid #d4c5a9;
  position: sticky;
  top: 0;
  z-index: 10;
}
.detailed-report-header h3 {
  margin: 0;
  font-size: 22px;
  color: #5d4037;
  display: flex;
  align-items: center;
  gap: 10px;
}
.close-detailed-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #5d4037;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}
.close-detailed-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: rotate(90deg);
}
.detailed-analysis-content {
  padding: 30px;
}
.disclaimer-banner {
  background: #fff6e8;
  border-left: 6px solid #c97e2c;
  padding: 16px 20px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 0 8px 8px 0;
  font-size: 14px;
  color: #7a5a3a;
  line-height: 1.5;
}
.report-section {
  margin-bottom: 36px;
}
.section-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #dac8ae;
  flex-wrap: wrap;
}
.title-number {
  font-size: 28px;
  font-weight: 700;
  color: #b87c4f;
  font-family: 'Georgia', serif;
}
.title-text {
  font-size: 20px;
  font-weight: 600;
  color: #4a3424;
  letter-spacing: 2px;
}
.title-status {
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 20px;
}
.title-status.warning {
  background: #fff0e0;
  color: #c97e2c;
}
.title-status.ok {
  background: #e0f0e0;
  color: #5a8a5a;
}
.section-content {
  padding-left: 20px;
  color: #4a3a2a;
  font-size: 15px;
  line-height: 1.7;
}
.feature-list {
  list-style: none;
  padding-left: 20px;
  margin: 12px 0;
}
.feature-list li {
  margin-bottom: 8px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.list-marker {
  color: #b87c4f;
  font-weight: 600;
}
.observation-box {
  background: #faf5ea;
  padding: 18px 22px;
  border-radius: 12px;
  margin-top: 12px;
  border: 1px solid #e8ddce;
}
.observation-label {
  font-weight: 600;
  color: #8b5a2b;
  margin-bottom: 12px;
}
.observation-list {
  list-style: none;
  padding-left: 0;
  margin-bottom: 12px;
}
.observation-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
}
.observation-list i {
  color: #7d9d6e;
}
.inference-card {
  display: flex;
  gap: 16px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e6d9c8;
}
.inference-icon {
  font-size: 28px;
  color: #b87c4f;
  min-width: 48px;
  text-align: center;
}
.inference-text strong {
  display: block;
  font-size: 16px;
  color: #8b5a2b;
  margin-bottom: 8px;
}
.warning-box {
  background: #fef4e8;
  border: 1px solid #e6cfb0;
  border-radius: 12px;
  padding: 18px 22px;
  display: flex;
  gap: 16px;
  margin-top: 20px;
}
.warning-box i {
  font-size: 26px;
  color: #dc843a;
}
.daily-advice {
  background: #f0f0ea;
  padding: 20px;
  border-radius: 12px;
  line-height: 1.8;
  white-space: pre-line;
}
.notice-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 12px;
}
.notice-item {
  display: flex;
  gap: 14px;
  background: rgba(255, 255, 255, 0.6);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e8ddce;
}
.notice-icon {
  font-size: 26px;
  color: #9c7a54;
  min-width: 44px;
}
.notice-text strong {
  display: block;
  font-size: 15px;
  color: #8b5a2b;
  margin-bottom: 6px;
}
.notice-text p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #5c4a34;
}
.report-footer {
  margin-top: 32px;
}
.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #d4c5a9, #d4c5a9, transparent);
  margin-bottom: 20px;
}
.footer-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: #f3ede3;
  padding: 18px 22px;
  border-radius: 12px;
  flex-wrap: wrap;
}
.footer-icon {
  font-size: 28px;
  color: #a0815c;
}
.footer-label {
  font-size: 13px;
  font-weight: 600;
  color: #8b5a2b;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.json-preview {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #2d2a24;
  color: #f0e6c5;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 提交按鈕 */
.submit-section-zen {
  text-align: center;
  margin: 60px 0;
}
.zen-btn-submit-huge {
  background: #b71c1c;
  color: white;
  border: none;
  padding: 18px 80px;
  font-size: 26px;
  font-family: 'NO3', 'Noto Serif SC', serif;
  letter-spacing: 6px;
  cursor: pointer;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(183, 28, 28, 0.3);
  transition: 0.3s;
}
.zen-btn-submit-huge:disabled {
  background: #ccc;
  box-shadow: none;
  opacity: 0.6;
  cursor: not-allowed;
}
.zen-btn-submit-huge:hover:not(:disabled) {
  background: #8b1a1a;
  transform: translateY(-2px);
}

/* 歷史記錄 */
.history-section-zen {
  margin-top: 60px;
  border-top: 1px solid #e8d9cc;
  padding-top: 30px;
}
.history-header-huge {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}
.history-scroll-row {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}
.history-card-zen {
  background: white;
  padding: 15px 25px;
  border: 1px solid #e8d9cc;
  min-width: 160px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}
.history-card-zen:hover {
  border-color: #b87c4f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
.h-name-huge {
  font-size: 18px;
  font-weight: bold;
  display: block;
  margin-top: 5px;
  color: #5d4037;
  word-break: break-word;
}
.btn-clear-text {
  background: none;
  border: none;
  color: #a0815c;
  cursor: pointer;
  font-size: 14px;
}
.btn-clear-text:hover {
  text-decoration: underline;
}

/* 隱私彈窗 */
.privacy-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.zen-modal {
  width: 90%;
  max-width: 500px;
  background: #fffcf7;
  padding: 40px;
  position: relative;
  border: 1px solid #a67c52;
  border-radius: 8px;
}
.huge-text-red {
  font-size: 32px;
  color: #b71c1c;
  margin-bottom: 20px;
  text-align: center;
}
.zen-p-large {
  font-size: 16px;
  line-height: 1.8;
  color: #5d4037;
  margin-bottom: 30px;
}
.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.zen-checkbox-huge {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  cursor: pointer;
}
.zen-checkbox-huge input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.zen-btn-enter {
  width: 100%;
  background: #5d4037;
  color: white;
  padding: 16px;
  border: none;
  font-size: 20px;
  font-family: 'NO3', 'Noto Serif SC', serif;
  cursor: pointer;
  border-radius: 40px;
}
.zen-btn-enter:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Loading 動畫 */
.ink-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #b71c1c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
.huge-text {
  font-size: 22px;
  font-weight: bold;
}
.large-text {
  font-size: 30px;
  font-weight: bold;
}
.sub-text-large {
  font-size: 14px;
  color: #8d6e63;
}

/* 響應式 */
@media (max-width: 768px) {
  .tongue-container {
    padding: 80px 16px;
  }
  .diagnosis-layout {
    gap: 30px;
  }
  .zen-form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .zen-title-huge {
    font-size: 42px;
    letter-spacing: 6px;
  }
  .zen-subtitle-huge {
    font-size: 20px;
  }
  .intro-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .intro-item {
    padding: 20px;
  }
  .ink-frame {
    max-width: 100%;
  }
  .zen-btn-action {
    flex: 1;
    font-size: 16px;
    padding: 12px;
  }
  .zen-btn-submit-huge {
    padding: 14px 40px;
    font-size: 20px;
    letter-spacing: 4px;
  }
  .constitution-huge {
    font-size: 32px;
  }
  .ancient-scroll {
    padding: 24px;
  }
  .detailed-report-container {
    max-height: 85vh;
  }
  .detailed-analysis-content {
    padding: 20px;
  }
  .notice-grid {
    grid-template-columns: 1fr;
  }
  .section-title {
    flex-wrap: wrap;
  }
  .title-status {
    margin-left: 0;
    margin-top: 6px;
  }
  .inference-card {
    flex-direction: column;
  }
  .warning-box {
    flex-direction: column;
  }
}
</style>
