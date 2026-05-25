<template>
  <div class="camera-container">
    <video ref="videoElement" autoplay playsinline muted></video>
    <canvas ref="outputCanvas" style="display: none"></canvas>

    <div class="camera-status" :class="{ active: isCameraActive }">
      <span class="status-dot"></span>
      <span class="status-text">{{ isCameraActive ? '表情识别中' : '摄像头未启动' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { uploadEmotionImage as uploadEmotionImageAPI } from '@/api/interviewRecord'

interface Props {
  autoStart?: boolean
  mirror?: boolean
  videoConstraints?: MediaTrackConstraints
}

const props = withDefaults(defineProps<Props>(), {
  autoStart: true,
  mirror: true,
  videoConstraints: () => ({ width: { ideal: 640 }, height: { ideal: 480 } }),
})

const emit = defineEmits<{
  (e: 'camera-ready', stream: MediaStream): void
  (e: 'camera-error', error: Error): void
  (e: 'face-detected', detected: boolean): void
  (e: 'emotion-changed', emotion: string): void
}>()

declare global {
  interface Window {
    FaceMesh: any
    Camera: any
  }
}

interface Landmark {
  x: number
  y: number
  z: number
}

interface EmotionConfig {
  displayName: string
  icon: string
  color: string
  points: number[]
}

interface EmotionDataPoint {
  timestamp: number
  datetime: string
  emotion: string
  emotionDisplayName: string
  confidence: number
  scores: {
    happy: number
    surprise: number
    anger: number
    sadness: number
    fear: number
    disgust: number
    neutral: number
  }
  details: {
    mouthOpen: number
    eyesWide: number
    smileIntensity: number
    browFurrow: number
    mouthCornerDrop: number
  }
  snapshotBase64?: string
  snapshotFileName?: string
}

interface EmotionScores {
  happy: number
  surprise: number
  anger: number
  sadness: number
  fear: number
  disgust: number
  neutral: number
}

interface EmotionDetails {
  mouthOpen: number
  eyesWide: number
  smileIntensity: number
  browFurrow: number
  mouthCornerDrop: number
}

const EMOTION_CONFIGS: Record<string, EmotionConfig> = {
  happy: {
    displayName: '开心',
    icon: '😊',
    color: '#f093fb',
    points: [61, 291, 13, 14, 49, 279],
  },
  surprise: {
    displayName: '惊讶',
    icon: '😲',
    color: '#4facfe',
    points: [33, 133, 362, 263, 159, 145, 386, 374, 13, 14, 61, 291],
  },
  anger: {
    displayName: '愤怒',
    icon: '😠',
    color: '#ff0844',
    points: [46, 53, 52, 51, 50, 276, 283, 282, 281, 280, 61, 291, 13],
  },
  sadness: {
    displayName: '悲伤',
    icon: '😢',
    color: '#5d26c4',
    points: [61, 291, 46, 276, 13, 14, 49, 279],
  },
  fear: {
    displayName: '恐惧',
    icon: '😨',
    color: '#a55b4c',
    points: [33, 133, 362, 263, 159, 145, 386, 374, 46, 276, 13, 14],
  },
  disgust: {
    displayName: '厌恶',
    icon: '😖',
    color: '#6b8c5c',
    points: [4, 49, 279, 61, 291, 13, 98, 327],
  },
  neutral: {
    displayName: '中性',
    icon: '😐',
    color: '#667eea',
    points: [4, 61, 291, 13, 14, 33, 133, 362, 263, 46, 276],
  },
}

const DEFAULT_NEUTRAL_CONFIG: EmotionConfig = {
  displayName: '中性',
  icon: '😐',
  color: '#667eea',
  points: [4, 61, 291, 13, 14, 33, 133, 362, 263, 46, 276],
}

const getEmotionConfig = (emotion: string): EmotionConfig => {
  return EMOTION_CONFIGS[emotion] || DEFAULT_NEUTRAL_CONFIG
}

const getEmotionIcon = (emotion: string): string => {
  return getEmotionConfig(emotion).icon
}

const getEmotionColor = (emotion: string): string => {
  return getEmotionConfig(emotion).color
}

const getLandmark = (landmarks: Landmark[] | null, index: number): Landmark | null => {
  if (!landmarks || !landmarks[index]) return null
  return landmarks[index]
}

const videoElement = ref<HTMLVideoElement>()
const outputCanvas = ref<HTMLCanvasElement>()
const isCameraActive = ref(false)
const currentEmotion = ref('neutral')
const currentEmotionDisplay = ref('')
const currentEmotionConfidence = ref(0)

let faceMesh: any = null
let camera: any = null
let analysisInterval: number | null = null
let beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | null = null
let pageHideHandler: (() => void) | null = null
const ANALYSIS_INTERVAL_MS = 20000
let interviewId = ref<number | null>(null)

let currentScores: EmotionScores = {
  happy: 0,
  surprise: 0,
  anger: 0,
  sadness: 0,
  fear: 0,
  disgust: 0,
  neutral: 0,
}
let currentDetails: EmotionDetails = {
  mouthOpen: 0,
  eyesWide: 0,
  smileIntensity: 0,
  browFurrow: 0,
  mouthCornerDrop: 0,
}
let currentEmotionState = 'neutral'
let currentLandmarks: Landmark[] | null = null
const emotionHistory: EmotionDataPoint[] = []

const distance = (p1: Landmark | null, p2: Landmark | null): number => {
  if (!p1 || !p2) return 0
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return Math.sqrt(dx * dx + dy * dy)
}

const getEyeAspectRatio = (landmarks: Landmark[] | null, isLeft: boolean): number => {
  if (!landmarks) return 0.3
  let upper, lower, outer, inner
  if (isLeft) {
    upper = getLandmark(landmarks, 159)
    lower = getLandmark(landmarks, 145)
    outer = getLandmark(landmarks, 33)
    inner = getLandmark(landmarks, 133)
  } else {
    upper = getLandmark(landmarks, 386)
    lower = getLandmark(landmarks, 374)
    outer = getLandmark(landmarks, 362)
    inner = getLandmark(landmarks, 263)
  }
  if (!upper || !lower || !outer || !inner) return 0.3
  const eyeHeight = distance(upper, lower)
  const eyeWidth = distance(outer, inner)
  return eyeWidth > 0 ? Math.min(1, (eyeHeight / eyeWidth) * 2) : 0.3
}

const getMouthOpenRatio = (landmarks: Landmark[] | null): number => {
  if (!landmarks) return 0
  const upperLipMid = getLandmark(landmarks, 13)
  const lowerLipMid = getLandmark(landmarks, 14)
  const leftCorner = getLandmark(landmarks, 61)
  const rightCorner = getLandmark(landmarks, 291)
  if (!upperLipMid || !lowerLipMid || !leftCorner || !rightCorner) return 0
  const mouthHeight = distance(upperLipMid, lowerLipMid)
  const mouthWidth = distance(leftCorner, rightCorner)
  return mouthWidth > 0 ? Math.min(1, (mouthHeight / mouthWidth) * 1.5) : 0
}

const getSmileIntensity = (landmarks: Landmark[] | null): number => {
  if (!landmarks) return 0
  const leftCorner = getLandmark(landmarks, 61)
  const rightCorner = getLandmark(landmarks, 291)
  const noseRef = getLandmark(landmarks, 4)
  if (!leftCorner || !rightCorner || !noseRef) return 0
  const leftOffset = noseRef.y - leftCorner.y
  const rightOffset = noseRef.y - rightCorner.y
  const avgOffset = (leftOffset + rightOffset) / 2
  let smile = (avgOffset + 0.02) / 0.1
  return Math.min(1, Math.max(0, smile))
}

const getBrowFurrow = (landmarks: Landmark[] | null): number => {
  if (!landmarks) return 0
  const leftInner = getLandmark(landmarks, 46)
  const leftOuter = getLandmark(landmarks, 50)
  const rightInner = getLandmark(landmarks, 276)
  const rightOuter = getLandmark(landmarks, 280)
  if (!leftInner || !leftOuter || !rightInner || !rightOuter) return 0
  const leftAngle = leftInner.y - leftOuter.y
  const rightAngle = rightInner.y - rightOuter.y
  const avgAngle = (leftAngle + rightAngle) / 2
  return Math.min(1, Math.max(0, (avgAngle + 0.02) * 30))
}

const getMouthCornerDrop = (landmarks: Landmark[] | null): number => {
  if (!landmarks) return 0
  const leftCorner = getLandmark(landmarks, 61)
  const rightCorner = getLandmark(landmarks, 291)
  const centerLip = getLandmark(landmarks, 13)
  if (!leftCorner || !rightCorner || !centerLip) return 0
  const avgCornerY = (leftCorner.y + rightCorner.y) / 2
  const drop = avgCornerY - centerLip.y
  return Math.min(1, Math.max(0, drop * 15))
}

const analyzeExpression = (
  landmarks: Landmark[] | null,
): { scores: EmotionScores; details: EmotionDetails } | null => {
  if (!landmarks || landmarks.length < 400) return null

  const leftEAR = getEyeAspectRatio(landmarks, true)
  const rightEAR = getEyeAspectRatio(landmarks, false)
  const avgEAR = (leftEAR + rightEAR) / 2
  const eyesWide = 1 - avgEAR
  const mouthOpen = getMouthOpenRatio(landmarks)
  const smileIntensity = getSmileIntensity(landmarks)
  const browFurrow = getBrowFurrow(landmarks)
  const mouthCornerDrop = getMouthCornerDrop(landmarks)

  let happy =
    smileIntensity * 0.7 +
    (mouthOpen > 0.05 && mouthOpen < 0.3 ? 0.2 : 0) +
    (avgEAR < 0.35 ? 0.1 : 0)
  happy = Math.min(1, happy)

  let surprise = eyesWide * 0.55 + mouthOpen * 0.45
  surprise = Math.min(1, surprise)

  let anger = browFurrow * 0.6 + (mouthOpen < 0.12 ? 0.25 : 0) + (mouthCornerDrop > 0.3 ? 0.15 : 0)
  anger = Math.min(1, anger)

  let sadness =
    mouthCornerDrop * 0.55 + browFurrow * 0.3 + (mouthOpen > 0.05 && mouthOpen < 0.2 ? 0.15 : 0)
  sadness = Math.min(1, sadness)

  let fear = eyesWide * 0.45 + browFurrow * 0.35 + mouthOpen * 0.2
  fear = Math.min(1, fear)

  let disgust =
    browFurrow * 0.4 +
    (mouthOpen > 0.1 && mouthOpen < 0.25 ? 0.35 : 0) +
    (1 - smileIntensity) * 0.25
  disgust = Math.min(1, disgust)

  let neutral = 1 - Math.max(happy, surprise, anger, sadness, fear, disgust)
  neutral = Math.min(1, Math.max(0.05, neutral))

  const total = happy + surprise + anger + sadness + fear + disgust + neutral
  if (total > 0) {
    happy /= total
    surprise /= total
    anger /= total
    sadness /= total
    fear /= total
    disgust /= total
    neutral /= total
  }

  return {
    scores: { happy, surprise, anger, sadness, fear, disgust, neutral },
    details: { mouthOpen, eyesWide, smileIntensity, browFurrow, mouthCornerDrop },
  }
}

const getDominantEmotion = (scores: EmotionScores): string => {
  let maxScore = -1
  let dominant = 'neutral'
  const entries: [string, number][] = [
    ['happy', scores.happy],
    ['surprise', scores.surprise],
    ['anger', scores.anger],
    ['sadness', scores.sadness],
    ['fear', scores.fear],
    ['disgust', scores.disgust],
    ['neutral', scores.neutral],
  ]
  for (const [key, value] of entries) {
    if (value > maxScore) {
      maxScore = value
      dominant = key
    }
  }
  return dominant
}

const drawKeyPointsForSnapshot = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[] | null,
  emotion: string,
  width: number,
  height: number,
) => {
  if (!landmarks) return

  const config = getEmotionConfig(emotion)
  const keyPoints = config.points
  const mainColor = config.color

  ctx.save()

  for (const idx of keyPoints) {
    const pt = getLandmark(landmarks, idx)
    if (!pt) continue
    const x = (1 - pt.x) * width
    const y = pt.y * height
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, 2 * Math.PI)
    ctx.fillStyle = mainColor
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fillStyle = 'white'
    ctx.fill()
  }

  if (emotion === 'anger') {
    const leftBrowLine: number[] = [46, 53, 52, 51, 50]
    const rightBrowLine: number[] = [276, 283, 282, 281, 280]

    ctx.beginPath()
    ctx.strokeStyle = mainColor
    ctx.lineWidth = 3

    for (let i = 0; i < leftBrowLine.length - 1; i++) {
      const idx1 = leftBrowLine[i] as number
      const idx2 = leftBrowLine[i + 1] as number
      const p1 = getLandmark(landmarks, idx1)
      const p2 = getLandmark(landmarks, idx2)
      if (p1 && p2) {
        ctx.beginPath()
        ctx.moveTo((1 - p1.x) * width, p1.y * height)
        ctx.lineTo((1 - p2.x) * width, p2.y * height)
        ctx.stroke()
      }
    }

    for (let i = 0; i < rightBrowLine.length - 1; i++) {
      const idx1 = rightBrowLine[i] as number
      const idx2 = rightBrowLine[i + 1] as number
      const p1 = getLandmark(landmarks, idx1)
      const p2 = getLandmark(landmarks, idx2)
      if (p1 && p2) {
        ctx.beginPath()
        ctx.moveTo((1 - p1.x) * width, p1.y * height)
        ctx.lineTo((1 - p2.x) * width, p2.y * height)
        ctx.stroke()
      }
    }
  }

  if (emotion === 'happy') {
    const leftCorner = getLandmark(landmarks, 61)
    const rightCorner = getLandmark(landmarks, 291)
    if (leftCorner && rightCorner) {
      ctx.beginPath()
      ctx.strokeStyle = mainColor
      ctx.lineWidth = 4
      ctx.moveTo((1 - leftCorner.x) * width, leftCorner.y * height)
      ctx.lineTo((1 - rightCorner.x) * width, rightCorner.y * height)
      ctx.stroke()
    }
  }

  if (emotion === 'surprise') {
    const leftEyeRing: number[] = [33, 133, 157, 158, 159, 160, 161, 173, 243, 246]
    const rightEyeRing: number[] = [362, 263, 387, 386, 385, 384, 398, 466, 373, 374]

    ctx.strokeStyle = mainColor
    ctx.lineWidth = 3

    for (let i = 0; i < leftEyeRing.length - 1; i++) {
      const idx1 = leftEyeRing[i] as number
      const idx2 = leftEyeRing[i + 1] as number
      const p1 = getLandmark(landmarks, idx1)
      const p2 = getLandmark(landmarks, idx2)
      if (p1 && p2) {
        ctx.beginPath()
        ctx.moveTo((1 - p1.x) * width, p1.y * height)
        ctx.lineTo((1 - p2.x) * width, p2.y * height)
        ctx.stroke()
      }
    }

    for (let i = 0; i < rightEyeRing.length - 1; i++) {
      const idx1 = rightEyeRing[i] as number
      const idx2 = rightEyeRing[i + 1] as number
      const p1 = getLandmark(landmarks, idx1)
      const p2 = getLandmark(landmarks, idx2)
      if (p1 && p2) {
        ctx.beginPath()
        ctx.moveTo((1 - p1.x) * width, p1.y * height)
        ctx.lineTo((1 - p2.x) * width, p2.y * height)
        ctx.stroke()
      }
    }
  }

  ctx.restore()
}

