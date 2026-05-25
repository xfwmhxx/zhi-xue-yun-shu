<template>
  <div v-if="visible" class="page-transition">
    <!-- 离开动画（A页面消失时）- 包含文字内容，从合上开始 -->
    <div
      v-if="mode === 'leave'"
      :class="['transition-section', 'leave-upper', { animate: isAnimating }]"
      ref="leaveUpper"
    >
      <div v-if="showText" class="transition-content">
        <h1>智学云枢</h1>
        <div class="subtitle">AI赋能中医教育</div>
        <p>融合传统智慧与现代科技，开启中医学习新篇章</p>
        <div class="intro-text">
          中医药学是中华民族的瑰宝，承载着数千年的医学智慧。从《黄帝内经》奠定理论基础，到《伤寒杂病论》开创临床先河，中医典籍记录了丰富的理论知识和实践经验。阴阳五行、脏腑经络、辨证论治构成了中医独特的理论体系，为中华民族的健康保障作出了不可磨灭的贡献。
        </div>
      </div>
    </div>
    <div
      v-if="mode === 'leave'"
      :class="['transition-section', 'leave-lower', { animate: isAnimating }]"
      ref="leaveLower"
    ></div>

    <!-- 进入动画（B页面出现时）- 从分开状态开始 -->
    <div
      v-if="mode === 'enter'"
      :class="['transition-section', 'enter-upper', { animate: isAnimating }]"
      ref="enterUpper"
    >
      <div v-if="showText" class="transition-content">
        <h1>智学云枢</h1>
        <div class="subtitle">AI赋能中医教育</div>
        <p>融合传统智慧与现代科技，开启中医学习新篇章</p>
        <div class="intro-text">
          中医药学是中华民族的瑰宝，承载着数千年的医学智慧。从《黄帝内经》奠定理论基础，到《伤寒杂病论》开创临床先河，中医典籍记录了丰富的理论知识和实践经验。阴阳五行、脏腑经络、辨证论治构成了中医独特的理论体系，为中华民族的健康保障作出了不可磨灭的贡献。
        </div>
      </div>
    </div>
    <div
      v-if="mode === 'enter'"
      :class="['transition-section', 'enter-lower', { animate: isAnimating }]"
      ref="enterLower"
    ></div>

    <!-- 隐藏的音频元素 -->
    <audio ref="enterAudio" preload="auto">
      <source :src="EnterWave" type="audio/wav" />
    </audio>
    <audio ref="leaveAudio" preload="auto">
      <source :src="LeaveWave" type="audio/wav" />
    </audio>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, onMounted, nextTick } from 'vue'
import LeaveWave from '@/assets/PageTransition/leave.wav'
import EnterWave from '@/assets/PageTransition/enter.wav'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
  mode: {
    type: String,
    default: 'leave', // 'leave' 或 'enter'
    validator: (value) => ['leave', 'enter'].includes(value),
  },
  showText: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['animation-end'])

const isAnimating = ref(false)
const enterAudio = ref(null)
const leaveAudio = ref(null)

onMounted(() => {
  console.log('PageTransition组件挂载，模式:', props.mode, 'visible:', props.visible)

  // 如果组件挂载时就已经是可见的，立即开始动画
  if (props.visible) {
    console.log('组件挂载时visible=true，立即开始动画')
    startAnimation()
  }
})

// 使用immediate: true来立即执行
watch(
  () => props.visible,
  (val, oldVal) => {
    console.log('PageTransition visible变化:', oldVal, '->', val, '模式:', props.mode)
    if (val) {
      // 使用nextTick确保DOM更新完成
      nextTick(() => {
        console.log('nextTick后开始动画')
        startAnimation()
      })
    }
  },
  { immediate: true }, // 添加这个选项
)

// 播放音频函数
const playAudio = () => {
  try {
    if (props.mode === 'enter' && enterAudio.value) {
      console.log('播放进入音效: /PageTransition/enter.wav')
      enterAudio.value.currentTime = 0
      enterAudio.value.play().catch((error) => {
        console.warn('进入音效播放失败:', error)
      })
    } else if (props.mode === 'leave' && leaveAudio.value) {
      console.log('播放离开音效: /PageTransition/leave.wa')
      leaveAudio.value.currentTime = 0
      leaveAudio.value.play().catch((error) => {
        console.warn('离开音效播放失败:', error)
      })
    }
  } catch (error) {
    console.error('播放音频时出错:', error)
  }
}

