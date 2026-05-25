<template>
  <div class="not-found" @click="goBack">
    <div class="content">
      <h1 class="error-code">404</h1>
      <p class="error-message">页面迷失在经络中</p>
      <p class="back-hint">点击任意位置返回上一页</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
* {
  font-family: 'No3';
}
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f0e6 0%, #e8dfd1 100%);
  cursor: pointer;
}

.content {
  text-align: center;
  animation: fadeIn 0.6s ease-out;
}

.error-code {
  font-size: 404px;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #5a3921, #8b5a2e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 20px;
  text-shadow: 0 4px 20px rgba(90, 57, 33, 0.15);
}

.error-message {
  font-size: 44px;
  color: #8b7355;
  margin: 20px 0 12px;
  font-weight: 500;
  letter-spacing: 2px;
}

.back-hint {
  font-size: 44px;
  color: #a67c52;
  opacity: 0.7;
  margin: 0;
  transition: opacity 0.3s ease;
}

.not-found:hover .back-hint {
  opacity: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .error-code {
    font-size: 120px;
    letter-spacing: 12px;
  }

  .error-message {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 80px;
    letter-spacing: 8px;
  }

  .error-message {
    font-size: 16px;
  }
}
</style>
