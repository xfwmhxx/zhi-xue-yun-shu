<template>
  <div class="model-viewer">
    <!-- 模型介绍容器：采用您给出的宣纸质感设计 -->
    <div class="model-intro">
      <div class="intro-icon"><i class="fas fa-scroll"></i></div>
      <div class="intro-content">
        <div class="intro-title">灵枢 · 数字化经络</div>
        <div class="intro-desc">以金石之精微，演化内经之深邃</div>
        <div class="intro-tags">
          <span>子午流注</span><span>金石刻度</span><span>水墨流变</span>
        </div>
      </div>
    </div>

    <!-- 3D 容器 -->
    <div class="model-hero-container" ref="canvasContainer">
      <!-- 叠加层：保持水墨感 -->
      <div class="paper-overlay"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

const canvasContainer = ref<HTMLElement | null>(null)

// Three.js 核心变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let currentModel: THREE.Group | null = null
let luoPanGroup: THREE.Group | null = null
let scanRing: THREE.Mesh | null = null
let floatingTexts: THREE.Group[] = []
let animationId: number
let time = 0

// 颜色配置：文字颜色深化为纯黑
const COLORS = {
  INK_DEEP: '#1a1a1a',
  GOLD_BRIGHT: '#d4af37',
  CINNABAR: '#a30000',
  BROWN_LINE: '#5d4037',
  POINT_GOLD: '#ffcc00',
  UI_GOLD: '#b8860b',
  PAPER_DARK: '#000000',
}

const ancientTexts = [
  '子午流注',
  '阴阳平衡',
  '营卫不息',
  '五行生克',
  '通则不痛',
  '气机升降',
  '藏象经穴',
  '天人感应',
  '经脉所过',
  '主治所及',
  '补虚泄实',
  '调和阴阳',
  '气血充盈',
  '经络通达',
  '法于阴阳',
  '和于术数',
]

// 1. 创建底座纹理（保留您的逻辑）
const createLuoPanCanvas = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  const center = 512

  ctx.beginPath()
  ctx.arc(center, center, 500, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(220, 200, 170, 0.3)'
  ctx.fill()

  ctx.strokeStyle = COLORS.UI_GOLD
  ctx.lineWidth = 2
  for (let i = 0; i < 360; i += 1) {
    const angle = (i * Math.PI) / 180
    const length = i % 10 === 0 ? 40 : 20
    const inner = 480 - length
    ctx.beginPath()
    ctx.moveTo(center + Math.cos(angle) * inner, center + Math.sin(angle) * inner)
    ctx.lineTo(center + Math.cos(angle) * 480, center + Math.sin(angle) * 480)
    ctx.stroke()
  }

  ctx.font = 'bold 44px "STKaiti", "serif"'
  ctx.fillStyle = COLORS.INK_DEEP
  ctx.textAlign = 'center'
  const bagua = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
  bagua.forEach((text, i) => {
    ctx.save()
    ctx.translate(center, center)
    ctx.rotate((i * Math.PI) / 4)
    ctx.fillText(text, 0, -380)
    ctx.restore()
  })

  ctx.strokeStyle = COLORS.INK_DEEP
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(center, center, 320, 0, Math.PI * 2)
  ctx.stroke()

  ctx.save()
  ctx.translate(center, center)
  ctx.beginPath()
  ctx.arc(0, 0, 200, Math.PI * 0.5, Math.PI * 1.5)
  ctx.fillStyle = COLORS.INK_DEEP
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, 200, Math.PI * 1.5, Math.PI * 0.5)
  ctx.strokeStyle = COLORS.INK_DEEP
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, -100, 100, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.INK_DEEP
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 100, 100, 0, Math.PI * 2)
  ctx.fillStyle = '#f4ecd8'
  ctx.fill()
  ctx.restore()

  return canvas
}

// 2. 创建底座组（保留您的逻辑和比例）
const createLuoPanBase = () => {
  const group = new THREE.Group()
  const mainGeo = new THREE.CircleGeometry(1.6, 64)
  const mainMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(createLuoPanCanvas()),
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  })
  const mainMesh = new THREE.Mesh(mainGeo, mainMat)
  mainMesh.rotation.x = -Math.PI / 2
  group.add(mainMesh)

  const ringGeo = new THREE.TorusGeometry(1.62, 0.01, 16, 100)
  const ringMat = new THREE.MeshBasicMaterial({ color: COLORS.GOLD_BRIGHT })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.01
  group.add(ring)

  const shadowGeo = new THREE.CircleGeometry(1.8, 32)
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
  })
  const shadow = new THREE.Mesh(shadowGeo, shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -0.05
  group.add(shadow)

  group.position.y = -1.1
  return group
}

