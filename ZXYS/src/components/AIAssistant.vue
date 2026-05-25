<template>
  <div class="xl-assistant-root">
    <!-- 召唤按钮 (圆角矩形) -->
    <div class="trigger-btn" :class="{ hidden: isAssistantOpen }" @click="isAssistantOpen = true">
      <div class="logo-box"><img src="/logo.png" /></div>
      <div class="trigger-text">
        <span>智学助手</span>
        <small><i class="fas fa-circle"></i> 在线</small>
      </div>
    </div>

    <!-- 主面板 (拟态玻璃空间) -->
    <Transition name="ink-zoom">
      <div v-if="isAssistantOpen" class="xl-glass-panel">
        <!-- 第一栏：模式切换 -->
        <nav class="xl-mode-nav">
          <div
            v-for="mode in modes"
            :key="mode.id"
            class="mode-btn"
            :class="{ active: activeMode === mode.id }"
            @click="switchMode(mode.id)"
          >
            <i class="fas" :class="mode.icon"></i>
            <span class="mode-label">{{ mode.name }}</span>
          </div>
        </nav>

        <!-- 第二栏：数字人形象全展示区 -->
        <div class="xl-digital-human-col">
          <div class="human-container">
            <xunfei_shuziren
              ref="digitalHumanRef"
              :avatar-id="currentAvatarId"
              :auto-connect="true"
            />
          </div>
        </div>

        <!-- 第三栏：对话区域 -->
        <div class="xl-chat-col">
          <header class="chat-header">
            <div class="header-title">
              <i class="fas fa-leaf"></i>
              <span>{{ modes.find((m) => m.id === activeMode)?.name }}</span>
            </div>
            <button class="close-btn" @click="isAssistantOpen = false">
              <i class="fas fa-times"></i>
            </button>
          </header>

          <div class="chat-main" ref="chatBoxRef">
            <div v-for="(msg, i) in messages" :key="i" :class="['msg-line', msg.role]">
              <div class="rect-avatar" v-if="msg.role === 'ai'">
                <img src="/logo.png" />
              </div>
              <div class="msg-bubble">
                {{ msg.role === 'ai' ? msg.typedContent : msg.content }}
                <span v-if="msg.isTyping" class="typing-cursor">|</span>
              </div>
            </div>
          </div>

          <div class="input-area">
            <div class="input-wrapper">
              <input
                v-model="userInput"
                placeholder="输入中医疑问或指令..."
                @keyup.enter="sendMessage"
              />
              <button class="send-btn" @click="sendMessage">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 第四栏：知识图谱预览 -->
        <div class="xl-graph-col">
          <div class="graph-card">
            <div class="graph-header">
              <span><i class="fas fa-sitemap"></i> 知识图谱</span>
              <div class="graph-header-actions">
                <button class="action-btn" @click="resetGraphLayout" title="重置布局">
                  <i class="fas fa-sync-alt"></i>
                </button>
                <button class="zoom-in-btn" @click="toggleFullscreen" title="全屏研读">
                  <i class="fas fa-expand-alt"></i>
                </button>
              </div>
            </div>
            <div class="graph-toolbar">
              <div class="filter-group">
                <span class="filter-label">关系筛选:</span>
                <div class="filter-buttons">
                  <button
                    v-for="rel in relationFilters"
                    :key="rel.type"
                    :class="['filter-chip', { active: activeRelationFilter === rel.type }]"
                    @click="setRelationFilter(rel.type)"
                  >
                    {{ rel.name }}
                  </button>
                  <button
                    :class="['filter-chip', { active: activeRelationFilter === 'all' }]"
                    @click="setRelationFilter('all')"
                  >
                    全部
                  </button>
                </div>
              </div>
            </div>
            <div class="chart-container" ref="chartContainer"></div>
            <!-- 图谱详情面板 -->
            <div class="graph-meta" v-if="selectedNode">
              <div class="selected-node-info">
                <h4>
                  <i class="fas fa-tag"></i>
                  {{ selectedNode.name }}
                  <!-- 模板中的节点详情面板 -->
                  <span
                    class="node-type-badge"
                    :style="{
                      backgroundColor:
                        currentGraphData.nodeTypes[selectedNode.type]?.color || '#8b5e3c',
                    }"
                  >
                    {{ selectedNode.type }}
                  </span>
                </h4>
                <p class="node-desc">{{ selectedNode.desc || '暂无描述信息' }}</p>
                <div class="node-relations" v-if="selectedNodeRelations.length">
                  <span class="relation-title">关联关系:</span>
                  <div class="relation-list">
                    <span
                      v-for="(rel, idx) in selectedNodeRelations.slice(0, 5)"
                      :key="idx"
                      class="relation-tag"
                    >
                      {{ rel.relation }} → {{ rel.targetName }}
                    </span>
                  </div>
                </div>
                <button class="close-node-detail" @click="clearSelectedNode">
                  <i class="fas fa-times-circle"></i>
                </button>
              </div>
            </div>
            <div class="graph-stats" v-else>
              <div class="stats-content">
                <i class="fas fa-info-circle"></i>
                <span
                  >{{ currentGraphData.nodes.length }} 个节点 ·
                  {{ currentGraphData.links.length }} 条关系</span
                >
                <span class="hint-text">点击节点查看详情，拖拽可调整布局</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 全屏图谱研读层 -->
        <Transition name="fade">
          <div v-if="isFullscreenGraph" class="xl-fullscreen-overlay">
            <header class="fs-header">
              <div class="fs-title">
                <i class="fas fa-project-diagram"></i>
                <span>中医知识空间 - 深度模式</span>
              </div>
              <div class="fs-actions">
                <button class="fs-action-btn" @click="resetFullscreenLayout" title="重置布局">
                  <i class="fas fa-sync-alt"></i> 重置
                </button>
                <button class="fs-close" @click="toggleFullscreen">
                  <i class="fas fa-compress-alt"></i> 退出研读
                </button>
              </div>
            </header>
            <div class="fs-toolbar">
              <div class="filter-group">
                <span class="filter-label">关系筛选:</span>
                <div class="filter-buttons">
                  <button
                    v-for="rel in relationFilters"
                    :key="rel.type"
                    :class="['filter-chip', { active: activeRelationFilter === rel.type }]"
                    @click="setRelationFilter(rel.type)"
                  >
                    {{ rel.name }}
                  </button>
                  <button
                    :class="['filter-chip', { active: activeRelationFilter === 'all' }]"
                    @click="setRelationFilter('all')"
                  >
                    全部
                  </button>
                </div>
              </div>
              <div class="fs-stats">
                <span>节点: {{ currentGraphData.nodes.length }}</span>
                <span>关系: {{ currentGraphData.links.length }}</span>
              </div>
            </div>
            <div class="fs-body" ref="fullChartContainer"></div>
            <!-- 全屏模式下的详情侧边栏 -->
            <div class="fs-detail-sidebar" v-if="selectedNode && isFullscreenGraph">
              <div class="sidebar-header">
                <h3><i class="fas fa-leaf"></i> 节点详情</h3>
                <button class="sidebar-close" @click="clearSelectedNode">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="sidebar-content">
                <div class="detail-name">{{ selectedNode.name }}</div>
                <!-- 全屏模式下的详情侧边栏中，修改 detail-type 的样式 -->
                <div
                  class="detail-type"
                  :style="{
                    backgroundColor:
                      currentGraphData.nodeTypes[selectedNode.type]?.color || '#8b5e3c',
                  }"
                >
                  {{ selectedNode.type }}
                </div>
                <div class="detail-desc">{{ selectedNode.desc || '暂无描述信息' }}</div>
                <div class="detail-relations" v-if="selectedNodeRelations.length">
                  <div class="relations-title">关联关系</div>
                  <div class="relations-list">
                    <div
                      v-for="(rel, idx) in selectedNodeRelations"
                      :key="idx"
                      class="relation-item"
                    >
                      <span class="rel-type">{{ rel.relation }}</span>
                      <span class="rel-target">{{ rel.targetName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import {
  chatQA,
  type KnowledgeGraph,
  type KnowledgeGraphNode,
  type KnowledgeGraphLink,
} from '@/api/ai'

import xunfei_shuziren from '@/views/MockInterview/xunfei_shuziren.vue'
// 在现有 ref 定义后面添加
const digitalHumanRef = ref<any>(null)
const currentAvatarId = ref('110117005') // 默认岐黄问答的形象

// 根据模式获取对应的数字人ID
const getAvatarIdByMode = (modeId: string): string => {
  const avatarMap: Record<string, string> = {
    qa: '110117005', // 岐黄问答
    resume: '110021006', // 简历优化
    plan: '110332017', // 学习计划
  }
  return avatarMap[modeId] || '110117005'
}

// --- 1. 基础状态控制 ---
const isAssistantOpen = ref(false)
const activeMode = ref('qa')
const userInput = ref('')
const chatBoxRef = ref<HTMLElement | null>(null)
const isFullscreenGraph = ref(false)

// --- 2. 模式定义 ---
const modes = [
  { id: 'qa', name: '岐黄问答', icon: 'fa-comment-medical' },
  { id: 'resume', name: '简历优化', icon: 'fa-file-invoice' },
  { id: 'plan', name: '学习计划', icon: 'fa-calendar-check' },
]

// --- 3. ECharts 实例 ---
let chartInstance: echarts.ECharts | null = null
let fullscreenInstance: echarts.ECharts | null = null
const chartContainer = ref<HTMLElement | null>(null)
const fullChartContainer = ref<HTMLElement | null>(null)

// --- 4. 知识图谱状态 ---
const selectedNode = ref<KnowledgeGraphNode | null>(null)
const activeRelationFilter = ref<string>('all')

// 关系筛选器定义
// const relationFilters = [
//   { type: '1', name: '变证' },
//   { type: '2', name: '主治' },
//   { type: '3', name: '君臣佐使' },
//   { type: '4', name: '病机' },
// ]
// 动态获取关系帅选
const relationFilters = computed(() => {
  // 从当前图谱的 links 中提取所有不重复的关系类型
  const types = new Set<string>()
  currentGraphData.value.links.forEach((link) => {
    if (link.relation) {
      types.add(link.relation)
    }
  })
  // 转换为筛选器格式，type 和 name 都用关系名称
  return Array.from(types).map((relType) => ({
    type: relType, // 用于筛选匹配
    name: relType, // 显示名称
  }))
})

// 当前图谱数据
const currentGraphData = ref<{
  nodes: KnowledgeGraphNode[]
  links: (KnowledgeGraphLink & { type: string })[]
  nodeTypes: Record<string, { name: string; color: string }>
}>({
  nodes: [],
  links: [],
  nodeTypes: {},
})

// 获取选中节点的关联关系
const selectedNodeRelations = computed(() => {
  if (!selectedNode.value) return []
  const relations: { relation: string; targetName: string }[] = []
  for (const link of currentGraphData.value.links) {
    if (link.source === selectedNode.value.id) {
      const targetNode = currentGraphData.value.nodes.find((n) => n.id === link.target)
      if (targetNode) {
        relations.push({ relation: link.relation, targetName: targetNode.name })
      }
    }
    if (link.target === selectedNode.value.id) {
      const sourceNode = currentGraphData.value.nodes.find((n) => n.id === link.source)
      if (sourceNode) {
        relations.push({ relation: link.relation + '（被）', targetName: sourceNode.name })
      }
    }
  }
  return relations
})

// 清除选中的节点
const clearSelectedNode = () => {
  selectedNode.value = null
  if (chartInstance) {
    chartInstance.dispatchAction({ type: 'unselect', seriesIndex: 0 })
  }
  if (fullscreenInstance) {
    fullscreenInstance.dispatchAction({ type: 'unselect', seriesIndex: 0 })
  }
}

// 设置关系筛选
const setRelationFilter = (type: string) => {
  activeRelationFilter.value = type
  nextTick(() => {
    if (chartInstance) {
      chartInstance.setOption(getEChartsOption(false), true)
    }
    if (fullscreenInstance && isFullscreenGraph.value) {
      fullscreenInstance.setOption(getEChartsOption(true), true)
    }
  })
}

// 获取过滤后的数据
const getFilteredData = () => {
  if (activeRelationFilter.value === 'all') {
    return { nodes: currentGraphData.value.nodes, links: currentGraphData.value.links }
  }
  // 筛选与选中关系类型匹配的 links
  const filteredLinks = currentGraphData.value.links.filter(
    (link) => link.type === activeRelationFilter.value,
  )
  const activeNodeIds = new Set<string>()
  filteredLinks.forEach((link) => {
    activeNodeIds.add(link.source)
    activeNodeIds.add(link.target)
  })
  const filteredNodes = currentGraphData.value.nodes.filter((node) => activeNodeIds.has(node.id))
  return { nodes: filteredNodes, links: filteredLinks }
}

// 生成 ECharts 配置
const getEChartsOption = (isFullscreen: boolean) => {
  const { nodes, links } = getFilteredData()

  if (nodes.length === 0) {
    return {}
  }

  // 构建 categories（用于图例）
  const categories = Object.entries(currentGraphData.value.nodeTypes).map(
    ([typeName, typeDef]) => ({
      name: typeDef.name,
      itemStyle: { color: typeDef.color },
    }),
  )

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 252, 245, 0.95)',
      borderColor: '#a67c52',
      borderWidth: 1,
      textStyle: { color: '#3e2723', fontSize: 12, fontFamily: 'No3' },
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `
            <div style="padding:8px; min-width: 150px;">
              <b style="font-size: 14px; color: #8b5e3c;">${params.data.name}</b>
              <div style="margin-top: 6px; font-size: 12px; color: #666;">${params.data.desc || '暂无描述'}</div>
              <div style="margin-top: 4px; font-size: 11px; color: #b71c1c;">类型: ${params.data.category}</div>
            </div>
          `
        }
        return `<div style="padding:6px 12px;"><b>${params.data.relation}</b></div>`
      },
    },
    legend: {
      bottom: 20,
      right: 20,
      orient: 'vertical',
      data: categories.map((c) => c.name),
      backgroundColor: 'rgba(255,255,255,0.5)',
      borderRadius: 8,
      padding: [8, 12],
      textStyle: { color: '#5d3a1a', fontSize: 11 },
      itemGap: 12,
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        symbolSize: isFullscreen ? 100 : 70,
        draggable: true,
        roam: true,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [4, 10],
        focusNodeAdjacency: false,
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 4, color: '#ff9800' },
          label: { show: true, fontWeight: 'bold' },
        },
        select: {
          itemStyle: { borderWidth: 3, borderColor: '#ffd700', shadowBlur: 15 },
          label: { show: true, fontWeight: 'bold' },
        },
        label: {
          show: true,
          position: 'inside',
          color: '#fff',
          fontSize: isFullscreen ? 50 : 30,
          fontWeight: '500',
          fontFamily: 'No3',
          textBorderColor: '#000', // 黑色描边
          textBorderWidth: 2,
        },
        force: {
          repulsion: isFullscreen ? 2000 : 1200,
          edgeLength: isFullscreen ? 180 : 140,
          gravity: 0.08,
          friction: 0.1,
          layoutAnimation: true,
        },
        data: nodes.map((n) => ({
          id: n.id,
          name: n.name,
          desc: n.desc,
          category: currentGraphData.value.nodeTypes[n.type]?.name || n.type,
          itemStyle: {
            color: currentGraphData.value.nodeTypes[n.type]?.color || '#8b5e3c',
            shadowBlur: 8,
            shadowColor: 'rgba(0,0,0,0.15)',
            borderColor: '#fff',
            borderWidth: 1.5,
          },
        })),
        links: links.map((l) => ({
          source: l.source,
          target: l.target,
          relation: l.relation,
          lineStyle: {
            color: l.color || '#546e7a',
            width: 2.5,
            type: 'solid',
            curveness: 0.15,
          },
          label: { show: true, formatter: l.relation, fontSize: 20, offset: [0, -8] },
        })),
        categories: categories,
        edgeLabel: { show: true, fontSize: 20, formatter: (params: any) => params.data.relation },
      },
    ],
  }
}

