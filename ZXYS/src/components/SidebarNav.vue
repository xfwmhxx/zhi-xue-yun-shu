<template>
  <aside class="sidebar-nav">
    <div class="logo-area">
      <i class="fas fa-leaf"></i>
      <span class="logo-text">杏林·灵枢</span>
    </div>
    <nav class="nav-menu">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: activeMenu === item.id }"
        @click="selectMenu(item.id)"
      >
        <i :class="item.icon"></i>
        <span class="nav-label">{{ item.label }}</span>
        <i v-if="activeMenu === item.id" class="fas fa-chevron-right active-indicator"></i>
      </div>
    </nav>
    <div class="sidebar-footer">
      <i class="fas fa-user-md"></i>
      <span>坐堂医官</span>
      <i class="fas fa-circle" style="font-size: 0.5rem; color: #7c9a6e"></i>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'SidebarNav',
  props: {
    activeMenu: {
      type: String,
      default: 'joblist',
    },
  },
  data() {
    return {
      menuItems: [
        { id: 'user', label: '用户管理', icon: 'fas fa-chalkboard-teacher' },
        { id: 'joblist', label: '职位管理', icon: 'fas fa-chalkboard-teacher' },
        { id: 'bookhouse', label: '书城管理', icon: 'fas fa-chalkboard-teacher' },
        { id: 'fangzhen', label: '仿真管理', icon: 'fas fa-chalkboard-teacher' },
        { id: 'shipin', label: '视频管理', icon: 'fas fa-chalkboard-teacher' },
        { id: 'exam', label: '考证管理', icon: 'fas fa-chalkboard-teacher' },
        { id: 'mybook', label: '书架管理', icon: 'fas fa-chalkboard-teacher' },
        { id: 'resume', label: '简历管理', icon: 'fas fa-chalkboard-teacher' },
        { id: 'interview', label: '面试管理', icon: 'fas fa-chalkboard-teacher' },
      ],
    }
  },
  methods: {
    selectMenu(id) {
      this.$emit('menu-select', id)
    },
  },
}
</script>

<style scoped>
.sidebar-nav {
  width: 280px;
  background: rgba(240, 228, 208, 0.55);
  backdrop-filter: blur(16px);
  border-right: 1px solid rgba(170, 125, 65, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 28px 0 28px 0;
  box-shadow: 6px 0 20px rgba(80, 50, 20, 0.08);
  transition: all 0.25s;
  border-radius: 0 36px 36px 0;
  margin: 12px 0 12px 0;
  height: calc(100vh - 24px);
  position: sticky;
  top: 10px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 28px 28px 28px;
  border-bottom: 1px solid rgba(170, 125, 65, 0.5);
  margin-bottom: 32px;
}

.logo-area i {
  font-size: 2rem;
  color: #b16d3c;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.logo-text {
  font-size: 1.6rem;
  font-weight: 500;
  color: #4b2a14;
  letter-spacing: 2px;
  text-shadow: 0 1px 0 rgba(255, 245, 215, 0.8);
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-radius: 48px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #54371e;
  font-weight: 500;
  position: relative;
  border: 1px solid transparent;
  background: transparent;
}

.nav-item i:first-child {
  width: 26px;
  font-size: 1.25rem;
  color: #996a42;
  transition: transform 0.1s;
}

.nav-label {
  font-size: 1rem;
  letter-spacing: 1px;
}

.nav-item:hover {
  background: rgba(205, 165, 105, 0.3);
  border-color: rgba(170, 120, 55, 0.5);
  transform: translateX(4px);
}

.nav-item.active {
  background: rgba(195, 140, 70, 0.45);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(180, 115, 50, 0.7);
  box-shadow: 0 4px 12px rgba(100, 60, 20, 0.2);
  color: #3c260f;
}

.nav-item.active i:first-child {
  color: #b1562a;
  text-shadow: 0 0 2px #ffd8a0;
}

.active-indicator {
  margin-left: auto;
  font-size: 0.85rem;
  color: #bb7542;
}

.sidebar-footer {
  margin-top: 30px;
  padding: 18px 28px;
  border-top: 1px solid rgba(170, 125, 65, 0.5);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: #613f20;
  font-weight: 500;
}

.sidebar-footer i:first-child {
  font-size: 1.2rem;
  color: #ad6a3d;
}
</style>