const captureSnapshot = async (
  emotion: string,
): Promise<{ base64: string; fileName: string } | null> => {
  if (!videoElement.value || !currentLandmarks) return null

  try {
    const video = videoElement.value
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight

    if (videoWidth === 0 || videoHeight === 0) return null

    const canvas = document.createElement('canvas')
    canvas.width = videoWidth
    canvas.height = videoHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -videoWidth, 0, videoWidth, videoHeight)
    ctx.restore()

    drawKeyPointsForSnapshot(ctx, currentLandmarks, emotion, videoWidth, videoHeight)

    const config = getEmotionConfig(emotion)
    ctx.font = "bold 24px 'Segoe UI'"
    ctx.fillStyle = config.color
    ctx.shadowBlur = 3
    ctx.shadowColor = 'black'
    ctx.fillText(`${config.displayName}表情`, 15, 50)

    ctx.font = '14px monospace'
    ctx.fillStyle = '#ffffff'
    const dateStr = new Date().toLocaleString()
    ctx.fillText(dateStr, 15, videoHeight - 25)

    const confidence = currentScores[emotion as keyof EmotionScores] || 0
    ctx.fillText(`置信度: ${Math.round(confidence * 100)}%`, 15, videoHeight - 10)

    ctx.shadowBlur = 0

    const base64 = canvas.toDataURL('image/jpeg', 0.85)
    const timestamp = Date.now()
    const fileName = `${timestamp}_${emotion}_${config.displayName}.jpg`

    return { base64, fileName }
  } catch (error) {
    console.error('截图失败:', error)
    return null
  }
}

