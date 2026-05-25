<template>
  <div class="book-list">
    <!-- 书籍列表容器 -->
    <div
      class="books-wrapper"
      :class="{ 'shelf-mode': mode === 'shelf', 'store-mode': mode === 'store' }"
    >
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchBooks" class="retry-button">重试</button>
      </div>

      <div v-else>
        <!-- 书架模式下的空状态：不显示任何内容，让父组件处理 -->
        <div v-if="mode === 'shelf' && allBooks.length === 0" class="empty-shelf"></div>

        <!-- 书城模式下的无搜索结果 -->
        <div v-else-if="filteredBooks.length === 0 && mode === 'store'" class="no-results">
          没有找到符合条件的书籍
        </div>

        <!-- 正常显示书籍列表 -->
        <div v-else-if="filteredBooks.length > 0" class="books-container">
          <div
            v-for="book in filteredBooks"
            :key="book.id"
            class="book-card"
            @click="handleBookClick(book)"
          >
            <div class="book-container">
              <div class="book-spine"></div>
              <div class="page cover" :style="getCoverStyle(book)"></div>

              <div class="page page-1" :style="{ '--i': 4 }">
                <div class="page-content">
                  <p>{{ book.name }}</p>
                  <p>{{ getBookIntro(book, 0, 100) }}</p>
                </div>
              </div>

              <div class="page page-2" :style="{ '--i': 3 }">
                <div class="page-content">
                  <p>作者</p>
                  <p>{{ book.author }}</p>
                </div>
              </div>

              <div class="page page-3" :style="{ '--i': 2 }">
                <div class="page-content">
                  <p>简介</p>
                  <p>{{ getBookIntro(book, 100, 200) }}</p>
                </div>
              </div>

              <div class="page back-cover" :style="{ '--i': 1 }"></div>
            </div>

            <div class="book-title" :title="book.name">
              {{ book.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getBookList, getUserBookshelf } from '@/api/book'
import { getUserId } from '@/utils/storage'
const BookBaseUrl = import.meta.env.VITE_RESOURCES_URL

// 定义书籍类型接口
export interface Book {
  id: number
  name: string
  author: string
  type: string
  volume: string
  tag_count: number
  cover_url: string
  introduce: string
}

// 定义组件Props
interface Props {
  mode?: 'store' | 'shelf'
  searchTerm?: string
  booksData?: Book[]
  autoLoad?: boolean
}

// 定义组件Emits
interface Emits {
  (e: 'book-click', book: Book): void
  (e: 'search', term: string): void
  (e: 'data-loaded', books: Book[]): void
  (e: 'error', error: Error): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'store',
  searchTerm: '',
  booksData: () => [],
  autoLoad: true,
})

const emit = defineEmits<Emits>()

// 响应式数据
const allBooks = ref<Book[]>([])
const loading = ref(false)
const error = ref<string>('')

// 计算属性：过滤后的书籍
const filteredBooks = computed(() => {
  if (!props.searchTerm.trim()) {
    return allBooks.value
  }

  const term = props.searchTerm.toLowerCase().trim()
  return allBooks.value.filter(
    (book) =>
      (book.name && book.name.toLowerCase().includes(term)) ||
      (book.author && book.author.toLowerCase().includes(term)),
  )
})

// 方法：获取书籍简介片段
const getBookIntro = (book: Book, start: number, end: number): string => {
  if (!book.introduce || book.introduce.length <= start) {
    return '暂无简介'
  }
  const intro = book.introduce.substring(start, Math.min(end, book.introduce.length))
  return intro + (book.introduce.length > end ? '...' : '')
}

