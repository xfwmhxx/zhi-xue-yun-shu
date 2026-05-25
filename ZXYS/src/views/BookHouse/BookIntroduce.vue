<template>
  <BreadcrumbNav
    title="书籍详情"
    :show-back="true"
    :breadcrumb-items="[
      { name: from === 'bookshelf' ? '我的书架' : '经典书城', url: returnPath },
      { name: '书籍详情', url: '' },
    ]"
  ></BreadcrumbNav>
  <main class="main-content">
    <!-- 1. 状态反馈 -->
    <div v-if="loading" class="state-container">
      <div class="ink-loading"></div>
      <p>正在开启尘封的医典...</p>
    </div>

    <div v-else-if="error" class="state-container">
      <div class="seal-error">勘误</div>
      <p>{{ error }}</p>
      <button @click="fetchBookDetail" class="retry-btn">重新读取</button>
    </div>

    <!-- 2. 主体详情 -->
    <div v-else-if="book" class="detail-wrapper fade-in">
      <!-- 第一部分：书籍 Hero 区域 -->
      <section class="book-hero">
        <div class="hero-left">
          <div class="cover-wrapper">
            <div class="book-decoration"></div>
            <img
              :src="book.cover_url"
              :alt="book.name"
              class="book-cover"
              @error="handleImageError"
            />
            <div class="seal-mark">正本精选</div>
          </div>
        </div>

        <div class="hero-right">
          <div class="title-section">
            <h1 class="book-title">{{ book.name }}</h1>
            <div class="author-row">
              <span class="author-name">{{ book.author }} 撰</span>
            </div>
          </div>

          <!-- 专业学术元数据 -->
          <div class="academic-info-grid">
            <div class="info-item">
              <span class="info-label">{{ book.metadata?.[0]?.label }}</span>
              <p class="info-value">{{ book.metadata?.[0]?.value || '中医四大经典 / 必读经论' }}</p>
            </div>
            <div class="info-item">
              <span class="info-label">{{ book.metadata?.[1]?.label }}</span>
              <p class="info-value">
                {{ book.metadata?.[1]?.value || '伤寒学派、易水学派、温病学派' }}
              </p>
            </div>
          </div>

          <!-- 操作按钮区 -->
          <div class="action-row">
            <button
              :class="['action-btn', 'shelf-btn', { 'is-active': isFavorited }]"
              @click="handleShelfAction"
            >
              <!-- 收藏了用 fas (实心)，没收藏用 far (空心) -->
              <i :class="[isFavorited ? 'fas' : 'far', 'fa-bookmark']"></i>
              {{ isFavorited ? '移出书篋' : '收藏入篋' }}
            </button>
            <button class="action-btn read-btn" @click="readNow">
              <i class="fas fa-book-open"></i> 研读原文
            </button>
          </div>
        </div>
      </section>

      <!-- 第二部分：深度功能切换区 -->
      <section class="function-tabs-container">
        <div class="tab-headers">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- 沉浸式功能面板 -->
        <div class="tab-content-wrapper">
          <!-- 1. 典籍提要 -->
          <div v-if="activeTab === 'intro'" class="content-pane fade-in">
            <h3 class="pane-title">【提要解说】</h3>
            <div class="intro-layout">
              <div class="intro-text-box">
                <p class="para">{{ book.introduce }}</p>
              </div>
              <div class="stat-side-bar">
                <div class="mini-card">
                  <span class="val">{{ book.volume || '12卷' }}</span>
                  <span class="lab">典籍卷目</span>
                </div>
                <div class="mini-card">
                  <span class="val">{{ book.tag_count || '120' }}</span>
                  <span class="lab">核心考点</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. AI 智慧顾问（沉浸式对话空间） -->
          <div v-if="activeTab === 'ai-logic'" class="ai-immersive-chat fade-in">
            <!-- AI 顾问声明栏 -->
            <div class="ai-consultant-header">
              <div class="expert-identity">
                <div class="expert-icon"><i class="fas fa- university"></i></div>
                <div class="expert-text">
                  <h4>典籍数字化顾问：{{ book.name }}专研版</h4>
                  <p>
                    <i class="fas fa-check-circle"></i>
                    我已深度阅读并索引全书内容，支持精确引证、疑难释义及方剂位置查询
                  </p>
                </div>
              </div>
              <div class="expert-status">
                <span class="pulse-dot"></span> 智学云枢书籍知识库已就绪
              </div>
            </div>

            <!-- 消息展示区 -->
            <div class="ai-message-list" ref="chatWindowRef">
              <div
                v-for="(msg, index) in chatMessages"
                :key="index"
                :class="['msg-item', msg.role]"
              >
                <div class="msg-avatar">{{ msg.role === 'ai' ? '助' : '客' }}</div>
                <div class="msg-bubble-wrap">
                  <div class="msg-bubble">{{ msg.content }}</div>
                  <div v-if="msg.source" class="msg-source-link">
                    <i class="fas fa-scroll"></i> 出处指引：{{ msg.source }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部输入区 -->
            <div class="ai-input-wrapper">
              <div class="input-inner">
                <input
                  type="text"
                  v-model="userInput"
                  placeholder="询问具体知识点，例如：'书中提到的“命门”理论在第几章？'..."
                  @keyup.enter="handleSendMessage"
                />
                <button class="send-trigger" @click="handleSendMessage">
                  <i class="fas fa-paper-plane"></i> 提问顾问
                </button>
              </div>
            </div>
          </div>

          <!-- 3. 知识图谱 -->
          <div v-show="activeTab === 'graph'" class="content-pane fade-in">
            <div class="graph-header">
              <h3 class="pane-title" style="margin-bottom: 0">【医学逻辑关联网络】</h3>
              <button class="graph-expand-btn" @click="openFullscreen">
                <i class="fas fa-expand-arrows-alt"></i> 全屏探索
              </button>
            </div>

            <div class="graph-box-normal">
              <div ref="chartRef" style="width: 100%; height: 100%"></div>

              <!-- 增加图例显示 -->
              <div class="graph-legend-overlay">
                <div class="legend-section">
                  <span><i class="dot s1"></i>证候</span>
                  <span><i class="dot s2"></i>方剂</span>
                  <span><i class="dot s3"></i>病机</span>
                </div>
              </div>
            </div>
            <p class="graph-hint">※ 点击节点可拖拽，双击可聚焦。连线颜色代表不同的逻辑关系类型。</p>
          </div>

          <!-- 4. 进阶评测 -->
          <div v-if="activeTab === 'exam'" class="content-pane fade-in">
            <div class="exam-hero-banner">
              <div class="hero-info">
                <h3>全书综合考评大卷</h3>
                <p>涵盖全书核心考点及临床模拟题，考试时长 90 分钟，闭卷模式。</p>
              </div>
              <button class="exam-start-btn" @click="startGlobalExam">开始挑战</button>
            </div>

            <div class="chapter-assessment">
              <h4 class="sub-pane-title">章节专项训练</h4>
              <div class="chapter-list">
                <div v-for="ch in chapters" :key="ch.idx" class="chapter-row">
                  <div class="ch-info">
                    <span class="ch-idx">卷 {{ ch.chapter_idx }}</span>
                    <span class="ch-name">{{ ch.chapter_name }}</span>
                  </div>
                  <div class="ch-actions">
                    <!-- 点击事件传入 ch.idx -->
                    <button class="ch-btn practice" @click="enterExam(ch.chapter_idx, '练习')">
                      <i class="fas fa-edit"></i> 刷题练习
                    </button>
                    <button class="ch-btn test" @click="enterExam(ch.chapter_idx, '自测')">
                      <i class="fas fa-stopwatch"></i> 封闭自测
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 全屏覆盖层：独立于主体容器，确保覆盖全网页 -->
    <div v-if="isFull" class="graph-full-overlay">
      <div class="full-header">
        <span class="full-title">《{{ book?.name }}》全景知识拓扑图</span>
        <button class="close-full-btn" @click="closeFullscreen">
          <i class="fas fa-compress-arrows-alt"></i> 退出全屏
        </button>
      </div>
      <div ref="fullChartRef" class="full-canvas"></div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  getBookDetail,
  getBookChapters,
  getUserBookshelf,
  addToBookshelf,
  removeFromBookshelf,
} from '@/api/book'
import { getKnowledgeGraph, getRelationsByPoint } from '@/api/knowledge'
import { getUserId } from '@/utils/storage'

