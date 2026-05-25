<script setup lang="ts">
import BackGround001 from './components/BackGround/BackGround001.vue'
import BackGround002 from './components/BackGround/BackGround002.vue'
import Nav from './components/Nav.vue'
import FootText from './components/FootText.vue'
import Footer from './components/Footer.vue'
import AIAssistant from './components/AIAssistant.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
const route = useRoute()

// 判断是否是404页面
const isNotFoundPage = computed(() => {
  return route.name === 'NotFound' || route.meta?.is404 === true || route.path === '/404'
})
</script>

<template>
  <!-- 智能助手组件：非404页面均显示 -->
  <AIAssistant
    v-if="
      !isNotFoundPage &&
      !(route.path === '/') &&
      !(route.path === '/Hina/MockInterview') &&
      !(route.path === '/Hina/userportrait') &&
      !route.path.startsWith('/Manager') &&
      !route.path.startsWith('/initialize') &&
      !route.path.startsWith('/Hina/BookPDFReader') &&
      !route.path.startsWith('/Hina/SimulatedPracticeExercises') &&
      !route.path.startsWith('/Unity')
    "
  />
  <BackGround002 v-if="route.path === '/' && !isNotFoundPage" />
  <BackGround001 v-else-if="route.path !== '/' && !isNotFoundPage" />
  <Nav
    v-if="
      route.path.startsWith('/Foundations') && !isNotFoundPage && !route.path.startsWith('/Manager')
    "
  ></Nav>
  <RouterView />
  <FootText
    v-if="
      !isNotFoundPage &&
      !(route.path === '/Hina/MockInterview') &&
      !route.path.startsWith('/Unity') && // ← 先排除 Unity 路径
      (!(route.path === '/' || route.path.startsWith('/initialize')) ||
        route.path === '/Foundations/userhome') &&
      !route.path.startsWith('/Hina/BookPDFReader') &&
      !route.path.startsWith('/Hina/SimulatedPracticeExercises') &&
      !(route.path === '/Hina/userportrait') &&
      !route.path.startsWith('/Manager')
    "
  ></FootText>

  <Footer
    v-if="
      !isNotFoundPage &&
      !(route.path === '/Hina/MockInterview') &&
      !route.path.startsWith('/Unity') && // ← 先排除 Unity 路径
      (!(route.path === '/' || route.path.startsWith('/initialize')) ||
        route.path === '/Foundations/userhome') &&
      !route.path.startsWith('/Hina/BookPDFReader') &&
      !route.path.startsWith('/Hina/SimulatedPracticeExercises') &&
      !(route.path === '/Hina/userportrait') &&
      !route.path.startsWith('/Manager')
    "
  ></Footer>
</template>

<style>
@font-face {
  font-family: 'No1';
  src: url('/Fonts/XiangJiaHongZiJi-ZhongHuaJinBangTi-2.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'No3';
  src: url('/Fonts/AaLanTingTiShi-LuoBiRuShen-2.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

body {
  background-image: url('./assets/images.jpg');
  background-repeat: repeat;
  background-size: 200px 200px;
  background-attachment: fixed;
  min-height: 100vh;
  position: relative;
  padding: 0;
  margin: 0;
}

/* 给整个body和html添加滚动条样式 */
html,
body {
  scrollbar-width: thin; /* Firefox 64+ 支持 */
  scrollbar-color: #8b4513 #f5f0eb; /* Firefox: 滑块颜色和轨道颜色 */
}

/* Webkit浏览器滚动条样式 (Chrome, Safari, Edge) */
/* 垂直滚动条 */
::-webkit-scrollbar {
  width: 8px; /* 垂直滚动条宽度 */
  height: 8px; /* 水平滚动条高度 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background: #f5f0eb; /* 浅米色背景 */
  border-radius: 4px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: #8b4513; /* 棕色滑块 */
  border-radius: 4px;
  border: 2px solid #f5f0eb; /* 创建内边距效果 */
}

/* 滚动条滑块悬停状态 */
::-webkit-scrollbar-thumb:hover {
  background: #a0522d; /* 悬停时深一点的棕色 */
}

/* 滚动条滑块激活状态 */
::-webkit-scrollbar-thumb:active {
  background: #654321; /* 点击时更深棕色 */
}

/* 滚动条角落 */
::-webkit-scrollbar-corner {
  background: #f5f0eb; /* 角落颜色 */
}
</style>
