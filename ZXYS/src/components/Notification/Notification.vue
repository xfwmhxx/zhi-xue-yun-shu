<template>
  <Transition name="notification-slide">
    <div v-if="visible" class="notification-wrapper" :style="wrapperStyle">
      <div class="out">
        <div class="in">
          <img :src="typeConfig[type].photo" class="Photo" :alt="type" />
          <div class="content">
            <p class="title">{{ title }}</p>
            <p v-if="note" class="note">{{ note }}</p>
          </div>
          <img :src="typeConfig[type].rightPhoto" class="RightPhoto" :alt="type + 'Right'" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive, watch } from 'vue'

// 导入图片资源
import successIcon from '@/assets/Notification/Success.png'
import successIconR from '@/assets/Notification/SuccessR.png'
import errorIcon from '@/assets/Notification/Error.png'
import errorIconR from '@/assets/Notification/ErrorR.png'
import warningIcon from '@/assets/Notification/Warning.png'
import warningIconR from '@/assets/Notification/WarningR.png'
import infoIcon from '@/assets/Notification/Info.png'
import infoIconR from '@/assets/Notification/InfoR.png'

// 导入音频文件
import successSound from '@/assets/Notification/Vedio/Success.wav'

// 定义组件接收的props类型
interface Props {
  // 消息类型
  type?: 'success' | 'error' | 'warning' | 'info'
  // 标题（必需）
  title: string
  // 备注（可选）
  note?: string
  // 停留时间（毫秒）
  duration?: number
  // 距离顶部的距离（像素）
  top?: number
  // 是否显示
  show?: boolean
  // 是否播放音效
  playSound?: boolean
}

// 定义组件事件
interface Emits {
  (e: 'close'): void
  (e: 'destroy'): void
}

// 定义props
const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 2000,
  top: 10,
  show: false,
  playSound: true,
})

// 定义emit
const emit = defineEmits<Emits>()

// 组件内部可见性状态
const visible = ref(false)

const typeConfig = reactive({
  success: {
    photo: successIcon,
    rightPhoto: successIconR,
  },
  error: {
    photo: errorIcon,
    rightPhoto: errorIconR,
  },
  warning: {
    photo: warningIcon,
    rightPhoto: warningIconR,
  },
  info: {
    photo: infoIcon,
    rightPhoto: infoIconR,
  },
})

// 音效配置
const soundConfig = {
  success: successSound,
  error: successSound,
  warning: successSound,
  info: successSound,
}

// 音频对象引用
let audio: HTMLAudioElement | null = null

// 计算wrapper样式
const wrapperStyle = computed(() => ({
  top: `${props.top}px`,
}))

// 定时器引用
let timer: ReturnType<typeof setTimeout> | null = null

// 播放音效
const playNotificationSound = () => {
  if (!props.playSound) return

  try {
    // 如果已有音频对象，先暂停并重置
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }

    // 创建新的音频对象
    audio = new Audio(soundConfig[props.type])
    audio.volume = 0.5 // 设置音量（0.0 到 1.0）

    // 播放音频
    audio.play().catch((error) => {
      console.warn('音效播放失败:', error)
    })
  } catch (error) {
    console.warn('创建音频对象失败:', error)
  }
}

// 显示消息
const show = () => {
  visible.value = true
  // 播放音效
  playNotificationSound()
  startTimer()
}

// 隐藏消息
const hide = () => {
  visible.value = false
  emit('close')
  // 延迟销毁，给动画留出时间
  setTimeout(() => {
    emit('destroy')
  }, 300)
}

// 开始定时器
const startTimer = () => {
  if (timer) {
    clearTimeout(timer)
  }

  if (props.duration > 0) {
    timer = setTimeout(() => {
      hide()
    }, props.duration)
  }
}

// 监听show prop的变化
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      show()
    } else {
      hide()
    }
  },
)

// 监听type变化，重新加载音效
watch(
  () => props.type,
  () => {
    // 如果当前可见，重新播放音效
    if (visible.value && props.playSound) {
      setTimeout(() => {
        playNotificationSound()
      }, 10)
    }
  },
)

