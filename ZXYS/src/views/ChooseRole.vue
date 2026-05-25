<template>
  <!-- 显示进入动画 -->
  <PageTransition
    v-if="showTransition"
    mode="leave"
    :show-text="true"
    @animation-end="onEnterAnimationEnd"
  />

  <!-- 页面背景浮动装饰（增强页面充实感） -->
  <div class="page-decorations">
    <div class="decor-item decor-1"></div>
    <div class="decor-item decor-2"></div>
    <div class="decor-item decor-3"></div>
    <div class="decor-item decor-4"></div>
  </div>

  <!-- 主容器 -->
  <div class="main-container">
    <!-- 顶部面包屑 -->
    <BreadcrumbNav title="角色选择" :show-back="false" />

    <!-- 面包屑占位符 -->
    <div class="breadcrumb-placeholder"></div>

    <!-- 页面内容区域 -->
    <div class="content-area">
      <div class="selection-section">
        <div class="character-selection">
          <!-- 标题区域 -->
          <div class="selection-header">
            <div class="title-decoration-top">
              <span class="dot"></span>
              <span class="line"></span>
              <span class="dot"></span>
            </div>
            <div class="title-main-wrapper">
              <!-- 左侧装饰：菱形点 + 渐变线 -->
              <span class="side-symbol left">
                <i class="symbol-diamond"></i>
                <i class="symbol-line"></i>
              </span>
              <h2 class="selection-title">请选择您的身份角色</h2>
              <!-- 右侧装饰：渐变线 + 菱形点 -->
              <span class="side-symbol right">
                <i class="symbol-line"></i>
                <i class="symbol-diamond"></i>
              </span>
            </div>
            <p class="selection-subtitle">传承岐黄薪火 · 开启智慧中医之旅</p>
          </div>

          <!-- 角色卡片区域 -->
          <div class="selection-main">
            <div class="characters-container">
              <div
                v-for="role in roles"
                :key="role.id"
                class="character-card"
                :class="[
                  `role-${role.id}`,
                  {
                    selected: selectedRoleId === role.id,
                    'not-selected': selectedRoleId && selectedRoleId !== role.id,
                  },
                ]"
                @click="selectRole(role.id)"
              >
                <!-- 卡片外发光层 -->
                <div class="card-glow-layer"></div>

                <!-- 玻璃拟态卡片主体 -->
                <div class="card-inner glass-effect">
                  <!-- 内部底纹装饰 -->
                  <div class="card-pattern"></div>

                  <!-- 传统中式印章点缀 -->
                  <div class="card-seal">{{ role.icon }}</div>

                  <!-- 边框动态流光 -->
                  <div class="border-shimmer"></div>

                  <!-- 四角装饰 -->
                  <div class="corner-decor top-left"></div>
                  <div class="corner-decor top-right"></div>
                  <div class="corner-decor bottom-left"></div>
                  <div class="corner-decor bottom-right"></div>

                  <!-- 角色图标 -->
                  <div class="card-icon-wrapper">
                    <div class="card-icon">
                      <span class="icon-text">{{ role.icon }}</span>
                      <div class="icon-pulse"></div>
                    </div>
                  </div>

                  <!-- 内容展示 -->
                  <div class="card-content">
                    <h3 class="card-title">{{ role.title }}</h3>
                    <div class="title-separator">
                      <span class="sep-dot"></span>
                      <span class="sep-line"></span>
                      <span class="sep-dot"></span>
                    </div>
                    <p class="card-subtitle-en">{{ role.subtitle }}</p>
                    <div class="card-desc">
                      {{ role.shortDesc }}
                    </div>
                  </div>

                  <!-- 选中指示器 -->
                  <div v-if="selectedRoleId === role.id" class="selected-indicator">
                    <span class="check-icon">✓</span>
                    <span class="indicator-text">身份已选定</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部确认区域 -->
          <div class="selection-footer">
            <transition name="button-fade">
              <div v-if="selectedRoleId" class="action-buttons">
                <button class="confirm-btn glass-btn" @click="confirmSelection">
                  <span class="btn-shine"></span>
                  <span class="btn-text">确认选择</span>
                  <span class="btn-arrow">→</span>
                </button>
              </div>
            </transition>

            <transition name="hint-fade" mode="out-in">
              <div v-if="!selectedRoleId" class="selection-hint" key="none">
                <div class="hint-icon-anim"><span></span><span></span><span></span></div>
                <span class="hint-text">点击上方卡片选择您的专属身份</span>
              </div>
              <div v-else class="selection-hint selected-hint" key="selected">
                <span class="hint-icon">●</span>
                <span class="hint-text">已准备就绪，请点击按钮开始您的中医修行</span>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>

  <PageTransition
    v-if="showTransition2"
    mode="enter"
    :show-text="true"
    @animation-end="onLeaveAnimationEnd"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import PageTransition from '@/components/PageTransition.vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import { tcd } from '@/components/Dialogue'
