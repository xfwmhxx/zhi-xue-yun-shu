<template>
  <div class="actor vision" @click="handleUserInteraction">
    <Video ref="videoRef" :muted="cameraMuted" />

    <!-- 扫描效果层 -->
    <div v-if="showScanEffect" class="scan-effect" :class="{ 'scan-animate': isScanning }"></div>

    <!-- 视频缩略图 - 右上角 -->
    <div
      v-if="showThumbnail && thumbnailSrc"
      class="video-thumbnail"
      :class="{
        'thumbnail-visible': thumbnailVisible,
        'thumbnail-large': thumbnailSize === 'large',
      }"
      @click="toggleThumbnailSize"
    >
      <img :src="thumbnailSrc" alt="视频快照" />
      <div class="thumbnail-badge">📸 实时快照</div>
      <div class="thumbnail-time">{{ lastCaptureTime }}</div>
      <button class="thumbnail-close" @click.stop="hideThumbnail">×</button>
    </div>

    <!-- 面试确认悬浮窗 -->
    <div v-if="showInterviewConfirm && !interviewConfirmed" class="interview-confirm-overlay">
      <div class="interview-confirm-modal">
        <div class="modal-header">
          <div class="modal-icon">🩺</div>
          <div class="modal-title">智学云枢AI医生</div>
        </div>
        <div class="modal-content">
          <p class="welcome-text">欢迎使用AI医生智能问诊服务</p>
          <p class="info-text">
            将由AI医生为您提供初步问诊建议，请确保您的摄像头和麦克风正常工作。
          </p>
          <div class="tips">
            <div class="tip-item">✓ 问诊时长约15-20分钟</div>
            <div class="tip-item">✓ 请保持环境安静、光线充足</div>
            <div class="tip-item">✓ 描述症状时请面向摄像头</div>
            <div class="tip-item">✓ 问诊过程中请勿刷新页面</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="cancelInterview">取消问诊</button>
          <button class="btn-confirm" @click="confirmInterview">开始问诊</button>
        </div>
      </div>
    </div>

    <!-- 加载提示 -->
    <div v-if="previewStarting && !isPreviewStarted && interviewConfirmed" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <div class="loading-text">正在启动摄像头，请稍候...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useCallStore } from '@/stores/call'
import { useController } from './ControllerContext'
import Video from '@/views/AIYS/Video.vue'

