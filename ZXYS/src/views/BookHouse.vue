<template>
  <main class="main-content">
    <!-- 第一部分：意境开篇（大幅留白，强化主题） -->
    <section class="hero-section">
      <h1 class="classic-title">中醫經典書城</h1>
      <div class="subtitle-wrapper">
        <span class="line"></span>
        <p class="classic-subtitle">博极医源 · 精勤不倦</p>
        <span class="line"></span>
      </div>
    </section>

    <!-- 第二部分：搜索引导（增加过渡，减少突兀感） -->
    <section class="search-area">
      <div class="ink-search-container">
        <!-- 装饰性元素：模拟毛笔笔触 -->
        <div class="brush-stroke"></div>

        <div class="search-input-box">
          <input
            type="text"
            v-model="searchTerm"
            class="zen-input"
            placeholder="搜索医经、方术、本草..."
            @keyup.enter="handleSearch"
          />
          <button class="zen-search-btn" @click="handleSearch">
            <i class="fas fa-search"></i>
            <span>探尋</span>
          </button>
        </div>

        <!-- 极简标签区：不再挤在侧面，而是优雅地横排 -->
        <div class="quick-tags">
          <span class="tag-label">热搜典籍：</span>
          <span class="tag-item" @click="searchTerm = '黃帝內經'">《黄帝内经》</span>
          <span class="tag-item" @click="searchTerm = '傷寒論'">《伤寒论》</span>
          <span class="tag-item" @click="searchTerm = '本草綱目'">《本草纲目》</span>
          <span class="tag-item" @click="searchTerm = '千金要方'">《千金药方》</span>
        </div>
      </div>
    </section>

    <!-- 第四部分：书籍列表（无框排版） -->
    <section class="books-container-zen">
      <!-- 区域装饰线：仿古籍版心线 -->

      <div class="book-list-inner">
        <BookList
          :search-term="searchTerm"
          :books-data="booksData"
          :auto-load="true"
          @book-click="handleBookClick"
          @search="handleSearchEmit"
          @data-loaded="handleDataLoaded"
          @error="handleError"
          ref="bookListRef"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import router from '@/router'
import BookList from '@/views/BookHouse/BookList.vue'
import type { BookListItem as Book } from '@/api/book'

const searchTerm = ref('')
const bookListRef = ref<InstanceType<typeof BookList>>()
const booksData = ref<Book[]>([])

const handleSearch = () => {
  console.log('Searching:', searchTerm.value)
}
const handleSearchEmit = (term: string) => {
  searchTerm.value = term
}
const handleBookClick = (book: Book) => {
  router.push({
    path: `/Hina/BookIntroduce/${book.id}`,
    state: {
      from: 'bookhouse', // 固定值
      returnPath: '/Foundations/BookHouse',
    },
  })
}
const handleDataLoaded = (books: Book[]) => {
  console.log('Loaded:', books.length)
}
const handleError = (error: Error) => {
  console.error('Error:', error)
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
/* === 核心布局：大呼吸感 === */
.main-content {
  width: 100%;
  padding-top: 5vh;
  padding-bottom: 120px;
  min-height: 100vh;
  font-family: 'NO3', serif;
  color: #4a342e; /* 深褐色，与纸张背景最搭 */
}

/* === 1. 头部标题区：空灵、大方 === */
.hero-section {
  text-align: center;
}

.stamp-wrapper {
  margin-bottom: 15px;
}

.classic-stamp {
  border: 2px solid #b71c1c;
  color: #b71c1c;
  padding: 2px 8px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 4px;
  display: inline-block;
}

.classic-title {
  font-size: 70px;
  letter-spacing: 12px;
  margin: 10px 0;
  font-weight: 550;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.subtitle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 5px;
}

.subtitle-wrapper .line {
  width: 40px;
  height: 1.5px;
  background-color: #a67c52;
}

.classic-subtitle {
  font-size: 24px;
  color: #8d6e63;
  letter-spacing: 4px;
}

/* === 2. 搜索区域：宣纸悬浮感 === */
.search-area {
  max-width: 900px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.ink-search-container {
  position: relative;
  background: rgba(255, 255, 255, 0.25); /* 极淡的白色，像半透明薄纸 */
  backdrop-filter: blur(8px);
  padding: 35px;
  border-radius: 2px;
  /* 模拟宣纸不规则边缘的微弱阴影 */
  box-shadow: 0 10px 30px rgba(74, 52, 46, 0.05);
  border: 1px solid rgba(166, 124, 82, 0.2);
}

.search-input-box {
  display: flex;
  border-bottom: 2px solid #5d4037;
  padding-bottom: 5px;
}

.zen-input {
  flex: 1;
  background: transparent;
  border: none;
  font-family: 'NO3';
  font-size: 22px;
  padding: 10px;
  color: #4a342e;
}

.zen-input:focus {
  outline: none;
}

.zen-search-btn {
  background: transparent;
  border: none;
  color: #5d4037;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'NO3';
  font-size: 18px;
  transition: color 0.3s;
}

.zen-search-btn:hover {
  color: #b71c1c;
}

.quick-tags {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.tag-label {
  font-size: 20px;
  color: #8d6e63;
}

.tag-item {
  font-size: 20px;
  cursor: pointer;
  color: #a67c52;
  transition: all 0.3s;
  border-bottom: 1px solid transparent;
}

.tag-item:hover {
  color: #b71c1c;
  border-bottom-color: #b71c1c;
}

/* === 3. 数据统计模块：增强仪式感 === */
.library-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  margin-bottom: 100px;
}

.stat-box {
  text-align: center;
}

.stat-box .num {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #5d4037;
}

.stat-box .lab {
  font-size: 14px;
  color: #8d6e63;
  letter-spacing: 2px;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background-color: rgba(166, 124, 82, 0.4);
}

/* === 4. 书籍列表区：去框、纯净 === */
.books-container-zen {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 40px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
}

.heading-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(166, 124, 82, 0.5), transparent);
}

.heading-text {
  font-size: 26px;
  letter-spacing: 6px;
  color: #5d4037;
  font-weight: 600;
}

.book-list-inner {
  /* 确保这里没有任何强制性的白色背景 */
  padding-bottom: 50px;
}

/* === 响应式调整 === */
@media (max-width: 768px) {
  .classic-title {
    font-size: 36px;
    letter-spacing: 6px;
  }
  .library-stats {
    gap: 20px;
    flex-direction: column;
  }
  .stat-divider {
    display: none;
  }
  .ink-search-container {
    padding: 20px;
  }
  .zen-input {
    font-size: 18px;
  }
}
</style>
