<template>
  <nav class="navbar">
    <img :src="BackGround" alt="" class="ZS002" />
    <div class="logo-container">
      <img src="/public/logo.png" alt="网站Logo" class="logo-img" />
      <div class="logo-text">智学云枢</div>
    </div>

    <ul class="nav-links">
      <li><RouterLink to="/Foundations/homepage">首页</RouterLink></li>
      <li><RouterLink to="/Foundations/joblist">职位列表</RouterLink></li>
      <li><RouterLink to="/Foundations/bookhouse">经典书城</RouterLink></li>
      <li><RouterLink to="/Foundations/labindex">仿真教学</RouterLink></li>
      <li><RouterLink to="/Foundations/AIVideo">灵枢慧影</RouterLink></li>
    </ul>

    <!-- 用户信息区域 -->
    <div class="user-profile">
      <img src="/public/User.png" alt="用户头像" class="user-avatar" />
      <span class="user-name">{{ user.username }}</span>

      <!-- 下拉菜单 -->
      <div class="dropdown-menu">
        <RouterLink to="/Foundations/userhome">个人中心</RouterLink>
        <div class="menu-item-with-lock" @click="handlePortraitClick">
          <span>用户画像</span>
          <i v-if="isTodayRegistered" class="fas fa-lock lock-icon"></i>
        </div>
        <RouterLink to="/Hina/knowledgelist">知识图谱</RouterLink>
        <RouterLink to="/" @click="outlog">退出登录</RouterLink>
      </div>
    </div>
  </nav>
  <div class="NavPlace"></div>
</template>

<script setup lang="ts">
// 引入消息提示组件
import { message } from '@/components/Notification'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo, removeUserId, removeUserInfo } from '@/utils/storage'

import BackGround from '@/assets/Nav/BackGround.png'

const router = useRouter()
// 读取用户信息

// 读取用户信息
const user = getUserInfo()!
// 判断是否是今日注册的新用户
const isTodayRegistered = computed(() => {
  return user?.is_today_registered === true
})

// 处理用户画像点击
const handlePortraitClick = () => {
  if (isTodayRegistered.value) {
    message.warning('暂不可用', {
      note: '新注册用户需要先完成初始化才能访问用户画像',
      duration: 3000,
    })
    return
  }
  router.push('/Hina/userportrait')
}

const outlog = () => {
  message.info('退出中...', {
    note: '正在清理登录状态',
    duration: 1000,
  })
  // 2秒后显示成功消息
  setTimeout(() => {
    // 清理本地存储
    removeUserId()
    removeUserInfo()

    message.success('已退出', {
      note: '欢迎下次使用!',
      duration: 3000,
    })

    // 3秒后跳转
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }, 2000)
}
</script>

<style scoped>
.NavPlace {
  height: 80px; /* 与导航栏高度一致 */
}

.navbar {
  width: 100%;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  font-family: 'No3';
}

.menu-item-with-lock {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  cursor: pointer;
}

.menu-item-with-lock:hover {
  background-color: rgba(139, 69, 19, 0.1);
}

.lock-icon {
  color: #999;
  font-size: 12px;
}

.logo-container {
  display: flex;
  align-items: center;
  min-width: 150px;
  margin-left: 5%;
}

.ZS002 {
  z-index: -2;
  height: 100%;
  position: absolute;
  width: 100%;
}

.logo-img {
  height: 50px;
  margin-right: 15px;
}

.logo-text {
  font-family: 'No1', sans-serif;
  font-size: 50px;
  color: #333;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  list-style: none;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1;
  max-width: 600px;
  margin: 0 20px;
}

.nav-links li {
  margin: 0 15px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-size: 24px;
  font-family: 'NO3';
  padding: 5px 0;
  position: relative;
  white-space: nowrap;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #8b4513;
  transition: width 0.3s;
}

.nav-links a:hover::after {
  width: 100%;
}

/* 用户信息区域 - 完全保留原有设置 */
.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 5%;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #8b4513;
  transition: all 0.3s ease;
}

.user-profile:hover .user-avatar {
  transform: scale(1.1);
}

.user-name {
  margin-left: 10px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

/* 下拉菜单 - 完全保留原有设置 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 15px);
  right: 0;
  width: 160px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.user-profile:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(5px);
}

.dropdown-menu a {
  display: block;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.dropdown-menu a:hover {
  background-color: rgba(139, 69, 19, 0.1);
  color: #8b4513;
}
</style>