import { message } from '@/components/Notification'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

// 来源信息
const from = ref('bookhouse')
const returnPath = ref('/Foundations/BookHouse')

// 读取用户信息
const getUserFromStorage = (): any => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return { username: '未登录用户', email: '' }
    return JSON.parse(userStr)
  } catch (error) {
    console.error('读取用户信息失败:', error)
    return { username: '访客', email: '' }
  }
}
const userId = ref<number | null>(null)
const chapters = ref<any[]>([]) // 章节列表
const graphNodes = ref<any[]>([]) // 图谱节点
const graphLinks = ref<any[]>([]) // 图谱连线

// 1. 动态元数据接口 (对应 Hero 区域的两个框)
interface MetadataItem {
  label: string
  value: string
}
// 2. AI 顾问配置接口
interface AIConfig {
  role: string
  context: string
  welcome: string
}

// 3. 知识图谱：节点接口
interface GraphNode {
  id: string // 唯一 ID，用于掌握度映射
  name: string // 显示的名称
  type: string // 类型，如 formula, syndrome, reaction
  desc?: string // 鼠标悬停详情
}

// 4. 知识图谱：关系接口
interface GraphLink {
  source: string // 起始节点 ID
  target: string // 目标节点 ID
  relation: string // 关系描述，如 "主治", "属于"
  type: string
}