const startAnimation = () => {
  console.log('开始过渡动画，模式:', props.mode)
  isAnimating.value = true

  // 播放对应的音频
  playAudio()

  // 动画持续时间
  const animationDuration = 1800

  console.log('动画将在', animationDuration, '毫秒后结束')

  // 动画完成后触发事件
  setTimeout(() => {
    console.log('过渡动画结束，触发animation-end事件')
    isAnimating.value = false
    emit('animation-end')
  }, animationDuration)
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'STKaiti', '楷体', 'SimSun', '宋体', serif;
}

/* 确保过渡层在最顶层 */
.page-transition {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999; /* 增加z-index，确保在最顶层 */
  pointer-events: none;
  display: block !important; /* 强制显示 */
}

.transition-section {
  position: absolute;
  width: 100%;
  height: 70%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 1 !important; /* 强制不透明 */
  visibility: visible !important; /* 强制可见 */
}

/* 过渡内容样式 */
.transition-content {
  max-width: 900px;
  text-align: center;
  z-index: 2;
  position: relative;
  padding: 3rem;
  opacity: 1 !important;
  visibility: visible !important;
}

.transition-content h1 {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  color: #f4e4c1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 8px;
  white-space: nowrap;
  opacity: 1 !important;
  visibility: visible !important;
}

.transition-content .subtitle {
  font-size: 2rem;
  margin-bottom: 2.5rem;
  color: #d4b483;
  font-weight: bold;
  letter-spacing: 4px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  opacity: 1 !important;
  visibility: visible !important;
}

.transition-content p {
  font-size: 1.4rem;
  line-height: 1.9;
  margin-bottom: 1.8rem;
  color: #e6d5b8;
  opacity: 1 !important;
  visibility: visible !important;
}

.transition-content .intro-text {
  font-size: 1.3rem;
  line-height: 1.8;
  color: #f0d8a8;
  text-align: justify;
  padding: 0 1.5rem;
  text-indent: 2em;
  opacity: 1 !important;
  visibility: visible !important;
}

/* 离开动画 - 用于页面离开时（A页面）：从显示到合上 */
.transition-section.leave-upper {
  top: 0;
  background: linear-gradient(135deg, #4a1f1f 0%, #5d2b2b 100%);
  transform-origin: top;
  z-index: 3;
  /* 开始时完全显示 */
  transform: translateY(0) rotateX(0);
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% calc(100% - 60px),
    98% calc(100% - 55px),
    96% calc(100% - 40px),
    94% calc(100% - 50px),
    92% calc(100% - 35px),
    90% calc(100% - 55px),
    88% calc(100% - 45px),
    86% calc(100% - 60px),
    84% calc(100% - 40px),
    82% calc(100% - 55px),
    80% calc(100% - 35px),
    78% calc(100% - 50px),
    76% calc(100% - 40px),
    74% calc(100% - 60px),
    72% calc(100% - 35px),
    70% calc(100% - 50px),
    68% calc(100% - 45px),
    66% calc(100% - 60px),
    64% calc(100% - 38px),
    62% calc(100% - 52px),
    60% calc(100% - 42px),
    58% calc(100% - 60px),
    56% calc(100% - 36px),
    54% calc(100% - 48px),
    52% calc(100% - 40px),
    50% calc(100% - 60px),
    48% calc(100% - 42px),
    46% calc(100% - 50px),
    44% calc(100% - 38px),
    42% calc(100% - 60px),
    40% calc(100% - 35px),
    38% calc(100% - 48px),
    36% calc(100% - 42px),
    34% calc(100% - 60px),
    32% calc(100% - 40px),
    30% calc(100% - 60px),
    28% calc(100% - 36px),
    26% calc(100% - 52px),
    24% calc(100% - 44px),
    22% calc(100% - 60px),
    20% calc(100% - 42px),
    18% calc(100% - 48px),
    16% calc(100% - 38px),
    14% calc(100% - 60px),
    12% calc(100% - 36px),
    10% calc(100% - 48px),
    8% calc(100% - 42px),
    6% calc(100% - 60px),
    4% calc(100% - 40px),
    2% calc(100% - 48px),
    0% calc(100% - 60px)
  );
  opacity: 1 !important;
  visibility: visible !important;
}

