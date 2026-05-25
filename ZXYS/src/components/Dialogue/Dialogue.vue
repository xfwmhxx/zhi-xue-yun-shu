<template>
  <!-- 遮罩层容器 - 添加点击监听 -->
  <div
    v-if="visible"
    class="overlay-container"
    id="tcd-overlay-container"
    @click="handleOverlayClick"
  ></div>

  <!-- 对话框容器 -->
  <Teleport to="body">
    <transition
      name="tcd-dialog"
      @enter="handleEnter"
      @after-enter="handleAfterEnter"
      @leave="handleLeave"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="visible"
        class="tcd-dialog-container"
        :style="containerStyle"
        @click="handleContainerClick"
      >
        <!-- 对话框 - 移除 @click.stop -->
        <div class="tcd-bk" role="dialog" aria-live="polite">
          <!-- 四角装饰 -->
          <div class="tcd-corner-decoration tcd-top-left"></div>
          <div class="tcd-corner-decoration tcd-top-right"></div>
          <div class="tcd-corner-decoration tcd-bottom-left"></div>
          <div class="tcd-corner-decoration tcd-bottom-right"></div>

          <!-- 底部中央提示 -->
          <div class="tcd-hint-container">
            <div class="tcd-hint-line"></div>
            <div class="tcd-hint-text tcd-hint-desktop">{{ hintText }}</div>
            <div class="tcd-hint-text tcd-hint-mobile">{{ hintText }}</div>
            <div class="tcd-hint-line"></div>
          </div>

          <div class="tcd-dialog-content">
            <div class="tcd-typewriter-container">
              <div ref="textElement" class="tcd-typewriter-text"></div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

export interface DialogStep {
  /** 文本内容 */
  text: string
  /** 要高亮元素的 CSS 选择器，如 '.highlight' 或 '#btn'，为空则不进行高亮 */
  highlightSelector?: string
  /** 自定义提示文本，不传则使用默认提示 */
  hintText?: string
  /** 自定义高亮区域样式 */
  highlightStyle?: Partial<CSSStyleDeclaration>
}

export interface DialogOptions {
  /** 向导步骤数组 */
  steps: DialogStep[]
  /** 打字速度（毫秒/字符），默认 50 */
  typingSpeed?: number
  /** 是否自动开始，默认 true */
  autoStart?: boolean
  /** 默认提示文本 */
  defaultHintText?: string
  /** 对话框宽度，默认 '60vw' */
  width?: string
  /** 对话框位置，默认 { bottom: '20px' } */
  position?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  /** 点击高亮区域时的回调 */
  onHighlightClick?: (stepIndex: number) => void
  /** 对话框关闭时的回调 */
  onClose?: () => void
  /** 步骤完成时的回调 */
  onStepComplete?: (stepIndex: number) => void
  /** 所有步骤完成时的回调 */
  onAllComplete?: () => void
}

const props = withDefaults(defineProps<DialogOptions>(), {
  typingSpeed: 50,
  autoStart: true,
  defaultHintText: '点击任意处继续',
  width: '60vw',
  position: () => ({ bottom: '20px' }),
  steps: () => [],
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
  'step-complete': [index: number]
  'all-complete': []
}>()

// 响应式状态
const visible = ref(false)
const currentStepIndex = ref(0)
const charIndex = ref(0)
const isTyping = ref(false)
const isWaitingForClick = ref(false)
const typingTimer = ref<number | null>(null)
const textElement = ref<HTMLElement>()

// 计算属性
const containerStyle = computed(() => ({
  width: props.width,
  top: props.position?.top,
  right: props.position?.right,
  bottom: props.position?.bottom,
  left: props.position?.left,
}))

const currentStep = computed(() => props.steps[currentStepIndex.value])
const hintText = computed(() => currentStep.value?.hintText || props.defaultHintText)

// 方法
const clearTimers = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
}

