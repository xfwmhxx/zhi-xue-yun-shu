<template>
  <div class="ai-doctor-page">
    <BreadcrumbNav title="AI医生" />

    <!-- 移除面包屑占位符，使用margin替代避免遮盖 -->
    <div class="doctor-container">
      <!-- 右侧问诊核心区（已移除左侧所有内容） -->
      <div class="consultation-section">
        <div class="section-header">
          <i class="fa-solid fa-video"></i>
          <span class="section-title">视频问诊</span>
          <span class="section-subtitle">与AI医生面对面沟通</span>
        </div>

        <!-- 未开启问诊时显示准备状态 -->
        <div v-if="!consultationStarted" class="consultation-prepare">
          <div class="prepare-icon">
            <i class="fa-solid fa-microphone-lines"></i>
          </div>
          <h3>准备就绪</h3>
          <p>点击下方按钮开始与AI医生视频问诊</p>
          <button class="start-consultation-btn" @click="startConsultation">
            <i class="fa-solid fa-play"></i> 开始视频问诊
          </button>
        </div>

        <!-- 音视频通话组件容器 - 固定高度，防止撑大 -->
        <div v-else class="call-wrapper">
          <I18nProvider>
            <Call
              :rc="runConfig as any"
              :mode="mode"
              :auto-call="true"
              :user-id="userId"
              :user-token="userToken"
              :share-token="shareToken"
              :region="region"
              :agent-type="agentType"
              :agent-id="agentId"
              :agent-config="callAgentConfig"
              :chat-sync-config="chatSyncConfig"
              :rtc-engine-config="rtcEngineConfig"
              @exit="handleCallExit"
              @auth-fail="handleAuthFail"
            />
          </I18nProvider>
        </div>

        <!-- 问诊记录快捷入口 -->
        <div v-if="consultationStarted" class="consultation-actions">
          <button class="action-btn" @click="endConsultation">
            <i class="fa-solid fa-phone-slash"></i> 结束问诊
          </button>
          <button class="action-btn secondary" @click="viewHistory">
            <i class="fa-solid fa-clock-rotate-left"></i> 查看历史记录
          </button>
        </div>
      </div>

      <!-- 底部健康提示 -->
      <div class="health-tips">
        <div class="tip-item">
          <i class="fa-solid fa-heart-circle-check"></i>
          <span>本AI医生基于中医理论，建议仅供参考</span>
        </div>
        <div class="tip-item">
          <i class="fa-solid fa-truck-medical"></i>
          <span>紧急情况请立即拨打120或前往就近医院</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

// 音视频通话相关导入
import { I18nProvider } from '@/utils/AIYS/common/i18nContext'
import Call from '@/views/AIYS/Call.vue'
import { getRuntimeConfig } from '@/types/interface'
import runUserConfig from '@/utils/AIYS/config/runConfig'
import { AICallAgentConfig, AICallChatSyncConfig } from 'aliyun-auikit-aicall'
import type { AICallAgentType } from 'aliyun-auikit-aicall'

const router = useRouter()

// ==================== 状态管理 ====================
const consultationStarted = ref(false)

const runConfig = ref(runUserConfig)
const mode = ref<'standard' | 'proxy'>('standard')
const userId = ref('')
const userToken = ref('')
const shareToken = ref<string | undefined>(undefined)
const region = ref('cn-hangzhou')
const agentType = ref<AICallAgentType>(3)
const agentId = ref('70f48e00f4d54eb58fcc7f6b14e41554')

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const callAgentConfig = ref(new AICallAgentConfig() as any)
const chatSyncConfig = ref(
  new AICallChatSyncConfig(generateSessionId(), agentId.value, userId.value) as any,
)

const rtcEngineConfig = ref({})

// ==================== 方法 ====================
const startConsultation = () => {
  consultationStarted.value = true
}

const endConsultation = () => {
  consultationStarted.value = false
}

const handleCallExit = () => {
  consultationStarted.value = false
}

const handleAuthFail = () => {
  console.error('认证失败')
  consultationStarted.value = false
}

const viewHistory = () => {
  router.push('/ConsultationHistory')
}

// ==================== 生命周期 ====================
onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  // 生成临时用户ID
  userId.value = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  userToken.value = `token_${Date.now()}`

  // 更新 chatSyncConfig 中的 receiverId
  chatSyncConfig.value = new AICallChatSyncConfig(generateSessionId(), agentId.value, userId.value)
})

onUnmounted(() => {
  // 清理工作
  consultationStarted.value = false
})
</script>

<style scoped>
/* === AI医生页面样式 - 修复定位问题，美化右侧区域 === */
.ai-doctor-page {
  width: 100%;
  min-height: 100vh;
  font-family: 'NO3', 'Noto Serif SC', 'PingFang SC', 'Microsoft YaHei', serif;
  position: relative;
}

/* 容器定位修复：确保内容不遮盖顶部面包屑导航 */
.doctor-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 80px;
  position: relative;
  z-index: 1;
}

/* 右侧问诊区 - 完全重设计，移除左侧相关内容，仅保留右侧并美化 */
.consultation-section {
  background: rgba(255, 253, 248, 0.98);
  border-radius: 48px;
  padding: 40px;
  border: 1px solid rgba(166, 124, 82, 0.25);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e8ddd0;
  flex-shrink: 0;
}