// 转换后端返回的图谱数据
const transformGraphData = (graph: KnowledgeGraph) => {
  // 直接使用后端返回的 nodeTypes（已包含颜色）
  const nodeTypesWithColor = graph.nodeTypes

  // 直接使用后端返回的 links（已包含颜色和type）
  const linksWithType = graph.links.map((link) => ({
    ...link,
    type: link.type || link.relation,
  }))

  currentGraphData.value = {
    nodes: graph.nodes,
    links: linksWithType,
    nodeTypes: nodeTypesWithColor,
  }

  // 重新渲染图表
  nextTick(() => {
    if (chartInstance && !isFullscreenGraph.value) {
      chartInstance.setOption(getEChartsOption(false), true)
    }
    if (fullscreenInstance && isFullscreenGraph.value) {
      fullscreenInstance.setOption(getEChartsOption(true), true)
    }
  })
}

// --- 5. 聊天业务逻辑 ---
// 定义消息类型
interface ChatMessage {
  role: 'user' | 'ai'
  content: string
  typedContent?: string // 仅 AI 消息需要
  isTyping?: boolean // 仅 AI 消息需要
}
const messages = ref<ChatMessage[]>([
  {
    role: 'ai',
    content:
      '尊驾好。我是您的杏林数字助手。知识空间已为您准备就绪。点击图谱中的节点可查看详细关联信息，使用关系筛选可聚焦特定知识领域。',
    typedContent: '',
    isTyping: true,
  },
])

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBoxRef.value) chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight
  })
}

