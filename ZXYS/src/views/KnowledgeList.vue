<template>
  <div class="kg-page-container">
    <PageTransition
      v-if="showTransition"
      mode="leave"
      :show-text="true"
      @animation-end="onEnterAnimationEnd"
    />

    <!-- 装饰性元素 -->
    <div class="ink-particles">
      <div v-for="n in 6" :key="n" :class="'particle p' + n"></div>
    </div>

    <div class="main-content">
      <BreadcrumbNav title="知识图谱" :show-back="true" />

      <!-- 知识图谱主容器 -->
      <div class="kg-glass-wrapper">
        <!-- 背景装饰 -->
        <div class="bg-calligraphy">
          <p>阴阳者，天地之道也，万物之纲纪，变化之父母，生杀之本始，神明之府也。</p>
          <p>凡治病必求于本。故积阳为天，积阴为地。</p>
        </div>

        <div class="card-seal">岐黄传习</div>

        <!-- 四角装饰 -->
        <div class="corner-decor top-left"></div>
        <div class="corner-decor top-right"></div>
        <div class="corner-decor bottom-left"></div>
        <div class="corner-decor bottom-right"></div>

        <!-- 顶部操作栏 + 搜索框 -->
        <div class="kg-header-actions">
          <div class="view-title-box">
            <span class="decoration-line"></span>
            <span class="view-title">用户知识体系全景图</span>
            <span class="decoration-line"></span>
          </div>

          <!-- 搜索框 - 使用 Font Awesome 图标 -->
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchKeyword"
              placeholder="搜索知识点..."
              class="search-input"
              @input="handleSearch"
              @keyup.enter="handleSearch"
            />
            <button v-if="searchKeyword" class="search-clear" @click="clearSearch">✕</button>
            <div v-if="searchResults.length > 0 && searchKeyword" class="search-dropdown">
              <div
                v-for="result in searchResults"
                :key="result.id"
                class="search-result-item"
                @click="locateNode(result)"
              >
                <i class="fas fa-{{ getTypeIcon(result.type) }} result-icon"></i>
                <span class="result-name">{{ result.name }}</span>
                <span class="result-type">{{ getTypeName(result.type) }}</span>
                <span
                  class="result-mastery"
                  :style="{ color: getMasteryColor(result.mastery || 0) }"
                >
                  {{ getMasteryLevelShort(result.mastery || 0) }}
                </span>
              </div>
              <div v-if="searchResults.length === 0" class="search-no-result">
                <i class="fas fa-search"></i> 未找到相关知识点
              </div>
            </div>
          </div>
        </div>

        <!-- 学习状态统计 -->
        <div class="learning-stats-v2">
          <div class="stat-main">
            <div class="progress-ring-lg">
              <svg viewBox="0 0 36 36">
                <path
                  class="ring-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="ring-fg"
                  :style="{ strokeDasharray: `${totalProgress}, 100` }"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="inner-data">
                <span class="num">{{ totalProgress }}</span>
                <span class="unit">%</span>
              </div>
            </div>
            <div class="stat-text">
              <h4>整体掌握度</h4>
              <p>
                已掌握 <b>{{ masteredCount }}</b> 个知识点
              </p>
            </div>
          </div>
        </div>

        <!-- ECharts 绘图区域 -->
        <div class="kg-chart-container" ref="chartRef"></div>

        <!-- 右侧详情面板 -->
        <Transition name="panel-slide">
          <div v-if="selectedNode" class="elegant-detail-panel">
            <div class="panel-paper-texture"></div>
            <button class="close-panel-x" @click="closeDetail">✕</button>

            <div class="panel-content">
              <div class="badge-row">
                <span class="category-tag">{{ getTypeName(selectedNode.type) }}</span>
                <span
                  class="status-tag"
                  :style="{ color: getMasteryColor(selectedNode.mastery || 0) }"
                >
                  {{ getMasteryLevel(selectedNode.mastery || 0) }}
                </span>
              </div>

              <h2 class="node-main-title">{{ selectedNode.name }}</h2>
              <div class="ornament-divider"></div>

              <div class="description-box">
                <p>{{ selectedNode.description || '暂无详细描述' }}</p>
              </div>

              <!-- 掌握度进度 -->
              <div class="mastery-info">
                <div class="info-head">
                  <span class="label">掌握进度</span>
                  <span
                    class="value"
                    :style="{ color: getMasteryColor(selectedNode.mastery || 0) }"
                  >
                    {{ ((selectedNode.mastery || 0) * 100).toFixed(0) }}%
                  </span>
                </div>
                <div class="progress-track">
                  <div
                    class="progress-fill"
                    :style="{
                      width: (selectedNode.mastery || 0) * 100 + '%',
                      backgroundColor: getMasteryColor(selectedNode.mastery || 0),
                    }"
                  ></div>
                </div>
              </div>

              <!-- 关联知识点 -->
              <div
                v-if="selectedNode.relatedPoints && selectedNode.relatedPoints.length"
                class="related-points"
              >
                <div class="related-title">关联知识点</div>
                <div class="related-tags">
                  <span
                    v-for="point in selectedNode.relatedPoints"
                    :key="point.id"
                    class="related-tag"
                    @click="jumpToNode(point.id)"
                  >
                    {{ point.name }}
                  </span>
                </div>
              </div>

              <div class="action-footer">
                <button class="study-action-btn" @click="goToStudy(selectedNode)">
                  <i class="fas fa-book-open"></i> 开始学习此知识点
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- 图例说明与关系筛选器 -->
        <div class="relation-legend" v-show="!selectedNode">
          <div class="legend-header">掌握度图例</div>
          <div class="legend-body">
            <div class="legend-item"><span class="color-dot high"></span> 精通 (≥80%)</div>
            <div class="legend-item"><span class="color-dot medium"></span> 熟悉 (40%-80%)</div>
            <div class="legend-item"><span class="color-dot low"></span> 入门 (&lt;40%)</div>
            <div class="legend-item"><span class="color-dot none"></span> 未学习 (0%)</div>
          </div>
          <div class="legend-divider"></div>

          <!-- 关系类型筛选器 -->
          <div class="legend-header">关系筛选</div>
          <div class="legend-body filter-section">
            <div class="legend-item" v-for="relationType in relationTypes" :key="relationType.key">
              <input
                type="checkbox"
                :id="`filter-${relationType.key}`"
                v-model="relationFilters[relationType.key]"
                @change="applyRelationFilters"
                class="filter-checkbox"
              />
              <label :for="`filter-${relationType.key}`" class="filter-label">
                <span :class="['dot', relationType.className]"></span>
                {{ relationType.label }}
              </label>
            </div>
          </div>
          <div class="legend-divider"></div>

          <div class="legend-header">视图优化</div>
          <div class="legend-body">
            <div class="legend-item">
              <input type="checkbox" id="hide-labels" v-model="hideLabels" @change="renderGraph" />
              <label for="hide-labels" class="filter-label"
                ><i class="fas fa-tag"></i> 简化标签 (仅名称)</label
              >
            </div>
            <div class="legend-item">
              <input
                type="checkbox"
                id="compact-mode"
                v-model="compactMode"
                @change="renderGraph"
              />
              <label for="compact-mode" class="filter-label"
                ><i class="fas fa-compress-alt"></i> 紧凑布局模式</label
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import PageTransition from '@/components/PageTransition.vue'
import * as echarts from 'echarts'
import {
  getKnowledgeGraph,
  getUserMastery,
  type KnowledgePoint,
  type UserMastery,
} from '@/api/knowledge'
import { getUserId } from '@/utils/storage'
import type { EChartsOption, SeriesOption } from 'echarts'

