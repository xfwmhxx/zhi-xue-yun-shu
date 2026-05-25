<!-- src/components/PlacementTest/DigitalHuman.vue -->
<template>
  <div ref="containerRef" class="avatar-render">
    <!-- SDK 渲染容器 -->
    <div :id="containerId" ref="sdkContainerRef" class="sdk-container" />

    <!-- 语音输入动画 -->

    <!-- 加载状态 -->
    <div v-if="!isAvatarConnected && !isConnecting" class="loading-placeholder">
      <div class="loading-text">-- 正在连接 --</div>
    </div>

    <!-- 连接中状态 -->
    <div v-if="isConnecting" class="loading-placeholder">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在连接数字人...</div>
    </div>

    <!-- 连接错误状态 -->
    <div v-if="connectError" class="error-placeholder">
      <div class="error-icon">⚠️</div>
      <div class="error-text">{{ connectError }}</div>
      <button class="retry-btn" @click="retryConnect">重试</button>
    </div>

    <!-- 数字人状态指示器 -->
    <div class="avatar-status" :class="{ active: isAvatarConnected }">
      <span class="status-dot"></span>
      <span class="status-text">{{ isAvatarConnected ? '数字人已就绪' : '数字人连接中' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { avatarService } from './services/avatar'
import type { AppState, AppStore } from '@/types'
import siriIcon from '@/assets/siri.png'

// 注入全局状态
const appState = inject<AppState>('appState')
const appStore = inject<AppStore>('appStore')

// 本地状态
const containerRef = ref<HTMLElement | null>(null)
const sdkContainerRef = ref<HTMLElement | null>(null)
const isConnecting = ref(false)
const connectError = ref<string | null>(null)
let reconnectTimer: any = null
let reconnectCount = 0
const MAX_RECONNECT = 3
let isInitialized = false

// 固定配置
const avatarConfig = {
  appId: '9abed793ccb24f248c39c882024739e7',
  appSecret: '38d7a6be62cf4af299143a61eb96c566',
}

// 获取容器ID
const containerId = computed(() => {
  const id = avatarService.getContainerId()
  console.log('[DigitalHuman] avatarService.getContainerId():', id)
  return id
})

// 计算 avatar 连接状态
const isAvatarConnected = computed(() => {
  if (!appState) return false
  return appState.avatar?.connected || false
})

// 监听连接状态变化
watch(isAvatarConnected, (connected) => {
  if (connected) {
    console.log('[DigitalHuman] 数字人已连接')
    isConnecting.value = false
    connectError.value = null
    reconnectCount = 0
    isInitialized = true
  }
})

// 加载数字人 SDK
const loadAvatarSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.XmovAvatar) {
      console.log('[DigitalHuman] SDK 已加载')
      resolve()
      return
    }

    console.log('[DigitalHuman] 开始加载数字人 SDK...')

    const sdkUrls = [
      'https://unpkg.com/@xmov/avatar-sdk@latest/dist/avatar-sdk.js',
      'https://cdn.jsdelivr.net/npm/@xmov/avatar-sdk@latest/dist/avatar-sdk.js',
    ]

    let currentIndex = 0

    const tryLoad = () => {
      if (currentIndex >= sdkUrls.length) {
        reject(new Error('所有 SDK 地址均加载失败'))
        return
      }

      const url = sdkUrls[currentIndex]
      console.log(`[DigitalHuman] 尝试加载 SDK: ${url}`)

      const script = document.createElement('script')
      script.src = String(url)
      script.async = true

      script.onload = () => {
        console.log(`[DigitalHuman] SDK 加载成功: ${url}`)
        let attempts = 0
        const maxAttempts = 20
        const checkInterval = setInterval(() => {
          if (window.XmovAvatar) {
            clearInterval(checkInterval)
            resolve()
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
            currentIndex++
            tryLoad()
          }
          attempts++
        }, 100)
      }

      script.onerror = () => {
        console.error(`[DigitalHuman] SDK 加载失败: ${url}`)
        currentIndex++
        tryLoad()
      }

      document.head.appendChild(script)
    }

    tryLoad()
  })
}