// ==================== 日志工具函数 ====================
const logWithTimestamp = (
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data?: any,
) => {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [Vision]`

  switch (level) {
    case 'info':
      console.log(`${prefix} ℹ️ ${message}`)
      if (data) console.log(`${prefix} 📦 数据:`, data)
      break
    case 'warn':
      console.warn(`${prefix} ⚠️ ${message}`)
      if (data) console.warn(`${prefix} 📦 数据:`, data)
      break
    case 'error':
      console.error(`${prefix} ❌ ${message}`)
      if (data) console.error(`${prefix} 📦 数据:`, data)
      break
    case 'debug':
      console.debug(`${prefix} 🔍 ${message}`)
      if (data) console.debug(`${prefix} 📦 数据:`, data)
      break
  }
}

// ==================== 状态定义 ====================
const showDebugPanel = ref(false)
const previewStarting = ref(false)
const isStartingPreview = ref(false)
const isPreviewStarted = ref(false)
const retryCount = ref(0)
const MAX_RETRIES = 3
let previewStartPromise: Promise<boolean> | null = null

const videoStatus = ref('未知')
const videoSize = ref('0x0')
const hasSrcObject = ref(false)
const isPlaying = ref(false)
const cameraPermission = ref('未知')
const devices = ref<MediaDeviceInfo[]>([])
const errorMessage = ref('')

// 用户交互相关
const hasUserInteracted = ref(false)
const showPlayOverlay = ref(false)

// 面试确认相关
const showInterviewConfirm = ref(true)
const interviewConfirmed = ref(false)

// ==================== 扫描效果和缩略图相关 ====================
const showScanEffect = ref(false)
const isScanning = ref(false)
const showThumbnail = ref(true)
const thumbnailSrc = ref<string>('')
const thumbnailVisible = ref(true)
const lastCaptureTime = ref('')
let scanInterval: ReturnType<typeof setInterval> | null = null

// 缩略图大小控制
const thumbnailSize = ref<'small' | 'large'>('small')

// 统计信息
let captureCount = 0

// 存储定时器 ID
let statusInterval: ReturnType<typeof setInterval> | null = null
let startTimer: ReturnType<typeof setTimeout> | null = null
let audioContext: AudioContext | null | undefined = null
let videoElementRef: HTMLVideoElement | null = null

// Vue 缺失的属性
const resolvedAgentType = ref('')
const chatSyncConfig = ref({})
const rtcEngineConfig = ref({})
const lang = ref('zh-CN')

// 组件引用
const videoRef = ref<InstanceType<typeof Video> | null>(null)
const controllerRef = useController()
const controller = controllerRef

// Store
const callStore = useCallStore()
const { cameraMuted } = storeToRefs(callStore)

// ==================== TensorFlow.js 人脸检测相关 ====================
let faceDetector: any = null
let isFaceDetectionReady = false
let tf: any = null
let faceDetection: any = null

// 动态加载 TensorFlow.js
const loadTensorFlow = async () => {
  try {
    logWithTimestamp('info', '开始加载 TensorFlow.js...')

    // 动态导入 TensorFlow.js
    tf = await import('@tensorflow/tfjs-core')
    await import('@tensorflow/tfjs-backend-webgl')
    faceDetection = await import('@tensorflow-models/face-detection')

    await tf.ready()
    await tf.setBackend('webgl')

    logWithTimestamp('info', 'TensorFlow.js 加载完成', { backend: tf.getBackend() })
    return true
  } catch (error) {
    logWithTimestamp('error', 'TensorFlow.js 加载失败', error)
    return false
  }
}

// 初始化人脸检测
const initFaceDetection = async () => {
  try {
    logWithTimestamp('info', '正在初始化人脸检测模型...')

    // 先加载 TensorFlow
    const tfLoaded = await loadTensorFlow()
    if (!tfLoaded) {
      logWithTimestamp('warn', 'TensorFlow.js 加载失败，将使用简单位置检测')
      return false
    }

    // 创建 MediaPipe Face Detector 模型
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector
    faceDetector = await faceDetection.createDetector(model, {
      runtime: 'tfjs',
      maxFaces: 3,
      refineLandmarks: true,
    })

    isFaceDetectionReady = true
    logWithTimestamp('info', '✅ 人脸检测模型加载成功')
    return true
  } catch (error) {
    logWithTimestamp('error', '人脸检测模型加载失败', error)
    isFaceDetectionReady = false
    return false
  }
}

// 检测人脸并获取关键点
const detectFaceWithLandmarks = async (imageData: ImageData): Promise<any[]> => {
  if (!isFaceDetectionReady || !faceDetector) {
    return []
  }

  try {
    // 创建 ImageBitmap
    const canvas = document.createElement('canvas')
    canvas.width = imageData.width
    canvas.height = imageData.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return []

    ctx.putImageData(imageData, 0, 0)
    const image = await createImageBitmap(canvas)

    // 执行人脸检测
    const faces = await faceDetector.estimateFaces(image, {
      flipHorizontal: false,
    })

    image.close()

    if (faces && faces.length > 0) {
      logWithTimestamp('debug', `检测到 ${faces.length} 个人脸`)

      // 提取关键点信息
      const landmarks = faces.map((face: any) => {
        const keypoints = face.keypoints

        // 初始化默认位置（使用边界框估算）
        let leftEyeX = face.box.xMin + face.box.width * 0.3
        let leftEyeY = face.box.yMin + face.box.height * 0.3
        let rightEyeX = face.box.xMin + face.box.width * 0.7
        let rightEyeY = face.box.yMin + face.box.height * 0.3
        let mouthX = face.box.xMin + face.box.width * 0.5
        let mouthY = face.box.yMin + face.box.height * 0.7

        // 如果有关键点，使用精确位置
        if (keypoints && keypoints.length >= 16) {
          // MediaPipe 关键点索引：
          // 左眼周围: 1, 2, 3
          const leftEyePoints = [keypoints[1], keypoints[2], keypoints[3]].filter((p: any) => p)
          if (leftEyePoints.length > 0) {
            leftEyeX =
              leftEyePoints.reduce((sum: number, p: any) => sum + p.x, 0) / leftEyePoints.length
            leftEyeY =
              leftEyePoints.reduce((sum: number, p: any) => sum + p.y, 0) / leftEyePoints.length
          }

          // 右眼周围: 5, 6, 7
          const rightEyePoints = [keypoints[5], keypoints[6], keypoints[7]].filter((p: any) => p)
          if (rightEyePoints.length > 0) {
            rightEyeX =
              rightEyePoints.reduce((sum: number, p: any) => sum + p.x, 0) / rightEyePoints.length
            rightEyeY =
              rightEyePoints.reduce((sum: number, p: any) => sum + p.y, 0) / rightEyePoints.length
          }

          // 嘴巴周围: 11, 12, 13, 14, 15, 16
          const mouthPoints = [
            keypoints[11],
            keypoints[12],
            keypoints[13],
            keypoints[14],
            keypoints[15],
            keypoints[16],
          ].filter((p: any) => p)
          if (mouthPoints.length > 0) {
            mouthX = mouthPoints.reduce((sum: number, p: any) => sum + p.x, 0) / mouthPoints.length
            mouthY = mouthPoints.reduce((sum: number, p: any) => sum + p.y, 0) / mouthPoints.length
          }
        }

        return {
          boundingBox: face.box,
          leftEye: { x: leftEyeX, y: leftEyeY },
          rightEye: { x: rightEyeX, y: rightEyeY },
          mouth: { x: mouthX, y: mouthY },
          keypoints: keypoints,
        }
      })

      return landmarks
    }
  } catch (error) {
    logWithTimestamp('warn', '人脸检测过程出错', error)
  }

  return []
}

// 在图片上标记眼睛和嘴巴
const markFaceOnImage = (imageData: ImageData, landmarks: any[]): string => {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')

  if (!ctx) return ''

  // 绘制原图
  ctx.putImageData(imageData, 0, 0)

  // 设置阴影效果
  ctx.shadowBlur = 4
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'

  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i]

    // 绘制人脸边框
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 3
    ctx.shadowBlur = 2
    ctx.strokeRect(
      lm.boundingBox.xMin,
      lm.boundingBox.yMin,
      lm.boundingBox.width,
      lm.boundingBox.height,
    )

    // 添加"人脸"标签
    ctx.fillStyle = '#00ffff'
    ctx.font = 'bold 14px Arial'
    ctx.fillText(`Face ${i + 1}`, lm.boundingBox.xMin + 5, lm.boundingBox.yMin - 5)

    // 标记左眼
    ctx.beginPath()
    ctx.arc(lm.leftEye.x, lm.leftEye.y, 10, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // // 添加眼睛表情
    // ctx.fillStyle = '#ffffff'
    // ctx.font = '20px Arial'
    // ctx.fillText('👁️', lm.leftEye.x - 15, lm.leftEye.y - 8)

    // 添加标签
    ctx.font = 'bold 12px Arial'
    ctx.fillStyle = '#00ff00'
    ctx.fillText('左眼', lm.leftEye.x - 15, lm.leftEye.y - 12)

    // 标记右眼
    ctx.beginPath()
    ctx.arc(lm.rightEye.x, lm.rightEye.y, 10, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // ctx.fillStyle = '#ffffff'
    // ctx.font = '20px Arial'
    // ctx.fillText('👁️', lm.rightEye.x + 5, lm.rightEye.y - 8)

    ctx.font = 'bold 12px Arial'
    ctx.fillStyle = '#00ff00'
    ctx.fillText('右眼', lm.rightEye.x + 5, lm.rightEye.y - 12)

    // 标记嘴巴
    ctx.beginPath()
    ctx.arc(lm.mouth.x, lm.mouth.y, 14, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.6)'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // ctx.fillStyle = '#ffffff'
    // ctx.font = '22px Arial'
    // ctx.fillText('👄', lm.mouth.x - 12, lm.mouth.y - 10)

    ctx.font = 'bold 12px Arial'
    ctx.fillStyle = '#ff0000'
    ctx.fillText('嘴巴', lm.mouth.x - 12, lm.mouth.y - 18)

    // 绘制关键点连线
    if (lm.keypoints && lm.keypoints.length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'
      ctx.lineWidth = 1.5

      // 连接面部轮廓关键点
      const faceOutline = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      for (let j = 0; j < faceOutline.length - 1; j++) {
        const p1 = lm.keypoints[faceOutline[j]!]
        const p2 = lm.keypoints[faceOutline[j + 1]!]
        if (p1 && p2) {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }
    }
  }

  // 如果没有检测到人脸，添加提示
  if (landmarks.length === 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = 'bold 18px Arial'
    // ctx.fillText('😊 未检测到人脸', canvas.width / 2 - 100, canvas.height / 2)
    ctx.font = '14px Arial'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.fillText('请确保面部清晰可见', canvas.width / 2 - 90, canvas.height / 2 + 30)
  }

  // 添加水印
  ctx.font = '10px Arial'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.fillText('AI 人脸检测', canvas.width - 80, canvas.height - 10)

  return canvas.toDataURL('image/jpeg', 0.85)
}

// ==================== 辅助函数 ====================

const getVideoElement = (): HTMLVideoElement | undefined => {
  if (videoElementRef) return videoElementRef
  const el = videoRef.value?.getVideoElement?.()
  if (el) {
    videoElementRef = el
    setupDirectVideoListeners(el)
  }
  return el
}

const setupDirectVideoListeners = (videoEl: HTMLVideoElement) => {
  videoEl.addEventListener('play', () => {
    logWithTimestamp('info', '视频 play 事件触发')
    isPlaying.value = true
  })

  videoEl.addEventListener('pause', () => {
    logWithTimestamp('info', '视频 pause 事件触发')
    isPlaying.value = false
  })

  videoEl.addEventListener('playing', () => {
    logWithTimestamp('info', '视频 playing 事件触发')
    isPlaying.value = true
  })

  videoEl.addEventListener('error', (e) => {
    logWithTimestamp('error', '视频错误', e)
  })
}

const updateVideoStatus = () => {
  const videoEl = getVideoElement()
  if (videoEl) {
    const rect = videoEl.getBoundingClientRect()
    videoSize.value = `${Math.round(rect.width)}x${Math.round(rect.height)}`
    hasSrcObject.value = !!videoEl.srcObject
    isPlaying.value = !videoEl.paused

    if (
      hasSrcObject.value &&
      videoEl.paused &&
      hasUserInteracted.value &&
      videoEl.readyState >= 2
    ) {
      logWithTimestamp('info', '检测到视频未播放，尝试播放')
      safePlayVideo(videoEl)
    }
  }
}

const clearError = () => {
  errorMessage.value = ''
}

const checkCameraDevices = async () => {
  try {
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    devices.value = allDevices.filter((d) => d.kind === 'videoinput')

    if (devices.value.length === 0) {
      cameraPermission.value = '无摄像头设备'
    } else if (devices.value.every((d) => !d.label)) {
      cameraPermission.value = '未授权'
    } else {
      cameraPermission.value = '已授权'
    }
    logWithTimestamp('debug', '摄像头设备检查完成', {
      cameraPermission: cameraPermission.value,
      deviceCount: devices.value.length,
    })
  } catch (error) {
    logWithTimestamp('error', '检查摄像头设备失败', error)
    cameraPermission.value = '检查失败'
  }
}

const requestCameraPermission = async (): Promise<boolean> => {
  try {
    logWithTimestamp('info', '请求摄像头权限...')
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach((track) => track.stop())
    await checkCameraDevices()
    logWithTimestamp('info', '摄像头权限已获取')
    return true
  } catch (error) {
    logWithTimestamp('error', '请求摄像头权限失败', error)
    errorMessage.value = '无法获取摄像头权限，请在浏览器设置中允许摄像头访问'
    return false
  }
}

// ==================== 视频播放处理 ====================

const safePlayVideo = async (videoElement: HTMLVideoElement): Promise<boolean> => {
  if (!videoElement) return false

  if (!videoElement.srcObject) {
    logWithTimestamp('warn', '没有视频流，无法播放')
    return false
  }

  if (!videoElement.paused) {
    logWithTimestamp('info', '视频已经在播放中')
    isPlaying.value = true
    return true
  }

  if (videoElement.readyState < 2) {
    logWithTimestamp('info', '等待视频元数据加载...')
    await new Promise<void>((resolve) => {
      const onCanPlay = () => {
        videoElement.removeEventListener('canplay', onCanPlay)
        resolve()
      }
      videoElement.addEventListener('canplay', onCanPlay)
      setTimeout(() => {
        videoElement.removeEventListener('canplay', onCanPlay)
        resolve()
      }, 3000)
    })
  }

  try {
    logWithTimestamp('info', '调用 video.play()...')
    await videoElement.play()
    logWithTimestamp('info', '✅ 视频播放成功')
    isPlaying.value = true
    showPlayOverlay.value = false
    return true
  } catch (error: any) {
    logWithTimestamp('error', '视频播放失败', { name: error.name, message: error.message })

    if (error.name === 'NotAllowedError') {
      logWithTimestamp('warn', '需要用户交互才能播放')
      showPlayOverlay.value = true
    }
    return false
  }
}

const forcePlayVideo = async () => {
  const videoEl = getVideoElement()
  if (!videoEl) {
    errorMessage.value = '视频元素不存在'
    return
  }

  if (!hasSrcObject.value) {
    errorMessage.value = '视频流不存在，请先启动预览'
    return
  }

  await safePlayVideo(videoEl)
}

// ==================== 截图功能（带人脸标记） ====================
const captureVideoFrameWithFaceMark = async (): Promise<string | null> => {
  const videoEl = getVideoElement()
  if (!videoEl) {
    logWithTimestamp('warn', '❌ 截图失败：视频元素不存在')
    return null
  }

  if (!videoEl.srcObject) {
    logWithTimestamp('warn', '❌ 截图失败：没有视频流')
    return null
  }

  if (videoEl.readyState < 2) {
    logWithTimestamp('warn', '❌ 截图失败：视频未就绪', { readyState: videoEl.readyState })
    return null
  }

  if (videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
    logWithTimestamp('warn', '❌ 截图失败：视频尺寸为 0')
    return null
  }

  try {
    const startTime = performance.now()

    // 创建 canvas 获取原始图像
    const canvas = document.createElement('canvas')
    const originalWidth = videoEl.videoWidth
    const originalHeight = videoEl.videoHeight

    canvas.width = originalWidth
    canvas.height = originalHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      logWithTimestamp('warn', '❌ 截图失败：无法获取 canvas context')
      return null
    }

    // 绘制视频帧
    ctx.drawImage(videoEl, 0, 0, originalWidth, originalHeight)

    // 获取图像数据用于人脸检测
    const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight)

    // 检测人脸
    let landmarks: any[] = []
    if (isFaceDetectionReady) {
      landmarks = await detectFaceWithLandmarks(imageData)
    }

    let resultImage: string

    if (landmarks.length > 0) {
      // 标记人脸关键点（保持原尺寸）
      resultImage = markFaceOnImage(imageData, landmarks)
      logWithTimestamp('info', `✅ 检测到 ${landmarks.length} 个人脸，已标记眼睛和嘴巴`)
    } else {
      // 没有检测到人脸，缩放后使用原图
      const scaledCanvas = document.createElement('canvas')
      scaledCanvas.width = originalWidth / 2
      scaledCanvas.height = originalHeight / 2
      const scaledCtx = scaledCanvas.getContext('2d')
      if (scaledCtx) {
        scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height)
        resultImage = scaledCanvas.toDataURL('image/jpeg', 0.7)
      } else {
        resultImage = canvas.toDataURL('image/jpeg', 0.7)
      }
      logWithTimestamp('info', 'ℹ️ 未检测到人脸，使用原图')
    }

    const duration = performance.now() - startTime
    captureCount++

    logWithTimestamp('info', `📸 截图成功 [#${captureCount}]`, {
      originalSize: `${originalWidth}x${originalHeight}`,
      hasFace: landmarks.length > 0,
      faceCount: landmarks.length,
      duration: `${duration.toFixed(2)}ms`,
    })

    return resultImage
  } catch (error) {
    logWithTimestamp('error', '❌ 截图异常', error)
    return null
  }
}

