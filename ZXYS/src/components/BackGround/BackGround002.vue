<template>
  <!-- 水墨画背景图 -->
  <img :src="BackImage" alt="装饰图案" class="decoration5 top-decoration" />
</template>

<script setup lang="ts">
import BackImage from '@/assets/BackGround/BackGround002/001.png'
</script>
<style scoped>
.decoration5 {
  position: fixed;
  right: 0px;
  top: 0;
  width: 100%;
  z-index: -1;
  opacity: 0.8;
  transition: all 0.5s ease;
  opacity: 0;
  animation: float 8s ease-in-out infinite;
  object-fit: cover;
  height: auto;
  margin-top: 250px;
}

.top-decoration {
  right: 0px;
  top: -230px;
}
</style>
