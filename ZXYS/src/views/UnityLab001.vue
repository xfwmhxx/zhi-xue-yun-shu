<template>
  <div class="unity-container">
    <button class="back-button" @click="goBack">← 返回</button>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在加载Unity应用... {{ loadingProgress }}%</p>
    </div>

    <div v-if="error" class="error-overlay">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>加载失败</h3>
        <p>{{ errorMessage }}</p>
        <button @click="reload" class="reload-btn">重新加载</button>
      </div>
    </div>

    <iframe
      ref="unityFrame"
      :src="unityHtmlPath"
      class="unity-frame"
      :style="iframeStyle"
      @load="onIframeLoad"
      @error="onIframeError"
      allow="autoplay; fullscreen"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

import { useRouter } from 'vue-router' // 添加这一行

const router = useRouter() // 添加这一行
const props = defineProps({
  unityHtmlPath: {
    type: String,
    required: true,
    default: '/Unity/Lab001/index.html',
  },
  width: {
    type: [String, Number],
    default: '100%',
  },
  height: {
    type: [String, Number],
    default: '100vh',
  },
})

const unityFrame = ref(null)
const loading = ref(true)
const loadingProgress = ref(0)
const error = ref(false)
const errorMessage = ref('')
let loadTimeout = null

const iframeStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  border: 'none',
}))

// 检查文件是否存在
const checkUnityFiles = async () => {
  try {
    // 检查 index.html 是否存在
    const response = await fetch(props.unityHtmlPath, { method: 'HEAD' })
    if (!response.ok) {
      throw new Error(`Unity文件不存在: ${props.unityHtmlPath}`)
    }
    console.log('✅ Unity index.html 存在')
    return true
  } catch (err) {
    console.error('❌ Unity文件检查失败:', err)
    errorMessage.value = `无法找到Unity文件: ${props.unityHtmlPath}`
    error.value = true
    loading.value = false
    return false
  }
}

const onIframeLoad = () => {
  console.log('✅ iframe 加载完成:', props.unityHtmlPath)

  // 清除超时
  if (loadTimeout) clearTimeout(loadTimeout)

  // 监听 Unity 消息
  window.addEventListener('message', handleUnityMessage)

  // 尝试检测 Unity 是否真的加载了
  try {
    const iframeDoc = unityFrame.value?.contentDocument
    const iframeWin = unityFrame.value?.contentWindow

    if (iframeDoc && iframeDoc.body) {
      // 检查 iframe 内是否有内容
      const bodyContent = iframeDoc.body.innerHTML
      if (bodyContent.includes('Unity') || bodyContent.includes('WebGL')) {
        console.log('✅ Unity 内容已加载')
        // 给 Unity 一点初始化时间
        setTimeout(() => {
          if (loading.value) {
            loading.value = false
          }
        }, 2000)
      } else if (bodyContent.includes('404') || bodyContent.includes('Not Found')) {
        console.error('❌ iframe 内返回 404')
        error.value = true
        errorMessage.value = 'Unity 页面不存在 (404)'
        loading.value = false
      } else {
        console.warn('⚠️ iframe 内容可能不是 Unity:', bodyContent.substring(0, 200))
        // 仍然尝试隐藏 loading
        setTimeout(() => {
          loading.value = false
        }, 3000)
      }
    }
  } catch (err) {
    // 跨域限制，无法访问 iframe 内容，假设加载成功
    console.warn('无法访问 iframe 内容（跨域限制）:', err)
    setTimeout(() => {
      loading.value = false
    }, 2000)
  }
}

const onIframeError = (event) => {
  console.error('❌ iframe 加载失败:', event)
  error.value = true
  errorMessage.value = `无法加载 ${props.unityHtmlPath}`
  loading.value = false
}

const handleUnityMessage = (event) => {
  if (event.data && typeof event.data === 'object') {
    if (event.data.type === 'unityProgress') {
      loadingProgress.value = event.data.progress
      if (event.data.progress === 100) {
        setTimeout(() => {
          loading.value = false
        }, 500)
      }
    }
  }
}

const reload = () => {
  error.value = false
  loading.value = true
  loadingProgress.value = 0
  if (unityFrame.value) {
    unityFrame.value.src = props.unityHtmlPath
  }
}

// 设置加载超时
const setLoadTimeout = () => {
  loadTimeout = setTimeout(() => {
    if (loading.value) {
      console.warn('⚠️ 加载超时，强制隐藏 loading')
      loading.value = false
      // 检查是否有错误
      checkUnityFiles()
    }
  }, 10000) // 10秒超时
}

const goBack = () => {
  router.back() // 返回上一页
  // 或者指定返回某个路由：router.push('/your-path')
}

defineExpose({
  reload,
  loading,
})

onMounted(() => {
  setLoadTimeout()
  checkUnityFiles()
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleUnityMessage)
  if (loadTimeout) clearTimeout(loadTimeout)
})
</script>

<style scoped>
.unity-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  background-color: #1a1a2e;
}

.unity-frame {
  display: block;
  width: 100%;
  height: 100%;
  background-color: #1a1a2e;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  backdrop-filter: blur(5px);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #4caf50;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p,
.error-overlay p {
  color: white;
  margin-top: 20px;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

.error-content {
  text-align: center;
  color: white;
}

.error-content i {
  font-size: 48px;
  color: #ff6b6b;
  margin-bottom: 16px;
}

.error-content h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
}

.error-content p {
  margin: 0 0 20px 0;
  color: #ccc;
}

.reload-btn {
  padding: 10px 24px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.reload-btn:hover {
  background: #45a049;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  backdrop-filter: blur(5px);
  transition: all 0.3s;
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateX(-2px);
}
</style>
