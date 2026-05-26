<!-- VisualNovelGuide.vue - 杏林主题样式版 -->
<template>
  <div v-if="visible" class="visual-novel-overlay">
    <!-- 背景层 -->
    <div class="vn-background-layer">
      <div
        class="vn-bg-image"
        :style="{ backgroundImage: `url(${getImageUrl(currentScene.background)})` }"
      ></div>
      <div class="vn-bg-overlay"></div>
    </div>

    <!-- 角色立绘层 -->
    <div class="vn-character-layer">
      <div
        v-if="currentScene.character && !currentScene.character.hidden"
        class="vn-character"
        :class="currentScene.character.position"
        :style="getCharacterContainerStyle(currentScene.character)"
      >
        <img
          :src="getImageUrl(currentScene.character.image)"
          :alt="currentScene.character.name || '角色'"
          :style="getCharacterImageStyle(currentScene.character)"
        />
      </div>
    </div>

    <!-- 对话框层 -->
    <div class="vn-dialogue-layer">
      <div class="vn-dialogue-container">
        <div v-if="currentScene.characterName" class="vn-dialogue-name">
          {{ currentScene.characterName }}
        </div>

        <div class="vn-dialogue-text">
          <span>{{ displayText }}</span>
          <span v-if="isTyping && !showOptions" class="vn-cursor">|</span>
        </div>

        <!-- 进度条（仅当没有选项时显示） -->
        <div class="vn-progress" v-if="!showOptions">
          <div class="vn-progress-bar">
            <div class="vn-progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="vn-progress-text">{{ currentStep + 1 }} / {{ totalSteps }}</div>
        </div>

        <!-- 选项区域 -->
        <div v-if="showOptions" class="vn-options">
          <button
            v-for="(option, idx) in currentScene.options"
            :key="idx"
            class="vn-option"
            :disabled="optionSelected"
            @click="selectOption(option)"
          >
            {{ option.text }}
          </button>
        </div>

        <!-- 普通按钮 -->
        <div class="vn-buttons" v-if="!showOptions">
          <button v-if="currentStep > 0" class="vn-btn vn-btn-prev" @click="prevStep">
            ← 回退
          </button>
          <button class="vn-btn vn-btn-next" @click="nextStep">
            {{ isTyping ? '跳过' : currentStep === totalSteps - 1 ? '完成' : '下一步' }}
          </button>
        </div>
      </div>
    </div>

    <button class="vn-close" @click="close">×</button>

    <!-- 反馈提示浮层 -->
    <div v-if="feedbackMessage" class="vn-feedback" :class="feedbackType">
      {{ feedbackMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  scenes: {
    type: Array,
    required: true,
  },
  typingSpeed: {
    type: Number,
    default: 50,
  },
  autoStart: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['complete', 'close', 'option-selected'])

const visible = ref(false)
const currentStep = ref(0)
const displayText = ref('')
const isTyping = ref(false)
const showOptions = ref(false)
const optionSelected = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('')
let typingTimer = null
let feedbackTimer = null

// 处理图片 URL - 修复背景加载问题
const getImageUrl = (path) => {
  if (!path) return ''
  // 如果是完整的URL或data URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('data:') || path.startsWith('blob:')) return path
  // 处理相对路径和绝对路径
  if (path.startsWith('@/') || path.startsWith('/src/')) {
    // 对于Vite项目，需要特殊处理，这里返回原路径让Vite处理
    return path
  }
  return path
}

// 获取角色容器样式
const getCharacterContainerStyle = (character) => {
  const style = {}

  if (character.offsetX !== undefined) {
    if (character.position === 'center') {
      style.left = `calc(50% + ${character.offsetX}px)`
    } else if (character.position === 'left') {
      style.left = `${character.offsetX}px`
    } else if (character.position === 'right') {
      style.right = `${character.offsetX}px`
    }
  }

  if (character.offsetY !== undefined) {
    style.bottom = `${character.offsetY}px`
  }

  if (character.opacity !== undefined) {
    style.opacity = character.opacity
  }

  if (character.zIndex !== undefined) {
    style.zIndex = character.zIndex
  }

  return style
}

// 获取角色图片样式
const getCharacterImageStyle = (character) => {
  const style = {}

  if (character.size !== undefined) {
    if (typeof character.size === 'number') {
      style.width = `${character.size}px`
      style.height = 'auto'
    } else {
      style.width = character.size
      style.height = 'auto'
    }
  } else if (character.width !== undefined) {
    if (typeof character.width === 'number') {
      style.width = `${character.width}px`
    } else {
      style.width = character.width
    }
    style.height = 'auto'
  } else if (character.height !== undefined) {
    if (typeof character.height === 'number') {
      style.height = `${character.height}px`
    } else {
      style.height = character.height
    }
    style.width = 'auto'
  }

  if (character.scale !== undefined) {
    style.transform = `scale(${character.scale})`
    if (character.position === 'center') {
      style.transformOrigin = 'center center'
    }
  }

  if (character.borderRadius !== undefined) {
    style.borderRadius =
      typeof character.borderRadius === 'number'
        ? `${character.borderRadius}px`
        : character.borderRadius
  }

  if (character.boxShadow) {
    style.boxShadow = character.boxShadow
  }

  if (character.rotate !== undefined) {
    if (style.transform) {
      style.transform += ` rotate(${character.rotate}deg)`
    } else {
      style.transform = `rotate(${character.rotate}deg)`
    }
  }

  if (character.filter) {
    style.filter = character.filter
  }

  if (character.animation) {
    style.animation = character.animation
  }

  style.maxWidth = '100%'
  style.maxHeight = '80vh'
  style.objectFit = 'contain'

  return style
}

// 当前场景
const currentScene = computed(
  () => props.scenes[currentStep.value] || props.scenes[props.scenes.length - 1],
)

// 总步骤数
const totalSteps = computed(() => props.scenes.length)

// 进度百分比
const progressPercent = computed(() => ((currentStep.value + 1) / totalSteps.value) * 100)

// 当前场景是否有选项
const hasOptions = computed(() => {
  return currentScene.value?.options && currentScene.value.options.length > 0
})

// 打字机效果
const startTyping = async (text) => {
  if (typingTimer) {
    clearInterval(typingTimer)
    isTyping.value = false
  }

  if (!text) {
    displayText.value = ''
    return
  }

  isTyping.value = true
  displayText.value = ''
  showOptions.value = false
  optionSelected.value = false

  let index = 0
  return new Promise((resolve) => {
    typingTimer = setInterval(() => {
      if (index < text.length) {
        displayText.value += text[index]
        index++
      } else {
        clearInterval(typingTimer)
        isTyping.value = false

        // 打字完成后，如果有选项则显示
        if (hasOptions.value) {
          showOptions.value = true
        }
        resolve()
      }
    }, props.typingSpeed)
  })
}

// 显示反馈
const showFeedback = (isCorrect, message) => {
  feedbackType.value = isCorrect ? 'correct' : 'incorrect'
  feedbackMessage.value = message || (isCorrect ? '✓ 回答正确！' : '✗ 回答错误')

  if (feedbackTimer) clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => {
    feedbackMessage.value = ''
    feedbackType.value = ''
  }, 1500)
}