const router = useRouter()
const chartRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null
const showTransition = ref(true)

// 数据状态
const allPoints = ref<KnowledgePoint[]>([])
const allRelations = ref<any[]>([])
const masteryMap = ref<Map<number, number>>(new Map())
const totalProgress = ref<number>(0)
const masteredCount = ref<number>(0)
const selectedNode = ref<any>(null)
const selectedNodeId = ref<string | null>(null)

// 视图优化状态
const hideLabels = ref(false)
const compactMode = ref(false)

// 搜索相关
const searchKeyword = ref('')
const searchResults = ref<any[]>([])

// 关系类型定义
const relationTypes = [
  { key: '主治', label: '主治', className: 's1' },
  { key: '组成成分', label: '组成成分', className: 's2' },
  { key: '核心病机', label: '核心病机', className: 's3' },
  { key: '包含证型', label: '包含证型', className: 's4' },
  { key: '代表方剂', label: '代表方剂', className: 's5' },
  { key: '传变', label: '传变', className: 's6' },
  { key: '所属病证', label: '所属病证', className: 's1' },
  { key: '功效', label: '功效', className: 's2' },
  { key: '出自著作', label: '出自著作', className: 's3' },
]

// 筛选器状态
const relationFilters = reactive<Record<string, boolean>>(
  Object.fromEntries(relationTypes.map((rt) => [rt.key, true])),
)