const startTyping = (index: number) => {
  const msg = messages.value[index]
  if (!msg) return
  let i = 0
  const timer = setInterval(() => {
    if (i < msg.content.length) {
      msg.typedContent += msg.content.charAt(i)
      i++
      scrollToBottom()
    } else {
      msg.isTyping = false
      clearInterval(timer)
    }
  }, 30)
}

const addAiMessage = (content: string) => {
  const index = messages.value.length
  messages.value.push({ role: 'ai', content, typedContent: '', isTyping: true })
  startTyping(index)
}

// 发送消息到AI
// 修改 sendMessageToAI 函数
const sendMessageToAI = async (question: string) => {
  // 显示加载状态
  const loadingIndex = messages.value.length
  messages.value.push({
    role: 'ai',
    content: '正在思索中...',
    typedContent: '正在思索中...',
    isTyping: false,
  })
  scrollToBottom()

  try {
    const result = await chatQA(question)

    if (result.code === 200 && result.data) {
      const { reply, knowledgeGraph } = result.data

      // 移除加载消息
      messages.value.splice(loadingIndex, 1)

      // 添加AI的文本回复
      addAiMessage(reply)

      // 🎯 让数字人说出回复内容
      if (digitalHumanRef.value && digitalHumanRef.value.sendText) {
        // 移除回复中的HTML标签和多余空白，只保留纯文本
        const cleanReply = reply
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
        digitalHumanRef.value.sendText(cleanReply)
        console.log('[助手] 数字人开始说话:', cleanReply.substring(0, 50))
      }

      // ✅ 在这里添加提示消息（根据不同模式显示不同提示）
      if (activeMode.value === 'resume') {
        // 简历优化模式
        addAiMessage('正在帮您自动修改简历中...')
      } else if (activeMode.value === 'plan') {
        // 学习计划模式
        addAiMessage('正在帮您生成个性化学习计划...')
      } else {
        // 默认提示
        addAiMessage('正在帮您整理相关知识图谱...')
      }

      // 更新知识图谱
      if (knowledgeGraph && knowledgeGraph.nodes.length > 0) {
        transformGraphData(knowledgeGraph)
      } else {
        console.warn('AI未返回图谱数据')
      }
    } else {
      throw new Error(result.message || '请求失败')
    }
  } catch (error: any) {
    console.error('AI问答失败:', error)
    messages.value.splice(loadingIndex, 1)
    addAiMessage('抱歉，服务暂时不可用，请稍后再试。')
  }
}

