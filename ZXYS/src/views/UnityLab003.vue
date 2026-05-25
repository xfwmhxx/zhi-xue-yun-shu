<!-- src/components/UnityHerbDisplay.vue -->
<template>
  <div class="unity-herb-container">
    <iframe
      ref="unityIframe"
      :src="iframeSrc"
      class="unity-iframe"
      frameborder="0"
      allow="autoplay; fullscreen"
      allowfullscreen
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const iframeSrc = computed(() => {
  // 开发环境
  if (import.meta.env.DEV) {
    return '/Unity/Lab003/index.html'
  }
  // 生产环境
  return '/Unity/Lab003/index.html'
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.unity-herb-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.unity-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