// 选择选项
const selectOption = async (option) => {
  if (optionSelected.value) return

  optionSelected.value = true

  // 显示反馈
  if (option.correct !== undefined) {
    showFeedback(option.correct, option.feedback)
  }

  // 触发事件
  emit('option-selected', option, currentStep.value)

  // 延迟后继续
  setTimeout(async () => {
    showOptions.value = false

    // 处理选项跳转
    if (option.nextStep !== undefined) {
      if (typingTimer) clearInterval(typingTimer)
      isTyping.value = false
      currentStep.value = option.nextStep
      await loadScene()
    } else if (option.action === 'complete') {
      emit('complete')
      close()
    } else if (option.action === 'close') {
      close()
    } else {
      // 默认下一场景
      await nextStep()
    }
  }, 1500)
}

// 加载场景
const loadScene = async () => {
  const scene = currentScene.value

  // 重置选项状态
  showOptions.value = false
  optionSelected.value = false

  if (scene.text) {
    await startTyping(scene.text)
  } else {
    // 没有文本，直接检查是否有选项
    if (hasOptions.value) {
      showOptions.value = true
    }
  }

  // 高亮效果
  if (scene.highlightSelector) {
    await nextTick()
    setTimeout(() => {
      const el = document.querySelector(scene.highlightSelector)
      if (el) {
        el.classList.add('vn-highlight-element')
        setTimeout(() => {
          el.classList.remove('vn-highlight-element')
        }, 2000)
      }
    }, 100)
  }
}