// 主题颜色
const themeColors = {
  high: '#a02828',
  medium: '#a67c52',
  low: '#d4b483',
  none: '#c0c0c0',
  deepBrown: '#3d2b1f',
}

// 获取知识点类型名称
const getTypeName = (type: number) => {
  const typeMap: Record<number, string> = {
    1: '理论',
    2: '方剂',
    3: '穴位/中药',
    4: '病机',
  }
  return typeMap[type] || '知识点'
}

// 获取知识点类型图标
const getTypeIcon = (type: number) => {
  const iconMap: Record<number, string> = {
    1: 'fa-brain',
    2: 'fa-capsules',
    3: 'fa-leaf',
    4: 'fa-heartbeat',
  }
  return iconMap[type] || 'fa-graduation-cap'
}

// 获取掌握度等级（完整版）
const getMasteryLevel = (score: number) => {
  if (score >= 0.8) return '已臻化境'
  if (score >= 0.4) return '渐入佳境'
  if (score > 0) return '初窥门径'
  return '待研习'
}

// 获取掌握度等级（简短版，用于搜索结果）
const getMasteryLevelShort = (score: number) => {
  if (score >= 0.8) return '精通'
  if (score >= 0.4) return '熟悉'
  if (score > 0) return '入门'
  return '未学'
}

// 获取掌握度颜色
const getMasteryColor = (score: number) => {
  if (score >= 0.8) return themeColors.high
  if (score >= 0.4) return themeColors.medium
  if (score > 0) return themeColors.low
  return themeColors.none
}

// 关系样式映射
const getRelationStyle = (relation: string) => {
  const styleMap: Record<string, { lineType: string; color: string }> = {
    主治: { lineType: 'solid', color: '#a67c52' },
    组成成分: { lineType: 'solid', color: '#a67c52' },
    核心病机: { lineType: 'dashed', color: '#a02828' },
    包含证型: { lineType: 'dashed', color: '#a67c52' },
    代表方剂: { lineType: 'solid', color: '#a02828' },
    传变: { lineType: 'dotted', color: '#d4b483' },
    所属病证: { lineType: 'solid', color: '#a67c52' },
    功效: { lineType: 'dashed', color: '#a67c52' },
    出自著作: { lineType: 'dotted', color: '#a67c52' },
  }
  return styleMap[relation] || { lineType: 'solid', color: '#a67c52' }
}

// 搜索处理
const handleSearch = () => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    searchResults.value = []
    return
  }

  searchResults.value = allPoints.value
    .filter((point) => point.name.toLowerCase().includes(keyword))
    .map((point) => ({
      ...point,
      mastery: masteryMap.value.get(point.id) || 0,
    }))
    .slice(0, 15)
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  searchResults.value = []
}