// 发送消息入口
const sendMessage = () => {
  if (!userInput.value.trim()) return

  const input = userInput.value.trim()
  messages.value.push({ role: 'user', content: input })
  userInput.value = ''
  scrollToBottom()

  // 调用真实API
  sendMessageToAI(input)
}

const switchMode = (id: string) => {
  activeMode.value = id
  const targetMode = modes.find((m) => m.id === id)
  // 切换数字人形象
  const newAvatarId = getAvatarIdByMode(id)
  if (newAvatarId !== currentAvatarId.value) {
    currentAvatarId.value = newAvatarId
    console.log(`[助手] 切换数字人形象: ${newAvatarId}`)
  }

  addAiMessage(`已为您切换至【${targetMode?.name}】模式。正在重新排布知识矩阵...`)
}

// --- 6. ECharts 初始化 ---
const initChart = async (isFullscreen: boolean) => {
  await nextTick()
  const target = isFullscreen ? fullChartContainer.value : chartContainer.value
  if (!target) return

  const existingInstance = isFullscreen ? fullscreenInstance : chartInstance
  if (existingInstance) existingInstance.dispose()

  const newInstance = echarts.init(target)
  newInstance.setOption(getEChartsOption(isFullscreen))

  // 绑定节点点击事件
  newInstance.off('click')
  newInstance.on('click', (params: any) => {
    if (params.dataType === 'node' && params.data) {
      // 确保从当前数据中查找
      const node = currentGraphData.value.nodes.find((n) => n.id === params.data.id)
      if (node) {
        selectedNode.value = node
        newInstance.dispatchAction({
          type: 'select',
          seriesIndex: 0,
          dataIndex: params.dataIndex,
        })
      }
    } else if (params.dataType !== 'node' && selectedNode.value) {
      clearSelectedNode()
    }
  })

  if (isFullscreen) {
    fullscreenInstance = newInstance
  } else {
    chartInstance = newInstance
  }
}