// 3. 创建上浮文字 - 带尾波效果，从背后升起，不遮挡人体
const createRisingText = () => {
  const text = ancientTexts[Math.floor(Math.random() * ancientTexts.length)]
  const canvas = document.createElement('canvas')
  canvas.width = 120
  canvas.height = 360
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '32px "STKaiti", "楷体", "KaiTi", serif'
    ctx.fillStyle = '#2c2c2c'
    ctx.shadowColor = 'rgba(0,0,0,0.4)'
    ctx.shadowBlur = 4
    ctx.textAlign = 'center'

    const chars = text?.split('')
    chars?.forEach((char, i) => {
      ctx.fillText(char, canvas.width / 2, 55 + i * 40)
    })
  }
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthTest: true,
    depthWrite: false,
  })
  const sprite = new THREE.Sprite(material)

  // 随机分布在背后区域（z 轴负方向为主，避免遮挡人体）
  // 人体大约在 z = 0 附近，让文字从 z = -1.5 到 z = -3.0 之间升起
  const angle = Math.random() * Math.PI * 2
  // 半径范围 1.2 到 2.8，主要分布在背后
  const r = 1.5 + Math.random() * 1.8
  // 从底部开始（y = -1.5 到 -0.8 之间）
  const startY = -1.5 + Math.random() * 0.8

  sprite.position.set(Math.cos(angle) * r, startY, Math.sin(angle) * r)
  sprite.scale.set(0.22, 0.7, 1)

  const group = new THREE.Group()
  group.add(sprite)

  // 创建尾波粒子系统
  const trailParticleCount = 8
  const trailParticles: THREE.Sprite[] = []
  for (let i = 0; i < trailParticleCount; i++) {
    const particleCanvas = document.createElement('canvas')
    particleCanvas.width = 20
    particleCanvas.height = 20
    const pCtx = particleCanvas.getContext('2d')
    if (pCtx) {
      pCtx.fillStyle = `rgba(180, 100, 50, ${0.3 - i * 0.03})`
      pCtx.beginPath()
      pCtx.arc(10, 10, 6 - i * 0.5, 0, Math.PI * 2)
      pCtx.fill()
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas)
    const particleMaterial = new THREE.SpriteMaterial({
      map: particleTexture,
      transparent: true,
      opacity: 0,
      depthTest: true,
      depthWrite: false,
    })
    const particle = new THREE.Sprite(particleMaterial)
    particle.scale.set(0.04, 0.04, 1)
    group.add(particle)
    trailParticles.push(particle)
  }

  group.userData = {
    speed: 0.008 + Math.random() * 0.01,
    startY: startY,
    trailParticles: trailParticles,
    trailPositions: [] as number[],
    lastUpdateTime: 0,
  }
  return group
}

// 4. 处理模型（加入局部自动缩放，确保显示，但不影响全局比例）
const processModelMesh = (fbx: THREE.Group) => {
  const box = new THREE.Box3().setFromObject(fbx)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const targetScale = 2.2 / maxDim
  fbx.scale.setScalar(targetScale)

  const center = box.getCenter(new THREE.Vector3())
  fbx.position.y = -box.min.y * targetScale - 1.05

  fbx.traverse((c: any) => {
    if (c.isMesh) {
      const geom = c.geometry
      const wireframe = new THREE.LineSegments(
        new THREE.EdgesGeometry(geom),
        new THREE.LineBasicMaterial({ color: COLORS.BROWN_LINE, transparent: true, opacity: 0.4 }),
      )
      const points = new THREE.Points(
        geom,
        new THREE.PointsMaterial({
          color: COLORS.POINT_GOLD,
          size: 0.01,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
        }),
      )
      c.add(wireframe, points)
      c.material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.05,
      })
    }
  })
  return fbx
}

const loadModel = async (path: string) => {
  const loader = new FBXLoader()
  return new Promise((resolve) => {
    loader.load(
      path,
      (fbx: any) => {
        const processed = processModelMesh(fbx)
        if (currentModel) scene.remove(currentModel)
        currentModel = processed
        scene.add(currentModel)
        resolve(true)
      },
      undefined,
      (err: any) => {
        console.error('模型加载失败', err)
        resolve(false)
      },
    )
  })
}

