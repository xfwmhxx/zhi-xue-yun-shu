<template>
  <!-- 遮罩层 -->
  <div
    v-if="visible"
    class="modal-overlay"
    :class="{ show: isShow, hiding: isHiding }"
    @click.self="handleOverlayClick"
  >
    <!-- 弹窗窗口 -->
    <div class="window" :class="{ show: isShow, hide: isHiding }">
      <!-- 弹窗标题（仅类型1和3显示） -->
      <h2 v-if="showTitle">{{ title }}</h2>
      <div v-if="showTitle" class="title-line"></div>

      <!-- 弹窗内容容器 -->
      <div class="content-container" :style="contentContainerStyle">
        <template v-if="Array.isArray(content)">
          <p v-for="(paragraph, index) in content" :key="index">
            {{ paragraph }}
          </p>
        </template>
        <template v-else>
          <p>{{ content }}</p>
        </template>
      </div>

      <!-- 按钮容器 -->
      <div class="button-container">
        <!-- 类型1和2：取消按钮 -->
        <button v-if="type === 1 || type === 2" class="modal-btn cancel-btn" @click="handleCancel">
          取消
        </button>

        <!-- 类型1和2：确定按钮，类型3：我知道了按钮 -->
        <button
          :class="['modal-btn', type === 3 ? 'know-btn' : 'confirm-btn']"
          @click="handleConfirm"
        >
          {{ type === 3 ? '我知道了' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

// 定义组件接收的Props
interface PopupProps {
  // 弹窗类型：1-标准弹窗，2-无标题弹窗，3-单按钮弹窗
  type: 1 | 2 | 3
  // 弹窗标题（类型1和3需要）
  title?: string
  // 弹窗内容，可以是字符串或字符串数组
  content: string | string[]
  // 是否显示弹窗
  modelValue: boolean
  // 是否可以通过点击遮罩层关闭
  closeOnClickOverlay?: boolean
  // 是否可以通过ESC键关闭
  closeOnPressEscape?: boolean
  // 弹窗宽度
  width?: string
  // 弹窗最小宽度
  minWidth?: string
  // 弹窗最大宽度
  maxWidth?: string
  // 弹窗高度
  height?: string
  // 弹窗最小高度
  minHeight?: string
  // 弹窗最大高度
  maxHeight?: string
}

// 定义组件触发的事件
interface PopupEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'closed'): void
  (e: 'opened'): void
}

const props = withDefaults(defineProps<PopupProps>(), {
  title: '',
  closeOnClickOverlay: false,
  closeOnPressEscape: true,
  width: '60vw',
  minWidth: '500px',
  maxWidth: '800px',
  height: 'auto',
  minHeight: '400px',
  maxHeight: '500px',
})

const emit = defineEmits<PopupEmits>()

// 响应式数据
const visible = ref(false) // 控制是否渲染DOM
const isShow = ref(false) // 控制显示动画
const isHiding = ref(false) // 控制隐藏动画

// 计算属性
const showTitle = computed(() => props.type === 1 || props.type === 3)

const contentContainerStyle = computed(() => {
  if (props.type === 2) {
    return {
      marginTop: '40px',
      height: 'calc(100% - 100px)',
    }
  }
  return {}
})

// 打开弹窗
const open = () => {
  if (visible.value) return

  visible.value = true
  isHiding.value = false

  // 等待DOM渲染
  nextTick(() => {
    // 触发重排，确保CSS过渡生效
    void document.body.offsetWidth

    // 添加显示类
    setTimeout(() => {
      isShow.value = true
      emit('opened')
    }, 10)
  })
}

// 关闭弹窗
const close = () => {
  if (!visible.value) return

  isShow.value = true
  isHiding.value = true

  // 等待动画完成
  setTimeout(() => {
    visible.value = false
    isHiding.value = false
    emit('update:modelValue', false)
    emit('closed')
  }, 400) // 与CSS动画时间保持一致
}

// 确认按钮处理
const handleConfirm = () => {
  emit('confirm')
  close()
}

// 取消按钮处理
const handleCancel = () => {
  emit('cancel')
  close()
}

// 遮罩层点击处理
const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    close()
  }
}

// ESC键处理
const handleKeydown = (e: KeyboardEvent) => {
  if (props.closeOnPressEscape && e.key === 'Escape' && visible.value) {
    e.preventDefault()
    e.stopPropagation()
    close()
  }
}

// 监听props变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      open()
    } else {
      close()
    }
  },
)

// 初始化
onMounted(() => {
  if (props.modelValue) {
    open()
  }

  // 监听ESC键
  document.addEventListener('keydown', handleKeydown)
})

// 清理
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 暴露方法给父组件
defineExpose({
  open,
  close,
})
</script>

<style>
/* 遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: auto; /* 确保鼠标事件被捕获 */
}

/* 显示遮罩层时的动画 */
.modal-overlay.show {
  opacity: 1;
  display: flex;
  animation: overlayFadeIn 0.4s ease forwards;
}

/* 隐藏遮罩层时的动画 */
.modal-overlay.hiding {
  opacity: 0;
  animation: overlayFadeOut 0.4s ease forwards;
}

/* 弹窗窗口 - 基础样式 */
.window {
  background-image: url('../../assets/Popup/image.jpg');
  background-size: 100% 100%;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 40px 35px 100px 35px;
  width: 60vw;
  max-width: 800px;
  min-width: 500px;
  height: calc(60vw * 0.57);
  max-height: 500px;
  min-height: 400px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(139, 69, 19, 0.1);
  transform: scale(0.8) translateY(20px);
  font-family: 'No3';

  opacity: 0;
}