// 5. 知识图谱包装接口
interface KnowledgeGraph {
  nodes: GraphNode[]
  links: GraphLink[]
}

// 6. 章节接口
interface Chapter {
  idx: string
  name: string
  qCount?: number // 题目数量
}

// 7. 核心书籍接口（总入口）
interface Book {
  id: number
  name: string
  author: string
  type: string
  introduce: string
  volume: string
  tag_count: number
  metadata: Array<{ label: string; value: string }>
  cover_url: string
  doc_path: string
  knowledge_points?: Array<{
    id: number
    name: string
    type: number
    description: string
  }>
}

const route = useRoute()
const router = useRouter()
const bookId = ref(route.params.id as string)
const book = ref<Book | null>(null)
const loading = ref(true)
const error = ref<string>('')
const activeTab = ref('intro')
const isFavorited = ref(false) // 记录当前书籍是否已收藏
// 书籍封面
const BookBaseUrl = import.meta.env.VITE_RESOURCES_URL

// 知识图谱相关
const chartRef = ref<HTMLElement | null>(null)
const fullChartRef = ref<HTMLElement | null>(null)
const isFull = ref(false)
let myChart: echarts.ECharts | null = null
let fullChart: echarts.ECharts | null = null

// AI 对话逻辑
const userInput = ref('')
const chatWindowRef = ref<HTMLElement | null>(null)
const chatMessages = ref([
  {
    role: 'ai',
    content:
      '尊驾好！我是本典籍的数字化顾问。关于书中的辨证思路、方剂原文或知识点分布的页码，您可以随时询问。',
    source: '',
  },
])

const tabs = [
  { id: 'intro', name: '典籍提要' },
  { id: 'ai-logic', name: 'AI 智慧顾问' },
  { id: 'graph', name: '知识图谱' },
  { id: 'exam', name: '进阶评测' },
]

const checkFavoriteStatus = async () => {
  const uid = getUserId()
  if (!uid) return
  userId.value = parseInt(uid)

  try {
    const res = await getUserBookshelf(parseInt(uid))
    if (res.code === 200) {
      isFavorited.value = res.data.some((item) => item.book_id === parseInt(bookId.value))
    }
  } catch (err) {
    console.error('检查收藏状态失败', err)
  }
}

const fetchBookDetail = async () => {
  loading.value = true
  try {
    // 获取书籍详情
    const res = await getBookDetail(parseInt(bookId.value))
    if (res.code === 200) {
      book.value = res.data
      book.value.cover_url = `${BookBaseUrl}` + book.value.cover_url
      console.log('boo is', book.value.cover_url)
      // 获取章节列表
      const chaptersRes = await getBookChapters(parseInt(bookId.value))
      if (chaptersRes.code === 200) {
        chapters.value = chaptersRes.data
      }

      // 构建知识图谱（基于书籍关联的知识点和全局关系）
      await buildKnowledgeGraph()
    } else {
      error.value = '该典籍暂未被收录'
    }
  } catch (err: any) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
  await checkFavoriteStatus()
}

