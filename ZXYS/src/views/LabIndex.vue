<template>
  <main class="lab-main">
    <!-- 页面标题区 -->
    <section class="hero-section">
      <div class="hero-bg-decoration"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          沉浸式中醫教育平台
        </div>
        <h1 class="classic-title">杏林实验室</h1>
        <div class="subtitle-wrapper">
          <span class="line"></span>
          <p class="classic-subtitle">沉浸式学习 · 探索中医智慧</p>
          <span class="line"></span>
        </div>
        <p class="hero-description">结合VR技术与MediaPipe视觉识别，开启全新互动学习体验</p>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-number">3+</span>
          <span class="stat-label">创新实验室</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">4</span>
          <span class="stat-label">核心技术</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">100%</span>
          <span class="stat-label">沉浸体验</span>
        </div>
      </div>
    </section>

    <!-- 核心亮点区 -->
    <section class="features-section">
      <div class="section-header">
        <span class="section-tag">核心优势</span>
        <h2 class="section-title">引领中医教育的<span>科技革新</span></h2>
        <p class="section-subtitle">前沿科技 × 中医教学 × 沉浸体验</p>
      </div>
      <div class="features-grid">
        <div class="feature-card" v-for="(feature, idx) in features" :key="idx">
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
          <div class="feature-link">
            <span>了解更多</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 技术应用区 -->
    <section class="tech-showcase">
      <div class="tech-container">
        <div class="tech-info">
          <div class="tech-badge">
            <i class="fas fa-microchip"></i>
            <span>技术应用</span>
          </div>
          <h2 class="tech-title">前沿技术，<span>赋能教学</span></h2>
          <p class="tech-desc">我们将尖端科技与传统中医深度融合，打造前所未有的学习体验</p>
          <div class="tech-list">
            <div class="tech-item" v-for="(tech, idx) in technologies" :key="idx">
              <div class="tech-icon">
                <i :class="tech.icon"></i>
              </div>
              <div class="tech-detail">
                <h4>{{ tech.title }}</h4>
                <p>{{ tech.desc }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="tech-preview">
          <div class="preview-card">
            <div class="preview-glow"></div>
            <div class="preview-content">
              <video class="vr-demo-video" autoplay muted loop playsinline>
                <source :src="VRVedio" type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 实验室入口区 -->
    <section class="labs-section" id="labs-section">
      <div class="section-header">
        <span class="section-tag">探索体验</span>
        <h2 class="section-title">开启您的<span>探索之旅</span></h2>
        <p class="section-subtitle">选择实验室，沉浸式学习中医智慧</p>
      </div>
      <div class="labs-grid">
        <div
          class="lab-card"
          v-for="lab in labs"
          :key="lab.id"
          :class="[lab.status, { 'active-card': lab.status === 'active' }]"
          @click="goToLab(lab.id)"
        >
          <div class="card-glow"></div>
          <div class="card-status" :class="lab.status">
            <i
              :class="lab.status === 'active' ? 'fas fa-play-circle' : 'fas fa-hourglass-half'"
            ></i>
            <span>{{ lab.statusText }}</span>
          </div>
          <div class="card-icon">
            <i :class="lab.icon"></i>
          </div>
          <h3 class="lab-title">{{ lab.title }}</h3>
          <p class="lab-description">{{ lab.description }}</p>
          <div class="lab-tags">
            <span class="tag" v-for="tag in lab.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="card-footer">
            <span class="enter-btn" :class="{ disabled: lab.status !== 'active' }">
              <span>{{ lab.status === 'active' ? '进入实验室' : '敬请期待' }}</span>
              <i :class="lab.status === 'active' ? 'fas fa-arrow-right' : 'fas fa-clock'"></i>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部说明 -->
    <div class="lab-footer">
      <div class="footer-inner">
        <div class="footer-note">
          <i class="fas fa-flask"></i>
          <span>更多实验室正在开发中，我们将持续更新，敬请期待...</span>
        </div>
        <div class="footer-tech">
          <span>技术支持：</span>
          <span class="tech-stack">Unity 3D</span>
          <span class="tech-divider">·</span>
          <span class="tech-stack">MediaPipe</span>
          <span class="tech-divider">·</span>
          <span class="tech-stack">WebXR</span>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { message } from '@/components/Notification'
import { onMounted } from 'vue'
import VRVedio from '@/assets/Lab/VR演示.mp4'

const router = useRouter()

// 定义实验室路由映射表
const labRoutes: Record<string, string> = {
  'acupoint-3d': '/Unity/Lab001',
  'acupuncture-vr': '/Unity/Lab002',
  'meridian-vr': '/Unity/Lab003',
}

const features = [
  {
    icon: 'fas fa-vr-cardboard',
    title: 'VR沉浸体验',
    desc: '虚拟现实技术打造真实人体场景，360°观察经络穴位，身临其境的学习感受',
  },
  {
    icon: 'fas fa-hand-peace',
    title: 'MediaPipe手势识别',
    desc: '实时捕捉手部动作，模拟针灸操作，精准识别穴位定位与手法训练',
  },
  {
    icon: 'fas fa-cube',
    title: 'Unity 3D可视化',
    desc: '高精度3D人体模型，支持缩放旋转，直观理解经络走向与穴位分布',
  },
  {
    icon: 'fas fa-comment-dots',
    title: '即时互动反馈',
    desc: '点击穴位获取详情，操作后即时评估，让学习变得生动有趣',
  },
]

const technologies = [
  {
    icon: 'fas fa-vr-cardboard',
    title: 'VR虚拟实境',
    desc: '沉浸式3D场景，真实还原人体结构，支持头部追踪与视角切换',
  },
  {
    icon: 'fas fa-hand-peace',
    title: 'MediaPipe视觉识别',
    desc: '实时手部关键点检测，21个关节点精准追踪，识别针灸手法',
  },
  {
    icon: 'fas fa-cube',
    title: 'Unity 3D引擎',
    desc: '高保真3D渲染，支持WebGL跨平台部署，流畅的交互体验',
  },
]

const labs = [
  {
    id: 'acupoint-3d',
    title: '3D人体穴位实验室',
    description: '探索人体经络奥秘，3D模型互动标注穴位，支持VR模式',
    icon: 'fas fa-cube',
    status: 'active',
    statusText: '体验中',
    tags: ['VR支持', '3D互动', '穴位标注'],
    progress: 65,
    progressText: '开发进度 65% · 基础功能已完成',
  },
  {
    id: 'acupuncture-vr',
    title: '四诊模拟实验室',
    description: '融入视觉小说叙事的沉浸式四诊交互模拟。',
    icon: 'fas fa-hand-peace',
    status: 'active',
    statusText: '体验中',
    tags: ['问诊', '望诊', '医案', '模拟'],
    progress: 35,
    progressText: '开发进度 75% · 基础功能已完成',
  },
  {
    id: 'meridian-vr',
    title: '3D草药实验室',
    description: '在3D空间中探索草药形态与特性，支持多角度观察。',
    icon: 'fas fa-water',
    status: 'active',
    statusText: '体验中',
    tags: ['3D互动', '模拟'],
    progress: 15,
    progressText: '开发进度 55% · 基础功能已完成',
  },
]

const scrollToLabs = () => {
  const labsSection = document.getElementById('labs-section')
  if (labsSection) {
    labsSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const goToLab = (labId: string) => {
  const lab = labs.find((l) => l.id === labId)
  if (lab?.status === 'active') {
    const routePath = labRoutes[labId]
    if (routePath) {
      router.push(routePath)
    } else {
      console.warn(`未找到实验室 ${labId} 的路由配置`)
    }
  } else {
    message.info('敬请期待', {
      note: '该实验室正在开发中，即将上线',
      duration: 2000,
    })
  }
}

onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})
</script>

<style scoped>
.lab-main {
  width: 100%;
  min-height: 100vh;
  padding-top: 5vh;
  padding-bottom: 50px;
  font-family: 'NO3', serif;
  position: relative;
}

/* 标题区 */
.hero-section {
  position: relative;
  text-align: center;
  margin-bottom: 100px;
  padding: 60px 40px 80px;
  overflow: hidden;
}

.hero-bg-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: radial-gradient(ellipse at center, rgba(166, 124, 82, 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(166, 124, 82, 0.12);
  backdrop-filter: blur(4px);
  padding: 8px 24px;
  border-radius: 40px;
  font-size: 15px;
  color: #a67c52;
  margin-bottom: 30px;
  border: 1px solid rgba(166, 124, 82, 0.2);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #a67c52;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.classic-title {
  font-size: 88px;
  letter-spacing: 12px;
  margin: 0 0 28px;
  font-weight: 550;
  color: #2c1e1a;
  line-height: 1.2;
}

.subtitle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 28px;
}

.subtitle-wrapper .line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #a67c52, transparent);
}