// 执行扫描效果和截图
const performScanAndCapture = async () => {
  const scanStartTime = performance.now()
  logWithTimestamp('info', '🔍 ========== 开始执行扫描 ==========')

  if (!interviewConfirmed.value || !isPreviewStarted.value) {
    logWithTimestamp('warn', '⏭️ 跳过扫描：面试未确认或预览未启动')
    return
  }

  const videoEl = getVideoElement()
  if (!videoEl || !videoEl.srcObject || videoEl.paused || videoEl.readyState < 2) {
    logWithTimestamp('warn', '⏭️ 跳过扫描：视频未就绪')
    return
  }

  // 显示扫描效果
  showScanEffect.value = true
  isScanning.value = true
  logWithTimestamp('debug', '✨ 扫描动画已启动')

  // 执行带人脸标记的截图
  const capturedImage = await captureVideoFrameWithFaceMark()
  if (capturedImage) {
    thumbnailSrc.value = capturedImage
    showThumbnail.value = true
    thumbnailVisible.value = true

    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    lastCaptureTime.value = timeStr

    const scanDuration = performance.now() - scanStartTime
    logWithTimestamp('info', '✅ 扫描完成', {
      captureTime: timeStr,
      scanDuration: `${scanDuration.toFixed(2)}ms`,
      totalCaptures: captureCount,
    })
  } else {
    logWithTimestamp('error', '❌ 扫描失败：截图未成功')
  }

  setTimeout(() => {
    isScanning.value = false
    setTimeout(() => {
      showScanEffect.value = false
    }, 300)
  }, 800)
}