// 下一步
const nextStep = async () => {
  // 如果正在打字，跳过打字
  if (isTyping.value) {
    if (typingTimer) {
      clearInterval(typingTimer)
      isTyping.value = false
    }
    displayText.value = currentScene.value.text
    // 如果有选项，显示选项
    if (hasOptions.value) {
      showOptions.value = true
    }
    return
  }

  // 如果当前场景有选项且未选择，不继续
  if (hasOptions.value && !optionSelected.value) {
    return
  }

  // 完成或下一步
  if (currentStep.value === totalSteps.value - 1) {
    emit('complete')
    close()
  } else {
    currentStep.value++
    await loadScene()
  }
}

// 上一步
const prevStep = async () => {
  if (typingTimer) {
    clearInterval(typingTimer)
    isTyping.value = false
  }

  if (currentStep.value > 0) {
    currentStep.value--
    await loadScene()
  }
}

// 开始引导
const start = async () => {
  visible.value = true
  currentStep.value = 0
  await loadScene()
}

// 关闭引导
const close = () => {
  visible.value = false
  if (typingTimer) {
    clearInterval(typingTimer)
    isTyping.value = false
  }
  if (feedbackTimer) {
    clearTimeout(feedbackTimer)
  }
  emit('close')
}

// 跳转到指定步骤
const jumpToStep = async (step) => {
  if (step >= 0 && step < totalSteps.value) {
    if (typingTimer) {
      clearInterval(typingTimer)
      isTyping.value = false
    }
    currentStep.value = step
    await loadScene()
  }
}

// 监听场景变化，滚动到高亮元素
watch(currentScene, () => {
  if (currentScene.value?.highlightSelector) {
    setTimeout(() => {
      const element = document.querySelector(currentScene.value.highlightSelector)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }
})

if (props.autoStart) {
  start()
}

defineExpose({
  start,
  close,
  nextStep,
  prevStep,
  jumpToStep,
})
</script>

<style scoped>
/* 杏林主题样式 - 浅杏色玻璃基底、古铜色边框、深褐色文字、印章红强调 */
.visual-novel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.75);
}

.vn-background-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.vn-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 背景覆盖层 - 杏林暖色调 */
.vn-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(210, 180, 140, 0.2) 0%, rgba(139, 69, 19, 0.5) 100%);
}

.vn-character-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}

.vn-character {
  position: absolute;
  bottom: 200px;
  pointer-events: none;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.vn-character.left {
  left: 50px;
}

.vn-character.center {
  left: 50%;
  transform: translateX(-50%);
}

.vn-character.right {
  right: 50px;
}

.vn-character img {
  display: block;
  transition: all 0.3s ease;
}

/* 对话框层 - 玻璃基底效果 */
.vn-dialogue-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  background: rgba(245, 235, 210, 0.92);
  backdrop-filter: blur(12px);
  border-top: 2px solid rgba(184, 115, 51, 0.6);
  box-shadow: 0 -8px 32px rgba(139, 69, 19, 0.2);
  padding: 20px 30px;
}

.vn-dialogue-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 角色名 - 古铜色边框 + 印章红文字 */
.vn-dialogue-name {
  font-size: 18px;
  font-weight: bold;
  color: #c23b22;
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 3px solid #b87333;
  letter-spacing: 1px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

/* 对话文字 - 深褐色 */
.vn-dialogue-text {
  font-size: 18px;
  line-height: 1.6;
  color: #4a2c14;
  min-height: 80px;
  margin-bottom: 15px;
  padding: 0 10px;
  font-weight: 500;
}

/* 光标闪烁 */
.vn-cursor {
  animation: blink 0.8s infinite;
  color: #b87333;
}

/* 进度条区域 */
.vn-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  padding: 0 10px;
}

/* 进度条轨道 - 浅杏色基底 */
.vn-progress-bar {
  flex: 1;
  height: 4px;
  background-color: rgba(184, 115, 51, 0.25);
  border-radius: 4px;
  overflow: hidden;
}

/* 进度条填充 - 古铜色渐变 */
.vn-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #b87333, #d4a373);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 进度文本 - 深褐色 */
.vn-progress-text {
  font-size: 12px;
  color: #5a3a22;
  font-weight: 500;
}