.classic-subtitle {
  font-size: 24px;
  color: #8d6e63;
  letter-spacing: 4px;
  font-weight: 400;
  margin: 0;
}

.hero-description {
  font-size: 30px;
  color: #a67c52;
  margin-top: 20px;
  letter-spacing: 1px;
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.85;
  line-height: 1.5;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 48px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 38px;
  border-radius: 50px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: transparent;
}

.hero-btn.primary {
  background: #a67c52;
  color: white;
  box-shadow: 0 4px 15px rgba(166, 124, 82, 0.3);
}

.hero-btn.primary:hover {
  background: #8b623f;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(166, 124, 82, 0.4);
}

.hero-btn.secondary {
  border: 1px solid rgba(166, 124, 82, 0.4);
  color: #a67c52;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
}

.hero-btn.secondary:hover {
  border-color: #a67c52;
  background: rgba(166, 124, 82, 0.1);
  transform: translateY(-2px);
}

.hero-stats {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 48px;
  margin-top: 80px;
  padding: 28px 50px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 80px;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid rgba(166, 124, 82, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 34px;
  font-weight: 600;
  color: #a67c52;
  letter-spacing: 1px;
}

.stat-label {
  font-size: 20px;
  color: #8d6e63;
  margin-top: 6px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(166, 124, 82, 0.3);
}

/* 通用区块样式 */
.section-header {
  text-align: center;
  margin-bottom: 70px;
}

.section-tag {
  display: inline-block;
  font-size: 14px;
  padding: 8px 22px;
  background: rgba(166, 124, 82, 0.12);
  color: #a67c52;
  border-radius: 30px;
  margin-bottom: 24px;
  letter-spacing: 1px;
  font-weight: 500;
}

.section-title {
  font-size: 56px;
  color: #2c1e1a;
  margin: 0 0 20px 0;
  font-weight: 550;
  letter-spacing: -0.5px;
}

.section-title span {
  color: #a67c52;
  position: relative;
}

.section-title span::after {
  content: '';
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  height: 8px;
  background: rgba(166, 124, 82, 0.2);
  border-radius: 4px;
  z-index: -1;
}

.section-subtitle {
  font-size: 24px;
  color: #8d6e63;
  margin: 0;
  font-weight: 400;
}

/* 亮点区域 */
.features-section {
  max-width: 1280px;
  margin: 0 auto 100px;
  padding: 0 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 28px;
  padding: 40px 30px;
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #a67c52, #d4b48c);
  transform: scaleX(0);
  transition: transform 0.4s ease;
  transform-origin: left;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: #a67c52;
  box-shadow: 0 20px 40px rgba(166, 124, 82, 0.12);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(166, 124, 82, 0.15), rgba(166, 124, 82, 0.05));
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon {
  background: rgba(166, 124, 82, 0.2);
}

.feature-icon i {
  font-size: 40px;
  color: #a67c52;
}

.feature-title {
  font-size: 24px;
  color: #2c1e1a;
  margin: 0 0 16px 0;
  font-weight: 550;
}

.feature-desc {
  font-size: 20px;
  color: #8d6e63;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #a67c52;
  cursor: pointer;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-link {
  opacity: 1;
  transform: translateX(0);
}

.feature-link i {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.feature-link:hover i {
  transform: translateX(4px);
}

/* 技术展示区 */
.tech-showcase {
  max-width: 1280px;
  margin: 0 auto 100px;
  padding: 0 40px;
}

.tech-container {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 40px;
  padding: 60px;
  display: flex;
  gap: 70px;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.tech-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(166, 124, 82, 0.08), transparent);
  border-radius: 50%;
  pointer-events: none;
}

.tech-info {
  flex: 1.2;
  position: relative;
  z-index: 1;
}

.tech-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 22px;
  background: rgba(166, 124, 82, 0.12);
  border-radius: 30px;
  font-size: 15px;
  color: #a67c52;
  margin-bottom: 28px;
  font-weight: 500;
}

.tech-title {
  font-size: 48px;
  color: #2c1e1a;
  margin: 0 0 24px 0;
  font-weight: 550;
  line-height: 1.2;
}

.tech-title span {
  color: #a67c52;
}

.tech-desc {
  font-size: 20px;
  color: #8d6e63;
  line-height: 1.6;
  margin-bottom: 48px;
  max-width: 90%;
}

.tech-list {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.tech-item {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.tech-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(166, 124, 82, 0.15), rgba(166, 124, 82, 0.05));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tech-icon i {
  font-size: 30px;
  color: #a67c52;
}

.tech-detail h4 {
  font-size: 24px;
  color: #2c1e1a;
  margin: 0 0 10px 0;
  font-weight: 550;
}

.tech-detail p {
  font-size: 20px;
  color: #8d6e63;
  line-height: 1.5;
  margin: 0;
}

.tech-preview {
  flex: 1;
}

.preview-card {
  position: relative;
  background: linear-gradient(135deg, rgba(166, 124, 82, 0.08), rgba(166, 124, 82, 0.02));
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 28px;
  overflow: hidden;
}

.preview-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 40%, rgba(166, 124, 82, 0.1), transparent);
  pointer-events: none;
}