const startPeriodicScan = () => {
  logWithTimestamp('info', '========== startPeriodicScan 被调用 ==========')

  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }

  logWithTimestamp('info', '⏰ 启动定时扫描任务', { interval: '5000ms' })

  scanInterval = setInterval(() => {
    performScanAndCapture()
  }, 5000)

  logWithTimestamp('info', '✅ 定时扫描已启动（每5秒一次）')
}

const stopPeriodicScan = () => {
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
    logWithTimestamp('info', '⏹️ 定时扫描已停止')
  }
}

const toggleThumbnailSize = () => {
  thumbnailSize.value = thumbnailSize.value === 'small' ? 'large' : 'small'
}

const hideThumbnail = () => {
  thumbnailVisible.value = false
  showThumbnail.value = false
}

const showThumbnailAgain = () => {
  if (thumbnailSrc.value) {
    thumbnailVisible.value = true
    showThumbnail.value = true
  }
}

// ==================== 面试确认逻辑 ====================

const confirmInterview = async () => {
  logWithTimestamp('info', '✅ 用户确认开始面试')
  interviewConfirmed.value = true
  showInterviewConfirm.value = false
  hasUserInteracted.value = true
  showPlayOverlay.value = false

  await new Promise((resolve) => setTimeout(resolve, 300))
  autoStartPreview()
}