// 定位到节点（带自动聚焦/缩放动画）
const locateNode = async (node: any) => {
  // 清除搜索
  clearSearch()

  // 关闭详情面板
  closeDetail()

  const nodeId = String(node.id)
  const nodeIndex = allPoints.value.findIndex((p) => String(p.id) === nodeId)

  if (myChart && nodeIndex !== -1) {
    // 先取消所有高亮
    myChart.dispatchAction({
      type: 'downplay',
      seriesIndex: 0,
    })

    // 高亮选中的节点
    myChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: nodeIndex,
    })

    // 获取节点的位置并自动聚焦
    await nextTick()
    const option = myChart.getOption() as EChartsOption
    let series: SeriesOption | undefined

    if (Array.isArray(option.series)) {
      series = option.series[0]
    } else if (option.series) {
      series = option.series
    }
    const data = series?.data as any[] | undefined

    if (data && data[nodeIndex]) {
      const nodeData = data[nodeIndex] // ✅ 不报错

      // 如果节点有坐标，则自动聚焦到该节点
      if (nodeData.x !== undefined && nodeData.y !== undefined) {
        // 获取图表容器尺寸
        const container = chartRef.value
        if (container) {
          const width = container.clientWidth
          const height = container.clientHeight

          // 计算居中偏移（使节点位于视图中心）
          const centerX = nodeData.x
          const centerY = nodeData.y

          // 使用 dispatchAction 进行视图移动，同时保持适当的缩放比例
          myChart.dispatchAction({
            type: 'graphRoam',
            seriesIndex: 0,
            dx: 0,
            dy: 0,
            zoom: 1.2, // 适当放大，让节点更清晰
            center: [centerX, centerY],
          })
        }
      }
    }

    // 延迟打开详情面板，让聚焦动画完成
    setTimeout(() => {
      selectedNode.value = {
        ...node,
        mastery: masteryMap.value.get(node.id) || 0,
        relatedPoints: getRelatedPoints(node.id),
      }
      selectedNodeId.value = nodeId
      renderGraph()
    }, 300)
  } else {
    // 如果图表未就绪，直接选中节点
    selectedNode.value = {
      ...node,
      mastery: masteryMap.value.get(node.id) || 0,
      relatedPoints: getRelatedPoints(node.id),
    }
    selectedNodeId.value = nodeId
    renderGraph()
  }
}

// 获取关联知识点
const getRelatedPoints = (nodeId: number) => {
  const activeRelations = allRelations.value.filter(
    (relation) => relationFilters[relation.relation] !== false,
  )
  return activeRelations
    .filter((r) => r.source_id === nodeId || r.target_id === nodeId)
    .map((r) => {
      const relatedId = r.source_id === nodeId ? r.target_id : r.source_id
      return allPoints.value.find((p) => p.id === relatedId)
    })
    .filter((p) => p)
    .slice(0, 5)
}

// 应用关系筛选器
const applyRelationFilters = () => {
  renderGraph()
}

// 渲染图谱
const renderGraph = () => {
  if (!myChart || allPoints.value.length === 0) return

  const filteredRelations = allRelations.value.filter(
    (relation) => relationFilters[relation.relation] !== false,
  )

  const connectedNodeIds = new Set<string>()
  filteredRelations.forEach((relation) => {
    connectedNodeIds.add(String(relation.source_id))
    connectedNodeIds.add(String(relation.target_id))
  })

  const nodes = allPoints.value
    .filter((point) => connectedNodeIds.has(String(point.id)))
    .map((point) => {
      const mastery = masteryMap.value.get(point.id) || 0
      const isSelected = String(point.id) === selectedNodeId.value
      const symbolSize = compactMode.value ? 45 : 60
      const fontSize = isSelected ? (compactMode.value ? 20 : 24) : compactMode.value ? 15 : 18

      return {
        id: String(point.id),
        name: point.name,
        symbolSize: symbolSize,
        itemStyle: {
          color: '#fff',
          borderColor: isSelected ? themeColors.high : getMasteryColor(mastery),
          borderWidth: isSelected ? (compactMode.value ? 5 : 6) : compactMode.value ? 2 : 3,
          shadowBlur: isSelected ? (compactMode.value ? 12 : 20) : compactMode.value ? 6 : 10,
          shadowColor: isSelected ? 'rgba(160, 40, 40, 0.4)' : 'rgba(166, 124, 82, 0.2)',
        },
        label: {
          show: !hideLabels.value,
          color: isSelected ? themeColors.high : themeColors.deepBrown,
          fontSize: fontSize,
          fontWeight: isSelected ? 'bold' : 'normal',
          fontFamily: 'STKaiti, serif',
          position: 'inside',
        },
      }
    })

  const links = filteredRelations.map((relation) => {
    const style = getRelationStyle(relation.relation)
    const lineWidth = compactMode.value ? 1.5 : 2
    const fontSize = compactMode.value ? 12 : 15

    return {
      source: String(relation.source_id),
      target: String(relation.target_id),
      label: {
        show: true,
        formatter: relation.relation,
        fontSize: fontSize,
        color: style.color,
        fontFamily: 'STKaiti, serif',
        offset: compactMode.value ? [0, -8] : [0, -10],
      },
      lineStyle: {
        color: style.color,
        width: lineWidth,
        curveness: 0.15,
        type: style.lineType,
      },
      symbol: ['none', 'arrow'],
      symbolSize: compactMode.value ? 4 : 6,
    }
  })

  const forceConfig = compactMode.value
    ? {
        repulsion: 400,
        edgeLength: 120,
        gravity: 0.12,
        friction: 0.1,
        layoutAnimation: true,
      }
    : {
        repulsion: 800,
        edgeLength: 200,
        gravity: 0.08,
        friction: 0.1,
        layoutAnimation: true,
      }

  const option = {
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        force: forceConfig,
        roam: true,
        draggable: true,
        focusNodeAdjacency: false,
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: compactMode.value ? 2.5 : 3, color: '#a02828' },
        },
        lineStyle: {
          color: 'source',
          curveness: 0.15,
          width: compactMode.value ? 1.5 : 2,
        },
        label: {
          show: !hideLabels.value,
          position: 'inside',
          fontSize: compactMode.value ? 11 : 13,
          fontFamily: 'STKaiti, serif',
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, compactMode.value ? 6 : 8],
      },
    ],
    backgroundColor: 'transparent',
  }

  myChart.setOption(option, true)
}