const uploadEmotionImage = async (
  id: number,
  emotion: string,
  imageBase64: string,
  timestamp: number,
): Promise<boolean> => {
  if (!id) {
    console.log('[Camera] 面试ID不存在，跳过上传')
    return false
  }

  try {
    // 将 base64 转为 Blob
    const base64Data = imageBase64.split(',')[1]
    const byteCharacters = atob(base64Data as string)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/jpeg' })

    // 创建 File 对象
    const file = new File([blob], `${timestamp}_${emotion}.jpg`, { type: 'image/jpeg' })

    const result = await uploadEmotionImageAPI(id, file, emotion)
    return result.data.code === 200
  } catch (error) {
    console.error('[Camera] 表情图片上传失败:', error)
    return false
  }
}

const recordEmotionData = async () => {
  const dominantEmotion = getDominantEmotion(currentScores)
  const confidence = currentScores[dominantEmotion as keyof EmotionScores] || 0
  const now = Date.now()

  console.log(
    `📸 定时记录 (${new Date(now).toLocaleTimeString()}): ${getEmotionConfig(dominantEmotion).displayName}`,
  )

  const snapshot = await captureSnapshot(dominantEmotion)

  const dataPoint: EmotionDataPoint = {
    timestamp: now,
    datetime: new Date(now).toISOString(),
    emotion: dominantEmotion,
    emotionDisplayName: getEmotionConfig(dominantEmotion).displayName,
    confidence: Math.round(confidence * 100) / 100,
    scores: { ...currentScores },
    details: { ...currentDetails },
    snapshotBase64: snapshot?.base64,
    snapshotFileName: snapshot?.fileName,
  }

  emotionHistory.push(dataPoint)
  currentEmotionState = dominantEmotion
  currentEmotion.value = dominantEmotion
  currentEmotionDisplay.value = getEmotionConfig(dominantEmotion).displayName
  currentEmotionConfidence.value = confidence

  emit('emotion-changed', dominantEmotion)
  emit('face-detected', true)

  console.log(
    `✅ 已记录: ${dataPoint.emotionDisplayName} (置信度: ${dataPoint.confidence * 100}%)${snapshot ? ' 📸' : ''}`,
  )

  if (snapshot && snapshot.base64 && interviewId.value) {
    console.log('[Camera] 立即上传截图到后端...')
    const uploadSuccess = await uploadEmotionImage(
      interviewId.value,
      dominantEmotion,
      snapshot.base64,
      now,
    )
    if (uploadSuccess) {
      console.log('[Camera] 截图上传成功')
    } else {
      console.warn('[Camera] 截图上传失败')
    }
  }
}