const cancelInterview = () => {
  logWithTimestamp('info', '❌ 用户取消面试')
  errorMessage.value = '您已取消面试，页面即将关闭...'
  setTimeout(() => {
    window.close()
  }, 2000)
}

const resetInterview = () => {
  logWithTimestamp('info', '🔄 重置面试状态')
  interviewConfirmed.value = false
  showInterviewConfirm.value = true
  isPreviewStarted.value = false
  hasUserInteracted.value = false
  errorMessage.value = ''

  stopPeriodicScan()
  captureCount = 0
  thumbnailSrc.value = ''
  showThumbnail.value = false

  const videoEl = getVideoElement()
  if (videoEl && videoEl.srcObject) {
    const stream = videoEl.srcObject as MediaStream
    stream.getTracks().forEach((track) => track.stop())
    videoEl.srcObject = null
  }
}

const handleUserInteraction = async () => {
  if (interviewConfirmed.value) return
  logWithTimestamp('debug', '检测到用户交互（备用）')
}

// ==================== 核心预览功能 ====================

const startPreview = async (): Promise<boolean> => {
  if (!interviewConfirmed.value) {
    logWithTimestamp('debug', '等待用户确认面试...')
    return false
  }

  if (isStartingPreview.value && previewStartPromise) {
    return previewStartPromise
  }

  if (!controller.value) {
    logWithTimestamp('error', 'Controller 未就绪')
    return false
  }

  const videoElement = getVideoElement()
  if (!videoElement) {
    logWithTimestamp('error', 'Video 元素未就绪')
    return false
  }

  isStartingPreview.value = true

  previewStartPromise = (async () => {
    const startTime = Date.now()
    try {
      await (controller.value as any).startPreview(videoElement)

      let retries = 0
      while (retries < 25 && !videoElement.srcObject) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        retries++
      }

      if (videoElement.srcObject) {
        hasSrcObject.value = true

        await new Promise<void>((resolve) => {
          if (videoElement.readyState >= 2) {
            resolve()
          } else {
            const onLoadedData = () => {
              videoElement.removeEventListener('loadeddata', onLoadedData)
              resolve()
            }
            videoElement.addEventListener('loadeddata', onLoadedData)
            setTimeout(() => resolve(), 3000)
          }
        })

        // 初始化人脸检测
        logWithTimestamp('info', '初始化人脸检测模型...')
        await initFaceDetection()

        await safePlayVideo(videoElement)
        await new Promise((resolve) => setTimeout(resolve, 500))

        const duration = Date.now() - startTime
        logWithTimestamp('info', `✅ startPreview 完成，耗时: ${duration}ms`)

        setTimeout(() => {
          startPeriodicScan()
          performScanAndCapture()
        }, 100)

        return true
      } else {
        return false
      }
    } catch (error) {
      logWithTimestamp('error', 'startPreview 调用失败', error)
      return false
    } finally {
      isStartingPreview.value = false
      previewStartPromise = null
    }
  })()

  return previewStartPromise
}