// 构建知识图谱的函数
const buildKnowledgeGraph = async () => {
  if (!book.value?.knowledge_points || book.value.knowledge_points.length === 0) {
    graphNodes.value = []
    graphLinks.value = []
    return
  }

  // 构建节点（从书籍关联的知识点）
  const nodes = book.value.knowledge_points.map((kp) => ({
    id: String(kp.id),
    name: kp.name,
    type: String(kp.type),
    desc: kp.description,
  }))

  // 获取这些知识点之间的关系
  const allLinks: any[] = []
  for (const kp of book.value.knowledge_points) {
    try {
      const res = await getRelationsByPoint(kp.id)
      if (res.code === 200 && res.data) {
        // 只保留两个端点都在当前书籍知识点范围内的关系
        const validLinks = res.data.filter((link) => {
          const sourceIn = nodes.some((n) => n.id === String(link.source_id))
          const targetIn = nodes.some((n) => n.id === String(link.target_id))
          return sourceIn && targetIn
        })

        validLinks.forEach((link) => {
          allLinks.push({
            source: String(link.source_id),
            target: String(link.target_id),
            relation: link.relation,
            type: getRelationType(link.relation),
          })
        })
      }
    } catch (e) {
      console.error('获取知识点关系失败', e)
    }
  }

  // 去重
  const uniqueLinks = allLinks.filter(
    (link, index, self) =>
      index === self.findIndex((l) => l.source === link.source && l.target === link.target),
  )

  graphNodes.value = nodes
  graphLinks.value = uniqueLinks

  // 如果有图谱组件，重新渲染
  if (activeTab.value === 'graph') {
    initNormalGraph()
  }
}

// 关系类型映射
const getRelationType = (relation: string): string => {
  const typeMap: Record<string, string> = {
    主治: '3',
    组成成分: '3',
    核心病机: '2',
    包含证型: '1',
    代表方剂: '3',
    传变: '4',
    所属病证: '1',
    功效: '1',
    出自著作: '4',
  }
  return typeMap[relation] || '4'
}

// ECharts 配置抽取
// --- ECharts 配置抽取：确保连线和节点有颜色 ---
const getOption = (isLarge: boolean) => {
  if (graphNodes.value.length === 0) return {}

  const nodeColors: any = {
    '1': '#b71c1c', // 理论
    '2': '#8b5e3c', // 方剂
    '3': '#3e2723', // 穴位/中药
    '4': '#6d4c41', // 病机
  }

  const getLinkStyle = (linkType: string) => {
    const linkMap: any = {
      '1': { color: '#546e7a', width: 2, type: 'dashed' },
      '2': { color: '#c62828', width: 3, type: 'solid' },
      '3': { color: '#2e7d32', width: 3, type: 'solid' },
      '4': { color: '#ef6c00', width: 2, type: 'solid' },
    }
    return linkMap[linkType] || { color: '#999', width: 1, type: 'solid' }
  }

  return {
    tooltip: { trigger: 'item', formatter: (params: any) => params.data.desc || params.name },
    series: [
      {
        type: 'graph',
        layout: 'force',
        symbolSize: isLarge ? 100 : 75,
        draggable: true,
        roam: true,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [4, 8],
        force: { repulsion: isLarge ? 2500 : 1000, edgeLength: isLarge ? 200 : 150, gravity: 0.1 },
        label: {
          show: true,
          position: 'inside',
          fontSize: isLarge ? 40 : 20,
          color: '#fff',
          fontFamily: 'NO3',
          textBorderColor: '#3e2723',
          textBorderWidth: 1,
        },
        data: graphNodes.value.map((n: any) => ({
          id: n.id,
          name: n.name,
          desc: n.desc,
          itemStyle: {
            color: nodeColors[n.type] || '#777',
            borderColor: 'rgba(255,255,255,0.3)',
            borderWidth: 1,
          },
        })),
        links: graphLinks.value.map((l: any) => {
          const style = getLinkStyle(l.type)
          return {
            source: l.source,
            target: l.target,
            relation: l.relation,
            lineStyle: { color: style.color, width: style.width, type: style.type, opacity: 0.8 },
          }
        }),
        edgeLabel: {
          show: true,
          formatter: (params: any) => params.data.relation,
          fontSize: isLarge ? 30 : 15,
          color: '#444',
          backgroundColor: 'rgba(255,255,255,0.7)',
          padding: [2, 4],
        },
        emphasis: { focus: 'adjacency', lineStyle: { width: 6 } },
      },
    ],
  }
}