const getEmotionRecordsForUpload = () => {
  return emotionHistory.map(({ snapshotBase64, snapshotFileName, ...rest }) => ({
    ...rest,
    snapshotFile: snapshotFileName || null,
  }))
}

const getSnapshotImagesForUpload = () => {
  const images: Array<{ fileName: string; base64: string; timestamp: number; emotion: string }> = []
  for (const record of emotionHistory) {
    if (record.snapshotBase64 && record.snapshotFileName) {
      images.push({
        fileName: record.snapshotFileName,
        base64: record.snapshotBase64,
        timestamp: record.timestamp,
        emotion: record.emotion,
      })
    }
  }
  return images
}

const getEmotionAnalysisJson = () => {
  if (emotionHistory.length === 0) {
    return null
  }

  return {
    exportTime: new Date().toISOString(),
    totalRecords: emotionHistory.length,
    recordInterval: ANALYSIS_INTERVAL_MS / 1000,
    startTime: emotionHistory[0]?.datetime || null,
    endTime: emotionHistory[emotionHistory.length - 1]?.datetime || null,
    records: emotionHistory.map(({ snapshotBase64, snapshotFileName, ...rest }) => ({
      ...rest,
      snapshotFile: snapshotFileName || null,
    })),
  }
}

const clearData = () => {
  emotionHistory.length = 0
  currentEmotionState = 'neutral'
  currentLandmarks = null
  console.log('[Camera] 数据已清空')
}