const autoStartPreview = async () => {
  if (
    !interviewConfirmed.value ||
    isPreviewStarted.value ||
    previewStarting.value ||
    isStartingPreview.value
  ) {
    return
  }

  previewStarting.value = true
  clearError()

  try {
    await checkCameraDevices()
    if (cameraPermission.value !== '已授权') {
      const granted = await requestCameraPermission()
      if (!granted) throw new Error('摄像头权限被拒绝')
    }

    const success = await startPreview()
    if (success) {
      isPreviewStarted.value = true
      retryCount.value = 0
      setTimeout(updateVideoStatus, 1000)
    }
  } catch (error) {
    logWithTimestamp('error', '自动启动预览失败', error)
    if (!isPreviewStarted.value && !isStartingPreview.value && retryCount.value < MAX_RETRIES - 1) {
      retryCount.value++
      setTimeout(autoStartPreview, 2000 * Math.pow(2, retryCount.value))
    }
  } finally {
    previewStarting.value = false
  }
}

// ==================== 生命周期 ====================

onMounted(async () => {
  logWithTimestamp('info', '========== Vision 组件挂载 ==========')

  await nextTick()
  await checkCameraDevices()

  setTimeout(() => {
    getVideoElement()
  }, 100)

  statusInterval = setInterval(updateVideoStatus, 1000)
  logWithTimestamp('info', 'Vision 组件初始化完成')
})