const createCursor = () => {
  const cursor = document.createElement('span')
  cursor.className = 'tcd-cursor'
  cursor.setAttribute('aria-hidden', 'true')
  return cursor
}

const removeCursor = () => {
  if (!textElement.value) return
  const cursor = textElement.value.querySelector('.tcd-cursor')
  if (cursor) cursor.remove()
}

const addCursor = () => {
  if (!textElement.value) return
  removeCursor()
  const cursor = createCursor()
  textElement.value.appendChild(cursor)
}

const hideHint = () => {
  const hintContainer = document.querySelector('.tcd-hint-container')
  if (hintContainer) {
    ;(hintContainer as HTMLElement).style.display = 'none'
  }
}

const showHint = () => {
  const hintContainer = document.querySelector('.tcd-hint-container')
  if (hintContainer) {
    ;(hintContainer as HTMLElement).style.display = 'flex'
  }
}

const showOverlayWithHole = (selector?: string) => {
  if (!selector) {
    hideOverlay()
    return
  }

  const targetElements = document.querySelectorAll(selector)
  if (targetElements.length === 0) {
    hideOverlay()
    return
  }

  // 清空遮罩容器
  const overlay = document.getElementById('tcd-overlay-container')
  if (!overlay) return

  overlay.innerHTML = ''

  targetElements.forEach((target) => {
    const targetElement = target as HTMLElement
    const targetRect = targetElement.getBoundingClientRect()

    // 控制亮孔离元素的距离
    const holePadding = 10
    const holeRadius = 25

    const hole = document.createElement('div')
    hole.className = 'tcd-overlay-hole'

    Object.assign(hole.style, {
      position: 'absolute',
      top: `${targetRect.top - holePadding}px`,
      left: `${targetRect.left - holePadding}px`,
      width: `${targetRect.width + 2 * holePadding}px`,
      height: `${targetRect.height + 2 * holePadding}px`,
      borderRadius: `${holeRadius}px`,
      pointerEvents: 'auto',
    })

    // 应用自定义样式
    if (currentStep.value?.highlightStyle) {
      Object.assign(hole.style, currentStep.value.highlightStyle)
    }

    hole.setAttribute('role', 'button')
    hole.setAttribute('tabindex', '0')

    // 移除 stopPropagation，让事件能冒泡
    hole.addEventListener('click', (event) => {
      // 移除 event.stopPropagation() 这行
      event.preventDefault()
      props.onHighlightClick?.(currentStepIndex.value)
      nextText()
    })

    hole.addEventListener('keydown', (event) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault()
        hole.click()
      }
    })

    overlay.appendChild(hole)

    setTimeout(() => {
      hole.classList.add('tcd-overlay-hole-active')
    }, 10)
  })
}

const hideOverlay = () => {
  const holes = document.querySelectorAll('.tcd-overlay-hole')
  holes.forEach((hole) => {
    hole.classList.remove('tcd-overlay-hole-active')
  })

  setTimeout(() => {
    const overlay = document.getElementById('tcd-overlay-container')
    if (overlay) overlay.innerHTML = ''
  }, 500)
}

const typeWriter = () => {
  clearTimers()

  if (!currentStep.value) return

  const currentText = currentStep.value.text

  if (charIndex.value < currentText.length) {
    if (textElement.value) {
      textElement.value.textContent = currentText.substring(0, charIndex.value)
      addCursor()
    }

    charIndex.value++

    typingTimer.value = window.setTimeout(typeWriter, props.typingSpeed)
    isTyping.value = true
  } else if (charIndex.value === currentText.length) {
    if (textElement.value) {
      textElement.value.textContent = currentText
      addCursor()
    }

    showOverlayWithHole(currentStep.value.highlightSelector)
    isWaitingForClick.value = true
    showHint()
    isTyping.value = false

    // 触发步骤完成事件
    emit('step-complete', currentStepIndex.value)
    props.onStepComplete?.(currentStepIndex.value)
  }
}

