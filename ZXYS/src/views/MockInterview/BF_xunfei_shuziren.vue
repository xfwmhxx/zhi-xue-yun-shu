<!-- src/components/PlacementTest/xunfei_shuziren.vue -->
<template>
  <div class="avatar-dashboard">
    <!-- 加载状态 -->
    <div class="loading-overlay" v-if="isInitializing">
      <div class="loadbox">
        <div class="spinner"></div>
        <div class="loading-text">数字人初始化中...</div>
      </div>
    </div>

    <div class="dashboard-container">
      <div class="avatar-section">
        <div class="section-header">
          <h3><i class="fas fa-robot"></i> 数字人交互</h3>
          <div class="status-badge" :class="isConnected ? 'connected' : 'disconnected'">
            <span class="status-dot"></span>
            {{ isConnected ? '在线' : '离线' }}
          </div>
        </div>

        <div class="avatar-video-container">
          <div class="avatar-wrapper" id="wrapper"></div>
        </div>

        <div class="control-panel">
          <div class="control-group">
            <span class="control-label"><i class="fas fa-adjust"></i> 透明度</span>
            <input
              type="range"
              class="slider"
              id="opacityRange"
              min="0"
              max="1"
              step="0.1"
              value="1"
              @input="updateOpacity"
            />
          </div>

          <div class="control-buttons">
            <button
              class="control-btn primary"
              @click="reconnectAvatar"
              :disabled="isConnected || isInitializing"
            >
              <i class="fas fa-play-circle"></i>
              {{ isConnected ? '已连接' : isInitializing ? '启动中...' : '启动数字人' }}
            </button>
            <button class="control-btn secondary" @click="interruptAvatar" :disabled="!isConnected">
              <i class="fas fa-hand-paper"></i>
              打断
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { setAvatarInstance, setSDKReady } from '@/services/avatarTTS'

// SDK导入
import AvatarPlatform, {
  PlayerEvents,
  SDKEvents,
} from '@/components/vm-sdk/avatar-sdk-web_3.1.1.1011/index.js'

// 注入全局状态
const appState = inject('appState')
const appStore = inject('appStore')

// 响应式数据
const isConnected = ref(false)
const isInitializing = ref(false)
const isAvatarSpeaking = ref(false)

// 更新配置
const defaultConfig = {
  appId: '331e8654',
  apiKey: '170cf57d0fb96bf5c78be27b999dd680',
  apiSecret: 'NmQwNjIxNzgyZDZjYmE3NGZlNTQ4YWI1',
  serverUrl: 'wss://avatar.cn-huadong-1.xf-yun.com/v1/interact',
  sceneId: '295533501187493888',
}

// 全局参数
const globalParams = {
  stream: {
    protocol: 'xrtc',
    fps: 25,
    bitrate: 1000000,
    alpha: 1,
  },
  avatar: {
    avatar_id: '110117005',
    width: 720,
    height: 1280,
    audio_format: 1,
  },
  tts: {
    vcn: 'x4_lingxiaoying_assist',
    speed: 50,
    pitch: 50,
    volume: 100,
    emotion: 13,
  },
  avatar_dispatch: {
    interactive_mode: 1,
  },
  subtitle: {
    subtitle: 0,
  },
}

let avatarPlatform = null

// 更新全局连接状态
const updateGlobalConnectionState = (connected) => {
  if (appState && appState.avatar) {
    appState.avatar.connected = connected
    console.log('[数字人] 更新全局连接状态:', connected)
  }
}

// 更新全局说话状态
const updateGlobalSpeakingState = (speaking) => {
  if (appState && appState.avatar) {
    appState.avatar.isSpeaking = speaking
    console.log('[数字人] 更新全局说话状态:', speaking)
  }
}