// 加载数据
const loadGraphData = async () => {
  try {
    const graphRes = await getKnowledgeGraph()
    if (graphRes.code === 200) {
      allPoints.value = graphRes.data.nodes
      allRelations.value = graphRes.data.edges
    }

    const userId = getUserId()
    if (userId) {
      const masteryRes = await getUserMastery(parseInt(userId))
      if (masteryRes.code === 200) {
        masteryRes.data.forEach((item: UserMastery) => {
          masteryMap.value.set(item.point_id, item.mastery_score)
        })
      }
    }

    let totalScore = 0
    let mastered = 0
    allPoints.value.forEach((point) => {
      const score = masteryMap.value.get(point.id) || 0
      totalScore += score
      if (score >= 0.4) mastered++
    })

    totalProgress.value =
      allPoints.value.length > 0 ? Math.round((totalScore / allPoints.value.length) * 100) : 0
    masteredCount.value = mastered
    renderGraph()
  } catch (error) {
    console.error('加载知识图谱失败', error)
  }
}

// 节点点击
const onNodeClick = (params: any) => {
  if (params.dataType === 'node') {
    const nodeData = params.data
    const point = allPoints.value.find((p) => String(p.id) === nodeData.id)
    if (point) {
      selectedNode.value = {
        ...point,
        mastery: masteryMap.value.get(point.id) || 0,
        relatedPoints: getRelatedPoints(point.id),
      }
      selectedNodeId.value = String(point.id)
      renderGraph()
    }
  }
}

// 背景点击
const onBackgroundClick = (params: any) => {
  if (!params.target) closeDetail()
}

// 关闭详情
const closeDetail = () => {
  selectedNode.value = null
  selectedNodeId.value = null
  renderGraph()
}

// 跳转到节点
const jumpToNode = (nodeId: number) => {
  closeDetail()
  const point = allPoints.value.find((p) => p.id === nodeId)
  if (point) {
    locateNode(point)
  }
}

// 开始学习
const goToStudy = (node: any) => {
  router.push(`/study/${node.id}`)
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  myChart = echarts.init(chartRef.value)
  loadGraphData()
  myChart.on('click', onNodeClick)
  myChart.getZr().on('click', onBackgroundClick)
}

// 动画结束
const onEnterAnimationEnd = () => {
  showTransition.value = false
}

// 窗口适配
const handleResize = () => {
  myChart?.resize()
}

// 点击外部关闭搜索下拉
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.search-box')) {
    searchResults.value = []
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
  myChart?.dispose()
})
</script>

