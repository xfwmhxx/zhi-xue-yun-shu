<template>
  <!-- 外层包裹层：模仿研习页面的 daily-evaluation-wrapper -->
  <div class="shelf-subpage-wrapper">
    <!-- 仿古大框 -->
    <div class="ancient-frame">
      <!-- 1. 顶部标题栏：仿古籍签条 -->
      <div class="shelf-top-header">
        <div class="title-tab">
          <span class="tab-text">藏书阁</span>
        </div>
        <div class="header-decoration-line"></div>
        <div class="header-seal">私藏</div>
      </div>

      <!-- 2. 统计信息区：边框与色调统一 -->
      <section class="shelf-info-grid">
        <div class="info-card-mini">
          <span class="label">【收藏总数】</span>
          <span class="val">{{ booksData.length }}<small>部</small></span>
        </div>
        <div class="info-card-mini">
          <span class="label">【书篋状态】</span>
          <span class="val">{{ booksData.length > 0 ? '充盈' : '虚位' }}</span>
        </div>
        <div class="info-card-mini tips">
          <p class="wisdom-quote">“书犹药也，善读之可以医愚。”</p>
        </div>
      </section>

      <!-- 3. 书架主体区 -->
      <div class="shelf-inner-container">
        <!-- 侧边纵向装饰文字 -->
        <div class="side-vertical-text">中医经典 · 数字化收藏</div>

        <!-- 实际的书籍列表 -->
        <div class="list-viewport">
          <BookList
            ref="bookListRef"
            mode="shelf"
            :auto-load="true"
            @book-click="handleBookClick"
            @data-loaded="handleDataLoaded"
            @error="handleError"
          />

          <!-- 空状态提示：印章风格调整 -->
          <div v-if="booksData.length === 0" class="empty-placeholder">
            <div class="ink-seal">未入库</div>
            <p class="empty-text">暂无私藏典籍，请移步书库选取</p>
            <button class="store-link-btn" @click="router.push('/Foundations/bookhouse')">
              去选书
            </button>
          </div>
        </div>
      </div>

      <!-- 4. 底部角标 -->
      <div class="frame-footer">
        <div class="footer-line"></div>
        <div class="corner-mark-left"></div>
        <div class="corner-mark-right"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookList from '@/views/BookHouse/BookList.vue'
import type { BookListItem as Book } from '@/api/book'
import { getUserId } from '@/utils/storage'

const router = useRouter()
const booksData = ref<Book[]>([])
const currentUserId = ref<number | null>(null)

onMounted(() => {
  const userId = getUserId()
  if (userId) {
    currentUserId.value = parseInt(userId)
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})

const handleBookClick = (book: Book) => {
  router.push({
    path: `/Hina/BookIntroduce/${book.id}`,
    state: {
      from: 'bookshelf',
      returnPath: '/Foundations/userhome/bookshelf',
    },
  })
}

const handleDataLoaded = (books: Book[]) => {
  booksData.value = books
}

const handleError = (error: Error) => {
  console.error('加载失败:', error)
}
</script>

<style scoped>
/* 全局字体强制统一 */
.shelf-subpage-wrapper,
.shelf-subpage-wrapper * {
  font-family: 'NO3', serif !important;
}

/* 外层包裹层：模仿研习页面的 daily-evaluation-wrapper */
.shelf-subpage-wrapper {
  padding: 10px;
  background: #fdfaf5;
}

/* 仿古大框 */
.ancient-frame {
  border: 2px solid rgba(139, 69, 19, 0.9);
  padding: 25px;
  position: relative;
  min-height: 600px;
  background: #fdfaf5;
  animation: fadeInFrame 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes fadeInFrame {
  from {
    opacity: 0;
    transform: scale(0.99);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 顶部标题签条：配色同步 */
.shelf-top-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.title-tab {
  background: rgba(139, 69, 19, 0.95);
  color: #fff;
  padding: 8px 30px;
  font-size: 20px;
  clip-path: polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%);
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.header-decoration-line {
  flex: 1;
  height: 1px;
  background: rgba(139, 69, 19, 0.2);
  margin: 0 15px;
}

.header-seal {
  border: 1px solid rgba(139, 69, 19, 0.8);
  color: rgba(139, 69, 19, 0.8);
  padding: 2px 4px;
  font-size: 12px;
  writing-mode: vertical-rl;
}

/* 统计卡片区 */
.shelf-info-grid {
  display: grid;
  grid-template-columns: 180px 180px 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.info-card-mini {
  border: 1px solid rgba(139, 69, 19, 0.3);
  padding: 15px;
  background: rgba(139, 69, 19, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-card-mini .label {
  font-size: 12px;
  color: #8d6e63;
  margin-bottom: 5px;
}

.info-card-mini .val {
  font-size: 24px;
  color: rgba(139, 69, 19, 1);
}

.wisdom-quote {
  font-style: italic;
  color: rgba(139, 69, 19, 0.6);
  font-size: 14px;
  text-align: right;
  margin: 0;
  line-height: 40px;
}

/* 内层主体区 */
.shelf-inner-container {
  border: 1px solid rgba(139, 69, 19, 0.15);
  padding: 20px;
  position: relative;
  background: #fff;
}

.side-vertical-text {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  color: rgba(139, 69, 19, 0.15);
  font-size: 12px;
  letter-spacing: 5px;
}

/* 空状态处理 */
.empty-placeholder {
  padding: 100px 0;
  text-align: center;
}

.ink-seal {
  display: inline-block;
  border: 2px double rgba(139, 69, 19, 0.6);
  color: rgba(139, 69, 19, 0.6);
  padding: 10px 25px;
  font-size: 24px;
  transform: rotate(-10deg);
  margin-bottom: 20px;
}

.empty-text {
  color: #8d6e63;
  margin-bottom: 20px;
}

.store-link-btn {
  background: rgba(139, 69, 19, 0.9);
  color: #fff;
  border: none;
  padding: 8px 35px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
}

.store-link-btn:hover {
  background: rgba(160, 82, 45, 1);
  transform: translateY(-2px);
}

/* 底部装饰 */
.frame-footer {
  margin-top: 30px;
  position: relative;
}

.footer-line {
  height: 4px;
  border-top: 1px solid rgba(139, 69, 19, 0.9);
  border-bottom: 1px solid rgba(139, 69, 19, 0.9);
}

.corner-mark-left,
.corner-mark-right {
  position: absolute;
  bottom: -5px;
  width: 15px;
  height: 15px;
  border: 2px solid rgba(139, 69, 19, 0.9);
}

.corner-mark-left {
  left: -5px;
  border-right: none;
  border-top: none;
}
.corner-mark-right {
  right: -5px;
  border-left: none;
  border-top: none;
}
</style>