// 初始化并连接数字人
const initAndConnect = async () => {
  if (isConnected.value) return

  isInitializing.value = true

  try {
    avatarPlatform = new AvatarPlatform()
    console.log('[数字人] SDK实例化成功')
    console.log('[数字人] SDK方法检查:', {
      writeText: typeof avatarPlatform.writeText,
      interrupt: typeof avatarPlatform.interrupt,
      start: typeof avatarPlatform.start,
    })

    // 设置数字人实例到 TTS 服务
    setAvatarInstance(avatarPlatform)

    avatarPlatform.setApiInfo(defaultConfig)
    console.log('[数字人] API配置已加载')

    avatarPlatform.setGlobalParams(globalParams)
    console.log('[数字人] 全局参数已配置')

    setupSDKEvents()
    setupPlayerEvents()

    await startAvatar()

    isConnected.value = true
    isInitializing.value = false
    updateGlobalConnectionState(true)

    // 延迟后检查 writeText 是否可用
    setTimeout(() => {
      console.log('[数字人] 连接后方法检查:', {
        writeText: typeof avatarPlatform?.writeText,
        interrupt: typeof avatarPlatform?.interrupt,
      })
      if (avatarPlatform && typeof avatarPlatform.writeText === 'function') {
        setSDKReady(true)
        console.log('[数字人] SDK 已就绪，writeText 可用')
      } else {
        console.warn('[数字人] SDK 就绪但 writeText 不可用')
      }
    }, 1000)

    console.log('[数字人] 数字人连接成功')
    ElMessage.success('数字人连接成功')
  } catch (error) {
    console.error('[数字人] 初始化失败:', error)
    isInitializing.value = false
    updateGlobalConnectionState(false)
    ElMessage.error('数字人连接失败: ' + error.message)
  }
}

// 启动数字人
const startAvatar = () => {
  return new Promise((resolve, reject) => {
    const wrapper = document.querySelector('#wrapper')
    if (!wrapper) {
      reject(new Error('找不到数字人容器'))
      return
    }

    avatarPlatform
      .start({ wrapper })
      .then(() => {
        resolve()
      })
      .catch(reject)
  })
}

// 设置SDK事件监听
const setupSDKEvents = () => {
  if (!avatarPlatform) return

  avatarPlatform
    .on(SDKEvents.connected, () => {
      console.log('[数字人] SDK连接成功')
      updateGlobalConnectionState(true)
    })
    .on(SDKEvents.stream_start, () => {
      console.log('[数字人] 视频流开始')
    })
    .on(SDKEvents.disconnected, () => {
      console.log('[数字人] SDK连接断开')
      isConnected.value = false
      isAvatarSpeaking.value = false
      updateGlobalConnectionState(false)
      updateGlobalSpeakingState(false)
      ElMessage.warning('数字人连接已断开')
    })
    .on(SDKEvents.error, (error) => {
      console.error('[数字人] SDK错误:', error)
      ElMessage.error('发生错误: ' + error.message)
    })
    .on(SDKEvents.frame_start, () => {
      console.log('[数字人] 开始说话')
      isAvatarSpeaking.value = true
      updateGlobalSpeakingState(true)
    })
    .on(SDKEvents.frame_stop, () => {
      console.log('[数字人] 停止说话')
      isAvatarSpeaking.value = false
      updateGlobalSpeakingState(false)
    })
    .on(SDKEvents.audio_start, () => {
      console.log('[数字人] 音频开始播放')
      if (!isAvatarSpeaking.value) {
        isAvatarSpeaking.value = true
        updateGlobalSpeakingState(true)
      }
    })
    .on(SDKEvents.audio_stop, () => {
      console.log('[数字人] 音频停止播放')
      isAvatarSpeaking.value = false
      updateGlobalSpeakingState(false)
    })
}

// 设置播放器事件监听
const setupPlayerEvents = () => {
  if (!avatarPlatform) return

  const player = avatarPlatform.createPlayer()
  player
    .on(PlayerEvents.play, () => {
      console.log('[数字人] 播放开始')
    })
    .on(PlayerEvents.playNotAllowed, () => {
      console.log('[数字人] 自动播放被阻止，尝试恢复')
      player.resume()
    })
}

// 打断数字人
const interruptAvatar = () => {
  if (!isConnected.value) {
    ElMessage.warning('请先连接数字人')
    return
  }

  if (avatarPlatform && typeof avatarPlatform.interrupt === 'function') {
    avatarPlatform.interrupt()
    ElMessage.info('已发送打断指令')
  } else {
    ElMessage.warning('打断功能不可用')
  }
}

// 重连数字人
const reconnectAvatar = () => {
  if (isConnected.value) return
  initAndConnect()
}

// 更新透明度
const updateOpacity = (event) => {
  const wrapper = document.getElementById('wrapper')
  if (wrapper) {
    wrapper.style.opacity = event.target.value
  }
}

// 暴露 isInitializing 状态给父组件
defineExpose({
  isInitializing,
})

// 页面加载时自动连接
onMounted(() => {
  const wrapper = document.getElementById('wrapper')
  if (wrapper) {
    const range = document.getElementById('opacityRange')
    if (range) {
      range.addEventListener('input', updateOpacity)
    }
  }

  setTimeout(() => {
    initAndConnect()
  }, 500)
})