<style scoped>
/* ==========================================================================
   1. 基础布局与氛围
   ========================================================================== */
.kg-page-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  /* overflow: hidden; */
  margin-bottom: 40px;
  font-family: 'STKaiti', 'No1', serif;
}

.main-content {
  top: 8vh;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

/* 飘动墨粒动画 */
.ink-particles .particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(61, 43, 31, 0.15);
  pointer-events: none;
  animation: inkFloat 15s infinite linear;
  z-index: 1;
}

.p1 {
  width: 30px;
  height: 30px;
  left: 5%;
  top: 20%;
  animation-delay: 0s;
}
.p2 {
  width: 50px;
  height: 50px;
  left: 80%;
  top: 15%;
  animation-delay: -3s;
}
.p3 {
  width: 20px;
  height: 20px;
  left: 40%;
  top: 80%;
  animation-delay: -7s;
}
.p4 {
  width: 40px;
  height: 40px;
  left: 15%;
  top: 60%;
  animation-delay: -5s;
}
.p5 {
  width: 25px;
  height: 25px;
  left: 70%;
  top: 70%;
  animation-delay: -2s;
}
.p6 {
  width: 35px;
  height: 35px;
  left: 90%;
  top: 40%;
  animation-delay: -9s;
}

@keyframes inkFloat {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

/* ==========================================================================
   2. 玻璃容器与底纹
   ========================================================================== */
.kg-glass-wrapper {
  flex: 1;
  margin: 0 40px 40px 40px;
  position: relative;
  border-radius: 40px;
  display: flex;
  overflow: hidden;
  background: rgba(255, 253, 247, 0.88);
  backdrop-filter: blur(25px);
  border: 1.5px solid rgba(166, 124, 82, 0.35);
  box-shadow: 0 25px 60px rgba(90, 57, 33, 0.18);
}

.bg-calligraphy {
  position: absolute;
  right: 8%;
  top: 10%;
  width: 200px;
  writing-mode: vertical-rl;
  pointer-events: none;
  opacity: 0.06;
  font-size: 24px;
  line-height: 2;
  color: #3d2b1f;
  z-index: 1;
}

.card-seal {
  position: absolute;
  bottom: 50px;
  right: 60px;
  width: 100px;
  height: 100px;
  border: 3px solid rgba(160, 40, 40, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(160, 40, 40, 0.6);
  font-size: 28px;
  font-weight: bold;
  transform: rotate(-15deg);
  border-radius: 6px;
  z-index: 2;
  pointer-events: none;
}

.corner-decor {
  position: absolute;
  width: 35px;
  height: 35px;
  border: 3px solid rgba(166, 124, 82, 0.3);
  z-index: 3;
  pointer-events: none;
}
.top-left {
  top: 30px;
  left: 30px;
  border-right: none;
  border-bottom: none;
}
.top-right {
  top: 30px;
  right: 30px;
  border-left: none;
  border-bottom: none;
}
.bottom-left {
  bottom: 30px;
  left: 30px;
  border-right: none;
  border-top: none;
}
.bottom-right {
  bottom: 30px;
  right: 30px;
  border-left: none;
  border-top: none;
}

/* ==========================================================================
   3. 头部标题与搜索框
   ========================================================================== */
.kg-header-actions {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
}

.view-title-box {
  display: flex;
  align-items: center;
  gap: 20px;
}

.view-title {
  font-size: 28px;
  font-weight: bold;
  color: #3d2b1f;
  letter-spacing: 6px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
}

.decoration-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #a67c52, transparent);
}

/* 搜索框样式 - Font Awesome 版本 */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 40px;
  border: 1px solid rgba(166, 124, 82, 0.3);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: #a67c52;
  box-shadow: 0 4px 12px rgba(166, 124, 82, 0.15);
}

.search-icon {
  padding-left: 16px;
  color: #a67c52;
  font-size: 16px;
}

.search-input {
  width: 260px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-family: inherit;
  color: #3d2b1f;
  outline: none;
  border-radius: 40px;
}

.search-input::placeholder {
  color: rgba(61, 43, 31, 0.4);
  font-style: italic;
}

.search-clear {
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 0 12px;
  color: #a67c52;
  transition: color 0.2s;
}

