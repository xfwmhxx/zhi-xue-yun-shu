<template>
  <PageTransition
    v-if="showTransition"
    mode="leave"
    :show-text="true"
    @animation-end="onEnterAnimationEnd"
  />

  <main class="main-content">
    <div class="profile-container">
      <!-- 左侧边栏 - 粘性定位 -->
      <div class="profile-sidebar" ref="sidebarRef">
        <!-- 用户信息卡片 - 杏林主题重构版 -->
        <div class="user-card">
          <div class="user-card-inner">
            <div class="avatar-wrapper">
              <img src="/public/User.png" alt="用户头像" class="user-card-avatar" />
            </div>

            <h2 class="user-card-name">{{ userInfo.username }}</h2>

            <!-- 装饰线条 -->
            <div class="user-card-divider">
              <span class="divider-dot"></span>
            </div>

            <div class="user-motto">
              <div class="motto-text">勤求古训，博采众方</div>
              <div class="motto-sub">大医精诚，止于至善</div>
            </div>

            <div class="user-badge"><i class="fas fa-leaf"></i> 杏林学子</div>
          </div>
        </div>

        <!-- 侧边导航容器 - 独立滚动区域 -->
        <div class="sidebar-nav-container">
          <div class="sidebar-nav-header">
            <h3 class="sidebar-nav-title">功能导航</h3>
          </div>

          <!-- 侧边导航 -->
          <nav class="sidebar-nav" ref="sidebarNavRef">
            <RouterLink
              v-for="nav in navItems"
              :key="nav.id"
              :to="nav.path"
              :class="{ active: isActive(nav.path) }"
              class="nav-link"
            >
              <i :class="nav.icon"></i>{{ nav.name }}
            </RouterLink>
          </nav>
        </div>
      </div>

      <!-- 右侧内容区域 - 动态显示 -->
      <div class="profile-content">
        <RouterView />
      </div>
    </div>
  </main>

  <!-- 返回顶部按钮 -->
  <div class="back-to-top" :class="{ show: showBackToTop }" @click="scrollToTop">
    <i class="fas fa-chevron-up"></i>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import PageTransition from '@/components/PageTransition.vue'
import { useRouter, useRoute } from 'vue-router'
import { getUserInfo } from '@/utils/storage'
const router = useRouter()
const route = useRoute()

// 进入动画
const showTransition = ref(false)
const onEnterAnimationEnd = () => {
  showTransition.value = false
}

const user = getUserInfo()!

// 响应式状态
const activeSection = ref<string>('recent')
const showBackToTop = ref<boolean>(false)
const bgOffset = ref<number>(0)
const sidebarRef = ref<HTMLElement | null>(null)

// 用户信息 - 已移除身份/年级/专业
const userInfo = ref({
  username: user.username || '学子',
  email: user.email,
  bio: '热爱中医文化，致力于将传统中医智慧与现代科技相结合。',
})

// 导航菜单项
const navItems = ref([
  {
    id: 'recent',
    name: '昔日复盘',
    icon: 'fas fa-calendar-alt',
    path: '/Foundations/userhome',
  },
  {
    id: 'today',
    name: '今日修习',
    icon: 'fas fa-seedling',
    path: '/Foundations/userhome/todayrecord',
  },
  {
    id: 'bookshelf',
    name: '我的书架',
    icon: 'fas fa-book-open',
    path: '/Foundations/userhome/bookshelf',
  },
  {
    id: 'resume',
    name: '我的简历',
    icon: 'fas fa-file-invoice',
    path: '/Foundations/userhome/resume',
  },
  {
    id: 'interview',
    name: '面试记录',
    icon: 'fas fa-microphone-alt',
    path: '/Foundations/userhome/interview',
  },
  {
    id: 'certification',
    name: '考证中心',
    icon: 'fas fa-certificate',
    path: '/Foundations/userhome/certification',
  },
])

// 判断是否激活
const isActive = (path: string) => {
  // 如果是首页，需要精确匹配
  if (path === '/Foundations/userhome') {
    return route.path === path
  }
  // 其他页面，只要路径包含即可
  return route.path.startsWith(path)
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  const scrollY = window.scrollY
  showBackToTop.value = scrollY > 500
  bgOffset.value = scrollY * 0.3

  if (sidebarRef.value) {
    const sidebarRect = sidebarRef.value.getBoundingClientRect()
    sidebarRef.value.style.boxShadow =
      sidebarRect.top <= 90 ? '5px 0 15px rgba(0, 0, 0, 0.05)' : 'none'
  }
}