import { PopupPlugin } from '@/components/Popup'

const router = useRouter()

const showTransition = ref(false)
const selectedRoleId = ref(null)
const showTransition2 = ref(false)

const roles = [
  {
    id: 1,
    title: '中医爱好者',
    subtitle: 'TCM Enthusiast',
    icon: '愛',
    shortDesc: '热爱传统文化，追求自然康养之道，探索日常调理秘方。',
  },
  {
    id: 2,
    title: '中医学者',
    subtitle: 'TCM Scholar',
    icon: '醫',
    shortDesc: '深研岐黄之术，提升专业素养，志在医道精进与学术突破。',
  },
  {
    id: 3,
    title: '中医求职者',
    subtitle: 'Career Seeker',
    icon: '職',
    shortDesc: '开启职业新篇，AI模拟实战演练，助力斩获理想中医岗位。',
  },
]
// 下一个页面路由
const nextRoute = ref('')

const selectRole = (roleId: any) => {
  selectedRoleId.value = roleId
}

const confirmSelection = () => {
  if (selectedRoleId.value === 1) {
    PopupPlugin.showType1({
      title: '身份确认',
      content: [
        '确认以“中医爱好者”身份进入吗？',
        '我们将带您轻松领略中医文化的独特魅力，随心探索中医奥秘。',
      ],
      onConfirm: async () => {
        nextRoute.value = '/userhome'
        showTransition2.value = true
      },
      onCancel: () => console.log('取消'),
    })
  } else if (selectedRoleId.value === 2) {
    PopupPlugin.showType1({
      title: '身份确认',
      content: [
        '确认以“中医学者”身份进入吗？',
        '我们将带您轻松领略中医文化的独特魅力，随心探索中医奥秘。',
      ],
      onConfirm: async () => {
        nextRoute.value = '/initialize/userinfo/2'
        showTransition2.value = true
      },
      onCancel: () => console.log('取消'),
    })
  } else if (selectedRoleId.value === 3) {
    PopupPlugin.showType1({
      title: '身份确认',
      content: [
        '确认以“中医求职者”身份进入吗？',
        '我们将带您轻松领略中医文化的独特魅力，随心探索中医奥秘。',
      ],
      onConfirm: async () => {
        nextRoute.value = '/initialize/userinfo/3'
        showTransition2.value = true
      },
      onCancel: () => console.log('取消'),
    })
  }
}

const onEnterAnimationEnd = () => {
  showTransition.value = false
}

const onLeaveAnimationEnd = () => {
  router.push(nextRoute.value)
  setTimeout(() => {
    showTransition2.value = false
  }, 100)
}