.section-header i {
  font-size: 32px;
  color: #a67c52;
  background: #f5ede4;
  padding: 12px;
  border-radius: 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: #2e241f;
  letter-spacing: 1px;
}

.section-subtitle {
  font-size: 15px;
  color: #8d6e63;
  margin-left: auto;
  font-weight: 400;
}

/* 问诊准备状态 - 美化设计 */
.consultation-prepare {
  text-align: center;
  padding: 60px 40px;
  background: linear-gradient(145deg, #ffffff, #fefaf5);
  border-radius: 32px;
  height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(166, 124, 82, 0.15);
  box-shadow:
    inset 0 1px 4px rgba(0, 0, 0, 0.02),
    0 8px 20px rgba(0, 0, 0, 0.03);
}

.prepare-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #e8ddd0, #d4c5b2);
  border-radius: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  animation: softBreathing 3s ease-in-out infinite;
  box-shadow: 0 12px 24px rgba(93, 64, 55, 0.15);
}

@keyframes softBreathing {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 12px 24px rgba(166, 124, 82, 0.15);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 18px 32px rgba(166, 124, 82, 0.25);
  }
}

.prepare-icon i {
  font-size: 56px;
  color: #5d4037;
}

.consultation-prepare h3 {
  font-size: 32px;
  color: #2e241f;
  margin-bottom: 16px;
  font-weight: 500;
}

.consultation-prepare p {
  font-size: 18px;
  color: #8d6e63;
  margin-bottom: 40px;
  max-width: 400px;
}

.start-consultation-btn {
  background: linear-gradient(135deg, #5d4037, #4a2e24);
  color: white;
  border: none;
  padding: 16px 48px;
  font-size: 18px;
  font-family: inherit;
  font-weight: 500;
  border-radius: 60px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  box-shadow: 0 8px 20px rgba(93, 64, 55, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  letter-spacing: 1px;
}

.start-consultation-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 28px rgba(93, 64, 55, 0.35);
  background: linear-gradient(135deg, #6b4c41, #5d3a2c);
}

.start-consultation-btn:active {
  transform: translateY(1px);
}

/* 通话容器 - 保持固定高度并优化圆角 */
.call-wrapper {
  width: 100%;
  height: 520px;
  background: #1e1e2f;
  border-radius: 32px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 240, 0.1);
}

.call-wrapper :deep(*) {
  max-width: 100%;
  max-height: 100%;
  box-sizing: border-box;
}

.call-wrapper :deep(.call-container),
.call-wrapper :deep(.aui-call-container),
.call-wrapper :deep(.video-container),
.call-wrapper :deep(.rtc-container) {
  width: 100%;
  height: 100%;
  border-radius: 32px;
  overflow: hidden;
}

.call-wrapper :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 问诊操作按钮组 */
.consultation-actions {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid #e8ddd0;
  flex-shrink: 0;
}

.action-btn {
  padding: 12px 32px;
  font-size: 16px;
  font-family: inherit;
  font-weight: 500;
  border-radius: 48px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #5d4037;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.5px;
}

.action-btn.secondary {
  background: transparent;
  border: 1.5px solid #a67c52;
  color: #5d4037;
}

.action-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.secondary:hover {
  background: rgba(166, 124, 82, 0.08);
  border-color: #8b5a3c;
}

/* 底部健康提示 - 更优雅 */
.health-tips {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  padding: 20px 32px;
  background: rgba(255, 252, 245, 0.9);
  border-radius: 80px;
  margin-top: 48px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(166, 124, 82, 0.2);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #7b5e4e;
  font-weight: 450;
}

.tip-item i {
  font-size: 20px;
  color: #a67c52;
}

/* 响应式优化 */
@media (max-width: 968px) {
  .doctor-container {
    padding: 70px 20px 60px;
  }

  .consultation-section {
    padding: 28px;
  }

  .section-title {
    font-size: 24px;
  }

  .call-wrapper,
  .consultation-prepare {
    height: 460px;
  }

  .consultation-prepare h3 {
    font-size: 28px;
  }

  .prepare-icon {
    width: 100px;
    height: 100px;
  }

  .prepare-icon i {
    font-size: 46px;
  }
}

@media (max-width: 576px) {
  .doctor-container {
    padding: 60px 16px 40px;
  }

  .consultation-section {
    padding: 20px;
    border-radius: 32px;
  }

  .consultation-prepare {
    padding: 40px 20px;
    height: 420px;
  }

  .consultation-prepare h3 {
    font-size: 24px;
  }

  .consultation-prepare p {
    font-size: 15px;
  }

  .start-consultation-btn {
    padding: 12px 32px;
    font-size: 16px;
  }

  .call-wrapper {
    height: 380px;
  }

  .action-btn {
    padding: 10px 20px;
    font-size: 14px;
  }

  .health-tips {
    flex-direction: column;
    align-items: center;
    gap: 14px;
    border-radius: 40px;
    padding: 16px 20px;
  }

  .section-header i {
    font-size: 26px;
    padding: 8px;
  }

  .section-title {
    font-size: 22px;
  }
}
</style>