// 切换全屏模式
const toggleFullscreen = async () => {
  isFullscreenGraph.value = !isFullscreenGraph.value
  await nextTick()
  if (isFullscreenGraph.value) {
    await initChart(true)
  } else {
    await initChart(false)
  }
}

// 重置布局
const resetGraphLayout = () => {
  if (chartInstance) {
    chartInstance.setOption(getEChartsOption(false), true)
  }
}

const resetFullscreenLayout = () => {
  if (fullscreenInstance) {
    fullscreenInstance.setOption(getEChartsOption(true), true)
  }
}

// --- 7. 生命周期 ---
watch(isAssistantOpen, async (val) => {
  if (val) {
    await nextTick()
    setTimeout(() => initChart(false), 200)
    // 启动欢迎消息的打字效果
    startTyping(0)
  } else {
    clearSelectedNode()
  }
})

onUnmounted(() => {
  if (chartInstance) chartInstance.dispose()
  if (fullscreenInstance) fullscreenInstance.dispose()
})
</script>

<style scoped>
/* 样式定义：严格遵循杏林拟态玻璃美学（保持原有样式并新增图谱交互样式） */
.xl-assistant-root {
  --xl-apricot: rgba(253, 245, 230, 0.85);
  --xl-bronze: #a67c52;
  --xl-shadow: rgba(74, 52, 46, 0.1);
  --xl-dark: #3e2723;
  --xl-green: #4c7040;
}