const setInterviewId = (id: number) => {
  interviewId.value = id
  console.log('[Camera] 设置面试ID:', id)
}

const cleanup = () => {
  console.log('🔄 清理资源...')
  if (analysisInterval) {
    clearInterval(analysisInterval)
    analysisInterval = null
  }
  if (camera) {
    try {
      camera.stop()
    } catch (e) {}
    camera = null
  }
  if (videoElement.value?.srcObject) {
    const tracks = (videoElement.value.srcObject as MediaStream).getTracks()
    tracks.forEach((track) => track.stop())
    videoElement.value.srcObject = null
  }
  isCameraActive.value = false
}

const loadMediaPipeModules = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.FaceMesh && window.Camera) {
      resolve()
      return
    }
    const faceMeshScript = document.createElement('script')
    faceMeshScript.src = '/models/mediapipe/face_mesh.js'
    faceMeshScript.onload = () => {
      const cameraScript = document.createElement('script')
      cameraScript.src = '/models/mediapipe/camera_utils.js'
      cameraScript.onload = () => resolve()
      cameraScript.onerror = () => reject(new Error('Failed to load Camera Utils'))
      document.head.appendChild(cameraScript)
    }
    faceMeshScript.onerror = () => reject(new Error('Failed to load FaceMesh'))
    document.head.appendChild(faceMeshScript)
  })
}