const initNormalGraph = () => {
  nextTick(() => {
    if (!chartRef.value || !book.value) return
    if (myChart) myChart.dispose()
    myChart = echarts.init(chartRef.value)
    myChart.setOption(getOption(false))
  })
}

const openFullscreen = () => {
  isFull.value = true
  document.body.style.overflow = 'hidden' // 锁定网页滚动
  nextTick(() => {
    if (!fullChartRef.value) return
    if (fullChart) fullChart.dispose() // 关键：销毁旧实例解决不显示Bug
    fullChart = echarts.init(fullChartRef.value)
    fullChart.setOption(getOption(true))
  })
}

const closeFullscreen = () => {
  if (fullChart) fullChart.dispose()
  isFull.value = false
  document.body.style.overflow = 'auto'
  initNormalGraph() // 重新回填小窗口图表
}

// 监听标签切换，如果是图谱则初始化
watch(activeTab, (val) => {
  if (val === 'graph') initNormalGraph()
})

const handleSendMessage = () => {
  if (!userInput.value.trim()) return

  const question = userInput.value
  chatMessages.value.push({ role: 'user', content: question, source: '' })
  userInput.value = ''

  scrollToBottom()

  // 模拟深度检索过程
  setTimeout(() => {
    chatMessages.value.push({
      role: 'ai',
      content: `基于对《${book.value?.name}》的检索，“${question}”相关的核心论述位于“卷二·脏腑辨证篇”。原书第 58 页明确提到该理论的演变，并给出了相应的治疗方略。`,
      source: `《${book.value?.name}》· 中卷 · 第四节 P58`,
    })
    scrollToBottom()
  }, 1000)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatWindowRef.value) {
      chatWindowRef.value.scrollTop = chatWindowRef.value.scrollHeight
    }
  })
}

const startGlobalExam = () => alert('正在准备综合卷...')
const enterExam = (ch: any, type: string) => {
  console.log(`进入章节 ${ch} 的 ${type} 模式，章节ID：${ch}`)
  router.push({
    path: `/Hina/BookProblemList/${book.value?.id}/${ch}`,
    state: {
      from: from.value, // 固定值
      returnPath: returnPath.value, // 固定值
    },
  })
}
const handleImageError = () => {
  if (book.value) book.value.cover_url = '/ZYDJ/DefaultCover.jpg'
}
const handleShelfAction = async () => {
  if (!userId.value) {
    message.error('错误', {
      note: '请先登录！',
      duration: 3000,
    })
    return
  }

  try {
    if (isFavorited.value) {
      // 移除书架
      const res = await removeFromBookshelf({
        user_id: userId.value,
        book_id: parseInt(bookId.value),
      })
      if (res.code === 200) {
        isFavorited.value = false
        message.success('成功', {
          note: '已从书架移除',
          duration: 2000,
        })
      }
    } else {
      const res = await addToBookshelf({ user_id: userId.value, book_id: parseInt(bookId.value) })
      if (res.code === 200) {
        isFavorited.value = true
        message.success('成功', {
          note: '已加入书架',
          duration: 2000,
        })
      }
    }
  } catch (err) {
    alert('操作失败，请重试')
  }
}
const readNow = () => {
  // 构造后端 PDF 静态资源 URL
  const pdfUrl = `${import.meta.env.VITE_RESOURCES_URL}/uploads/books/${book.value?.id}.pdf`
  router.push({
    path: `/Hina/BookPDFReader/${book.value?.id}`,
    query: {
      url: encodeURIComponent(pdfUrl),
    },
  })
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      bookId.value = newId as string
      fetchBookDetail()
    }
  },
)