.transition-section.leave-lower {
  bottom: 0;
  background: linear-gradient(135deg, #5d2b2b 0%, #4a1f1f 100%);
  transform-origin: bottom;
  z-index: 2;
  /* 开始时完全显示 */
  transform: translateY(0) rotateX(0);
  clip-path: polygon(
    0% 60px,
    2% 48px,
    4% 40px,
    6% 0%,
    8% 42px,
    10% 48px,
    12% 36px,
    14% 0%,
    16% 38px,
    18% 48px,
    20% 42px,
    22% 0%,
    24% 44px,
    26% 52px,
    28% 36px,
    30% 0%,
    32% 40px,
    34% 0%,
    36% 42px,
    38% 48px,
    40% 35px,
    42% 0%,
    44% 38px,
    46% 50px,
    48% 42px,
    50% 0%,
    52% 40px,
    54% 48px,
    56% 36px,
    58% 0%,
    60% 42px,
    62% 52px,
    64% 38px,
    66% 0%,
    68% 45px,
    70% 50px,
    72% 35px,
    74% 0%,
    76% 40px,
    78% 50px,
    80% 35px,
    82% 0%,
    84% 40px,
    86% 60px,
    88% 45px,
    90% 50px,
    92% 35px,
    94% 50px,
    96% 40px,
    98% 55px,
    100% 60px,
    100% 100%,
    0% 100%
  );
  opacity: 1 !important;
  visibility: visible !important;
}

/* 进入动画 - 用于页面进入时（B页面）：从合上到分开 */
.transition-section.enter-upper {
  top: 0;
  background: linear-gradient(135deg, #4a1f1f 0%, #5d2b2b 100%);
  transform-origin: top;
  z-index: 3;
  /* 开始时是合上的状态 */
  transform: translateY(-100%) rotateX(3deg);
  clip-path: polygon(
    0% 0%,
    100% 0%,
    100% calc(100% - 60px),
    98% calc(100% - 55px),
    96% calc(100% - 40px),
    94% calc(100% - 50px),
    92% calc(100% - 35px),
    90% calc(100% - 55px),
    88% calc(100% - 45px),
    86% calc(100% - 60px),
    84% calc(100% - 40px),
    82% calc(100% - 55px),
    80% calc(100% - 35px),
    78% calc(100% - 50px),
    76% calc(100% - 40px),
    74% calc(100% - 60px),
    72% calc(100% - 35px),
    70% calc(100% - 50px),
    68% calc(100% - 45px),
    66% calc(100% - 60px),
    64% calc(100% - 38px),
    62% calc(100% - 52px),
    60% calc(100% - 42px),
    58% calc(100% - 60px),
    56% calc(100% - 36px),
    54% calc(100% - 48px),
    52% calc(100% - 40px),
    50% calc(100% - 60px),
    48% calc(100% - 42px),
    46% calc(100% - 50px),
    44% calc(100% - 38px),
    42% calc(100% - 60px),
    40% calc(100% - 35px),
    38% calc(100% - 48px),
    36% calc(100% - 42px),
    34% calc(100% - 60px),
    32% calc(100% - 40px),
    30% calc(100% - 60px),
    28% calc(100% - 36px),
    26% calc(100% - 52px),
    24% calc(100% - 44px),
    22% calc(100% - 60px),
    20% calc(100% - 42px),
    18% calc(100% - 48px),
    16% calc(100% - 38px),
    14% calc(100% - 60px),
    12% calc(100% - 36px),
    10% calc(100% - 48px),
    8% calc(100% - 42px),
    6% calc(100% - 60px),
    4% calc(100% - 40px),
    2% calc(100% - 48px),
    0% calc(100% - 60px)
  );
  opacity: 1 !important;
  visibility: visible !important;
}

.transition-section.enter-lower {
  bottom: 0;
  background: linear-gradient(135deg, #5d2b2b 0%, #4a1f1f 100%);
  transform-origin: bottom;
  z-index: 2;
  /* 开始时是合上的状态 */
  transform: translateY(100%) rotateX(-3deg);
  clip-path: polygon(
    0% 60px,
    2% 48px,
    4% 40px,
    6% 0%,
    8% 42px,
    10% 48px,
    12% 36px,
    14% 0%,
    16% 38px,
    18% 48px,
    20% 42px,
    22% 0%,
    24% 44px,
    26% 52px,
    28% 36px,
    30% 0%,
    32% 40px,
    34% 0%,
    36% 42px,
    38% 48px,
    40% 35px,
    42% 0%,
    44% 38px,
    46% 50px,
    48% 42px,
    50% 0%,
    52% 40px,
    54% 48px,
    56% 36px,
    58% 0%,
    60% 42px,
    62% 52px,
    64% 38px,
    66% 0%,
    68% 45px,
    70% 50px,
    72% 35px,
    74% 0%,
    76% 40px,
    78% 50px,
    80% 35px,
    82% 0%,
    84% 40px,
    86% 60px,
    88% 45px,
    90% 50px,
    92% 35px,
    94% 50px,
    96% 40px,
    98% 55px,
    100% 60px,
    100% 100%,
    0% 100%
  );
  opacity: 1 !important;
  visibility: visible !important;
}

/* 关键帧动画 */
/* 离开动画：从显示到合上 */
@keyframes leaveUpper {
  0% {
    transform: translateY(0) rotateX(0);
  }
  100% {
    transform: translateY(-100%) rotateX(3deg);
  }
}

@keyframes leaveLower {
  0% {
    transform: translateY(0) rotateX(0);
  }
  100% {
    transform: translateY(100%) rotateX(-3deg);
  }
}

/* 进入动画：从合上到显示 */
@keyframes enterUpper {
  0% {
    transform: translateY(-100%) rotateX(3deg);
  }
  100% {
    transform: translateY(0) rotateX(0);
  }
}

@keyframes enterLower {
  0% {
    transform: translateY(100%) rotateX(-3deg);
  }
  100% {
    transform: translateY(0) rotateX(0);
  }
}

/* 动画类 */
.leave-upper.animate {
  animation: leaveUpper 1.8s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
  opacity: 1 !important;
  visibility: visible !important;
}

.leave-lower.animate {
  animation: leaveLower 1.8s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
  opacity: 1 !important;
  visibility: visible !important;
}

.enter-upper.animate {
  animation: enterUpper 1.8s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
  opacity: 1 !important;
  visibility: visible !important;
}

.enter-lower.animate {
  animation: enterLower 1.8s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
  opacity: 1 !important;
  visibility: visible !important;
}

/* 隐藏的音频元素样式 */
audio {
  display: none;
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .transition-content h1 {
    font-size: 2.5rem;
    white-space: normal;
    letter-spacing: 4px;
  }

  .transition-content .subtitle {
    font-size: 1.4rem;
  }

  .transition-content p {
    font-size: 1.1rem;
  }

  .transition-content .intro-text {
    font-size: 1rem;
    text-indent: 1.5em;
  }

  .transition-content {
    padding: 1.5rem;
  }

  .transition-section.leave-upper,
  .transition-section.enter-upper {
    clip-path: polygon(
      0% 0%,
      100% 0%,
      100% calc(100% - 35px),
      90% calc(100% - 30px),
      80% calc(100% - 20px),
      70% calc(100% - 25px),
      60% calc(100% - 22px),
      50% calc(100% - 35px),
      40% calc(100% - 18px),
      30% calc(100% - 30px),
      20% calc(100% - 22px),
      10% calc(100% - 32px),
      0% calc(100% - 35px)
    );
  }

  .transition-section.leave-lower,
  .transition-section.enter-lower {
    clip-path: polygon(
      0% 35px,
      10% 32px,
      20% 22px,
      30% 30px,
      40% 18px,
      50% 35px,
      60% 22px,
      70% 25px,
      80% 20px,
      90% 30px,
      100% 35px,
      100% 100%,
      0% 100%
    );
  }
}
</style>