onUnmounted(() => {
  logWithTimestamp('info', '========== Vision 组件卸载 ==========')
  stopPeriodicScan()
  if (statusInterval) clearInterval(statusInterval)
  if (startTimer) clearTimeout(startTimer)
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }

  const videoElement = getVideoElement()
  if (videoElement && videoElement.srcObject) {
    const stream = videoElement.srcObject as MediaStream
    stream.getTracks().forEach((track) => track.stop())
    videoElement.srcObject = null
  }
})

watch(controller, (newVal) => {
  if (
    newVal &&
    interviewConfirmed.value &&
    !isPreviewStarted.value &&
    !previewStarting.value &&
    !isStartingPreview.value
  ) {
    setTimeout(autoStartPreview, 500)
  }
})

// 挂载调试方法
if (typeof window !== 'undefined') {
  setTimeout(() => {
    ;(window as any).visionStatus = () => ({
      interviewConfirmed: interviewConfirmed.value,
      isPreviewStarted: isPreviewStarted.value,
      hasSrcObject: hasSrcObject.value,
      isPlaying: isPlaying.value,
      thumbnailExists: !!thumbnailSrc.value,
      captureCount: captureCount,
      faceDetectionReady: isFaceDetectionReady,
    })
    ;(window as any).captureNow = () => performScanAndCapture()
    ;(window as any).startScan = () => startPeriodicScan()
    ;(window as any).stopScan = () => stopPeriodicScan()
    ;(window as any).testFaceDetection = async () => {
      console.log('测试人脸检测...')
      const video = getVideoElement()
      if (video && video.readyState >= 2) {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const landmarks = await detectFaceWithLandmarks(imageData)
          console.log('检测结果:', landmarks)
          alert(`检测到 ${landmarks.length} 个人脸`)
        }
      } else {
        console.log('视频未就绪')
      }
    }
  }, 100)
}
</script>