onMounted(() => {
  // 从路由状态获取来源
  if (router.options.history.state) {
    from.value = (router.options.history.state.from as string) || 'bookhouse'
    returnPath.value =
      (router.options.history.state.returnPath as string) || '/Foundations/BookHouse'
  }

  console.log('来源:', from.value)
  console.log('返回路径:', returnPath.value)

  window.scrollTo({ top: 0, behavior: 'smooth' })
  fetchBookDetail()
  window.addEventListener('resize', () => {
    myChart?.resize()
    fullChart?.resize()
  })
})
</script>

<style scoped>
/* === 基础布局 === */
.main-content {
  width: 100%;
  min-height: 100vh;
  padding-top: 40px;
  padding-bottom: 80px;
  font-family: 'NO3', serif;
  color: #3e2723;
}

/* 状态容器 */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}
.ink-loading {
  width: 45px;
  height: 45px;
  border: 3px solid rgba(139, 94, 60, 0.1);
  border-top-color: #b71c1c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* === Hero 区域 === */
.detail-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}
.book-hero {
  display: flex;
  background: rgba(253, 245, 230, 0.9);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(139, 94, 60, 0.2);
  padding: 60px 50px;
  gap: 70px;
  border-radius: 4px;
  margin-bottom: 50px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.06);
}

.hero-left {
  flex: 0 0 300px;
}
.cover-wrapper {
  position: relative;
  width: 300px;
  height: 420px;
  transform-style: preserve-3d;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  box-shadow: 20px 20px 40px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 2;
  transition: 0.6s;
}
.book-decoration {
  position: absolute;
  inset: -15px;
  border: 1.5px solid #8b5e3c;
  opacity: 0.3;
  z-index: 1;
  transition: 0.6s;
}
.seal-mark {
  position: absolute;
  top: 30px;
  right: -15px;
  background: #b71c1c;
  color: #fff;
  writing-mode: vertical-rl;
  padding: 12px 6px;
  font-size: 13px;
  letter-spacing: 4px;
  z-index: 3;
}

.cover-wrapper:hover {
  transform: scale(1.03) rotateY(-5deg);
}
.cover-wrapper:hover .book-decoration {
  inset: -25px;
  opacity: 0.8;
  border-color: #b71c1c;
}

.hero-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.book-title {
  font-size: 56px;
  color: #3e2723;
  margin-bottom: 12px;
  font-weight: 400;
  letter-spacing: 2px;
}
.author-row {
  font-size: 24px;
  color: #8b5e3c;
  margin-bottom: 35px;
}

.academic-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 45px;
}
.info-item {
  padding: 22px;
  background: rgba(139, 94, 60, 0.05);
  border-left: 4px solid #8b5e3c;
}
.info-label {
  display: block;
  font-size: 16px;
  color: #8d6e63;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.info-value {
  font-size: 20px;
  font-weight: 500;
  color: #3e2723;
  line-height: 1.6;
}