const initCamera = async () => {
  try {
    console.log('📷 请求摄像头...')
    const stream = await navigator.mediaDevices.getUserMedia({
      video: props.videoConstraints,
    })
    if (videoElement.value) {
      videoElement.value.srcObject = stream
      await videoElement.value.play()
      isCameraActive.value = true
      emit('camera-ready', stream)
    }

    await loadMediaPipeModules()

    faceMesh = new window.FaceMesh({
      locateFile: (file: string) => `/models/mediapipe/${file}`,
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults((results: any) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0] as Landmark[]
        if (landmarks && landmarks.length > 0) {
          currentLandmarks = landmarks
          const analysis = analyzeExpression(landmarks)
          if (analysis) {
            currentScores = analysis.scores
            currentDetails = analysis.details
          }
        }
      } else {
        emit('face-detected', false)
      }
    })

    camera = new window.Camera(videoElement.value, {
      onFrame: async () => {
        if (faceMesh && videoElement.value) {
          await faceMesh.send({ image: videoElement.value })
        }
      },
      width: 640,
      height: 480,
    })

    camera.start()

    analysisInterval = window.setInterval(() => {
      recordEmotionData()
    }, ANALYSIS_INTERVAL_MS)

    console.log('✅ 表情识别器已启动')
    console.log(`📸 每 ${ANALYSIS_INTERVAL_MS / 1000} 秒自动记录一次表情和截图`)
  } catch (err) {
    console.error('初始化失败:', err)
    emit('camera-error', err as Error)
    isCameraActive.value = false
  }
}

const stopCamera = () => {
  cleanup()
}

const startCamera = () => {
  if (!isCameraActive.value) {
    initCamera()
  }
}

const getCurrentEmotion = () => {
  return {
    emotion: currentEmotion.value,
    displayName: currentEmotionDisplay.value,
    icon: getEmotionIcon(currentEmotion.value),
    confidence: currentEmotionConfidence.value,
  }
}

const getEmotionHistory = () => {
  return emotionHistory
}

defineExpose({
  startCamera,
  stopCamera,
  isActive: () => isCameraActive.value,
  getCurrentEmotion,
  getEmotionHistory,
  getEmotionRecordsForUpload,
  getSnapshotImagesForUpload,
  getEmotionAnalysisJson,
  clearData,
  setInterviewId,
})

onMounted(() => {
  if (props.autoStart) {
    initCamera()
  }

  pageHideHandler = () => {
    console.log('📄 页面隐藏')
  }
  document.addEventListener('visibilitychange', pageHideHandler)

  beforeUnloadHandler = (e: BeforeUnloadEvent) => {
    console.log('🚪 页面关闭')
  }
  window.addEventListener('beforeunload', beforeUnloadHandler)
})

onBeforeUnmount(() => {
  console.log('🗑️ 组件卸载')
  cleanup()
})

onUnmounted(() => {
  if (pageHideHandler) document.removeEventListener('visibilitychange', pageHideHandler)
  if (beforeUnloadHandler) window.removeEventListener('beforeunload', beforeUnloadHandler)
  console.log('✅ 组件卸载完成')
})
</script>

<style scoped>
.camera-container {
  width: 100%;
  height: 100%;
  background: #2d1f0f;
  overflow: hidden;
  position: relative;
  border-radius: 12px;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: v-bind('props.mirror ? "scaleX(-1)" : "scaleX(1)"');
}

canvas {
  display: none;
}

.camera-status {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  z-index: 10;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  transition: all 0.3s;
}

.camera-status.active .status-dot {
  background: #10b981;
  animation: pulse 1.5s infinite;
}

.status-text {
  font-size: 12px;
  color: #fff;
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