onMounted(() => {
  showTransition.value = true
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'

  tcd.show({
    steps: [
      {
        text: `欢迎踏入中医数字殿堂。这里有三条修行之路，请问您以何种身份登堂入室？`,
        hintText: '点击继续',
      },
      {
        text: '【爱好者】将解锁海量养生百科，助您成为生活中的康养达人。',
        hintText: '点击继续',
        highlightSelector: '.role-1',
      },
      {
        text: '【中医学者】提供精准的学术辅导，助力通过各类执业考试与期末挑战。',
        hintText: '点击继续',
        highlightSelector: '.role-2',
      },
      {
        text: '【求职者】为您开启AI模拟面试官，提供全方位的职场进阶支持。',
        hintText: '点击继续',
        highlightSelector: '.role-3',
      },
      {
        text: '挑选您的身份后，点击下方确认按钮，开启您的修行。',
        hintText: '开始探索',
      },
    ],
  })
})

onUnmounted(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* ==========================================================================
   1. 基础布局
   ========================================================================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
}

.main-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  font-family: 'STKaiti', 'SimSun', serif;
  overflow: hidden;
  position: relative;
  z-index: 10;
}

/* ==========================================================================
   2. 背景装饰增强
   ========================================================================== */
.page-decorations {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.decor-item {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
  animation: floatDecor 25s infinite alternate ease-in-out;
}

.decor-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  left: -100px;
  background: #c19a6b;
}
.decor-2 {
  width: 450px;
  height: 450px;
  bottom: -100px;
  right: -50px;
  background: #8b7355;
  animation-delay: -7s;
}
.decor-3 {
  width: 300px;
  height: 300px;
  top: 15%;
  right: 15%;
  background: #d4b483;
  animation-delay: -12s;
}
.decor-4 {
  width: 350px;
  height: 350px;
  bottom: 20%;
  left: 10%;
  background: #5a3921;
  animation-delay: -18s;
}

@keyframes floatDecor {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(100px, 60px) scale(1.1);
  }
}

/* ==========================================================================
   3. 标题设计
   ========================================================================== */

.title-main-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px; /* 增大间距，让装饰更舒展 */
  margin-bottom: 12px;
}

.selection-title {
  font-size: 44px;
  color: #3d2b1f;
  font-weight: bold;
  letter-spacing: 6px;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* 左右符号装饰核心样式 */
.side-symbol {
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.8;
}

/* 菱形点：金镶玉质感 */
.symbol-diamond {
  width: 12px;
  height: 12px;
  background-color: #a67c52;
  transform: rotate(45deg);
  box-shadow: 0 0 12px rgba(166, 124, 82, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
}

/* 装饰线条：两头消失的渐变线 */
.symbol-line {
  width: 100px; /* 线条长度 */
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(166, 124, 82, 0),
    rgba(166, 124, 82, 1),
    rgba(166, 124, 82, 0)
  );
}

/* 响应式微调：小屏幕隐藏线条保留点，或缩小间距 */
@media (max-width: 900px) {
  .symbol-line {
    width: 40px;
  }
  .title-main-wrapper {
    gap: 15px;
  }
}
.breadcrumb-placeholder {
  height: 10vh;
  min-height: 80px;
}

.selection-section {
  flex: 1;
  padding: 0 40px;
  display: flex;
  flex-direction: column;
}

.character-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.selection-header {
  margin-top: 30px;
  text-align: center;
  margin-bottom: 10px;
}

.title-decoration-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
  opacity: 0.6;
}

.title-decoration-top .line {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #a67c52, transparent);
}

.title-decoration-top .dot {
  width: 4px;
  height: 4px;
  background: #a67c52;
  transform: rotate(45deg);
}

.selection-title {
  font-size: 40px;
  color: #3d2b1f;
  font-weight: bold;
  letter-spacing: 6px;
  margin-bottom: 10px;
  position: relative;
}

.selection-subtitle {
  font-size: 18px;
  color: #8b7355;
  letter-spacing: 3px;
  font-style: italic;
}

/* ==========================================================================
   4. 灵动玻璃拟态卡片
   ========================================================================== */
.selection-main {
  width: 100%;
}

.characters-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  perspective: 1500px;
}

.character-card {
  flex: 1;
  max-width: 360px;
  /* height: 420px; */
  height: 400px;
  position: relative;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  border-radius: 30px;
  transform-style: preserve-3d;
}