/* 替换原来的 .preview-content 样式，添加视频相关样式 */
.preview-content {
  padding: 0;
  text-align: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 28px;
}

.vr-demo-video {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 28px;
  object-fit: cover;
}

.video-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  padding: 30px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;
}

.video-caption i {
  font-size: 16px;
  color: #a67c52;
}

/* 实验室入口区 */
.labs-section {
  max-width: 1280px;
  margin: 0 auto 70px;
  padding: 0 40px;
}

.labs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.lab-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(166, 124, 82, 0.2);
  border-radius: 28px;
  padding: 36px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  position: relative;
  overflow: hidden;
}

.lab-card.active-card {
  border-color: rgba(166, 124, 82, 0.4);
  background: rgba(255, 255, 255, 0.96);
}

.lab-card:hover {
  transform: translateY(-6px);
  border-color: #a67c52;
  box-shadow: 0 20px 40px rgba(166, 124, 82, 0.15);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: radial-gradient(ellipse at 50% 0%, rgba(166, 124, 82, 0.1), transparent);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.lab-card:hover .card-glow {
  opacity: 1;
}

.card-status {
  position: absolute;
  top: 28px;
  right: 28px;
  font-size: 20px;
  padding: 6px 16px;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.card-status.active {
  background: rgba(166, 124, 82, 0.15);
  color: #a67c52;
  border: 1px solid rgba(166, 124, 82, 0.3);
}

.card-status.coming {
  background: rgba(166, 124, 82, 0.1);
  color: #b87c4f;
  border: 1px solid rgba(166, 124, 82, 0.2);
}

.card-status.planning {
  background: rgba(166, 124, 82, 0.08);
  color: #b87c4f;
  border: 1px solid rgba(166, 124, 82, 0.15);
}

.card-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, rgba(166, 124, 82, 0.12), rgba(166, 124, 82, 0.05));
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.card-icon i {
  font-size: 36px;
  color: #a67c52;
}

.lab-title {
  font-size: 30px;
  font-weight: 550;
  color: #2c1e1a;
  margin: 0 0 14px 0;
}

.lab-description {
  font-size: 20px;
  color: #8d6e63;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.lab-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.tag {
  font-size: 16px;
  padding: 6px 16px;
  background: rgba(166, 124, 82, 0.1);
  color: #a67c52;
  border-radius: 30px;
  font-weight: 500;
}

.lab-progress {
  margin-bottom: 28px;
}

.progress-bar {
  height: 6px;
  background: rgba(166, 124, 82, 0.15);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a67c52, #c99e6e);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #b87c4f;
  font-weight: 500;
}

.card-footer {
  margin-top: auto;
  padding-top: 8px;
}

.enter-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 500;
  color: #a67c52;
  transition: all 0.3s ease;
}