// 初始化数字人
const initAvatar = async () => {
  if (!appState || !appStore) {
    console.error('[DigitalHuman] appState 或 appStore 未注入')
    connectError.value = '服务未初始化'
    return
  }

  if (appState.avatar.connected) {
    console.log('[DigitalHuman] 数字人已连接，无需重复连接')
    return
  }

  if (reconnectCount >= MAX_RECONNECT) {
    connectError.value = `连接失败，已重试 ${MAX_RECONNECT} 次`
    isConnecting.value = false
    return
  }

  if (isInitialized) {
    console.log('[DigitalHuman] 数字人已初始化，跳过')
    return
  }

  isConnecting.value = true
  connectError.value = null

  try {
    console.log('[DigitalHuman] 开始连接数字人...')

    // 1. 设置配置到 appState
    if (appState.avatar) {
      appState.avatar.appId = avatarConfig.appId
      appState.avatar.appSecret = avatarConfig.appSecret
    }

    console.log('[DigitalHuman] 数字人配置已设置')

    // 2. 加载 SDK
    await loadAvatarSDK()

    if (!window.XmovAvatar) {
      throw new Error('SDK 不可用')
    }

    // 3. 等待 DOM 渲染完成
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 300))

    // 4. 获取容器元素 - 使用 ref 直接获取 DOM 元素
    const container = sdkContainerRef.value || document.getElementById(containerId.value)
    if (!container) {
      throw new Error(`找不到视频容器: ${containerId.value}`)
    }

    console.log('[DigitalHuman] 找到容器元素:', container)
    console.log('[DigitalHuman] 容器ID:', container.id)
    console.log('[DigitalHuman] 容器是否在 DOM 中:', document.body.contains(container))

    // 5. 确保容器有正确的样式
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.position = 'relative'
    container.style.overflow = 'hidden'

    // 6. 清空容器
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    // 7. 创建视频元素
    const videoElement = document.createElement('video')
    videoElement.id = 'avatar-video'
    videoElement.autoplay = true
    videoElement.playsInline = true
    videoElement.muted = true
    videoElement.style.width = '100%'
    videoElement.style.height = '100%'
    videoElement.style.objectFit = 'cover'
    videoElement.style.position = 'absolute'
    videoElement.style.top = '0'
    videoElement.style.left = '0'
    container.appendChild(videoElement)

    if (appState.avatar) {
      appState.avatar.videoElement = videoElement
    }
    console.log('[DigitalHuman] 视频元素已创建')

    // 8. 检查是否已有实例
    if (appState.avatar?.instance) {
      console.log('[DigitalHuman] 已有数字人实例，跳过创建')
      return
    }

    // 9. 创建数字人实例 - 传递 DOM 元素而不是 ID 字符串
    console.log('[DigitalHuman] 创建数字人实例...')
    console.log('[DigitalHuman] 使用容器:', container)

    const avatarInstance = new window.XmovAvatar({
      container: container, // 直接传递 DOM 元素，而不是 ID 字符串
      appId: avatarConfig.appId,
      appSecret: avatarConfig.appSecret,
      onMessage: (message: any) => {
        console.log('[DigitalHuman] SDK 消息:', message)
        // 处理错误消息
        if (message?.code === 10001) {
          console.warn('[DigitalHuman] SDK 警告:', message.message)
          // 忽略 containerId 错误，因为我们已经正确传递了 DOM 元素
          if (message.message?.includes('containerId')) {
            console.log('[DigitalHuman] 忽略 containerId 警告，使用 DOM 元素已正确传递')
          }
        }
      },
      onReady: () => {
        console.log('[DigitalHuman] 数字人实例已就绪')
        if (appState.avatar) {
          appState.avatar.connected = true
          appState.avatar.instance = avatarInstance
        }
        isConnecting.value = false
        isInitialized = true
      },
      onError: (error: any) => {
        console.error('[DigitalHuman] 数字人实例错误:', error)
        connectError.value = error?.message || '数字人实例错误'
        isConnecting.value = false
        if (appState.avatar) {
          appState.avatar.connected = false
        }
      },
      onSpeakingStart: () => {
        console.log('[DigitalHuman] 数字人开始说话')
        if (appState.avatar) {
          appState.avatar.speaking = true
        }
      },
      onSpeakingEnd: () => {
        console.log('[DigitalHuman] 数字人结束说话')
        if (appState.avatar) {
          appState.avatar.speaking = false
        }
      },
      onThinkingStart: () => {
        console.log('[DigitalHuman] 数字人开始思考')
        if (appState.avatar) {
          appState.avatar.thinking = true
        }
      },
      onThinkingEnd: () => {
        console.log('[DigitalHuman] 数字人结束思考')
        if (appState.avatar) {
          appState.avatar.thinking = false
        }
      },
    })

    if (appState.avatar) {
      appState.avatar.instance = avatarInstance
    }
    console.log('[DigitalHuman] 数字人实例创建成功')

    // 10. 调用 store 的连接方法
    if (appStore?.connectAvatar) {
      await appStore.connectAvatar()
    }

    console.log('[DigitalHuman] 数字人连接成功')
    reconnectCount = 0
  } catch (error: any) {
    console.error('[DigitalHuman] 数字人连接失败:', error)
    connectError.value = error.message || '连接失败，请重试'
    isConnecting.value = false
    if (appState.avatar) {
      appState.avatar.connected = false
    }
    reconnectCount++

    if (reconnectCount < MAX_RECONNECT) {
      if (reconnectTimer) clearTimeout(reconnectTimer)
      const delay = 5000 * reconnectCount
      console.log(`[DigitalHuman] ${delay / 1000}秒后自动重试 (${reconnectCount}/${MAX_RECONNECT})`)
      reconnectTimer = setTimeout(() => {
        initAvatar()
      }, delay)
    }
  }
}