/* 召唤按钮 */
.trigger-btn {
  position: fixed;
  right: 40px;
  bottom: 40px;
  width: 160px;
  height: 64px;
  background: #8b5e3c;
  border-radius: 12px;
  border: 1px solid var(--xl-bronze);
  display: flex;
  align-items: center;
  padding: 0 15px;
  cursor: pointer;
  z-index: 999;
  box-shadow: 0 8px 25px var(--xl-shadow);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.trigger-btn:hover {
  transform: translateY(-5px);
  border-color: var(--xl-apricot);
}
.trigger-btn.hidden {
  opacity: 0;
  transform: scale(0.8) translateX(50px);
  pointer-events: none;
}
.logo-box {
  width: 42px;
  height: 42px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  margin-right: 12px;
}
.logo-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.trigger-text {
  color: #fff;
  font-size: 25px;
  font-family: 'No1';
}
.trigger-text small {
  display: block;
  font-size: 16px;
  opacity: 0.8;
  margin-top: 2px;
}
.trigger-text small i {
  color: #52c41a;
  font-size: 8px;
}

/* 主面板 */
.xl-glass-panel {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  height: 850px;
  max-width: 96vw;
  max-height: 92vh;
  background: var(--xl-apricot);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--xl-bronze);
  border-radius: 20px;
  display: flex;
  overflow: hidden;
  z-index: 10000;
  box-shadow: 0 30px 100px var(--xl-shadow);
}