const applyDisappearAnimation = (callback: () => void) => {
  if (!textElement.value) return

  const animations = ['tcd-fade-out', 'tcd-slide-up', 'tcd-dissolve']
  const randomAnimation = animations[Math.floor(Math.random() * animations.length)]!

  textElement.value.classList.add(randomAnimation)
  removeCursor()

  setTimeout(() => {
    if (textElement.value) {
      textElement.value.classList.remove(randomAnimation)
      textElement.value.style.opacity = ''
      textElement.value.style.transform = ''
      textElement.value.style.filter = ''
      textElement.value.textContent = ''
    }

    if (callback) {
      setTimeout(callback, 50)
    }
  }, 500)
}

const showNextText = () => {
  if (currentStepIndex.value >= props.steps.length - 1) {
    // hideDialog()
    // emit('all-complete')
    // props.onAllComplete?.()
    // return
    // 修改这里，让 transition 控制动画
    visible.value = false
    // 移除了 hideDialog() 的调用，让 transition 处理动画
    setTimeout(() => {
      emit('all-complete')
      props.onAllComplete?.()
    }, 800) // 等待动画完成
    return
  }

  currentStepIndex.value++
  charIndex.value = 0
  isWaitingForClick.value = false
  isTyping.value = false

  hideOverlay()
  typeWriter()
}

const nextText = () => {
  if (!currentStep.value) return

  if (isTyping.value) {
    charIndex.value = currentStep.value.text.length
    if (textElement.value) {
      textElement.value.textContent = currentStep.value.text
    }
    removeCursor()
    addCursor()
    showOverlayWithHole(currentStep.value.highlightSelector)
    isWaitingForClick.value = true
    showHint()
    isTyping.value = false
    return
  }

  if (isWaitingForClick.value) {
    hideHint()
    applyDisappearAnimation(showNextText)
  }
}

// 添加遮罩层点击处理
const handleOverlayClick = (event: MouseEvent) => {
  if (!currentStep.value) return

  const target = event.target as HTMLElement

  // 如果是点击高亮孔本身，不在这里处理（高亮孔有自己的处理）
  if (target.classList.contains('tcd-overlay-hole')) {
    return
  }

  // 点击遮罩层其他区域
  nextText()
}

// 修改对话框容器点击处理
const handleContainerClick = (event: MouseEvent) => {
  if (!currentStep.value) return

  // 移除对对话框内容区域的阻止
  // 现在点击文本框内容区域也会触发 nextText()
  nextText()
}

const handleEnter = (el: Element) => {
  ;(el as HTMLElement).style.opacity = '0'
  ;(el as HTMLElement).style.transform = 'translateY(100px)'

  nextTick(() => {
    setTimeout(() => {
      ;(el as HTMLElement).style.transition = 'opacity 0.8s ease, transform 0.8s ease'
      ;(el as HTMLElement).style.opacity = '1'
      ;(el as HTMLElement).style.transform = 'translateY(0)'
    }, 10)
  })
}

const handleAfterEnter = () => {
  if (props.autoStart) {
    typeWriter()
  }
}

const handleLeave = (el: Element) => {
  ;(el as HTMLElement).style.transition = 'opacity 0.8s ease, transform 0.8s ease'
  ;(el as HTMLElement).style.opacity = '0'
  ;(el as HTMLElement).style.transform = 'translateY(100px)'
}

const handleAfterLeave = () => {
  emit('close')
  props.onClose?.()
  visible.value = false
}

// 公共方法
const showDialog = () => {
  visible.value = true
  currentStepIndex.value = 0
  charIndex.value = 0
  isTyping.value = false
  isWaitingForClick.value = false
  clearTimers()
  hideOverlay()
}

const hideDialog = () => {
  visible.value = false
  hideOverlay()
  hideHint()
  clearTimers()
}