// 组件卸载时清理
onUnmounted(() => {
  if (avatarPlatform && isConnected.value) {
    try {
      avatarPlatform.stop()
      updateGlobalConnectionState(false)
      console.log('[数字人] 已断开连接')
    } catch (error) {
      console.error('[数字人] 断开连接失败:', error)
    }
  }
})
</script>

<style scoped>
/* 样式保持不变 */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

:root {
  --xinglin-gold: #c9a87b;
  --xinglin-gold-light: #e6d5b8;
  --xinglin-brown: #8b7355;
  --xinglin-brown-dark: #5a3e2e;
  --xinglin-red: #b76e6e;
  --xinglin-green: #7c9a6e;
  --xinglin-cream: #fef7e6;
  --xinglin-paper: #faf3e0;
  --xinglin-shadow: rgba(90, 62, 46, 0.15);
  --xinglin-border: rgba(166, 124, 82, 0.3);
  --xinglin-debug: #2196f3;
}

.avatar-dashboard {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  background: linear-gradient(135deg, #fef7e6 0%, #fff5e6 100%);
  font-family: 'STKaiti', '华文楷书', 'Microsoft YaHei', 'SimSun', serif;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(250, 243, 224, 0.98);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loadbox {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(166, 124, 82, 0.3);
  border-top-color: var(--xinglin-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 18px;
  color: var(--xinglin-brown);
  letter-spacing: 4px;
  font-family: 'STKaiti', serif;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dashboard-container {
  display: flex;
  gap: 20px;
  height: 100%;
  min-height: 0;
}

.avatar-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(250, 243, 224, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid var(--xinglin-border);
  border-radius: 16px;
  padding: 20px;
  min-height: 0;
  box-shadow: 0 8px 20px var(--xinglin-shadow);
  position: relative;
  overflow: hidden;
}

.avatar-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--xinglin-gold),
    var(--xinglin-brown),
    var(--xinglin-gold)
  );
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.section-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--xinglin-brown-dark);
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'STKaiti', serif;
}

.section-header i {
  color: var(--xinglin-gold);
  font-size: 1.1rem;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'STKaiti', serif;
}

.status-badge.connected {
  background: rgba(124, 154, 110, 0.2);
  color: var(--xinglin-green);
}

.status-badge.disconnected {
  background: rgba(183, 110, 110, 0.2);
  color: var(--xinglin-red);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-badge.connected .status-dot {
  background: var(--xinglin-green);
  animation: pulse 2s infinite;
}

.status-badge.disconnected .status-dot {
  background: var(--xinglin-red);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.avatar-video-container {
  flex: 1;
  position: relative;
  margin-bottom: 15px;
  min-height: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--xinglin-border);
  background: rgba(139, 115, 85, 0.1);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.05);
}

.avatar-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.control-panel {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--xinglin-border);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  color: var(--xinglin-brown);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 60px;
  font-family: 'STKaiti', serif;
}

.slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: var(--xinglin-border);
  border-radius: 2px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--xinglin-gold);
  cursor: pointer;
  box-shadow: 0 0 5px rgba(166, 124, 82, 0.5);
  border: 2px solid var(--xinglin-cream);
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.control-btn {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  font-family: 'STKaiti', serif;
  background: rgba(166, 124, 82, 0.1);
  border: 1px solid var(--xinglin-border);
  color: var(--xinglin-brown-dark);
}

.control-btn.primary {
  background: linear-gradient(135deg, rgba(166, 124, 82, 0.2), rgba(201, 168, 123, 0.15));
  border-color: var(--xinglin-gold);
  color: var(--xinglin-brown-dark);
}

.control-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(166, 124, 82, 0.3), rgba(201, 168, 123, 0.25));
  box-shadow: 0 4px 12px rgba(166, 124, 82, 0.2);
  transform: translateY(-1px);
}

.control-btn.secondary {
  background: rgba(166, 124, 82, 0.1);
  border-color: var(--xinglin-border);
}

.control-btn.secondary:hover:not(:disabled) {
  background: rgba(166, 124, 82, 0.2);
  transform: translateY(-1px);
}

.control-btn.debug {
  background: rgba(33, 150, 243, 0.15);
  border-color: var(--xinglin-debug);
  color: #1976d2;
}

.control-btn.debug:hover:not(:disabled) {
  background: rgba(33, 150, 243, 0.25);
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(166, 124, 82, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--xinglin-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--xinglin-gold);
}

@media (max-width: 768px) {
  .avatar-dashboard {
    padding: 10px;
  }
  .control-buttons {
    flex-wrap: wrap;
  }
}
</style>