// 5. 初始化逻辑（保留您的布局设置）
const init3D = async () => {
  if (!canvasContainer.value) return
  const container = canvasContainer.value

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  )
  camera.position.set(0, 0.5, 3.5)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 1.2))

  // 添加罗盘底座
  luoPanGroup = createLuoPanBase()
  luoPanGroup.scale.set(0.6, 0.6, 0.6)
  scene.add(luoPanGroup)

  // 添加扫描环
  const scanGeo = new THREE.TorusGeometry(0.7, 0.005, 16, 100)
  const scanMat = new THREE.MeshBasicMaterial({
    color: COLORS.CINNABAR,
    transparent: true,
    opacity: 0.5,
  })
  scanRing = new THREE.Mesh(scanGeo, scanMat)
  scanRing.rotation.x = Math.PI / 2
  scene.add(scanRing)

  // 减少文字数量，更精致（从120减少到45个）
  for (let i = 0; i < 45; i++) {
    const t = createRisingText()
    floatingTexts.push(t)
    scene.add(t)
  }

  await loadModel('/UserPortrait/Male Base Mesh A Pose.fbx')

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    time += 0.015

    if (currentModel) currentModel.rotation.y += 0.005

    if (luoPanGroup) luoPanGroup.rotation.y += 0.008

    if (scanRing) {
      scanRing.position.y = Math.sin(time * 0.8) * 1.0
      scanRing.scale.setScalar(1 + Math.cos(time * 0.8) * 0.2)
    }

    // 上浮文字动画：竖直向上，带尾波效果
    floatingTexts.forEach((group) => {
      const sprite = group.children[0] as THREE.Sprite
      const trailParticles = group.userData.trailParticles as THREE.Sprite[]

      // 竖直向上移动，不左右摆动
      group.position.y += group.userData.speed

      // 更新尾波粒子位置
      if (trailParticles && trailParticles.length > 0) {
        // 每个粒子的偏移量（从下往上排列）
        trailParticles.forEach((particle, idx) => {
          const offset = (idx + 1) * 0.08
          const particleY = group.position.y - offset
          // 粒子只出现在文字下方，且透明度随距离衰减
          if (particleY > group.userData.startY - 0.2) {
            particle.position.set(group.position.x, particleY, group.position.z)
            // 透明度随距离和生命衰减
            const life = 1 - offset / 0.8
            particle.material.opacity = Math.min(0.4, life * 0.5) * sprite.material.opacity
          } else {
            particle.material.opacity = 0
          }
        })
      }

      // 透明度动画：底部淡入，中间最明显，顶部淡出
      let opacity = 0
      const height = group.position.y

      if (height < -0.3) {
        // 底部淡入区域
        const fadeIn = (height + 1.5) / 1.2
        opacity = Math.min(0.8, Math.max(0, fadeIn * 0.7))
      } else if (height < 1.5) {
        // 中间区域 - 最明显
        opacity = 0.8
      } else if (height < 2.8) {
        // 顶部淡出区域
        const fadeOut = (2.8 - height) / 1.3
        opacity = Math.max(0, fadeOut * 0.8)
      } else {
        opacity = 0
      }

      sprite.material.opacity = opacity

      // 重置逻辑：当文字飘出顶部视野后，重置到底部
      if (group.position.y > 3.0) {
        // 重置到底部
        group.position.y = -1.5 + Math.random() * 0.8

        // 随机更换位置（背后区域为主）
        const newAngle = Math.random() * Math.PI * 2
        const newRadius = 1.5 + Math.random() * 1.8
        group.position.x = Math.cos(newAngle) * newRadius
        group.position.z = Math.sin(newAngle) * newRadius

        // 随机更换文字内容，增加变化
        const newText = ancientTexts[Math.floor(Math.random() * ancientTexts.length)]
        const newCanvas = document.createElement('canvas')
        newCanvas.width = 120
        newCanvas.height = 360
        const ctx = newCanvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, newCanvas.width, newCanvas.height)
          ctx.font = '32px "STKaiti", "楷体", "KaiTi", serif'
          ctx.fillStyle = '#2c2c2c'
          ctx.shadowColor = 'rgba(0,0,0,0.4)'
          ctx.shadowBlur = 4
          ctx.textAlign = 'center'
          const chars = newText?.split('')
          chars?.forEach((char, i) => {
            ctx.fillText(char, newCanvas.width / 2, 55 + i * 40)
          })
        }
        const newTexture = new THREE.CanvasTexture(newCanvas)
        sprite.material.map = newTexture
        sprite.material.needsUpdate = true

        // 随机重置速度
        group.userData.speed = 0.008 + Math.random() * 0.01
        group.userData.startY = group.position.y

        // 重置尾波粒子
        if (trailParticles) {
          trailParticles.forEach((particle, idx) => {
            particle.material.opacity = 0
          })
        }
      }
    })

    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', () => {
    if (!canvasContainer.value) return
    camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  })
}

onMounted(() => nextTick(init3D))
onUnmounted(() => {
  cancelAnimationFrame(animationId)
  renderer?.dispose()
})
</script>

<style scoped>
/* 样式部分完全保留您的设置 */
.model-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.model-intro {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 2px;
  border-left: 4px solid #8b4513;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 15px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.03);
  z-index: 10;
}

.intro-icon {
  font-size: 24px;
  color: #1a1a1a;
}

.intro-title {
  font-family: 'STKaiti', 'serif';
  font-size: 30px;
  font-weight: bold;
  color: #1a1a1a;
  letter-spacing: 2px;
}

.intro-desc {
  font-size: 20px;
  color: #4a433b;
  margin-top: 2px;
}

.intro-tags {
  margin-top: 6px;
}

.intro-tags span {
  font-size: 16px;
  background: rgba(139, 69, 19, 0.1);
  color: #8b4513;
  padding: 1px 6px;
  border: 1px solid rgba(139, 69, 19, 0.2);
  margin-right: 5px;
  border-radius: 2px;
}

.model-hero-container {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.paper-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle, transparent 50%, rgba(139, 69, 19, 0.05) 100%);
  box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.02);
}

@font-face {
  font-family: 'STKaiti';
  src: local('STKaiti'), local('华文楷体');
}
</style>
