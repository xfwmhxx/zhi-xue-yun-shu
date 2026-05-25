<template>
  <BreadcrumbNav title="中医辞典"></BreadcrumbNav>
  <div class="app-container">
    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="search-section">
        <!-- 搜索框 -->
        <div class="search-container">
          <input
            type="text"
            class="search-box"
            placeholder="请输入中医术语、药方、穴位名称..."
            v-model="searchQuery"
            @keypress.enter="handleSearch"
          />
          <button class="search-button" @click="handleSearch">搜索</button>
          <button class="cancel-search-button" v-show="isSearching" @click="cancelSearch">
            取消搜索
          </button>
        </div>

        <!-- 搜索结果区域 -->
        <div class="search-results-container" v-show="isSearching">
          <div class="search-results-header">
            <h2 class="search-results-title">搜索结果</h2>
            <div class="search-results-count">{{ searchResults.length }} 条结果</div>
          </div>
          <div class="search-results-list" :class="{ empty: searchResults.length === 0 }">
            <template v-if="searchResults.length === 0">
              <div class="no-data-text">没有找到匹配的结果</div>
            </template>
            <template v-else>
              <div
                v-for="result in searchResults"
                :key="result.Third"
                class="search-result-item"
                @click="showDetailView(result.Third)"
              >
                {{ result.Third }}
              </div>
            </template>
          </div>
        </div>

        <!-- 分类导航 -->
        <div class="category-nav" v-show="!isSearching && !activePhrase">
          <div class="category-tabs">
            <button
              class="category-tab"
              :class="{ active: activeTab === 'stroke' }"
              @click="switchTab('stroke')"
            >
              按笔画
            </button>
            <button
              class="category-tab"
              :class="{ active: activeTab === 'pinyin' }"
              @click="switchTab('pinyin')"
            >
              按拼音
            </button>
          </div>

          <!-- 分类面包屑导航 -->
          <div class="category-breadcrumb">
            <template v-for="(item, index) in breadcrumbPath" :key="index">
              <span v-if="index > 0" class="category-breadcrumb-separator">></span>
              <div class="category-breadcrumb-item" @click="navigateToBreadcrumb(index)">
                {{ item }}
              </div>
            </template>
          </div>

          <!-- 笔画分类 -->
          <div class="category-content" v-show="activeTab === 'stroke'">
            <div class="stroke-tags" v-show="!activeStrokeTag">
              <div
                v-for="tag in strokeTags"
                :key="tag.stroke"
                class="stroke-tag"
                :class="{ active: activeStrokeTag === tag.stroke }"
                @click="selectStrokeTag(tag.stroke, tag.name)"
              >
                {{ tag.name }}
              </div>
            </div>

            <!-- 字列表容器 -->
            <div
              class="character-list"
              v-show="activeStrokeTag && !activeCharacter"
              :class="{ empty: currentCharacters.length === 0 }"
            >
              <template v-if="currentCharacters.length === 0">
                <div class="no-data-text">暂无数据</div>
              </template>
              <template v-else>
                <div
                  v-for="char in currentCharacters"
                  :key="char"
                  class="character-item"
                  @click="selectCharacter(char)"
                >
                  {{ char }}
                </div>
              </template>
            </div>

            <!-- 词组列表容器 -->
            <div
              class="phrase-list"
              v-show="activeCharacter"
              :class="{ empty: currentPhrases.length === 0 }"
            >
              <template v-if="currentPhrases.length === 0">
                <div class="no-data-text">暂无数据</div>
              </template>
              <template v-else>
                <div
                  v-for="phrase in currentPhrases"
                  :key="phrase"
                  class="phrase-item"
                  @click="showDetailView(phrase)"
                >
                  {{ phrase }}
                </div>
              </template>
            </div>
          </div>

          <!-- 拼音分类 -->
          <div class="category-content" v-show="activeTab === 'pinyin'">
            <div class="pinyin-tags" v-show="!activePinyinTag">
              <div
                v-for="tag in pinyinTags"
                :key="tag.pinyin"
                class="pinyin-tag"
                :class="{ active: activePinyinTag === tag.pinyin }"
                @click="selectPinyinTag(tag.pinyin, tag.name)"
              >
                {{ tag.name }}
              </div>
            </div>

            <!-- 拼音字列表容器 -->
            <div
              class="character-list"
              v-show="activePinyinTag && !activeCharacter"
              :class="{ empty: currentPinyinCharacters.length === 0 }"
            >
              <template v-if="currentPinyinCharacters.length === 0">
                <div class="no-data-text">暂无数据</div>
              </template>
              <template v-else>
                <div
                  v-for="char in currentPinyinCharacters"
                  :key="char"
                  class="character-item"
                  @click="selectCharacter(char)"
                >
                  {{ char }}
                </div>
              </template>
            </div>

            <!-- 拼音词组列表容器 -->
            <div
              class="phrase-list"
              v-show="activeCharacter"
              :class="{ empty: currentPhrases.length === 0 }"
            >
              <template v-if="currentPhrases.length === 0">
                <div class="no-data-text">暂无数据</div>
              </template>
              <template v-else>
                <div
                  v-for="phrase in currentPhrases"
                  :key="phrase"
                  class="phrase-item"
                  @click="showDetailView(phrase)"
                >
                  {{ phrase }}
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- 详情页 -->
        <div class="detail-view" v-show="activePhrase">
          <div class="detail-header-container">
            <a href="javascript:void(0);" class="detail-back-button" @click="backFromDetail"
              >返回</a
            >
            <h1 class="detail-title">{{ detailData?.Third || '' }}</h1>
          </div>

          <div class="detail-content">
            <div class="detail-section">
              <h2 class="detail-section-title">分类</h2>
              <div class="detail-section-content">
                {{ processTextWithLineBreaks(detailData?.taxon) || '暂无分类信息' }}
              </div>
            </div>

            <div class="detail-section">
              <h2 class="detail-section-title">医书记载</h2>
              <div class="detail-section-content">
                {{ processTextWithLineBreaks(detailData?.document) || '暂无医书记载' }}
              </div>
            </div>

            <div class="detail-section">
              <h2 class="detail-section-title">名词解释</h2>
              <div class="detail-section-content">
                {{ processTextWithLineBreaks(detailData?.explain) || '暂无名词解释' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import { Back } from 'gsap'

// DOM 元素引用 (用于滚动效果)
const bgBg = ref(null)
const brakePoint = ref(null)
const dividerSection = ref(null)

// 状态变量
const dictionaryData = ref([])
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref([])
const activeTab = ref('stroke')
const activeStrokeTag = ref(null)
const activePinyinTag = ref(null)
const activeCharacter = ref(null)
const activePhrase = ref(null)
const breadcrumbPath = ref(['笔画表'])

// 计算属性
const strokeTags = computed(() => {
  if (!dictionaryData.value.length) return []
  const strokes = [
    ...new Set(dictionaryData.value.filter((item) => item.type === 1).map((item) => item.First)),
  ]
  return strokes.map((s) => ({
    stroke: s.replace('画', ''),
    name: s,
  }))
})

const pinyinTags = computed(() => {
  if (!dictionaryData.value.length) return []
  const pinyins = [
    ...new Set(dictionaryData.value.filter((item) => item.type === 2).map((item) => item.First)),
  ]
  return pinyins.map((p) => ({
    pinyin: p,
    name: p,
  }))
})

const currentCharacters = computed(() => {
  if (!activeStrokeTag.value) return []
  const chars = [
    ...new Set(
      dictionaryData.value
        .filter((item) => item.type === 1 && item.First === activeStrokeTag.value + '画')
        .map((item) => item.Second),
    ),
  ]
  return chars.length ? chars : ['暂无数据']
})

const currentPinyinCharacters = computed(() => {
  if (!activePinyinTag.value) return []
  const chars = [
    ...new Set(
      dictionaryData.value
        .filter((item) => item.type === 2 && item.First === activePinyinTag.value)
        .map((item) => item.Second),
    ),
  ]
  return chars.length ? chars : ['暂无数据']
})

const currentPhrases = computed(() => {
  if (!activeCharacter.value) return []
  let phrases = []
  if (activeTab.value === 'stroke') {
    phrases = dictionaryData.value
      .filter((item) => item.type === 1 && item.Second === activeCharacter.value)
      .map((item) => item.Third)
  } else {
    phrases = dictionaryData.value
      .filter((item) => item.type === 2 && item.Second === activeCharacter.value)
      .map((item) => item.Third)
  }
  return phrases.length ? phrases : ['暂无数据']
})

const detailData = computed(() => {
  if (!activePhrase.value) return null
  if (isSearching.value) {
    return dictionaryData.value.find((item) => item.Third === activePhrase.value)
  } else if (activeTab.value === 'stroke') {
    return dictionaryData.value.find((item) => item.type === 1 && item.Third === activePhrase.value)
  } else {
    return dictionaryData.value.find((item) => item.type === 2 && item.Third === activePhrase.value)
  }
})

// 滚动效果函数
const setBrakePointPosition = () => {
  if (!dividerSection.value || !brakePoint.value) return
  const dividerRect = dividerSection.value.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  brakePoint.value.style.top = scrollTop + dividerRect.top + 'px'
}

const updateBgPosition = () => {
  if (!bgBg.value || !brakePoint.value) return
  const brakePointRect = brakePoint.value.getBoundingClientRect()
  const scrollY = window.scrollY
  const bgBgHeight = bgBg.value.offsetHeight
  const bgBgBottom = scrollY + bgBgHeight
  const dividerTop = brakePointRect.top + scrollY

  if (bgBgBottom >= dividerTop) {
    bgBg.value.style.transform = `translateY(${-(bgBgBottom - dividerTop)}px)`
  } else {
    bgBg.value.style.transform = 'translateY(0)'
  }
}

const handleScroll = () => {
  setBrakePointPosition()
  updateBgPosition()
}

// 数据加载
const loadDictionaryData = async () => {
  try {
    const response = await fetch('/ZYCD/data.json')
    if (!response.ok) throw new Error('网络响应不正常')
    dictionaryData.value = await response.json()
    initPage()
  } catch (error) {
    console.error('加载数据失败:', error)
    alert('加载数据失败，请稍后再试')
  }
}

// 初始化
const initPage = () => {
  setBrakePointPosition()
  window.addEventListener('resize', setBrakePointPosition)
  window.addEventListener('scroll', handleScroll)
}

// 搜索相关
const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (query === '') {
    alert('请输入搜索内容')
    return
  }

  isSearching.value = true
  searchResults.value = dictionaryData.value.filter(
    (item) => item.Third && item.Third.includes(query),
  )
  breadcrumbPath.value = ['搜索结果']
  activePhrase.value = null
  activeCharacter.value = null
  activeStrokeTag.value = null
  activePinyinTag.value = null
}

const cancelSearch = () => {
  isSearching.value = false
  searchQuery.value = ''
  searchResults.value = []
  breadcrumbPath.value = ['笔画表']
  activeTab.value = 'stroke'
  activeStrokeTag.value = null
  activePinyinTag.value = null
  activeCharacter.value = null
  activePhrase.value = null
}

// 分类导航相关
const switchTab = (tab) => {
  activeTab.value = tab
  activeStrokeTag.value = null
  activePinyinTag.value = null
  activeCharacter.value = null
  activePhrase.value = null
  breadcrumbPath.value = [tab === 'stroke' ? '笔画表' : '拼音表']
}

const selectStrokeTag = (stroke, name) => {
  activeStrokeTag.value = stroke
  activeCharacter.value = null
  activePhrase.value = null
  breadcrumbPath.value = ['笔画表', name]
}

const selectPinyinTag = (pinyin, name) => {
  activePinyinTag.value = pinyin
  activeCharacter.value = null
  activePhrase.value = null
  breadcrumbPath.value = ['拼音表', name]
}

const selectCharacter = (char) => {
  activeCharacter.value = char
  activePhrase.value = null
  if (activeTab.value === 'stroke') {
    breadcrumbPath.value = ['笔画表', breadcrumbPath.value[1], char]
  } else {
    breadcrumbPath.value = ['拼音表', breadcrumbPath.value[1], char]
  }
}

const showDetailView = (phrase) => {
  activePhrase.value = phrase
  if (isSearching.value) {
    breadcrumbPath.value = ['搜索结果', phrase]
  } else if (activeTab.value === 'stroke') {
    breadcrumbPath.value = ['笔画表', breadcrumbPath.value[1], activeCharacter.value, phrase]
  } else {
    breadcrumbPath.value = ['拼音表', breadcrumbPath.value[1], activeCharacter.value, phrase]
  }
}

const backFromDetail = () => {
  if (activePhrase.value) {
    activePhrase.value = null
    breadcrumbPath.value.pop()
  }
}

const navigateToBreadcrumb = (index) => {
  const targetPath = breadcrumbPath.value.slice(0, index + 1)
  breadcrumbPath.value = targetPath

  if (targetPath.length === 1) {
    // 返回主标签
    if (targetPath[0] === '搜索结果') {
      isSearching.value = true
      activeTab.value = 'stroke'
      activeStrokeTag.value = null
      activePinyinTag.value = null
      activeCharacter.value = null
      activePhrase.value = null
    } else {
      isSearching.value = false
      activeTab.value = targetPath[0] === '笔画表' ? 'stroke' : 'pinyin'
      activeStrokeTag.value = null
      activePinyinTag.value = null
      activeCharacter.value = null
      activePhrase.value = null
    }
  } else if (targetPath.length === 2) {
    // 返回笔画/拼音标签
    isSearching.value = false
    if (targetPath[0] === '笔画表') {
      activeTab.value = 'stroke'
      const strokeName = targetPath[1]
      const strokeNum = strokeName.replace('画', '')
      activeStrokeTag.value = strokeNum
      activePinyinTag.value = null
      activeCharacter.value = null
      activePhrase.value = null
    } else if (targetPath[0] === '拼音表') {
      activeTab.value = 'pinyin'
      activePinyinTag.value = targetPath[1]
      activeStrokeTag.value = null
      activeCharacter.value = null
      activePhrase.value = null
    }
  } else if (targetPath.length === 3) {
    // 返回字列表
    isSearching.value = false
    activeCharacter.value = targetPath[2]
    activePhrase.value = null
  }
}

// 工具函数
const processTextWithLineBreaks = (text) => {
  if (typeof text !== 'string') return text
  return text.replace(/<br>/g, '\n')
}

// 生命周期
onMounted(() => {
  bgBg.value = document.querySelector('.BgBg')
  brakePoint.value = document.querySelector('.brake-point')
  dividerSection.value = document.querySelector('.divider-section')
  loadDictionaryData()
  window.scrollTo(0, 0)
})
</script>

<style scoped>
/* === 基础重置 === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'NO3';
}

/* === 详情页标题栏 === */
.detail-header {
  width: 100%;
  height: 100px;
  background-color: rgba(139, 69, 19, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  padding: 0 5%;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-top-row {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.back-button {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-size: 18px;
  font-family: 'NO3';
  position: absolute;
  left: 5%;
}

.back-button::before {
  content: '←';
  margin-right: 8px;
  font-size: 20px;
}

.title-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.detail-header-title {
  font-family: 'No3', sans-serif;
  font-size: 32px;
  color: white;
  letter-spacing: 2px;
  text-align: center;
}

.breadcrumb-row {
  width: 100%;
  margin-top: 8px;
  padding-left: 5%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-family: 'NO3';
  font-size: 16px;
  color: white;
}

.breadcrumb a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  margin: 0 5px;
}

.breadcrumb a:hover {
  color: white;
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.5);
}

.breadcrumb-current {
  font-weight: bold;
  color: white;
}

/* === 主要内容区域 === */
.main-content {
  flex: 1;
  width: 100%;
  padding-top: 150px;
  padding-bottom: 50px;
}

/* === 搜索区域 === */
.search-section {
  width: 100%;
  max-width: 900px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

/* === 搜索框样式 === */
.search-container {
  position: relative;
  width: 100%;
  margin-bottom: 30px;
}

.search-box {
  width: 100%;
  padding: 20px 30px;
  font-size: 22px;
  font-family: 'NO3';
  border: 3px solid #8b4513;
  border-radius: 60px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.25);
  transition: all 0.3s ease;
  outline: none;
  color: #5a3921;
  padding-right: 120px;
}

.search-box:focus {
  border-color: #5a3921;
  box-shadow: 0 6px 25px rgba(139, 69, 19, 0.35);
  background-color: white;
}

.search-box::placeholder {
  color: #a68b7a;
  font-style: italic;
  font-size: 20px;
}

.search-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #8b4513;
  color: white;
  border: none;
  border-radius: 50px;
  width: 100px;
  height: 50px;
  font-size: 18px;
  font-family: 'NO3';
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(139, 69, 19, 0.3);
}

.search-button:hover {
  background-color: #5a3921;
  transform: translateY(-50%) scale(1.05);
}

.cancel-search-button {
  position: absolute;
  right: 120px;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
  color: #8b4513;
  border: none;
  border-radius: 50px;
  width: 80px;
  height: 40px;
  font-size: 16px;
  font-family: 'NO3';
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-search-button:hover {
  color: #5a3921;
  transform: translateY(-50%) scale(1.05);
}

/* === 分类导航 === */
.category-nav {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.category-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.category-tab {
  flex: 1;
  padding: 10px 0;
  font-size: 18px;
  font-family: 'NO3';
  color: #8b4513;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.category-tab.active {
  border-bottom: 3px solid #8b4513;
  font-weight: bold;
  color: #5a3921;
}

.category-tab:hover {
  color: #5a3921;
}

.category-content {
  display: block;
}

.stroke-tags,
.pinyin-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.stroke-tag,
.pinyin-tag {
  padding: 10px 20px;
  background-color: rgba(139, 69, 19, 0.1);
  color: #8b4513;
  border-radius: 30px;
  font-size: 16px;
  font-family: 'NO3';
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(139, 69, 19, 0.3);
}

.stroke-tag:hover,
.pinyin-tag:hover {
  background-color: rgba(139, 69, 19, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 69, 19, 0.15);
}

.stroke-tag.active,
.pinyin-tag.active {
  background-color: #8b4513;
  color: white;
}

/* === 分类面包屑导航 === */
.category-breadcrumb {
  width: 100%;
  padding: 10px 15px;
  background-color: rgba(139, 69, 19, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.category-breadcrumb-item {
  font-family: 'NO3';
  font-size: 16px;
  color: #8b4513;
  cursor: pointer;
  transition: all 0.3s;
  padding: 5px 10px;
  border-radius: 4px;
}

.category-breadcrumb-item:hover {
  background-color: rgba(139, 69, 19, 0.2);
  text-decoration: underline;
}

.category-breadcrumb-separator {
  margin: 0 8px;
  color: rgba(139, 69, 19, 0.5);
}

/* === 搜索结果区域 === */
.search-results-container {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-results-title {
  font-family: 'NO3';
  font-size: 24px;
  color: #8b4513;
}

.search-results-count {
  font-family: 'NO3';
  font-size: 16px;
  color: #8b4513;
  background-color: rgba(139, 69, 19, 0.1);
  padding: 5px 10px;
  border-radius: 20px;
}

.search-results-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  min-height: 60px;
  align-items: center;
}

.search-results-list.empty {
  justify-content: center;
}

.search-result-item {
  padding: 8px 15px;
  background-color: rgba(139, 69, 19, 0.1);
  color: #8b4513;
  border-radius: 20px;
  font-size: 18px;
  font-family: 'NO3';
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(139, 69, 19, 0.3);
}

.search-result-item:hover {
  background-color: rgba(139, 69, 19, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 69, 19, 0.15);
}

/* === 字列表 === */
.character-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  min-height: 60px;
  align-items: center;
}

.character-list.empty {
  justify-content: center;
}

.character-item {
  padding: 8px 15px;
  background-color: rgba(139, 69, 19, 0.1);
  color: #8b4513;
  border-radius: 20px;
  font-size: 18px;
  font-family: 'NO3';
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(139, 69, 19, 0.3);
}

.character-item:hover {
  background-color: rgba(139, 69, 19, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 69, 19, 0.15);
}

.no-data-text {
  font-family: 'NO3';
  font-size: 16px;
  color: #8b4513;
  font-style: italic;
}

/* === 词组列表 === */
.phrase-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  min-height: 60px;
  align-items: center;
}

.phrase-list.empty {
  justify-content: center;
}

.phrase-item {
  padding: 8px 15px;
  background-color: rgba(139, 69, 19, 0.1);
  color: #8b4513;
  border-radius: 20px;
  font-size: 18px;
  font-family: 'NO3';
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(139, 69, 19, 0.3);
}

.phrase-item:hover {
  background-color: rgba(139, 69, 19, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 69, 19, 0.15);
}

/* === 详情页 === */
.detail-view {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.detail-header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  text-align: center;
}

.detail-back-button {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #8b4513;
  font-size: 18px;
  font-family: 'NO3';
  margin-bottom: 15px;
  align-self: flex-start;
}

.detail-back-button::before {
  content: '←';
  margin-right: 8px;
  font-size: 20px;
}

.detail-title {
  font-family: 'No3', sans-serif;
  font-size: 36px;
  color: #8b4513;
  letter-spacing: 2px;
  text-align: center;
  width: 100%;
  margin: 10px 0;
}

.detail-content {
  margin-top: 30px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section-title {
  font-family: 'NO3';
  font-size: 22px;
  color: #5a3921;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 2px solid rgba(139, 69, 19, 0.3);
}

.detail-section-content {
  font-family: 'NO3';
  font-size: 16px;
  color: #5a3921;
  line-height: 1.8;
  white-space: pre-line;
}

/* === 装饰元素 === */
.ZS010 {
  z-index: -2;
  width: 300px;
  position: fixed;
  top: 100px;
  left: 0;
}

.ZS008 {
  z-index: -2;
  width: 300px;
  position: fixed;
  top: 100px;
  right: 0;
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

/* === 分隔线 === */
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

/* === 底部文本 === */
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

/* === 页脚 === */
.footer {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px 0;
  text-align: center;
  margin: 0;
  position: absolute;
  bottom: -100px;
}

.footer p {
  margin: 5px 0;
  padding: 0 20px;
  font-size: 20px;
  font-family: 'NO3';
}

/* === 刹车点 === */
.brake-point {
  position: absolute;
  width: 100%;
  height: 1px;
  top: 100vh;
  left: 0;
  pointer-events: none;
}

/* === 状态类 === */
.hidden {
  display: none !important;
}
</style>