<style scoped>
.actor.vision {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

.actor.vision :deep(.ai-video) {
  width: 100%;
  max-width: 1280px;
  height: auto;
  aspect-ratio: 16 / 9;
  position: relative;
  background-color: #000;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.actor.vision :deep(.video-container) {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000;
}

.actor.vision :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;
  display: block;
}

/* 扫描效果 */
.scan-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2147483647 !important;
  overflow: hidden;
  border-radius: 20px;
}

.scan-effect.scan-animate::before {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(76, 175, 80, 0.4) 50%,
    transparent 100%
  );
  animation: scanMove 0.8s ease-in-out forwards;
}

@keyframes scanMove {
  0% {
    top: -100%;
  }
  100% {
    top: 100%;
  }
}

/* 缩略图 */
.video-thumbnail {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  width: 120px;
  height: 90px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  z-index: 999999 !important;
  border: 2px solid rgba(76, 175, 80, 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.video-thumbnail.thumbnail-large {
  width: 240px;
  height: 180px;
}

.video-thumbnail:hover {
  transform: scale(1.05);
  border-color: #4caf50;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #4caf50;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.thumbnail-time {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 9px;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.thumbnail-close {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.video-thumbnail:hover .thumbnail-close {
  opacity: 1;
}

.thumbnail-close:hover {
  background: #ff0000;
  transform: scale(1.1);
}

/* 面试确认悬浮窗 */
.interview-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(60, 40, 20, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200000;
}

.interview-confirm-modal {
  width: 520px;
  max-width: 90%;
  background: rgba(250, 242, 228, 0.98);
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(190, 145, 85, 0.6);
}

.modal-header {
  background: linear-gradient(135deg, #b87a48 0%, #9a5e32 100%);
  padding: 28px;
  text-align: center;
}

.modal-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.modal-title {
  font-size: 26px;
  font-weight: 600;
  color: #fff5e8;
}

.modal-content {
  padding: 32px 28px;
}

.welcome-text {
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
  color: #b87a48;
}

.info-text {
  font-size: 14px;
  text-align: center;
  margin-bottom: 28px;
  color: #7a5432;
}

.tips {
  background: rgba(185, 125, 65, 0.12);
  border-radius: 20px;
  padding: 18px 22px;
  border-left: 4px solid #b87a48;
}

.tip-item {
  font-size: 13px;
  margin: 10px 0;
  color: #5a3a1e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-item::before {
  content: '✓';
  color: #8dab7f;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  gap: 16px;
  padding: 20px 28px 32px;
  border-top: 1px solid rgba(190, 145, 85, 0.3);
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: rgba(170, 110, 55, 0.15);
  color: #c4713a;
  border: 1px solid rgba(200, 130, 70, 0.4);
}

.btn-confirm {
  background: linear-gradient(135deg, #b87a48 0%, #9a5e32 100%);
  color: #fff5e8;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  border-radius: 20px;
}

.loading-content {
  text-align: center;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 32px;
  border-radius: 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #b87a48;
  border-right-color: #b87a48;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 768px) {
  .video-thumbnail {
    width: 80px;
    height: 60px;
  }
  .video-thumbnail.thumbnail-large {
    width: 160px;
    height: 120px;
  }
}
</style>