.character-card:hover {
  transform: translateY(-20px) rotateX(8deg) rotateY(2deg);
  z-index: 10;
}

/* 玻璃拟态效果增强 */
.glass-effect {
  background: rgba(255, 253, 247, 0.7);
  backdrop-filter: blur(15px) saturate(160%);
  -webkit-backdrop-filter: blur(15px) saturate(160%);
  border: 1px solid rgba(212, 180, 131, 0.3);
  box-shadow:
    0 15px 35px rgba(90, 57, 33, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.card-inner {
  width: 100%;
  height: 100%;
  padding: 50px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 30px;
  position: relative;
  z-index: 2;
  overflow: hidden;
  transition: all 0.4s ease;
}

/* 装饰：祥云底纹 */
.card-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='40' viewBox='0 0 80 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 20c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm20 0c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm20 0c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10z' fill='%23a67c52' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
  pointer-events: none;
}

/* 装饰：中式身份印章 */
.card-seal {
  position: absolute;
  top: 25px;
  right: 25px;
  width: 45px;
  height: 45px;
  border: 2px solid rgba(160, 40, 40, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(160, 40, 40, 0.8);
  font-size: 22px;
  font-weight: bold;
  border-radius: 4px;
  transform: rotate(15deg);
  opacity: 0.3;
  transition: all 0.5s ease;
}

.character-card:hover .card-seal {
  opacity: 0.8;
  transform: rotate(0deg) scale(1.1);
  background: rgba(160, 40, 40, 0.05);
}

/* 装饰：动态流光 */
.border-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 45%,
    rgba(255, 255, 255, 0.6) 50%,
    transparent 55%
  );
  background-size: 300% 300%;
  opacity: 0;
  transition: opacity 0.3s;
}

.character-card:hover .border-shimmer {
  opacity: 1;
  animation: shimmerFlow 2s infinite linear;
}