.lab-card:hover .enter-btn:not(.disabled) {
  gap: 16px;
}

.enter-btn i {
  transition: transform 0.3s ease;
}

.lab-card:hover .enter-btn:not(.disabled) i {
  transform: translateX(5px);
}

.enter-btn.disabled {
  color: #c0a080;
  cursor: not-allowed;
}

/* 底部 */
.lab-footer {
  max-width: 1280px;
  margin: 0 auto;
  padding: 30px 40px 20px;
}

.footer-inner {
  text-align: center;
  padding: 30px 0 20px;
  border-top: 1px solid rgba(166, 124, 82, 0.2);
}

.footer-note {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 14px 32px;
  background: rgba(166, 124, 82, 0.06);
  border-radius: 50px;
  font-size: 30px;
  color: #8d6e63;
  margin-bottom: 24px;
  backdrop-filter: blur(4px);
}

.footer-note i {
  color: #a67c52;
  font-size: 40px;
}

.footer-tech {
  font-size: 24px;
  color: #b87c4f;
}

.tech-stack {
  color: #a67c52;
  font-weight: 500;
}

.tech-divider {
  margin: 0 10px;
  color: rgba(166, 124, 82, 0.4);
}

/* 响应式 */
@media (max-width: 1280px) {
  .features-grid {
    gap: 28px;
  }

  .classic-title {
    font-size: 72px;
  }
}