// 组件挂载时自动显示
onMounted(() => {
  if (props.show) {
    // 延迟一点时间确保DOM已渲染
    setTimeout(() => {
      visible.value = true
      // 播放音效
      if (props.playSound) {
        playNotificationSound()
      }
      startTimer()
    }, 50)
  }
})

// 组件销毁前清理
onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
  // 清理音频对象
  if (audio) {
    audio.pause()
    audio = null
  }
})

// 暴露方法给父组件
defineExpose({
  show,
  hide,
})
</script>

<style scoped>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 添加 Electron 专用的重置样式 */
:global(body.electron) .notification-wrapper *,
:global(body.webview) .notification-wrapper * {
  -webkit-user-drag: none;
  -webkit-app-region: no-drag;
  box-sizing: border-box;
}

/* 消息通知容器 - 修复 Electron 定位问题 */
.notification-wrapper {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999999;
  display: flex;
  justify-content: center;
  align-items: center;
  will-change: transform, opacity;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15));

  /* Electron 特定优化 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 外层容器 - 修复尺寸计算问题 */
.out {
  /* 明确的固定尺寸 */
  width: 420px;
  min-width: 420px;
  max-width: 420px;
  height: 108px; /* 100px + 2 * 4px padding */
  min-height: 108px;
  max-height: 108px;
  padding: 4px;
  background: linear-gradient(
    135deg,
    rgba(201, 175, 28, 0.8) 0%,
    rgba(226, 196, 32, 0.9) 50%,
    rgba(201, 175, 28, 0.8) 100%
  );
  border-radius: 20px;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.25),
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;

  /* 防止 Electron 中的渲染问题 */
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  contain: layout paint style;
}

/* 内层元素 - 修复尺寸和背景问题 */
.in {
  width: 412px; /* 420px - 2 * 4px padding */
  height: 100px;
  min-width: 412px;
  max-width: 412px;
  min-height: 100px;
  max-height: 100px;
  background:
    linear-gradient(135deg, rgba(250, 138, 19, 0.95) 0%, rgba(255, 165, 0, 0.9) 100%),
    url('../../assets/images.jpg');
  background-blend-mode: overlay;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 15px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  box-sizing: border-box;

  /* 修复 Electron 中的背景渲染 */
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/* 添加光泽效果 */
.out::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
  z-index: 1;
}

/* 悬停效果 */
.out:hover {
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 6px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15);
}

/* 主阴影效果 */
.in {
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.3),
    inset 0 -1px 1px rgba(0, 0, 0, 0.1);
}

/* 添加光泽边缘 */
.in::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  bottom: 1px;
  border-radius: 14px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 20%,
    transparent 80%,
    rgba(0, 0, 0, 0.05) 100%
  );
  pointer-events: none;
}

/* 添加光晕效果 */
.in::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 15px;
  box-shadow:
    inset 0 0 20px rgba(255, 215, 0, 0.1),
    inset 0 0 40px rgba(255, 165, 0, 0.05);
  pointer-events: none;
}

/* 修复图片加载和显示问题 */
.Photo {
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  height: 100px;
  min-height: 100px;
  max-height: 100px;
  object-fit: contain;
  padding: 10px;
  display: block;
  vertical-align: middle;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease;
  z-index: 1;
}

.Photo:hover {
  transform: scale(1.05);
}

.RightPhoto {
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  height: 100px;
  min-height: 100px;
  max-height: 100px;
  object-fit: contain;
  padding: 10px;
  display: block;
  vertical-align: middle;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease;
  z-index: 1;
}

.RightPhoto:hover {
  transform: scale(1.05);
}

/* 内容区域 - 修复布局问题 */
.content {
  display: flex;
  font-family:
    'No3',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-weight: 200;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #2c3e50;
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  height: 100px;
  min-height: 100px;
  max-height: 100px;
  margin-left: 0;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(255, 255, 255, 0.1) 80%,
    transparent 100%
  );
  padding: 0 10px;
  backdrop-filter: blur(1px);
  flex-shrink: 0;
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;
  box-sizing: border-box;
}

