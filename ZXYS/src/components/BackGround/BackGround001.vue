<template>
  <img :src="ZS010" alt="" class="ZS010" />
  <img :src="ZS008" alt="" class="ZS008" />
  <img :src="BgBg" alt="" class="BgBg" />
</template>

<script setup>
import ZS010 from '@/assets/BackGround/BackGround001/ZS010.png'
import ZS008 from '@/assets/BackGround/BackGround001/ZS008.png'
import BgBg from '@/assets/BackGround/BackGround001/10(1).png'
</script>

<style scoped>
.ZS010,
.ZS008,
.BgBg {
  position: fixed;
  z-index: -10000;
}

.ZS010 {
  width: 300px;
  top: 100px;
  left: 0;
}

.ZS008 {
  width: 300px;
  /* bottom: 5vh; */
  top: 12vh;
  right: 0;
}

.BgBg {
  width: 100%;
  bottom: 0;
  left: 0;
  pointer-events: none;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
</style>
