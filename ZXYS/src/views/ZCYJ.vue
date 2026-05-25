<template>
  <BreadcrumbNav title="中成药集" />
  <div class="medicine-container">
    <!-- 主要内容区域 -->
    <main class="main-content" ref="mainContent">
      <!-- 搜索框容器 -->
      <div class="search-container" :class="{ hidden: showDetail }">
        <input
          type="text"
          class="search-input"
          placeholder="搜索中成药名称、功效或主治..."
          v-model="searchInput"
          @keypress.enter="performSearch"
        />
        <button class="search-button" @click="performSearch">搜索</button>
      </div>

      <!-- 列表容器 -->
      <div class="list-wrapper" :class="{ hidden: showDetail }">
        <div class="medicine-list">
          <div
            v-for="medicine in paginatedData"
            :key="medicine.Name"
            class="medicine-item"
            @click="showMedicineDetail(medicine)"
          >
            <div class="medicine-header">
              <div class="medicine-name">{{ medicine.Name }}</div>
              <div class="medicine-attending">{{ medicine.Attending }}</div>
            </div>
          </div>
          <div v-if="filteredData.length === 0 && !loading" class="no-results">
            没有找到符合条件的中成药
          </div>
          <div v-if="loading" class="no-results">加载中...</div>
        </div>

        <!-- 分页器 -->
        <div v-if="totalPages > 1 && filteredData.length > 0" class="pagination">
          <button
            class="page-btn prev-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="page-num"
              :class="{ active: page === currentPage }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            <span v-if="showEllipsisEnd" class="page-ellipsis">...</span>
            <button
              v-if="totalPages > 5 && currentPage < totalPages - 2"
              class="page-num"
              @click="changePage(totalPages)"
            >
              {{ totalPages }}
            </button>
          </div>
          <button
            class="page-btn next-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>

      <!-- 详情面板容器 -->
      <div class="detail-container" :style="{ height: detailHeight }">
        <div class="detail-panel" :class="{ active: showDetail }">
          <div class="detail-panel-bg"></div>
          <div class="detail-panel-content">
            <div class="detail-panel-header">
              <div>
                <div class="detail-panel-title">{{ currentMedicine?.Name || '' }}</div>
              </div>
              <button class="close-button" @click="closeDetailPanel">×</button>
            </div>

            <!-- 处方区域 -->
            <div class="detail-section">
              <div class="detail-title">处方</div>
              <div class="ingredient-grid">
                <div
                  v-for="(item, idx) in currentMedicine?.Prescription || []"
                  :key="idx"
                  class="ingredient-card"
                >
                  <span class="ingredient-name">{{ item.MedicineName }}</span>
                  <span class="ingredient-amount">{{ item.Amount }}{{ item.Unit }}</span>
                </div>
              </div>
            </div>

            <!-- 制法区域 -->
            <div class="detail-section">
              <div class="detail-title">制法</div>
              <div class="detail-text" v-html="currentMedicine?.Recipe || '暂无信息'"></div>
            </div>

            <!-- 主治区域 -->
            <div class="detail-section">
              <div class="detail-title">主治</div>
              <div class="detail-text" v-html="currentMedicine?.Attending || '暂无信息'"></div>
            </div>

            <!-- 性状区域 -->
            <div class="detail-section">
              <div class="detail-title">性状</div>
              <div class="detail-text" v-html="currentMedicine?.SAP1 || '暂无信息'"></div>
            </div>

            <!-- 用法与用量区域 -->
            <div class="detail-section">
              <div class="detail-title">用法与用量</div>
              <div class="detail-text" v-html="currentMedicine?.UAD || '暂无信息'"></div>
            </div>

            <!-- 注意事项区域 -->
            <div class="detail-section">
              <div class="detail-title">注意事项</div>
              <div class="detail-text" v-html="currentMedicine?.Precautions || '暂无信息'"></div>
            </div>

            <!-- 规格区域 -->
            <div class="detail-section">
              <div class="detail-title">规格</div>
              <div class="detail-text" v-html="currentMedicine?.Specifications || '暂无信息'"></div>
            </div>

            <!-- 贮藏区域 -->
            <div class="detail-section">
              <div class="detail-title">贮藏</div>
              <div class="detail-text" v-html="currentMedicine?.SAP2 || '暂无信息'"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