// 方法：获取封面样式
const getCoverStyle = (book: Book) => {
  if (book.cover_url) {
    return {
      backgroundImage: `url('${BookBaseUrl}${book.cover_url}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return {
    backgroundColor: 'rgba(255,255,255,0.9)',
  }
}

// 方法：处理书籍点击
const handleBookClick = (book: Book) => {
  emit('book-click', book)
}

// 方法：获取书籍数据
const fetchBooks = async () => {
  loading.value = true
  error.value = ''

  try {
    if (props.mode === 'shelf') {
      console.log('当前是书架模式，正在获取用户书架数据...')
      const userId = getUserId()
      if (!userId) {
        allBooks.value = []
        loading.value = false
        return
      }

      const res = await getUserBookshelf(parseInt(userId))
      if (res.code === 200) {
        allBooks.value = res.data.map((item) => item.book)
      } else {
        allBooks.value = []
      }
    } else {
      console.log('当前是书城模式，正在获取全部书籍数据...')
      const res = await getBookList({ page: 1, limit: 100 })
      if (res.code === 200) {
        allBooks.value = res.data.list
      } else {
        allBooks.value = []
      }
    }

    emit('data-loaded', allBooks.value)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '加载失败'
    error.value = errorMsg
    emit('error', err instanceof Error ? err : new Error(errorMsg))
  } finally {
    loading.value = false
  }
}

// 监听搜索词变化
watch(
  () => props.searchTerm,
  (newTerm) => {
    emit('search', newTerm)
  },
)

// 监听外部数据变化
watch(
  () => props.booksData,
  (newData) => {
    if (newData && newData.length > 0) {
      allBooks.value = newData
    }
  },
  { deep: true },
)

// 生命周期钩子
onMounted(() => {
  if (props.autoLoad) {
    fetchBooks()
  }
})

// 暴露方法给父组件
defineExpose({
  fetchBooks,
  getBooks: () => allBooks.value,
  getFilteredBooks: () => filteredBooks.value,
})
</script>

<style scoped>
.book-list {
  width: 100%;
}

/* === 书籍列表容器 - 书城模式（保留原有样式） === */
.books-wrapper.store-mode {
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 300px;
}

/* === 书籍列表容器 - 书架模式（无背景，让父组件控制） === */
.books-wrapper.shelf-mode {
  width: 100%;
  margin: 0 auto;
  padding: 0;
  background-color: transparent;
  backdrop-filter: none;
  border-radius: 0;
  box-shadow: none;
  border: none;
  min-height: auto;
}

/* 加载和错误状态 */
.loading,
.no-results,
.error {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: #8b4513;
  font-family: 'NO3', sans-serif;
}

.error p {
  margin-bottom: 20px;
}

.retry-button {
  background-color: #8b4513;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #6b3410;
}

.books-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 40px 20px;
  padding: 20px 0;
}

/* === 书籍卡片样式 === */
.book-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-container {
  position: relative;
  width: 180px;
  height: 260px;
  transform-style: preserve-3d;
  transition: transform 0.8s ease;
  overflow: hidden;
}

.book-container .page {
  position: absolute;
  width: 172px;
  height: 252px;
  top: 4px;
  left: 8px;
  transform-origin: left center;
  transition:
    transform 0.6s ease,
    box-shadow 0.6s ease;
  background-size: cover;
  background-position: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  z-index: calc(var(--i) * 10);
  backface-visibility: hidden;
  border-radius: 0 4px 4px 0;
}

.book-container .cover,
.book-container .back-cover {
  width: 180px;
  height: 252px;
  top: 4px;
  left: 0;
  border-radius: 0 4px 4px 0;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
  background-size: cover;
  background-position: center;
  box-sizing: border-box;
}

.book-container .cover {
  z-index: 50;
  background-color: rgba(255, 255, 255, 0.9);
  background-size: 100% 100%;
}

.book-container .back-cover {
  z-index: 5;
  background: linear-gradient(to right, #e4e8eb, #f5f7fa);
}

.book-container .page-1,
.book-container .page-2,
.book-container .page-3 {
  background-color: #f9f9f9;
  box-shadow:
    inset 0 0 6px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 2px;
  background-image: linear-gradient(to bottom, #f9f9f9 0%, #e8e8e8 100%);
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.book-container:hover {
  transform: translateX(25px) rotateY(5deg);
}

.book-container:hover .cover {
  transform: rotateY(-40deg);
  box-shadow: -4px 4px 12px rgba(0, 0, 0, 0.15);
}

.book-container:hover .page-1 {
  transform: rotateY(-25deg);
  transition-delay: 0.1s;
  z-index: 40;
  box-shadow: -3px 3px 10px rgba(0, 0, 0, 0.1);
}

.book-container:hover .page-2 {
  transform: rotateY(-15deg);
  transition-delay: 0.2s;
  z-index: 30;
  box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.1);
}

.book-container:hover .page-3 {
  transform: rotateY(-8deg);
  transition-delay: 0.3s;
  z-index: 20;
  box-shadow: -1px 1px 6px rgba(0, 0, 0, 0.1);
}

.book-container .back-cover::before {
  content: 'THE END';
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  letter-spacing: 2px;
  color: #3d3d3d;
  font-weight: bold;
  font-size: 10px;
}

.book-container .book-spine {
  position: absolute;
  left: -1px;
  top: 4px;
  width: 8px;
  height: 172px;
  background: linear-gradient(to right, #1a2a3a, #2c3e50);
  transform: rotateY(90deg);
  transform-origin: left;
  z-index: 100;
  border-radius: 2px 0 0 2px;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.15);
}

.book-container .page-content {
  padding: 10px;
  color: #333;
  font-size: 8px;
  line-height: 1.5;
  height: calc(100% - 20px);
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 0 1px 1px 0;
  box-sizing: border-box;
  background-image: linear-gradient(to bottom, #fff 0%, #f5f5f5 100%);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.book-container .page-content p {
  margin-bottom: 6px;
  text-align: justify;
}

.book-container .page-content p:first-child {
  font-weight: bold;
  font-size: 9px;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
  margin-bottom: 8px;
  color: #5d2906;
}

/* 书籍名称 */
.book-title {
  margin-top: 10px;
  font-family: 'NO3';
  font-size: 20px;
  color: #8b4513;
  text-align: center;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* === 响应式调整 === */
@media (max-width: 1600px) {
  .books-container {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 1200px) {
  .books-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .books-wrapper.store-mode {
    width: 95%;
    padding: 20px;
  }

  .books-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .books-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .books-container {
    grid-template-columns: 1fr;
    max-width: 300px;
    margin: 0 auto;
  }

  .book-container {
    width: 150px;
    height: 225px;
  }

  .book-container .page {
    width: calc(150px - 10px);
    height: 215px;
  }

  .book-container .cover,
  .book-container .back-cover {
    width: 150px;
    height: 215px;
  }

  .book-container .book-spine {
    width: 10px;
    height: 215px;
  }

  .book-title {
    font-size: 16px;
    max-width: 150px;
  }
}
</style>
