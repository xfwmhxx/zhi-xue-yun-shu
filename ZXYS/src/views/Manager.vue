<template>
  <div class="app-xinglin">
    <!-- 侧边栏组件 -->
    <sidebar-nav :active-menu="activeMenu" @menu-select="handleMenuSelect" />

    <!-- 主内容区域 -->
    <main class="main-content" :key="activeMenu">
      <transition name="fade" mode="out-in">
        <component :is="currentComponent" />
      </transition>
    </main>
  </div>
</template>

<script>
import SidebarNav from '@/components/SidebarNav.vue'
import joblist from './Manager/joblist.vue'
import bookhouse from './Manager/bookhouse.vue'
import fangzhen from './Manager/fangzhen.vue'
import shipin from './Manager/shipin.vue'
import exam from './Manager/exam.vue'
import user from './Manager/user.vue'
import mybook from './Manager/mybook.vue'
import resume from './Manager/resume.vue'
import interview from './Manager/interview.vue'

export default {
  name: 'App',
  components: {
    SidebarNav,
    joblist,
    bookhouse,
    fangzhen,
    shipin,
    exam,
    user,
    mybook,
    resume,
    interview,
  },
  data() {
    return {
      activeMenu: 'user',
    }
  },
  computed: {
    currentComponent() {
      const components = {
        joblist: 'joblist',
        bookhouse: 'bookhouse',
        fangzhen: 'fangzhen',
        shipin: 'shipin',
        exam: 'exam',
        user: 'user',
        mybook: 'mybook',
        resume: 'resume',
        interview: 'interview',
      }
      return components[this.activeMenu] || 'user'
    },
  },
  methods: {
    handleMenuSelect(menuId) {
      this.activeMenu = menuId
    },
  },
}
</script>

<style scoped>
/* 全局重置与杏林主题变量 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'No3';
  font-size: 22px;
  background: linear-gradient(135deg, #e8d9c5 0%, #cfbc9f 100%);
  min-height: 100vh;
  backdrop-filter: blur(2px);
}

.app-xinglin {
  display: flex;
  min-height: 100vh;
  background: rgba(245, 235, 220, 0.3);
  align-items: flex-start;
}

/* 主内容区域 - 玻璃效果容器 */
.main-content {
  flex: 1;
  margin: 20px 30px 20px 10px;
  background: rgba(250, 245, 235, 0.55);
  backdrop-filter: blur(12px);
  border-radius: 28px;
  border: 1px solid rgba(205, 165, 110, 0.6);
  box-shadow:
    0 8px 20px rgba(100, 60, 20, 0.12),
    inset 0 1px 0 rgba(255, 245, 220, 0.6);
  padding: 24px 28px;
  transition: all 0.3s ease;
  overflow-y: auto;
}

/* 自定义滚动条 - 古铜色调 */
.main-content::-webkit-scrollbar {
  width: 8px;
}
.main-content::-webkit-scrollbar-track {
  background: rgba(180, 130, 70, 0.2);
  border-radius: 10px;
}
.main-content::-webkit-scrollbar-thumb {
  background: rgba(139, 69, 19, 0.6);
  border-radius: 10px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 全局按钮与印章红色强调 */
.el-button--primary,
.btn-xinglin-primary {
  background: #b55b3c !important;
  border-color: #9a4327 !important;
}
.btn-xinglin-primary:hover {
  background: #9a4327 !important;
  border-color: #7a341e !important;
}

/* 公用卡片样式（杏林玻璃卡片） */
.xinglin-card {
  background: rgba(250, 242, 228, 0.7);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(190, 145, 85, 0.7);
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(80, 50, 20, 0.08);
  padding: 1.5rem;
  transition: all 0.2s;
}

/* 深褐色文字全局 */
body,
.app-xinglin,
.main-content,
.xinglin-card,
.sidebar-nav {
  color: #4a2a12;
}

h1,
h2,
h3,
h4 {
  color: #3e2410;
  font-weight: 500;
  letter-spacing: 1px;
}

/* 链接与强调色 */
a {
  color: #a15e3a;
  text-decoration: none;
}
a:hover {
  color: #c27146;
}
</style>