/* 第一栏：模式导航 */
.xl-mode-nav {
  width: 90px;
  background: rgba(166, 124, 82, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 30px;
  border-right: 1px solid rgba(166, 124, 82, 0.1);
}
.mode-btn {
  width: 62px;
  height: 62px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--xl-bronze);
  cursor: pointer;
  transition: 0.3s;
  gap: 6px;
}
.mode-btn i {
  font-size: 20px;
}
.mode-btn .mode-label {
  font-size: 10px;
  font-family: 'No3';
}
.mode-btn.active,
.mode-btn:hover {
  background: #5d3a1a;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 第二栏：数字人区域 */
.xl-digital-human-col {
  width: 400px;
  background: rgba(0, 0, 0, 0.04);
  border-right: 1px solid rgba(166, 124, 82, 0.08);
}
.human-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder-content {
  text-align: center;
  color: var(--xl-bronze);
  opacity: 0.4;
}
.placeholder-content i {
  font-size: 100px;
  margin-bottom: 20px;
}
.ink-mask {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(transparent, rgba(166, 124, 82, 0.15));
}

/* 第三栏：聊天对话 */
.xl-chat-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 450px;
  background: rgba(255, 255, 255, 0.15);
}
.chat-header {
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(166, 124, 82, 0.1);
}
.header-title {
  font-family: 'No1';
  font-size: 30px;
  color: #5d3a1a;
  display: flex;
  align-items: center;
  gap: 10px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  color: var(--xl-bronze);
  cursor: pointer;
  transition: 0.3s;
}
.close-btn:hover {
  color: #b71c1c;
  transform: rotate(90deg);
}

.chat-main {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.chat-main::-webkit-scrollbar {
  width: 4px;
}
.chat-main::-webkit-scrollbar-track {
  background: transparent;
}
.chat-main::-webkit-scrollbar-thumb {
  background: rgba(166, 124, 82, 0.2);
  border-radius: 10px;
}

.msg-line {
  display: flex;
  gap: 15px;
  max-width: 88%;
}
.msg-line.ai {
  align-self: flex-start;
}
.msg-line.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.rect-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 2px solid var(--xl-green);
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
}
.rect-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.msg-bubble {
  padding: 15px 20px;
  border-radius: 15px;
  background: #fff;
  color: var(--xl-dark);
  font-family: 'No3';
  line-height: 1.7;
  font-size: 20px;
  font-weight: 200;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.user .msg-bubble {
  background: var(--xl-green);
  color: #fff;
}
.typing-cursor {
  display: inline-block;
  width: 2px;
  background: var(--xl-green);
  margin-left: 2px;
  animation: blink 1s infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

.input-area {
  padding: 25px 30px;
}
.input-wrapper {
  background: #fff;
  border: 1px solid var(--xl-bronze);
  border-radius: 15px;
  display: flex;
  padding: 6px 15px;
  align-items: center;
}
.input-wrapper input {
  flex: 1;
  border: none;
  padding: 12px;
  outline: none;
  font-family: 'No3';
  font-size: 20px;
  background: transparent;
}
.send-btn {
  background: #5d3a1a;
  color: #fff;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  cursor: pointer;
}

/* 第四栏：图谱预览 (增强样式) */
.xl-graph-col {
  width: 440px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
}
.graph-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'No1';
  font-size: 30px;
  color: #5d3a1a;
  margin-bottom: 12px;
}
.graph-header-actions {
  display: flex;
  gap: 8px;
}
.action-btn,
.zoom-in-btn {
  background: rgba(166, 124, 82, 0.15);
  border: none;
  color: var(--xl-bronze);
  cursor: pointer;
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.2s;
}
.action-btn:hover,
.zoom-in-btn:hover {
  background: #5d3a1a;
  color: #fff;
}
.graph-toolbar {
  margin-bottom: 12px;
  padding: 8px 0;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.filter-label {
  font-size: 20px;
  color: var(--xl-dark);
  font-family: 'No3';
}
.filter-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.filter-chip {
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(166, 124, 82, 0.12);
  border: 1px solid transparent;
  font-size: 20px;
  font-family: 'No3';
  color: var(--xl-dark);
  cursor: pointer;
  transition: all 0.2s;
}
.filter-chip.active {
  background: #5d3a1a;
  color: #fff;
  border-color: var(--xl-bronze);
}
.filter-chip:hover {
  background: rgba(93, 58, 26, 0.7);
  color: #fff;
}
.chart-container {
  flex: 1;
  min-height: 280px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  border: 1px solid rgba(166, 124, 82, 0.15);
}
.graph-meta {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 252, 245, 0.6);
  border-radius: 12px;
  border-left: 3px solid #8b5e3c;
}
.selected-node-info {
  position: relative;
}
.selected-node-info h4 {
  margin: 0 0 6px 0;
  color: #b71c1c;
  font-family: 'No1';
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.node-type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  color: #fff;
  font-family: 'No3';
}
.node-desc {
  margin: 6px 0;
  font-size: 12px;
  font-family: 'No3';
  line-height: 1.5;
  color: var(--xl-dark);
}
.node-relations {
  margin-top: 8px;
}
.relation-title {
  font-size: 11px;
  color: #8b5e3c;
  font-weight: bold;
}
.relation-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.relation-tag {
  background: rgba(166, 124, 82, 0.15);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  color: #5d3a1a;
}
.close-node-detail {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: #a67c52;
  cursor: pointer;
  font-size: 14px;
}
.graph-stats {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 252, 245, 0.6);
  border-radius: 12px;
  text-align: center;
}
.stats-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 20px;
  color: var(--xl-dark);
  font-family: 'No3';
}
.hint-text {
  font-size: 16px;
  opacity: 0.7;
}