// 重试连接
const retryConnect = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  reconnectCount = 0
  connectError.value = null
  isInitialized = false
  initAvatar()
}

// 清理资源
const cleanup = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (appState?.avatar?.instance) {
    try {
      if (typeof appState.avatar.instance.destroy === 'function') {
        appState.avatar.instance.destroy()
      }
      appState.avatar.instance = null
      console.log('[DigitalHuman] 数字人实例已销毁')
    } catch (e) {
      console.error('[DigitalHuman] 销毁数字人实例失败:', e)
    }
  }

  if (appState?.avatar?.videoElement) {
    try {
      const video = appState.avatar.videoElement
      video.pause()
      if (video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
      video.srcObject = null
      if (video.parentNode) {
        video.parentNode.removeChild(video)
      }
      appState.avatar.videoElement = null
    } catch (e) {
      console.error('[DigitalHuman] 清理视频元素失败:', e)
    }
  }

  if (appState?.avatar) {
    appState.avatar.connected = false
  }
}

// 调试函数 - 挂载到 window
const debugInfo = () => {
  console.group('🔍 数字人调试信息')
  console.log('appState:', appState)
  console.log('appStore:', appStore)
  console.log('isAvatarConnected:', isAvatarConnected.value)
  console.log('isConnecting:', isConnecting.value)
  console.log('connectError:', connectError.value)
  console.log('isInitialized:', isInitialized)
  console.log('containerId:', containerId.value)
  console.log('sdkContainerRef:', sdkContainerRef.value)
  console.log('videoElement:', appState?.avatar?.videoElement)
  console.log('avatarInstance:', appState?.avatar?.instance)
  console.log('window.XmovAvatar:', window.XmovAvatar)
  console.groupEnd()
}

// 获取视频元素
const getVideoElement = () => {
  return appState?.avatar?.videoElement ?? null
}

// 获取连接状态
const getConnectionStatus = () => {
  return {
    connected: isAvatarConnected.value,
    connecting: isConnecting.value,
    error: connectError.value,
    initialized: isInitialized,
  }
}

// 挂载调试方法到 window
if (typeof window !== 'undefined') {
  window.__debugDigitalHuman = {
    debugInfo,
    getVideoElement,
    getConnectionStatus,
    getAppState: () => appState,
    getAppStore: () => appStore,
  }
  console.log('[DigitalHuman] 调试方法已挂载，可使用 window.__debugDigitalHuman 查看状态')
}

// 生命周期
onMounted(() => {
  console.log('[DigitalHuman] 组件挂载')
  console.log('[DigitalHuman] containerId from service:', containerId.value)
  initAvatar()
})

onUnmounted(() => {
  console.log('[DigitalHuman] 组件卸载，清理资源')
  cleanup()

  if (appStore && appState?.avatar?.connected) {
    try {
      appStore.disconnectAvatar()
    } catch (e) {
      console.error('[DigitalHuman] 断开连接失败:', e)
    }
  }

  // 清理调试方法
  if (typeof window !== 'undefined') {
    delete window.__debugDigitalHuman
  }
})
</script>

<style scoped>
.avatar-render {
  flex: 1;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.sdk-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sdk-container :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.voice-animation {
  position: absolute;
  left: 50%;
  bottom: 20%;
  transform: translateX(-50%);
  width: 360px;
  max-width: 90%;
  z-index: 101;
  pointer-events: none;
}

.voice-animation > img {
  width: 100%;
  height: auto;
  animation: voicePulse 1.5s ease-in-out infinite;
}

.loading-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(166, 124, 82, 0.3);
  border-top-color: #a67c52;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 18px;
  color: #8b4513;
  font-weight: 500;
  font-family: 'STKaiti', 'SimSun', serif;
}

.error-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 10;
}

.error-icon {
  font-size: 48px;
}

.error-text {
  font-size: 18px;
  font-weight: 500;
  color: #ef4444;
}

.retry-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #5a3921, #3d2b1f);
  color: #fff;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(90, 57, 33, 0.3);
}

/* 数字人状态指示器 */
.avatar-status {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  z-index: 10;
}

.avatar-status .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  transition: all 0.3s;
}

.avatar-status.active .status-dot {
  background: #10b981;
  animation: pulse 1.5s infinite;
}

.avatar-status .status-text {
  font-size: 11px;
  color: #fff;
  font-family: 'STKaiti', 'SimSun', serif;
}

@keyframes voicePulse {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateX(-50%) scale(1.05);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
</style>