const goToStep = (index: number) => {
  if (index < 0 || index >= props.steps.length) return

  clearTimers()
  currentStepIndex.value = index
  charIndex.value = 0
  isTyping.value = false
  isWaitingForClick.value = false

  if (textElement.value) {
    textElement.value.textContent = ''
  }

  hideOverlay()
  hideHint()

  nextTick(() => {
    typeWriter()
  })
}

// 暴露公共方法
defineExpose({
  show: showDialog,
  hide: hideDialog,
  goToStep,
  currentStep: currentStepIndex,
})

// 监听器
watch(
  () => props.steps,
  () => {
    if (visible.value) {
      goToStep(0)
    }
  },
  { deep: true },
)

// 生命周期
onMounted(() => {
  if (props.autoStart) {
    showDialog()
  }
})

onUnmounted(() => {
  clearTimers()
  hideOverlay()
})
</script>

<style>
:root {
  --tcd-primary-color: #8b4513;
  --tcd-secondary-color: #3e2e1e;
  --tcd-tertiary-color: #5d4037;
  --tcd-background-color: #f5f0e1;
  --tcd-card-bg: #f8f3e6;
  --tcd-shadow-color: rgba(139, 69, 19, 0.2);
  --tcd-shadow-color-dark: rgba(139, 69, 19, 0.3);
  --tcd-transition-speed: 0.3s;
  --tcd-border-radius: 10px;
  --tcd-dialog-border-radius: 15px;
}

/* 遮罩层容器 */
.overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  z-index: 9998;
  cursor: pointer;
}

/* 高亮区域 */
.tcd-overlay-hole {
  position: absolute;
  border-radius: 25px;
  background-color: transparent;
  z-index: 10000;
  pointer-events: auto;
  opacity: 0;
  transition: opacity 0.5s ease;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  cursor: pointer;
}

.tcd-overlay-hole-active {
  opacity: 1;
}

.tcd-overlay-hole:after {
  content: '';
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border: 2px solid #ffd700;
  border-radius: 30px;
  opacity: 0.8;
  animation: tcd-pulse-border 2s infinite ease-in-out;
  pointer-events: none;
}

@keyframes tcd-pulse-border {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* 对话框容器 */
.tcd-dialog-container {
  position: fixed;
  z-index: 9999;
  /* min-height: 300px; */
  pointer-events: auto;
  left: 20%;
  right: 20%;
  cursor: pointer;
  font-family: 'No3';
}

/* 对话框 */
.tcd-bk {
  background-color: var(--tcd-card-bg);
  background-image:
    linear-gradient(to bottom, rgba(139, 69, 19, 0.1) 1px, transparent 1px),
    linear-gradient(to right, rgba(139, 69, 19, 0.1) 1px, transparent 1px);
  background-size: 20px 40px;
  border: 2px solid var(--tcd-primary-color);
  border-radius: var(--tcd-dialog-border-radius);
  padding: 30px 80px;
  box-sizing: border-box;
  height: auto;
  width: 100%;
  /* font-family: 'ZCOOL XiaoWei', serif; */

  font-size: 24px;
  line-height: 40px;
  text-indent: 2em;
  color: var(--tcd-secondary-color);
  box-shadow: 0 10px 30px rgba(139, 69, 19, 0.3);
  overflow: hidden;
  /* min-height: 300px; */
  height: 270px;
  position: relative;
  cursor: pointer;
}

/* 纸张边缘的仿古效果 */
.tcd-bk:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 95%, rgba(139, 69, 19, 0.1) 100%);
  pointer-events: none;
  z-index: 1;
}

.tcd-bk:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(
      circle at 20% 30%,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.7) 120px,
      rgba(255, 255, 255, 0) 240px
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.7) 120px,
      rgba(255, 255, 255, 0) 240px
    );
  pointer-events: none;
  z-index: 1;
}

/* 四角装饰 */
.tcd-corner-decoration {
  position: absolute;
  width: 40px;
  height: 40px;
  z-index: 2;
}