@keyframes shimmerFlow {
  0% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

/* 装饰：四角 */
.corner-decor {
  position: absolute;
  width: 25px;
  height: 25px;
  border: 1.5px solid #d4b483;
  opacity: 0.3;
  transition: all 0.5s ease;
}
.top-left {
  top: 20px;
  left: 20px;
  border-right: none;
  border-bottom: none;
}
.top-right {
  top: 20px;
  right: 20px;
  border-left: none;
  border-bottom: none;
}
.bottom-left {
  bottom: 20px;
  left: 20px;
  border-right: none;
  border-top: none;
}
.bottom-right {
  bottom: 20px;
  right: 20px;
  border-left: none;
  border-top: none;
}

.character-card:hover .corner-decor {
  width: 40px;
  height: 40px;
  opacity: 0.8;
  border-color: #a67c52;
}

/* 图标设计 */
.card-icon-wrapper {
  margin-bottom: 30px;
  position: relative;
}

.card-icon {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fdfaf0, #f0ead6);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(166, 124, 82, 0.4);
  box-shadow: 0 10px 25px rgba(90, 57, 33, 0.1);
  position: relative;
  z-index: 2;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.icon-text {
  font-size: 40px;
  color: #5a3921;
}

.icon-pulse {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 1px solid #d4b483;
  opacity: 0;
  transition: all 0.4s ease;
}

.character-card:hover .card-icon {
  transform: scale(1.1) translateY(-5px);
  background: #a67c52;
}

.character-card:hover .icon-text {
  color: #fff;
}

.character-card:hover .icon-pulse {
  opacity: 0.5;
  animation: iconPulseAnim 2s infinite;
}

@keyframes iconPulseAnim {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* 卡片内容 */
.card-content {
  text-align: center;
  z-index: 2;
}

.card-title {
  font-size: 26px;
  color: #4a3111;
  margin-bottom: 8px;
}

.title-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
}

.sep-line {
  width: 30px;
  height: 1px;
  background: #d4b483;
}
.sep-dot {
  width: 3px;
  height: 3px;
  background: #d4b483;
  transform: rotate(45deg);
}

.card-subtitle-en {
  font-size: 13px;
  color: #8b7355;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 20px;
  font-family: 'Arial', sans-serif;
  opacity: 0.8;
}

.card-desc {
  font-size: 16px;
  color: #6a4a2e;
  line-height: 1.7;
}

/* 选中状态特效 */
.character-card.selected .card-inner {
  background: rgba(255, 252, 245, 0.9);
  border: 2px solid #a67c52;
  box-shadow: 0 25px 50px rgba(90, 57, 33, 0.25);
}

.character-card.selected .card-seal {
  opacity: 1;
  border-color: #a02828;
  background: rgba(160, 40, 40, 0.1);
}

.card-glow-layer {
  position: absolute;
  inset: -15px;
  background: radial-gradient(circle, rgba(166, 124, 82, 0.2) 0%, transparent 75%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.character-card.selected .card-glow-layer {
  opacity: 1;
}

.selected-indicator {
  position: absolute;
  bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  background: #a67c52;
  border-radius: 40px;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(166, 124, 82, 0.4);
  animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.character-card.not-selected {
  opacity: 0.5;
  filter: blur(1px) grayscale(0.4);
  transform: scale(0.92);
}

/* ==========================================================================
   5. 底部按钮与提示
   ========================================================================== */
.selection-footer {
  /* margin-top: 10px; */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.glass-btn {
  padding: 18px 80px;
  font-size: 22px;
  color: #fff;
  background: #5a3921;
  border-radius: 60px;
  border: none;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(90, 57, 33, 0.3);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.glass-btn:hover {
  transform: translateY(-5px);
  background: #4a3111;
  box-shadow: 0 15px 40px rgba(90, 57, 33, 0.4);
}

.selection-hint {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.15);
  padding: 10px 30px;
  border-radius: 30px;
  backdrop-filter: blur(5px);
  color: #8b7355;
  font-size: 17px;
  margin-bottom: 30px;
}

.hint-icon-anim {
  display: flex;
  gap: 4px;
}

.hint-icon-anim span {
  width: 6px;
  height: 6px;
  background: #d4b483;
  border-radius: 50%;
  animation: hintDots 1.5s infinite;
}

.hint-icon-anim span:nth-child(2) {
  animation-delay: 0.2s;
}
.hint-icon-anim span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes hintDots {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
}

.selected-hint {
  color: #4a3111;
  background: rgba(212, 180, 131, 0.25);
  font-weight: bold;
}

/* ==========================================================================
   6. 响应式布局优化
   ========================================================================== */
@media (max-width: 1200px) {
  .characters-container {
    gap: 20px;
  }
  .character-card {
    min-width: 280px;
    height: 380px;
  }
  .selection-title {
    font-size: 32px;
  }
}

@media (max-width: 900px) {
  .characters-container {
    flex-wrap: wrap;
  }
  .character-card {
    width: 45%;
    max-width: none;
  }
}

@media (max-width: 600px) {
  .main-container {
    overflow-y: auto;
  }
  .selection-section {
    padding: 0 15px;
  }
  .characters-container {
    flex-direction: column;
    align-items: center;
  }
  .character-card {
    width: 100%;
    height: auto;
    min-height: 180px;
  }
  .card-inner {
    flex-direction: row;
    padding: 25px;
    text-align: left;
  }
  .card-icon-wrapper {
    margin-bottom: 0;
    margin-right: 20px;
  }
  .card-icon {
    width: 70px;
    height: 70px;
  }
  .card-content {
    text-align: left;
  }
  .card-seal {
    display: none;
  }
  .selected-indicator {
    right: 20px;
    bottom: 10px;
    left: auto;
    padding: 5px 15px;
  }
  .confirm-btn {
    width: 90%;
    justify-content: center;
  }
}

/* 过渡动画 */
.button-fade-enter-active {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.button-fade-leave-active {
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.9);
}

@keyframes bounceIn {
  from {
    opacity: 0;
    transform: scale(0.7) translateY(40px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
