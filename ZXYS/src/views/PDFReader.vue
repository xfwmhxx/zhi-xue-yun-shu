<template>
  <BreadcrumbNav title="中医典籍" :show-back="true" :breadcrumb-items="breadcrumbItems" />
  <div class="pdf-container-wrapper">
    <!-- 加载动画 -->
    <div v-if="isLoading" class="pdf-loading-overlay">
      <div class="loading-content">
        <div class="ink-loading"></div>
        <p class="loading-text">正在加载典籍...</p>
        <p class="loading-subtext">请稍候，经典正在为您呈现</p>
      </div>
    </div>

    <!-- PDF查看器 -->
    <PDFViewer
      v-show="!isLoading"
      ref="pdfViewerRef"
      :pdfUrl="currentPdfUrl"
      @pdf-loaded="handlePdfLoaded"
      @pdf-load-error="handlePdfLoadError"
    />
  </div>
</template>

<script setup lang="ts">
import PDFViewer from '@/components/pdf/PDFViewer.vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 定义书籍类型
interface Book {
  id: string | number
  Name: string
  Author: string
  Introduce: string
  Cover?: string
  Document: string
}

// 获取路由参数
const route = useRoute()
const router = useRouter()
// 响应式数据
const book = ref<Book | null>(null)
const loading = ref(true)
const error = ref<string>('')
const imageError = ref(false)
const isLoading = ref(true) // PDF加载状态

// 从路由参数获取ID
const bookId = route.params.id as string

// 计算面包屑导航项
const breadcrumbItems = computed(() => {
  const items = [{ name: '经典书城', url: '/Foundations/bookhouse' }]

  if (book.value) {
    items.push(
      {
        name: '书籍详情',
        url: `/Hina/BookIntroduce/${book.value.id}`,
      },
      {
        name: book.value.Name,
        url: '#',
      },
    )
  }

  return items
})

const pdfViewerRef = ref(null)
const currentPdfUrl = ref(book.value?.Document)

// PDF加载完成回调
const handlePdfLoaded = () => {
  isLoading.value = false
  console.log('PDF加载完成')
}

// PDF加载失败回调
const handlePdfLoadError = () => {
  isLoading.value = false
  console.error('PDF加载失败')
  // 可选：显示错误提示
}

// 监听book的变化，当book有值时更新currentPdfUrl
watch(
  book,
  (newBook) => {
    if (newBook && newBook.Document) {
      currentPdfUrl.value = newBook.Document
      console.log('PDF URL已更新:', currentPdfUrl.value)
    } else {
      currentPdfUrl.value = ''
    }
  },
  { immediate: true },
)

// 生命周期
onMounted(() => {
  const bookId = route.params.id
  currentPdfUrl.value = `${import.meta.env.VITE_RESOURCES_URL}/uploads/books/${bookId}.pdf`
  console.log(currentPdfUrl)
  console.log('PDF URL:', currentPdfUrl.value)

  // 禁用页面滚动
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'

  // 设置超时，防止加载时间过长
  setTimeout(() => {
    if (isLoading.value) {
      isLoading.value = false
      console.log('PDF加载超时，强制结束加载状态')
    }
  }, 10000) // 10秒超时
})

onUnmounted(() => {
  // 离开页面时恢复滚动条
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})
</script>

<style scoped>
.pdf-container-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
}

/* 加载动画遮罩层 */
.pdf-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f0e8 0%, #e8e0d4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.loading-content {
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

/* 水墨风格加载动画 */
.ink-loading {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  position: relative;
  border-radius: 50%;
  background: transparent;
  animation: inkSpread 1.5s ease-in-out infinite;
}

.ink-loading::before,
.ink-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 2px solid #8b5e3c;
  animation: ripple 1.5s ease-out infinite;
}

.ink-loading::after {
  animation-delay: 0.75s;
}

@keyframes ripple {
  0% {
    transform: scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes inkSpread {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.loading-text {
  font-size: 18px;
  font-weight: 500;
  color: #3e2723;
  margin: 16px 0 8px;
  letter-spacing: 2px;
  font-family: 'NO3', serif;
}

.loading-subtext {
  font-size: 13px;
  color: #8d6e63;
  margin: 0;
  letter-spacing: 1px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