.tcd-top-left {
  top: 10px;
  left: 10px;
  border-top: 2px solid var(--tcd-primary-color);
  border-left: 2px solid var(--tcd-primary-color);
  border-top-left-radius: 8px;
}

.tcd-top-right {
  top: 10px;
  right: 10px;
  border-top: 2px solid var(--tcd-primary-color);
  border-right: 2px solid var(--tcd-primary-color);
  border-top-right-radius: 8px;
}

.tcd-bottom-left {
  bottom: 10px;
  left: 10px;
  border-bottom: 2px solid var(--tcd-primary-color);
  border-left: 2px solid var(--tcd-primary-color);
  border-bottom-left-radius: 8px;
}

.tcd-bottom-right {
  bottom: 10px;
  right: 10px;
  border-bottom: 2px solid var(--tcd-primary-color);
  border-right: 2px solid var(--tcd-primary-color);
  border-bottom-right-radius: 8px;
}

.tcd-dialog-content {
  position: relative;
  z-index: 2;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tcd-typewriter-container {
  position: relative;
  min-height: 200px;
}

.tcd-typewriter-text {
  font-size: 24px;
  line-height: 40px;
  text-indent: 2em;
  min-height: 200px;
  white-space: pre-wrap;
  word-wrap: break-word;
  position: relative;
}

/* 光标样式 */
.tcd-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background-color: var(--tcd-primary-color);
  vertical-align: middle;
  margin-left: 2px;
  animation: tcd-blink 1s infinite;
  position: relative;
  top: -2px;
}

@keyframes tcd-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* 文本消失动画 */
.tcd-fade-out {
  animation: tcd-fade-out-anim 0.5s ease-out forwards;
}

.tcd-slide-up {
  animation: tcd-slide-up-anim 0.5s ease-out forwards;
}

.tcd-dissolve {
  animation: tcd-dissolve-anim 0.5s ease-out forwards;
}

@keyframes tcd-fade-out-anim {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes tcd-slide-up-anim {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

@keyframes tcd-dissolve-anim {
  0% {
    opacity: 1;
    filter: blur(0px);
  }
  100% {
    opacity: 0;
    filter: blur(10px);
  }
}

/* 底部中央提示 */
.tcd-hint-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  z-index: 3;
}

.tcd-hint-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--tcd-primary-color), transparent);
  margin: 0 10px;
}

.tcd-hint-text {
  /* font-family: 'ZCOOL XiaoWei', serif; */
  font-size: 16px;
  color: var(--tcd-primary-color);
  white-space: nowrap;
  animation: tcd-pulse 2s infinite ease-in-out;
  margin-right: 50px;
}

.tcd-hint-mobile {
  display: none;
}

@keyframes tcd-pulse {
  0%,
  100% {
    opacity: 0.7;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tcd-bk {
    padding: 20px 30px;
    font-size: 20px;
    line-height: 35px;
    min-height: 250px;
  }

  .tcd-typewriter-text {
    font-size: 20px;
    line-height: 35px;
    min-height: 150px;
  }

  .tcd-typewriter-container {
    min-height: 150px;
  }

  .tcd-cursor {
    height: 1.1em;
  }

  .tcd-hint-text {
    font-size: 14px;
  }

  .tcd-hint-desktop {
    display: none;
  }

  .tcd-hint-mobile {
    display: block;
  }

  .tcd-hint-container {
    bottom: 15px;
  }
}

@media (max-width: 480px) {
  .tcd-bk {
    padding: 15px 20px;
    font-size: 18px;
    line-height: 30px;
    min-height: 220px;
  }

  .tcd-typewriter-text {
    font-size: 18px;
    line-height: 30px;
    min-height: 120px;
  }

  .tcd-typewriter-container {
    min-height: 120px;
  }

  .tcd-cursor {
    height: 1em;
  }

  .tcd-hint-text {
    font-size: 12px;
  }

  .tcd-hint-container {
    bottom: 10px;
  }

  .tcd-hint-line {
    margin: 0 5px;
  }
}
</style>