const router = useRouter()

// 数据状态
const medicineData = ref([])
const searchInput = ref('')
const searchTerm = ref('')
const loading = ref(true)
const showDetail = ref(false)
const currentMedicine = ref(null)
const detailHeight = ref('0px')

// 分页相关
const currentPage = ref(1)
const pageSize = 24

// DOM引用（背景滚动用）
const brakePoint = ref(null)

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchTerm.value.trim()) return medicineData.value
  const term = searchTerm.value.toLowerCase()
  return medicineData.value.filter(
    (medicine) =>
      medicine.Name.toLowerCase().includes(term) || medicine.Attending.toLowerCase().includes(term),
  )
})

// 分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredData.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize))

// 显示的页码数组
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)

  if (total > 5) {
    if (current <= 3) {
      start = 1
      end = 5
    } else if (current >= total - 2) {
      start = total - 4
      end = total
    }
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 是否显示结尾省略号
const showEllipsisEnd = computed(() => {
  return totalPages.value > 5 && currentPage.value < totalPages.value - 2
})

// 加载中成药数据
const loadMedicineData = async () => {
  try {
    loading.value = true
    const response = await fetch('/ZCYJ/data.json')
    const data = await response.json()
    medicineData.value = data
  } catch (error) {
    console.error('加载中成药数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 执行搜索
const performSearch = () => {
  searchTerm.value = searchInput.value.trim()
  currentPage.value = 1
  if (
    currentMedicine.value &&
    !filteredData.value.some((m) => m.Name === currentMedicine.value.Name)
  ) {
    closeDetailPanel()
  }
}

// 切换页码
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

// 显示中成药详情
const showMedicineDetail = async (medicine) => {
  if (currentMedicine.value?.Name === medicine.Name) return

  currentMedicine.value = medicine
  showDetail.value = true

  await nextTick()

  const detailPanelEl = document.querySelector('.detail-panel')
  if (detailPanelEl) {
    detailHeight.value = detailPanelEl.scrollHeight + 'px'
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 关闭详情面板
const closeDetailPanel = async () => {
  showDetail.value = false
  detailHeight.value = '0'
  currentMedicine.value = null

  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 背景图滚动效果
let rafId = null
const updateBgPosition = () => {
  if (!brakePoint.value) return

  const bgBg = document.querySelector('.BgBg')
  if (!bgBg) return

  const brakePointRect = brakePoint.value.getBoundingClientRect()
  const scrollY = window.scrollY
  const bgBgHeight = bgBg.offsetHeight

  const bgBgBottom = scrollY + bgBgHeight
  const dividerTop = brakePointRect.top + scrollY

  if (bgBgBottom >= dividerTop) {
    const pushDistance = bgBgBottom - dividerTop
    bgBg.style.transform = `translateY(${-pushDistance}px)`
  } else {
    bgBg.style.transform = 'translateY(0)'
  }
}

const handleScroll = () => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(updateBgPosition)
}

// 设置刹车点位置
const setBrakePointPosition = () => {
  if (!brakePoint.value) return
  const dividerSection = document.querySelector('.divider-section')
  if (dividerSection) {
    const dividerRect = dividerSection.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    brakePoint.value.style.top = scrollTop + dividerRect.top + 'px'
  }
}

onMounted(() => {
  loadMedicineData()
  setBrakePointPosition()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', setBrakePointPosition)
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', setBrakePointPosition)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
/* === 基础重置 === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* === 背景容器样式 === */
.medicine-container {
  font-family: 'NO3';
  background-repeat: repeat;
  background-size: 200px 200px;
  background-attachment: fixed;
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* === 主要内容区域 === */
.main-content {
  flex: 1;
  width: 100%;
  padding: 120px 0 40px;
  min-height: 100vh;
  position: relative;
}

/* 搜索框样式 */
.search-container {
  width: 100%;
  margin-bottom: 30px;
  position: relative;
  display: flex;
  align-items: center;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 1;
  transform: translateY(0);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 5%;
}

.search-container.hidden {
  opacity: 0;
  transform: translateY(-100px);
  height: 0;
  margin-bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #8b4513;
  border-radius: 15px 0 0 15px;
  font-size: 24px;
  font-family: 'NO3';
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  height: 70px;
  border-right: none;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 2px 15px rgba(139, 69, 19, 0.3);
  border-color: #6b3410;
}

.search-button {
  background-color: #8b4513;
  font-family: 'NO3';
  color: white;
  border: none;
  border-radius: 0 15px 15px 0;
  padding: 0 20px;
  width: 150px;
  height: 70px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-button:hover {
  background-color: #6b3410;
}

.search-button:active {
  transform: scale(0.98);
}

/* 中成药列表容器 */
.list-wrapper {
  width: 100%;
  padding: 0 5%;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 1;
  transform: translateY(0);
  margin: 0 auto;
}

.list-wrapper.hidden {
  opacity: 0;
  transform: translateY(-100px);
  height: 0;
  overflow: hidden;
  margin-top: 0;
  pointer-events: none;
}

.medicine-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
  width: 100%;
}

.medicine-item {
  background-image: url('/public/ZCYJ/ZCYJBg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  aspect-ratio: 5/3;
}

.medicine-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.2);
}

.medicine-header {
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.7);
  color: #6b3410;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.medicine-name {
  font-size: 30px;
  margin-bottom: 5px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
}

.medicine-attending {
  font-size: 20px;
  opacity: 0.8;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #8b4513;
  font-size: 18px;
  grid-column: 1 / -1;
}

/* 分页器样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 15px;
  flex-wrap: wrap;
}

.page-btn {
  background-color: #f5e6d3;
  border: 1px solid #8b4513;
  color: #8b4513;
  padding: 8px 20px;
  border-radius: 25px;
  font-size: 16px;
  font-family: 'NO3';
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background-color: #8b4513;
  color: white;
  transform: translateY(-2px);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-num {
  min-width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid #8b4513;
  color: #8b4513;
  font-size: 16px;
  font-family: 'NO3';
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-num:hover {
  background-color: rgba(139, 69, 19, 0.1);
  transform: translateY(-2px);
}

.page-num.active {
  background-color: #8b4513;
  color: white;
  border-color: #8b4513;
}

.page-ellipsis {
  color: #8b4513;
  font-size: 16px;
  padding: 0 4px;
}

/* 详情面板容器 */
.detail-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  transition: height 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 5%;
}

.detail-panel {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  opacity: 0;
  transform: translateY(100px);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.detail-panel-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/public/ZCYJ/ZCYJBg.png');
  background-size: cover;
  opacity: 0.1;
  pointer-events: none;
  z-index: 0;
}

.detail-panel.active {
  opacity: 1;
  transform: translateY(0);
}

.detail-panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.detail-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-panel-title {
  font-size: 50px;
  color: #8b4513;
  font-weight: 200;
}

.close-button {
  background: none;
  border: none;
  font-size: 32px;
  color: #8b4513;
  cursor: pointer;
  padding: 5px 10px;
  transition: transform 0.2s;
}

.close-button:hover {
  transform: scale(1.1);
}

/* 详情区域样式 */
.detail-section {
  margin-bottom: 30px;
}

.detail-title {
  font-weight: 200px;
  color: #8b4513;
  margin-bottom: 15px;
  font-size: 40px;
  display: flex;
  align-items: center;
}

.detail-title::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 32px;
  background-color: #8b4513;
  margin-right: 12px;
  border-radius: 4px;
}

/* 处方网格布局 - 标签化卡片样式 */
.ingredient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.ingredient-card {
  background-color: rgba(139, 69, 19, 0.08);
  padding: 12px 18px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.ingredient-card:hover {
  background-color: rgba(139, 69, 19, 0.15);
  transform: translateX(5px);
}

.ingredient-name {
  font-size: 26px;
  font-weight: 500;
  color: #5a2e0e;
}

.ingredient-amount {
  font-size: 24px;
  color: #8b4513;
  font-weight: bold;
}

/* 文本内容样式 */
.detail-text {
  font-size: 28px;
  line-height: 1.6;
  color: #333;
  padding: 10px 0 10px 20px;
  background-color: rgba(139, 69, 19, 0.03);
  border-radius: 10px;
}

/* 装饰元素 */
.ZS010 {
  z-index: -2;
  width: 300px;
  position: fixed;
  top: 100px;
  left: 0;
  pointer-events: none;
}

.ZS008 {
  z-index: -2;
  width: 300px;
  position: fixed;
  top: 100px;
  right: 0;
  pointer-events: none;
}

.BgBg {
  z-index: -2;
  position: fixed;
  width: 100%;
  bottom: 0;
  left: 0;
  pointer-events: none;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

/* 分隔线 */
.divider-section {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 40px 0;
  position: relative;
}

.divider-line {
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #8b4513 20%, #8b4513 80%, transparent 100%);
  position: relative;
}

.divider-line::before,
.divider-line::after {
  content: '❖';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #8b4513;
  font-size: 20px;
}

.divider-line::before {
  left: -15px;
}

.divider-line::after {
  right: -15px;
}

/* 底部文本 */
.foot-text {
  z-index: 5;
  width: 100%;
  height: 50%;
  color: #8b4513;
  align-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
  box-sizing: border-box;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.5em;
  line-height: 2em;
  font-family: 'No1', sans-serif;
  font-size: 25px;
  transition: all 0.5s ease;
}

/* 页脚 */
.footer {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px 0;
  text-align: center;
  margin: 0;
}

.footer p {
  margin: 5px 0;
  padding: 0 20px;
  font-size: 20px;
  font-family: 'NO3';
}

/* 刹车点 */
.brake-point {
  position: absolute;
  width: 100%;
  height: 1px;
  top: 100vh;
  left: 0;
  pointer-events: none;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .medicine-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 1024px) {
  .detail-panel {
    padding: 25px;
  }

  .detail-panel-title {
    font-size: 40px;
  }

  .detail-title {
    font-size: 32px;
  }

  .detail-title::before {
    height: 28px;
  }

  .ingredient-name {
    font-size: 22px;
  }

  .ingredient-amount {
    font-size: 20px;
  }

  .detail-text {
    font-size: 22px;
  }
}

@media (max-width: 768px) {
  .medicine-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .ZS010,
  .ZS008 {
    top: 110px;
  }

  .main-content {
    padding-top: 130px;
  }

  .detail-panel {
    padding: 20px;
  }

  .detail-panel-title {
    font-size: 32px;
  }

  .detail-title {
    font-size: 28px;
  }

  .detail-title::before {
    height: 24px;
    width: 6px;
  }

  .ingredient-grid {
    grid-template-columns: 1fr;
  }

  .ingredient-name {
    font-size: 18px;
  }

  .ingredient-amount {
    font-size: 18px;
  }

  .detail-text {
    font-size: 18px;
    padding-left: 12px;
  }

  .page-btn {
    padding: 6px 16px;
    font-size: 14px;
  }

  .page-num {
    min-width: 34px;
    height: 34px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .medicine-list {
    grid-template-columns: 1fr;
  }

  .medicine-name {
    font-size: 20px;
  }

  .medicine-attending {
    font-size: 14px;
  }

  .search-input {
    padding: 10px 15px;
    font-size: 16px;
    height: 50px;
  }

  .search-button {
    height: 50px;
    font-size: 16px;
    width: 100px;
  }

  .detail-panel {
    padding: 15px;
  }

  .detail-panel-title {
    font-size: 24px;
  }

  .detail-title {
    font-size: 20px;
    margin-bottom: 10px;
  }

  .detail-title::before {
    height: 20px;
    width: 5px;
    margin-right: 10px;
  }

  .ingredient-card {
    padding: 8px 12px;
  }

  .ingredient-name {
    font-size: 15px;
  }

  .ingredient-amount {
    font-size: 14px;
  }

  .detail-text {
    font-size: 14px;
    padding-left: 10px;
  }

  .pagination {
    gap: 8px;
  }

  .page-btn {
    padding: 4px 12px;
    font-size: 12px;
  }

  .page-num {
    min-width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>