/* 标题和备注的样式调整 */
.content .title {
  margin: 0;
  padding: 0;
  font-size: 36px;
  margin-bottom: 6px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(45deg, #2c3e50, #34495e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 1px 1px rgba(255, 255, 255, 0.5));
  transition: all 0.3s ease;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content .note {
  margin: 0;
  padding: 0;
  font-size: 20px;
  font-weight: 500;
  opacity: 0.85;
  color: rgba(44, 62, 80, 0.9);
  letter-spacing: 0.3px;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 悬停时文字效果 */
.content:hover .title {
  font-size: 37px;
  margin-bottom: 8px;
}

.content:hover .note {
  font-size: 21px;
  opacity: 0.9;
}

/* 动画效果 - 保留原有动画 */
.notification-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100px) scale(0.9);
  filter: blur(5px) drop-shadow(0 0 0 rgba(0, 0, 0, 0));
}

.notification-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity, filter;
}

.notification-slide-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
  filter: blur(0) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15));
}

.notification-slide-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
  filter: blur(0) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15));
}

.notification-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.5, -0.5, 0.5, 1.5);
  will-change: transform, opacity, filter;
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-50px) scale(0.95);
  filter: blur(3px) drop-shadow(0 0 0 rgba(0, 0, 0, 0));
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-wrapper {
    width: 90%;
    max-width: 420px;
  }

  .out {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    height: 98px;
    min-height: 98px;
    max-height: 98px;
  }

  .in {
    width: calc(100% - 8px) !important;
    min-width: calc(100% - 8px) !important;
    max-width: calc(100% - 8px) !important;
    height: 90px;
    min-height: 90px;
    max-height: 90px;
  }

  .content {
    width: 180px;
    min-width: 180px;
    max-width: 180px;
    height: 90px;
    min-height: 90px;
    max-height: 90px;
  }

  .content .title {
    font-size: 28px;
  }

  .content .note {
    font-size: 16px;
  }

  .Photo,
  .RightPhoto {
    width: 80px;
    min-width: 80px;
    max-width: 80px;
    height: 80px;
    min-height: 80px;
    max-height: 80px;
  }
}

@media (max-width: 480px) {
  .out {
    height: 88px;
    min-height: 88px;
    max-height: 88px;
  }

  .in {
    height: 80px;
    min-height: 80px;
    max-height: 80px;
  }

  .content {
    width: 150px;
    min-width: 150px;
    max-width: 150px;
    height: 80px;
    min-height: 80px;
    max-height: 80px;
  }

  .content .title {
    font-size: 24px;
  }

  .content .note {
    font-size: 14px;
  }

  .Photo,
  .RightPhoto {
    width: 70px;
    min-width: 70px;
    max-width: 70px;
    height: 70px;
    min-height: 70px;
    max-height: 70px;
  }
}

/* Electron 特定媒体查询 */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .notification-wrapper {
    /* 强制使用 GPU 加速 */
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .out {
    background: linear-gradient(
      135deg,
      rgba(161, 140, 22, 0.9) 0%,
      rgba(181, 156, 25, 0.95) 50%,
      rgba(161, 140, 22, 0.9) 100%
    );
  }

  .in {
    background:
      linear-gradient(135deg, rgba(200, 120, 15, 0.95) 0%, rgba(220, 140, 20, 0.9) 100%),
      url('/Notification/images.jpg');
  }

  .content {
    color: #ecf0f1;
  }

  .content .title {
    background: linear-gradient(45deg, #ecf0f1, #bdc3c7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .content .note {
    color: rgba(236, 240, 241, 0.85);
  }
}

/* 高DPI屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .out,
  .in {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }

  .content .title,
  .content .note {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* 减少运动用户的简化动画 */
@media (prefers-reduced-motion: reduce) {
  .notification-slide-enter-active,
  .notification-slide-leave-active,
  .out,
  .in,
  .Photo,
  .RightPhoto,
  .content .title,
  .content .note {
    transition: none !important;
  }

  .notification-slide-enter-from,
  .notification-slide-leave-to {
    transform: translateX(-50%) translateY(0) !important;
    opacity: 1 !important;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .Photo:hover,
  .RightPhoto:hover,
  .out:hover,
  .content:hover .title,
  .content:hover .note {
    transform: none !important;
  }

  .Photo,
  .RightPhoto {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