onMounted(() => {
  showTransition.value = true
  window.addEventListener('scroll', handleScroll)
  setTimeout(() => {
    window.dispatchEvent(new Event('scroll'))
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 杏林主题变量 */
:host {
  --color-apricot-light: #fdf5e6; /* 浅杏色 */
  --color-apricot-glass: rgba(253, 245, 230, 0.85);
  --color-bronze: #a67c52; /* 古铜色 */
  --color-bronze-light: rgba(166, 124, 82, 0.2);
  --color-brown-dark: #4a342e; /* 深褐色 */
  --color-brown-text: #5d4037; /* 褐色文字 */
}

.main-content {
  flex: 1;
  padding-top: 20px;
  width: 100%;
  padding-bottom: 80px;
  font-family: 'No3', serif;
}

.profile-container {
  max-width: 85vw;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 35px;
  position: relative;
}

/* 左侧边栏 */
.profile-sidebar {
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 10vh;
  height: 82vh;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

/* 用户卡片 - 杏林视觉重构 */
.user-card {
  background-color: rgba(253, 245, 230, 0.85); /* 浅杏色玻璃基底 */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px 20px;
  margin-bottom: 25px;
  border: 1.5px solid #a67c52; /* 古铜色边框 */
  box-shadow: 0 10px 25px rgba(74, 52, 46, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* 装饰性暗纹 */
.user-card::before {
  content: '';
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(166, 124, 82, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.avatar-wrapper {
  position: relative;
  width: 130px;
  height: 130px;
  margin: 0 auto 15px;
}

.user-card-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #a67c52;
  padding: 4px;
  background: #fff;
  z-index: 2;
  position: relative;
}

.avatar-decoration {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 1px solid rgba(166, 124, 82, 0.4);
  border-radius: 50%;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.user-card-name {
  font-size: 26px;
  color: #4a342e; /* 深褐色文字 */
  margin: 10px 0 15px;
  font-weight: 600;
  letter-spacing: 1px;
}

.user-card-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.user-card-divider::before,
.user-card-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #a67c52, transparent);
}

.divider-dot {
  width: 6px;
  height: 6px;
  background: #a67c52;
  transform: rotate(45deg);
  margin: 0 10px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin: 10px 0 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  color: #a67c52;
  font-weight: bold;
}

.stat-label {
  font-size: 13px;
  color: #8d6e63;
  margin-top: 4px;
}

.user-badge {
  display: inline-block;
  padding: 5px 15px;
  background-color: rgba(166, 124, 82, 0.15);
  color: #4a342e;
  border-radius: 20px;
  font-size: 14px;
  border: 0.5px solid rgba(166, 124, 82, 0.3);
}

.user-motto {
  margin: 15px 0 20px;
  text-align: center;
}

.motto-text {
  font-size: 16px;
  color: #a67c52;
  font-weight: 500;
  letter-spacing: 2px;
  font-family: 'STKaiti', 'KaiTi', serif;
}

.motto-sub {
  font-size: 12px;
  color: #8d6e63;
  margin-top: 6px;
  letter-spacing: 1px;
}

/* 侧边导航容器 */
.sidebar-nav-container {
  flex: 1;
  background-color: rgba(253, 245, 230, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1.5px solid #a67c52;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-nav-header {
  padding: 20px 25px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.2);
}

.sidebar-nav-title {
  font-size: 18px;
  color: #4a342e;
  font-weight: 600;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 10px 0;
  overflow-y: auto;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  padding: 14px 25px;
  color: #5d4037;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
}

.sidebar-nav a:hover {
  background-color: rgba(166, 124, 82, 0.1);
  color: #a67c52;
  padding-left: 30px;
}

.sidebar-nav a.active {
  background-color: rgba(166, 124, 82, 0.15);
  color: #4a342e;
  border-left-color: #a67c52;
  font-weight: bold;
}

.sidebar-nav a i {
  margin-right: 15px;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* 右侧内容区域 */
.profile-content {
  flex: 1;
  min-width: 0;
}

/* 返回顶部 */
.back-to-top {
  position: fixed;
  bottom: 120px;
  right: 40px;
  width: 55px;
  height: 55px;
  background-color: #4a342e;
  color: #fdf5e6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s ease;
  border: 2px solid #a67c52;
}

.back-to-top.show {
  opacity: 1;
  visibility: visible;
}

.back-to-top:hover {
  transform: translateY(-5px);
  background-color: #a67c52;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* 滚动条美化 */
.sidebar-nav::-webkit-scrollbar {
  width: 5px;
}
.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-nav::-webkit-scrollbar-thumb {
  background: #a67c52;
  border-radius: 10px;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .profile-container {
    flex-direction: column;
    max-width: 95vw;
  }
  .profile-sidebar {
    width: 100%;
    position: relative;
    height: auto;
    top: 0;
  }
  .sidebar-nav-container {
    margin-top: 20px;
  }
}
</style>