/* 弹窗显示时的动画 */
.window.show {
  animation:
    fadeIn 0.4s ease forwards,
    scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* 弹窗隐藏时的动画 */
.window.hide {
  animation:
    fadeOut 0.4s ease forwards,
    scaleOut 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* 弹窗标题 - 居中 */
.window h2 {
  margin-bottom: 20px;
  color: #8b4513;
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
  opacity: 0;
  transform: translateY(-20px);
  animation: slideInUp 0.5s ease forwards;
  animation-delay: 0.1s;
}

.window.show h2 {
  opacity: 1;
  transform: translateY(0);
}

/* 标题装饰线 */
.title-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #8b4513, transparent);
  margin: 0 auto 25px auto;
  position: relative;
  opacity: 0;
  transform: translateY(-20px);
  animation: slideInUp 0.5s ease forwards;
  animation-delay: 0.2s;
}

.window.show .title-line {
  opacity: 1;
  transform: translateY(0);
}

.title-line::before,
.title-line::after {
  content: '❖';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #8b4513;
  font-size: 16px;
}

.title-line::before {
  left: -20px;
}

.title-line::after {
  right: -20px;
}

/* 弹窗内容容器 - 修正高度计算 */
.content-container {
  background-color: rgba(255, 255, 255, 0);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  padding: 25px 30px;
  border: 1px solid rgba(139, 69, 19, 0.1);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  height: calc(100% - 120px) !important; /* 确保按钮不会被遮挡 */
  max-height: calc(100% - 120px) !important;
  overflow-y: auto;
  box-sizing: border-box; /* 确保padding包含在高度内 */
}

/* 弹窗内容 - 首行缩进 */
.window p {
  color: #333;
  line-height: 1.8;
  margin-bottom: 15px;
  text-indent: 2em;
  opacity: 0;
  transform: translateY(20px);
  font-size: 24px !important; /* 确保字体大小正确 */
  animation: slideInUp 0.5s ease forwards;
  animation-fill-mode: both;
}

.window.show .content-container p {
  opacity: 1;
  transform: translateY(0);
}

.window.show .content-container p:nth-child(1) {
  animation-delay: 0.3s;
}

.window.show .content-container p:nth-child(2) {
  animation-delay: 0.4s;
}

.window.show .content-container p:nth-child(3) {
  animation-delay: 0.5s;
}

.window.show .content-container p:nth-child(4) {
  animation-delay: 0.6s;
}

.window.show .content-container p:nth-child(5) {
  animation-delay: 0.7s;
}

.window.show .content-container p:nth-child(6) {
  animation-delay: 0.8s;
}

.window.show .content-container p:nth-child(7) {
  animation-delay: 0.9s;
}

.window.show .content-container p:nth-child(8) {
  animation-delay: 1s;
}

.window.show .content-container p:nth-child(9) {
  animation-delay: 1.1s;
}

.window.show .content-container p:nth-child(10) {
  animation-delay: 1.2s;
}

/* 按钮容器 */
.button-container {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 0 30px;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.5s ease forwards;
  animation-delay: 0.8s;
  animation-fill-mode: both;
}

.window.show .button-container {
  opacity: 1;
  transform: translateY(0);
}

/* 通用按钮样式 */
.modal-btn {
  padding: 12px 40px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'No3';
  min-width: 120px;
  text-align: center;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.8);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-fill-mode: both;
}

.window.show .modal-btn {
  opacity: 1;
  transform: scale(1);
}

.window.show .cancel-btn {
  animation-delay: 0.9s;
}

.window.show .confirm-btn,
.window.show .know-btn {
  animation-delay: 1s;
}

/* 按钮装饰边框 */
.modal-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modal-btn:hover::before {
  border-color: rgba(139, 69, 19, 0.3);
}

/* 取消按钮 */
.cancel-btn {
  background-color: rgba(240, 240, 240, 0.9);
  color: #8b4513;
  border: 2px solid #8b4513;
}

.cancel-btn:hover {
  background-color: rgba(139, 69, 19, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 69, 19, 0.2);
}

/* 确定按钮 */
.confirm-btn {
  background-color: rgba(139, 69, 19, 0.9);
  color: white;
  border: 2px solid #8b4513;
}

.confirm-btn:hover {
  background-color: rgba(107, 46, 0, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
}

/* 我知道了按钮 */
.know-btn {
  background-color: rgba(139, 69, 19, 0.9);
  color: white;
  border: 2px solid #8b4513;
}

.know-btn:hover {
  background-color: rgba(107, 46, 0, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
}

/* 滚动条样式 */
.content-container::-webkit-scrollbar {
  width: 6px;
}

.content-container::-webkit-scrollbar-track {
  background: rgba(139, 69, 19, 0.1);
  border-radius: 3px;
}

.content-container::-webkit-scrollbar-thumb {
  background: rgba(139, 69, 19, 0.5);
  border-radius: 3px;
}

.content-container::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 69, 19, 0.7);
}

/* 弹窗装饰元素 */
.window::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #8b4513 0%, rgba(139, 69, 19, 0.8) 50%, #8b4513 100%);
}

/* 动画关键帧 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8) translateY(20px);
  }
  to {
    transform: scale(1) translateY(0);
  }
}

@keyframes scaleOut {
  from {
    transform: scale(1) translateY(0);
  }
  to {
    transform: scale(0.8) translateY(-20px);
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideOutDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(20px);
    opacity: 0;
  }
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes overlayFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