@media (max-width: 1024px) {
  .classic-title {
    font-size: 60px;
    letter-spacing: 8px;
  }

  .section-title {
    font-size: 44px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .labs-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tech-container {
    flex-direction: column;
    padding: 48px;
  }

  .tech-preview {
    width: 100%;
    max-width: 450px;
    margin: 0 auto;
  }

  .tech-desc {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .classic-title {
    font-size: 44px;
    letter-spacing: 4px;
  }

  .hero-section {
    padding: 40px 20px 60px;
    margin-bottom: 60px;
  }

  .hero-stats {
    margin-top: 50px;
    padding: 20px 30px;
    gap: 30px;
  }

  .stat-number {
    font-size: 26px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .hero-btn {
    width: 220px;
    justify-content: center;
  }

  .section-title {
    font-size: 34px;
  }

  .features-section,
  .tech-showcase,
  .labs-section {
    padding: 0 20px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .labs-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .tech-container {
    padding: 32px;
  }

  .tech-title {
    font-size: 36px;
  }

  .preview-content {
    padding: 40px 30px;
  }

  .lab-card {
    padding: 28px;
  }

  .lab-footer {
    padding: 20px;
  }

  .footer-note {
    flex-direction: column;
    gap: 10px;
    padding: 14px 24px;
  }
}
</style>