.action-row {
  display: flex;
  gap: 25px;
}
.action-btn {
  padding: 14px 45px;
  font-family: 'NO3';
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.shelf-btn {
  background: transparent;
  border: 1px solid #8b5e3c;
  color: #8b5e3c;
}
.shelf-btn:hover {
  background: #8b5e3c;
  color: #fff;
}
.read-btn {
  background: #3e2723;
  color: #fff;
  border: none;
  box-shadow: 0 5px 15px rgba(62, 39, 35, 0.2);
}
.read-btn:hover {
  background: #b71c1c;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(183, 28, 28, 0.2);
}

/* === 功能切换区 === */
.function-tabs-container {
  background: rgba(253, 245, 230, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(139, 94, 60, 0.2);
  border-radius: 4px;
  overflow: hidden;
}
.tab-headers {
  display: flex;
  background: rgba(139, 94, 60, 0.05);
  border-bottom: 1px solid rgba(139, 94, 60, 0.1);
}
.tab-btn {
  padding: 22px 55px;
  font-family: 'NO3';
  font-size: 20px;
  color: #8d6e63;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: 0.3s;
}
.tab-btn.active {
  color: #3e2723;
  font-weight: bold;
  background: #fff;
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30%;
  right: 30%;
  height: 4px;
  background: #b71c1c;
}

.tab-content-wrapper {
  min-height: 550px;
  background: #fff;
  position: relative;
}
.content-pane {
  padding: 50px;
}

/* 1. 提要面板 */
.intro-layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 60px;
}
.pane-title {
  font-size: 24px;
  font-weight: 500;
  color: #b71c1c;
  margin-bottom: 25px;
  border-left: 4px solid #b71c1c;
  padding-left: 15px;
}
.intro-text-box {
  font-size: 24px;
  line-height: 2.2;
  text-align: justify;
  text-indent: 2em;
}
.stat-side-bar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.mini-card {
  padding: 30px;
  background: #fdfaf5;
  border: 1px solid #e0d8c3;
  text-align: center;
}
.mini-card .val {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #8b5e3c;
}
.mini-card .lab {
  font-size: 20px;
  color: #8d6e63;
}

/* === 2. 沉浸式 AI 对话室样式 === */
.ai-immersive-chat {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: #fdfcf9; /* 更接近书卷的底色 */
}

.ai-consultant-header {
  padding: 25px 40px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  z-index: 2;
}

.expert-identity {
  display: flex;
  align-items: center;
  gap: 20px;
}
.expert-icon {
  width: 50px;
  height: 50px;
  background: #3e2723;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.expert-text h4 {
  margin: 0;
  font-size: 24px;
  color: #3e2723;
  font-weight: 400;
}
.expert-text p {
  margin: 5px 0 0 0;
  font-size: 16px;
  color: #8d6e63;
}

.expert-status {
  font-size: 20px;
  color: #4caf50;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pulse-dot {
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.ai-message-list {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjBlY2UyIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvc3ZnPg==');
}

.msg-item {
  display: flex;
  gap: 15px;
  max-width: 80%;
}
.msg-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e0d8c3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}
.user .msg-avatar {
  background: #3e2723;
  color: #fff;
}

.msg-bubble-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.user .msg-bubble-wrap {
  align-items: flex-end;
}

.msg-bubble {
  background: #fff;
  padding: 14px 18px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  font-size: 24px;
  line-height: 1.6;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
}
.user .msg-bubble {
  background: #3e2723;
  color: #fff;
  border-color: #3e2723;
}

.msg-source-link {
  font-size: 20px;
  color: #b71c1c;
  font-style: italic;
  background: rgba(183, 28, 28, 0.05);
  padding: 4px 10px;
  border-left: 2px solid #b71c1c;
}

.ai-input-wrapper {
  padding: 30px 40px;
  background: #fff;
  border-top: 1px solid #eee;
}
.input-inner {
  display: flex;
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
.input-inner input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px 20px;
  outline: none;
  font-size: 15px;
  transition: 0.3s;
}
.input-inner input:focus {
  border-color: #b71c1c;
  box-shadow: 0 0 10px rgba(183, 28, 28, 0.05);
}

.send-trigger {
  background: #3e2723;
  color: #fff;
  border: none;
  padding: 0 30px;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.3s;
  font-family: 'NO3';
}
.send-trigger:hover {
  background: #b71c1c;
  transform: translateY(-2px);
}

/* 3. 知识图谱 */
.graph-placeholder-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 0;
}
.center-node {
  background: #b71c1c;
  color: #fff;
  padding: 18px 50px;
  border-radius: 4px;
  font-size: 22px;
}
.orbit-container {
  display: flex;
  gap: 50px;
  margin-top: 60px;
}
.orbit-node {
  border: 1px solid #8b5e3c;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 15px;
  background: #fff;
}