.search-clear:hover {
  color: #a02828;
}

/* 搜索下拉结果 */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: rgba(255, 253, 247, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(166, 124, 82, 0.25);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 360px;
  overflow-y: auto;
  z-index: 30;
}

.search-dropdown::-webkit-scrollbar {
  width: 4px;
}
.search-dropdown::-webkit-scrollbar-track {
  background: rgba(166, 124, 82, 0.1);
  border-radius: 4px;
}
.search-dropdown::-webkit-scrollbar-thumb {
  background: rgba(166, 124, 82, 0.4);
  border-radius: 4px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(166, 124, 82, 0.1);
}

.search-result-item:hover {
  background: rgba(166, 124, 82, 0.1);
}

.result-icon {
  width: 20px;
  color: #a67c52;
  font-size: 14px;
  text-align: center;
}

.result-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #3d2b1f;
}

.result-type {
  font-size: 11px;
  color: #a67c52;
  background: rgba(166, 124, 82, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.result-mastery {
  font-size: 11px;
  font-weight: bold;
  min-width: 36px;
  text-align: right;
}

.search-no-result {
  padding: 12px 16px;
  text-align: center;
  font-size: 13px;
  color: rgba(61, 43, 31, 0.5);
}

.search-no-result i {
  margin-right: 6px;
  color: #a67c52;
}

/* ==========================================================================
   4. 学习统计
   ========================================================================== */
.learning-stats-v2 {
  position: absolute;
  bottom: 40px;
  left: 40px;
  background: rgba(255, 255, 255, 0.9);
  padding: 16px 28px;
  border-radius: 20px;
  border: 1px solid rgba(166, 124, 82, 0.2);
  z-index: 20;
  display: flex;
  align-items: center;
  backdrop-filter: blur(5px);
}

.stat-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.progress-ring-lg {
  position: relative;
  width: 70px;
  height: 70px;
}
.ring-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3.5;
}
.ring-fg {
  fill: none;
  stroke: #a02828;
  stroke-width: 3.5;
  stroke-linecap: round;
  transition: 1s;
}
.inner-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #a02828;
}
.inner-data .num {
  font-size: 22px;
  font-weight: bold;
}
.inner-data .unit {
  font-size: 12px;
}

.stat-text h4 {
  margin: 0;
  font-size: 18px;
  color: #3d2b1f;
}
.stat-text p {
  margin: 5px 0 0 0;
  font-size: 14px;
  color: #8b7355;
}
.stat-text b {
  color: #a02828;
}

/* ==========================================================================
   5. 详情面板
   ========================================================================== */