/* 按钮容器 */
.vn-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 10px;
}

/* 通用按钮样式 */
.vn-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 回退按钮 - 古铜色边框透明玻璃 */
.vn-btn-prev {
  background-color: rgba(245, 235, 210, 0.85);
  color: #5a3a22;
  border: 1px solid #b87333;
  backdrop-filter: blur(4px);
}

.vn-btn-prev:hover {
  background-color: rgba(245, 235, 210, 1);
  border-color: #c23b22;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(184, 115, 51, 0.3);
}

/* 下一步/完成按钮 - 古铜色主色 */
.vn-btn-next {
  background: linear-gradient(135deg, #b87333, #9a5a2a);
  color: #fdf8ed;
  box-shadow: 0 2px 6px rgba(139, 69, 19, 0.3);
}

.vn-btn-next:hover {
  background: linear-gradient(135deg, #c4813a, #ad6530);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(184, 115, 51, 0.4);
}

/* 选择题样式 - 杏林主题 */
.vn-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 10px;
  margin-top: 5px;
  margin-bottom: 15px;
}

/* 选项按钮 - 玻璃基底 + 古铜色边框 */
.vn-option {
  padding: 12px 20px;
  background: rgba(245, 235, 210, 0.75);
  backdrop-filter: blur(4px);
  border: 1px solid #b87333;
  border-radius: 12px;
  color: #4a2c14;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-weight: 500;
}

.vn-option:hover:not(:disabled) {
  background: rgba(245, 235, 210, 0.95);
  border-color: #c23b22;
  transform: translateX(6px);
  box-shadow: 0 2px 8px rgba(184, 115, 51, 0.25);
}

.vn-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 反馈提示浮层 - 印章红 + 古铜点缀 */
.vn-feedback {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 28px;
  border-radius: 48px;
  font-size: 16px;
  font-weight: bold;
  z-index: 10001;
  animation: vn-feedback-fade 1.5s ease forwards;
  white-space: nowrap;
  box-shadow: 0 6px 24px rgba(139, 69, 19, 0.4);
  letter-spacing: 1px;
}

/* 正确反馈 - 印章红底 */
.vn-feedback.correct {
  background: #c23b22;
  color: #fdf8ed;
  border-left: 4px solid #ffd78c;
}

/* 错误反馈 - 深褐色底 */
.vn-feedback.incorrect {
  background: #5a3a22;
  color: #fdf8ed;
  border-left: 4px solid #c23b22;
}

@keyframes vn-feedback-fade {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.85);
  }
  15% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.05);
  }
  30% {
    transform: translate(-50%, -50%) scale(1);
  }
  85% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.85);
  }
}

/* 关闭按钮 - 古铜色玻璃 */
.vn-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(245, 235, 210, 0.85);
  backdrop-filter: blur(4px);
  border: 1px solid #b87333;
  color: #5a3a22;
  font-size: 24px;
  cursor: pointer;
  z-index: 4;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vn-close:hover {
  background-color: rgba(245, 235, 210, 1);
  border-color: #c23b22;
  transform: rotate(90deg) scale(1.02);
  color: #c23b22;
}

/* 光标闪烁动画 */
@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* 全局高亮元素 - 印章红脉冲 */
:global(.vn-highlight-element) {
  animation: vn-pulse 0.5s ease-in-out 3;
  box-shadow: 0 0 0 3px #c23b22 !important;
  border-radius: 8px;
  position: relative;
  z-index: 100;
}

@keyframes vn-pulse {
  0% {
    box-shadow: 0 0 0 0 #c23b22;
  }
  70% {
    box-shadow: 0 0 0 12px rgba(194, 59, 34, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(194, 59, 34, 0);
  }
}

/* 响应式适配 - 保持杏林主题 */
@media (max-width: 768px) {
  .vn-dialogue-layer {
    padding: 15px 20px;
  }

  .vn-dialogue-text {
    font-size: 15px;
    min-height: 70px;
  }

  .vn-dialogue-name {
    font-size: 15px;
  }

  .vn-option {
    font-size: 14px;
    padding: 10px 15px;
  }

  .vn-btn {
    padding: 6px 16px;
    font-size: 13px;
  }

  .vn-character {
    bottom: 150px;
  }

  .vn-character.left {
    left: 20px;
  }

  .vn-character.right {
    right: 20px;
  }
}
</style>