/* 4. 评测面板 */
.exam-hero-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #3e2723, #5d4037);
  padding: 50px;
  color: #fff;
  margin-bottom: 60px;
  border-radius: 4px;
}
.hero-info h3 {
  font-size: 26px;
  margin-bottom: 10px;
}
.hero-info p {
  font-size: 16px;
  opacity: 0.8;
}
.exam-start-btn {
  background: #b71c1c;
  color: #fff;
  border: none;
  padding: 15px 45px;
  font-family: 'NO3';
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
.exam-start-btn:hover {
  transform: scale(1.05);
}

.sub-pane-title {
  font-size: 22px;
  color: #b71c1c;
  margin-bottom: 30px;
  border-left: 4px solid #b71c1c;
  padding-left: 15px;
}
.chapter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  border-bottom: 1px solid rgba(139, 94, 60, 0.1);
  transition: 0.3s;
}
.chapter-row:hover {
  background: rgba(139, 94, 60, 0.03);
}
.ch-info {
  display: flex;
  align-items: center;
  gap: 25px;
}
.ch-idx {
  font-weight: bold;
  color: #b71c1c;
  font-size: 30px;
  font-weight: 400;
}
.ch-name {
  font-size: 24px;
  color: #3e2723;
}
.ch-actions {
  display: flex;
  gap: 15px;
}
.ch-btn {
  padding: 10px 22px;
  font-family: 'NO3';
  cursor: pointer;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  transition: 0.3s;
}
.ch-btn.practice {
  background: transparent;
  border: 1px solid #8b5e3c;
  color: #8b5e3c;
}
.ch-btn.practice:hover {
  background: #8b5e3c;
  color: #fff;
}
.ch-btn.test {
  background: #3e2723;
  color: #fff;
  border: none;
}
.ch-btn.test:hover {
  background: #b71c1c;
}
/* --- 知识图谱专用补充样式 --- */
.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.graph-expand-btn {
  background: #3e2723;
  color: #fff;
  border: none;
  padding: 8px 18px;
  font-family: 'NO3';
  font-size: 20px;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s;
}

.graph-expand-btn:hover {
  background: #b71c1c;
  transform: translateY(-2px);
}

.graph-box-normal {
  width: 100%;
  height: 500px;
  border: 1px solid #e0d8c3;
  background: #fdfcf9;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

/* 图例悬浮窗 */
.graph-legend-overlay {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 15px;
  border-radius: 4px;
  border: 1px solid #eee;
  pointer-events: none;
  z-index: 5;
}

.legend-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
}

.legend-section span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shelf-btn.is-active {
  background: #8b5e3c;
  color: #fff;
  border-color: #8b5e3c;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot.s1 {
  background: #b71c1c;
}
.dot.s2 {
  background: #8b5e3c;
}
.dot.s3 {
  background: #3e2723;
}
.dot.s4 {
  background: #6d4c41;
}

/* 全屏图例特供样式 */
.full-legend {
  position: absolute;
  bottom: 40px;
  left: 40px;
  display: flex;
  gap: 30px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border: 1px solid #e0d8c3;
  border-radius: 4px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.l-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ln {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 2px;
  color: #fff;
}
/* 连线颜色映射 */
.ln.l1 {
  background: #546e7a;
} /* 表现 */
.ln.l2 {
  background: #2e7d32;
} /* 主治 */
.ln.l3 {
  background: #c62828;
} /* 病机 */
.ln.l4 {
  background: #ef6c00;
} /* 逻辑 */

.graph-hint {
  text-align: center;
  margin-top: 15px;
  font-size: 20px;
  color: #8d6e63;
  font-style: italic;
}
/* 全屏覆盖层样式 */
.graph-full-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #fdfcf9;
  z-index: 10000; /* 确保在最顶层 */
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease;
}

.full-header {
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  border-bottom: 1px solid #e0d8c3;
  background: #fff;
}

.full-title {
  font-size: 24px;
  font-family: 'NO3';
  color: #3e2723;
}

.close-full-btn {
  background: #b71c1c;
  color: #fff;
  border: none;
  padding: 10px 25px;
  font-family: 'NO3';
  cursor: pointer;
  border-radius: 4px;
  transition: 0.3s;
}

.close-full-btn:hover {
  background: #d32f2f;
}

.full-canvas {
  flex: 1;
  width: 100%;
}

/* 动画过渡 */
.fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .book-hero {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .intro-layout {
    grid-template-columns: 1fr;
  }
  .exam-hero-banner {
    flex-direction: column;
    gap: 30px;
    text-align: center;
  }
  .chapter-row {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .ai-immersive-chat {
    height: 750px;
  }
  .expert-identity {
    flex-direction: column;
    text-align: center;
  }
}
</style>