.elegant-detail-panel {
  position: absolute;
  top: 40px;
  right: 40px;
  bottom: 40px;
  width: 360px;
  background: #fdfaf7;
  border: 2px solid #a67c52;
  border-radius: 20px;
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.panel-paper-texture {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.3;
  background-image: url('https://www.transparenttextures.com/patterns/handmade-paper.png');
}

.panel-content {
  position: relative;
  z-index: 2;
  padding: 40px 25px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.close-panel-x {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 26px;
  color: #a67c52;
  cursor: pointer;
  z-index: 3;
}

.badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.category-tag {
  background: rgba(166, 124, 82, 0.15);
  color: #a67c52;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}
.status-tag {
  font-weight: bold;
  font-size: 14px;
}

.node-main-title {
  font-size: 28px;
  margin: 0 0 15px 0;
  color: #3d2b1f;
  text-align: center;
  border-bottom: 1.5px solid rgba(166, 124, 82, 0.2);
  padding-bottom: 15px;
}
.ornament-divider {
  height: 6px;
  background: radial-gradient(circle, #a67c52 2px, transparent 2px);
  background-size: 12px 12px;
  margin-bottom: 20px;
  opacity: 0.4;
}
.description-box {
  background: rgba(166, 124, 82, 0.05);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 3px solid #a67c52;
}
.description-box p {
  font-size: 20px;
  line-height: 1.6;
  color: #5a3921;
  margin: 0;
}

.mastery-info {
  margin-bottom: 25px;
}
.info-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: bold;
}
.progress-track {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.related-points {
  margin-bottom: 25px;
}
.related-title {
  font-size: 20px;
  font-weight: bold;
  color: #a67c52;
  margin-bottom: 12px;
}
.related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.related-tag {
  background: rgba(166, 124, 82, 0.1);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 16px;
  color: #5a3921;
  cursor: pointer;
  transition: all 0.2s;
}
.related-tag:hover {
  background: rgba(166, 124, 82, 0.3);
  transform: translateY(-1px);
}

.action-footer {
  margin-top: auto;
  padding-top: 20px;
}
.study-action-btn {
  width: 100%;
  padding: 14px;
  background: #a02828;
  color: #fff;
  border: none;
  border-radius: 40px;
  font-size: 16px;
  font-weight: bold;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.study-action-btn i {
  font-size: 14px;
}
.study-action-btn:hover {
  background: #801818;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(160, 40, 40, 0.3);
}

/* ==========================================================================
   6. 图例与筛选器
   ========================================================================== */
.relation-legend {
  position: absolute;
  bottom: 40px;
  right: 40px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  padding: 15px 20px;
  border-radius: 20px;
  border: 1px solid rgba(166, 124, 82, 0.25);
  z-index: 20;
  min-width: 180px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.relation-legend::-webkit-scrollbar {
  width: 4px;
}
.relation-legend::-webkit-scrollbar-track {
  background: rgba(166, 124, 82, 0.1);
  border-radius: 4px;
}
.relation-legend::-webkit-scrollbar-thumb {
  background: rgba(166, 124, 82, 0.4);
  border-radius: 4px;
}

.legend-header {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 14px;
  color: #3d2b1f;
  border-left: 3px solid #a67c52;
  padding-left: 8px;
}
.legend-divider {
  height: 1px;
  background: rgba(166, 124, 82, 0.2);
  margin: 12px 0;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #5a3921;
}
.filter-section .legend-item {
  margin-bottom: 6px;
}
.filter-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #a67c52;
}
.filter-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #5a3921;
}
.filter-label i {
  color: #a67c52;
  font-size: 12px;
  width: 16px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.color-dot.high {
  background: #a02828;
}
.color-dot.medium {
  background: #a67c52;
}
.color-dot.low {
  background: #d4b483;
}
.color-dot.none {
  background: #c0c0c0;
}

.dot {
  width: 24px;
  height: 2px;
  display: inline-block;
}
.s1 {
  border-top: 2px solid #a67c52;
}
.s2 {
  border-top: 2px dashed #a67c52;
}
.s3 {
  border-top: 2px solid #a02828;
}
.s4 {
  border-top: 2px dotted #d4b483;
}
.s5 {
  border-top: 2px solid #a02828;
}
.s6 {
  border-top: 2px dotted #a67c52;
}

/* 动画 */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

.kg-chart-container {
  flex: 1;
  z-index: 5;
  width: 100%;
  height: 100%;
}

/* 响应式 */
@media (max-width: 1024px) {
  .elegant-detail-panel {
    width: 320px;
    right: 20px;
    top: 20px;
    bottom: 20px;
  }
  .bg-calligraphy {
    display: none;
  }
  .kg-glass-wrapper {
    margin: 0 20px 20px 20px;
  }
  .view-title {
    font-size: 22px;
  }
  .relation-legend {
    max-width: 160px;
    padding: 12px 16px;
  }
  .legend-item {
    font-size: 11px;
  }
  .search-input {
    width: 180px;
  }
  .kg-header-actions {
    gap: 20px;
  }
  .decoration-line {
    width: 40px;
  }
}

@media (max-width: 768px) {
  .relation-legend {
    display: none;
  }
  .learning-stats-v2 {
    left: 20px;
    bottom: 20px;
    padding: 12px 20px;
  }
  .stat-text h4 {
    font-size: 14px;
  }
  .stat-text p {
    font-size: 12px;
  }
  .progress-ring-lg {
    width: 50px;
    height: 50px;
  }
  .search-input {
    width: 140px;
  }
  .decoration-line {
    width: 20px;
  }
  .view-title {
    font-size: 18px;
    letter-spacing: 3px;
  }
  .kg-header-actions {
    gap: 12px;
  }
}
</style>
