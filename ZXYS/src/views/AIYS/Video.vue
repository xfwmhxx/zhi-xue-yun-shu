<!-- src/components/Video.vue -->
<template>
  <div
    class="ai-video"
    :class="[
      {
        'is-loading': loading,
        'is-loaded': !loading,
        'is-muted': muted,
      },
      className,
    ]"
  >
    <div class="video-container">
      <video
        ref="videoElement"
        :muted="muted"
        autoplay
        playsinline
        @canplay="handleCanPlay"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @error="handleVideoError"
        @playing="handlePlaying"
      />

      <div class="loading-overlay" v-show="loading">
        <ul class="_loading">
          <li v-for="index in 5" :key="index" />
        </ul>
      </div>

      <div class="muted-overlay" v-show="muted">
        <span v-html="videoMutedSVG"></span>
      </div>

      <div
        v-if="backgroundUrl && !muted"
        class="background-layer"
        :style="{ backgroundImage: `url(${backgroundUrl})` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { isMobile } from '@/utils/AIYS/common/utils'
import { videoMutedSVG } from '@/utils/AIYS/icons/call'

// ==================== 日志工具函数 ====================
const logWithTimestamp = (
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data?: any,
) => {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [Video]`

  switch (level) {
    case 'info':
      console.log(`${prefix} ℹ️ ${message}`)
      if (data) console.log(`${prefix} 📦 数据:`, data)
      break
    case 'warn':
      console.warn(`${prefix} ⚠️ ${message}`)
      if (data) console.warn(`${prefix} 📦 数据:`, data)
      break
    case 'error':
      console.error(`${prefix} ❌ ${message}`)
      if (data) console.error(`${prefix} 📦 数据:`, data)
      break
    case 'debug':
      console.debug(`${prefix} 🔍 ${message}`)
      if (data) console.debug(`${prefix} 📦 数据:`, data)
      break
  }
}

export interface VideoProps {
  className?: string
  muted?: boolean
}

const props = withDefaults(defineProps<VideoProps>(), {
  className: '',
  muted: false,
})

const emit = defineEmits<{
  (e: 'loaded'): void
  (e: 'error', error: Event): void
}>()

const videoElement = ref<HTMLVideoElement | null>(null)
const loading = ref(true)
const backgroundUrl = ref<string>('')
let timeoutId: ReturnType<typeof setTimeout> | null = null

// 强制结束 loading 状态
const forceLoaded = () => {
  if (loading.value) {
    logWithTimestamp('info', '强制结束 loading 状态')
    loading.value = false
    emit('loaded')
  }
}

const handleVideoError = (event: Event) => {
  logWithTimestamp('error', '视频错误', event)
  // 错误时也强制显示，避免一直隐藏
  forceLoaded()
  emit('error', event)
}

const handleCanPlay = () => {
  logWithTimestamp('info', 'Video can play')
  forceLoaded()
}

const handleLoadedMetadata = () => {
  logWithTimestamp('info', 'Video metadata loaded', {
    videoWidth: videoElement.value?.videoWidth,
    videoHeight: videoElement.value?.videoHeight,
  })
  forceLoaded()
}

const handleTimeUpdate = () => {
  forceLoaded()
  if (!isMobile() && !props.muted) {
    addVideoBlurBackground()
  }
}

// 新增 playing 事件处理
const handlePlaying = () => {
  logWithTimestamp('info', 'Video playing')
  forceLoaded()
}

// 监听 srcObject 变化
watch(
  () => videoElement.value?.srcObject,
  (newStream, oldStream) => {
    logWithTimestamp('info', 'srcObject 变化', {
      hasNewStream: !!newStream,
      hasOldStream: !!oldStream,
      isLoading: loading.value,
    })
    if (newStream) {
      // 有视频流了，但可能需要等待一下
      logWithTimestamp('debug', '检测到新视频流，500ms后强制结束loading')
      setTimeout(forceLoaded, 500)
    }
  },
)

// 监听 src 变化
watch(
  () => videoElement.value?.src,
  (newSrc, oldSrc) => {
    logWithTimestamp('info', 'src 变化', {
      newSrc: newSrc ? newSrc.substring(0, 100) + '...' : null,
      oldSrc: oldSrc ? oldSrc.substring(0, 100) + '...' : null,
    })
    if (newSrc) {
      loading.value = true
      // 设置超时，避免一直加载
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        logWithTimestamp('warn', '加载超时，强制显示')
        forceLoaded()
      }, 3000)
    }
  },
)

// 监听 muted 变化
watch(
  () => props.muted,
  (newVal, oldVal) => {
    logWithTimestamp('info', 'muted 状态变化', { newVal, oldVal })
    if (videoElement.value) {
      videoElement.value.muted = newVal
    }
  },
)

const addVideoBlurBackground = () => {
  const videoEl = videoElement.value
  if (!videoEl) return

  if (videoEl.getAttribute('data-has-background')) return

  if (!videoEl.videoWidth || !videoEl.videoHeight) return

  const videoAspect = videoEl.videoWidth / videoEl.videoHeight
  const containerEl = videoEl.parentElement
  if (!containerEl) return

  const containerAspect = containerEl.clientWidth / containerEl.clientHeight

  if (Math.abs(videoAspect - containerAspect) < 0.05) return

  const currentTime = videoEl.currentTime
  if (currentTime <= 0) return

  videoEl.removeEventListener('timeupdate', handleTimeUpdate)

  const canvas = document.createElement('canvas')
  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)

  videoEl.setAttribute('data-has-background', 'true')

  canvas.toBlob((blob) => {
    if (!blob) return

    if (backgroundUrl.value) {
      URL.revokeObjectURL(backgroundUrl.value)
    }

    const blobUrl = URL.createObjectURL(blob)
    backgroundUrl.value = blobUrl
    logWithTimestamp('debug', '视频背景模糊图片已生成')
  }, 'image/png')
}

// 暴露方法
const getVideoElement = (): HTMLVideoElement | undefined => {
  logWithTimestamp('debug', 'getVideoElement 被调用')
  return videoElement.value || undefined
}

const setSrc = (src: string) => {
  logWithTimestamp('info', 'setSrc 被调用', { src: src.substring(0, 100) + '...' })
  if (videoElement.value) {
    videoElement.value.src = src
    videoElement.value.load()
    loading.value = true
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(forceLoaded, 3000)
  }
}

const play = async () => {
  logWithTimestamp('info', 'play 被调用')
  if (videoElement.value) {
    try {
      await videoElement.value.play()
      logWithTimestamp('info', 'play 成功')
    } catch (error) {
      logWithTimestamp('error', 'play 失败', error)
    }
  }
}

const pause = () => {
  logWithTimestamp('debug', 'pause 被调用')
  videoElement.value?.pause()
}

const stop = () => {
  logWithTimestamp('info', 'stop 被调用')
  if (videoElement.value) {
    videoElement.value.pause()
    videoElement.value.currentTime = 0
  }
}

const setMuted = (muted: boolean) => {
  logWithTimestamp('info', 'setMuted 被调用', { muted })
  if (videoElement.value) {
    videoElement.value.muted = muted
  }
}

const isLoading = (): boolean => {
  return loading.value
}

defineExpose({
  getVideoElement,
  setSrc,
  play,
  pause,
  stop,
  setMuted,
  isLoading,
})

onMounted(() => {
  logWithTimestamp('info', '========== Video 组件挂载 ==========')
  logWithTimestamp('info', '组件配置', {
    className: props.className,
    muted: props.muted,
    isMobile: isMobile(),
  })
})

onUnmounted(() => {
  logWithTimestamp('info', '========== Video 组件卸载 ==========')
  if (timeoutId) {
    logWithTimestamp('debug', '清理超时定时器')
    clearTimeout(timeoutId)
  }
  if (backgroundUrl.value) {
    logWithTimestamp('debug', '清理背景图片URL')
    URL.revokeObjectURL(backgroundUrl.value)
    backgroundUrl.value = ''
  }
})
</script>

<style lang="less" scoped>
.ai-video {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #1a1a1a;

  .video-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 8px;
  }

  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: 10000;
    opacity: 1;
    transition: opacity 0.3s ease;
    background-color: #000;
  }

  // 加载时隐藏
  &.is-loading video {
    opacity: 0;
  }

  // 加载完成后显示
  &.is-loaded video {
    opacity: 1;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 3;
  }

  .muted-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 4;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .background-layer {
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    filter: blur(10px);
    z-index: 1;
  }

  ._loading {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;

    li {
      margin: 0 4px;
      width: 4px;
      height: 5px;
      border-radius: 2px;
      background-color: var(--ai-color-primary);
      animation: loading 1s ease-in-out infinite;

      &:nth-child(1) {
        animation-delay: -0.4s;
      }
      &:nth-child(2) {
        animation-delay: -0.2s;
      }
      &:nth-child(3) {
        animation-delay: 0s;
      }
      &:nth-child(4) {
        animation-delay: 0.2s;
      }
      &:nth-child(5) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes loading {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

@media screen and (max-width: 768px) {
  .ai-video {
    .background-layer {
      display: none;
    }

    video {
      object-fit: cover;
    }
  }
}
</style>
