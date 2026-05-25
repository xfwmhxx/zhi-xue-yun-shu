<template>
  <div class="pane-fade">
    <div class="snapshot-scroll">
      <div v-for="(item, idx) in snapshots" :key="idx" class="snapshot-item">
        <div class="brush-frame">
          <!-- 图片展示，包含错误处理 -->
          <img :src="getFullImageUrl(item.fileUrl)" @error="handleImgError" />
          <!-- 情绪标签：优先使用父组件传来的显示名称，否则进行内部映射转换 -->
          <div class="emotion-tag">
            {{ getEmotionDisplayName(item.emotionDisplayName || item.emotion) }}
          </div>
        </div>
        <!-- 时间标签 -->
        <div class="time-label">{{ formatDateTime(item.datetime) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义 Props
defineProps<{
  snapshots: any[]
}>()

const ImageBaseUrl = import.meta.env.VITE_RESOURCES_URL

/**
 * 情绪中英文映射表
 * 确保即使后端返回英文，前端也能显示正确的中文语义
 */
const emotionMap: Record<string, string> = {
  neutral: '中性',
  happy: '开心',
  sad: '悲伤',
  angry: '愤怒',
  fear: '恐惧',
  disgust: '厌恶',
  surprise: '惊讶',
}

/**
 * 获取情绪的中文显示名称
 * @param emotion 原始情绪字符串（英文或中文）
 */
const getEmotionDisplayName = (emotion: string) => {
  if (!emotion) return '未知'
  // 如果在映射表中找到了对应中文则返回，否则返回原字符串
  return emotionMap[emotion.toLowerCase()] || emotion
}

/**
 * 拼接完整的图片 URL
 * @param url 图片路径
 */
const getFullImageUrl = (url: string) => {
  if (!url) return '/api/placeholder/200/150'
  if (url.startsWith('http')) return url
  // 根据实际后端地址拼接，这里假设后端端口为 8000
  return `${ImageBaseUrl}${url}`
}

/**
 * 当图片加载失败时展示占位图
 */
const handleImgError = (e: any) => {
  e.target.src = '/api/placeholder/200/150'
}

/**
 * 格式化时间显示 (HH:mm:ss)
 * @param ts 时间戳或日期字符串
 */
const formatDateTime = (ts: string | number) => {
  if (!ts) return '暂无时间'
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* 容器布局：自动填充网格 */
.snapshot-scroll {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

/* 相框样式：白边加阴影，模拟纸质质感 */
.brush-frame {
  position: relative;
  border: 10px solid #fff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.brush-frame:hover {
  transform: scale(1.02);
}

/* 图片适配 */
.brush-frame img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

/* 情绪标签：位于右下角，深红色背景 */
.emotion-tag {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #b71c1c;
  color: #fff;
  padding: 5px 15px;
  font-size: 14px;
  font-family: 'NO3', serif;
  z-index: 1;
}

/* 时间标签文字样式 */
.time-label {
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  color: #8d6e63;
  font-family: 'NO3', serif;
}

/* 进场动画 */
.pane-fade {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