/* 全屏图谱层 (空间替代增强版) */
.xl-fullscreen-overlay {
  position: absolute;
  left: 90px;
  top: 0;
  right: 0;
  bottom: 0;
  background: var(--xl-apricot);
  backdrop-filter: blur(25px);
  z-index: 500;
  display: flex;
  flex-direction: column;
}
.fs-header {
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(166, 124, 82, 0.2);
}
.fs-title {
  font-family: 'No1';
  font-size: 50px;
  color: #5d3a1a;
  display: flex;
  align-items: center;
  gap: 12px;
}
.fs-actions {
  display: flex;
  gap: 15px;
}
.fs-action-btn {
  background: rgba(166, 124, 82, 0.2);
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  color: #5d3a1a;
  cursor: pointer;
  font-family: 'No3';
  transition: all 0.2s;
}
.fs-action-btn:hover {
  background: #5d3a1a;
  color: #fff;
}
.fs-close {
  background: #5d3a1a;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'No1';
}
.fs-toolbar {
  padding: 12px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(166, 124, 82, 0.1);
  background: rgba(255, 255, 255, 0.2);
}
.fs-stats {
  display: flex;
  gap: 20px;
  font-size: 13px;
  font-family: 'No3';
  color: var(--xl-dark);
}
.fs-body {
  flex: 1;
  width: 100%;
  position: relative;
}
.fs-detail-sidebar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: rgba(253, 245, 230, 0.95);
  backdrop-filter: blur(10px);
  border-left: 1px solid var(--xl-bronze);
  z-index: 10;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.2);
}
.sidebar-header h3 {
  margin: 0;
  font-family: 'No1';
  color: #5d3a1a;
  font-size: 1.1rem;
}
.sidebar-close {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--xl-bronze);
  cursor: pointer;
}
.sidebar-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.detail-name {
  font-size: 30px;
  font-family: 'No1';
  color: #b71c1c;
  margin-bottom: 12px;
}
.detail-type {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  color: #fff;
  font-size: 20px;
  font-family: 'No3';
  margin-bottom: 15px;
}
.detail-desc {
  font-size: 20px;
  line-height: 1.6;
  color: var(--xl-dark);
  font-family: 'No3';
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(166, 124, 82, 0.3);
}
.relations-title {
  font-weight: bold;
  color: #8b5e3c;
  margin-bottom: 12px;
  font-size: 20px;
}
.relations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.relation-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(166, 124, 82, 0.08);
  border-radius: 8px;
  font-size: 16px;
}
.rel-type {
  color: #c62828;
  font-weight: 500;
}
.rel-target {
  color: #2e7d32;
}

/* 过渡动画 */
.ink-zoom-enter-active,
.ink-zoom-leave-active {
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.ink-zoom-enter-from,
.ink-zoom-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%) scale(0.92);
  filter: blur(10px);
}
.fade-enter-active,
.fade-leave-active {
  transition: 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
