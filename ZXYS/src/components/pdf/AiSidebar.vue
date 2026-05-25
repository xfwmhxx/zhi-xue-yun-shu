<template>
  <div class="ai-chat-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 侧边栏头部 - 收起时只展示图标框，展开时显示完整头部 -->
    <div class="chat-header" :class="{ 'collapsed-header-only': isCollapsed }">
      <!-- 展开状态下的完整头部 -->
      <div v-if="!isCollapsed" class="header-content">
        <div class="header-left">
          <div class="ai-avatar-seal">助</div>
          <div class="header-info">
            <h3>AI助手</h3>
            <span class="ai-status" :class="aiStatusClass">{{ aiStatusText }}</span>
          </div>
        </div>
        <button @click="toggleCollapse" class="collapse-btn" title="折叠">←</button>
      </div>
      <!-- 收起状态下的简约图标框（只显示图标和未读标记） -->
      <div v-else class="collapsed-header" @click="toggleCollapse">
        <span class="collapsed-icon-seal">助</span>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
      </div>
    </div>

    <!-- 聊天内容区域 - 仅在展开时显示 -->
    <div v-if="!isCollapsed" class="chat-content">
      <!-- API密钥设置提示 -->
      <div v-if="!aiConfig.apiKey" class="api-key-prompt">
        <div class="prompt-content">
          <h4>⚙️ 需要配置API密钥</h4>
          <p>请先设置DeepSeek API密钥以使用AI功能</p>
          <div class="api-input-group">
            <input
              v-model="tempApiKey"
              type="password"
              placeholder="请输入DeepSeek API Key"
              class="api-input"
              @keyup.enter="saveApiKey"
            />
            <button @click="saveApiKey" class="api-save-btn">保存</button>
          </div>
          <p class="api-help">
            获取API密钥：访问
            <a href="https://platform.deepseek.com/" target="_blank" class="api-link">
              DeepSeek官网
            </a>
          </p>
        </div>
      </div>

      <!-- 聊天消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <!-- 欢迎消息 -->
        <div v-if="aiConfig.apiKey" class="welcome-message">
          <div class="ai-avatar-seal">助</div>
          <div class="welcome-text">
            <h4>欢迎使用AI助手</h4>
            <p>我可以帮您分析PDF内容、解答问题、总结要点等。</p>
          </div>
        </div>

        <!-- 消息列表 -->
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'message-item',
            {
              'ai-message': message.role === 'assistant',
              'user-message': message.role === 'user',
              loading: message.loading,
            },
          ]"
        >
          <!-- AI消息 -->
          <div v-if="message.role === 'assistant'" class="message-ai">
            <div class="ai-avatar-seal">助</div>
            <div class="message-content-ai">
              <div v-if="message.loading" class="loading-indicator">
                <div class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="loading-text">思考中...</div>
              </div>
              <div v-else class="message-bubble-ai">
                {{ message.content }}
              </div>
              <div v-if="!message.loading" class="message-time">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <!-- 用户消息 -->
          <div v-else class="message-user">
            <div class="message-content-user">
              <div class="message-bubble-user">
                {{ message.content }}
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
            <div class="user-avatar">我</div>
          </div>
        </div>
      </div>

      <!-- 消息输入区域 - 修复样式，确保文本框可见且可交互 -->
      <div class="message-input-area">
        <div class="textarea-wrapper">
          <textarea
            v-model="inputMessage"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.enter.shift.exact.prevent="inputMessage += '\n'"
            placeholder="输入您的问题...（Enter发送，Shift+Enter换行）"
            rows="3"
            ref="messageInput"
            :disabled="isLoading || !aiConfig.apiKey"
          ></textarea>
          <div class="input-actions">
            <button
              @click="clearConversation"
              class="clear-btn"
              title="清空对话"
              :disabled="messages.length <= 1 || isLoading"
            >
              清空
            </button>
            <button
              @click="handleSend"
              class="send-btn"
              :disabled="!inputMessage.trim() || isLoading || !aiConfig.apiKey"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              <span v-else>发送</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'

// 消息接口
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date | string
  loading?: boolean
  context?: string | null
}

// AI配置接口
interface AIConfig {
  apiKey: string
  baseURL: string
  model: string
  maxTokens: number
  temperature: number
}

// API请求数据接口
interface AIRequestData {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  max_tokens: number
  temperature: number
  stream: boolean
}

// API响应接口
interface AIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// 组件props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

// 组件emits
const emit = defineEmits<{
  'toggle-collapse': []
}>()

// 响应式数据
const isCollapsed = ref(props.collapsed)
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const messageInput = ref<HTMLInputElement | null>(null)
const messages = ref<Message[]>([])
const isLoading = ref(false)
const unreadCount = ref(0)
const tempApiKey = ref('')
const showApiConfig = ref(false)

// AI配置
const aiConfig = ref<AIConfig>({
  apiKey: '', // 请替换为你自己的 DeepSeek API Key
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  maxTokens: 2000,
  temperature: 0.7,
})

// AI状态
const aiStatus = ref<'idle' | 'thinking' | 'error'>('idle')
const aiStatusText = computed(() => {
  switch (aiStatus.value) {
    case 'idle':
      return '在线'
    case 'thinking':
      return '思考中'
    case 'error':
      return '连接错误'
    default:
      return '在线'
  }
})

const aiStatusClass = computed(() => `status-${aiStatus.value}`)

// 监听props变化
watch(
  () => props.collapsed,
  (newVal: boolean) => {
    isCollapsed.value = newVal
    if (!newVal && unreadCount.value > 0) {
      unreadCount.value = 0
    }
  },
)

// 初始化时从localStorage读取API密钥，但保留硬编码作为后备
onMounted(() => {
  const savedApiKey = localStorage.getItem('deepseek_api_key')
  if (savedApiKey) {
    aiConfig.value.apiKey = savedApiKey
  }
  // 确保输入框可以获得焦点（修复无法选中/输入的问题）
  setTimeout(() => {
    if (messageInput.value && !isCollapsed.value && aiConfig.value.apiKey) {
      messageInput.value.focus()
    }
  }, 100)
  scrollToBottom()
})

// 保存API密钥
function saveApiKey() {
  if (tempApiKey.value.trim()) {
    aiConfig.value.apiKey = tempApiKey.value.trim()
    localStorage.setItem('deepseek_api_key', tempApiKey.value.trim())
    tempApiKey.value = ''
    showToast('API密钥已保存')
  } else {
    showToast('请输入有效的API密钥')
  }
}

// 清除API密钥
function clearApiKey() {
  aiConfig.value.apiKey = ''
  localStorage.removeItem('deepseek_api_key')
  showToast('API密钥已清除')
}

// 暴露给父组件的方法
defineExpose({
  sendMessage: async (content: string, context: string | null = null) => {
    if (content && content.trim()) {
      await sendUserMessage(content, context)
      return true
    }
    return false
  },

  askAI: async (question: string, selectedText: string = '') => {
    let content = question
    if (selectedText) {
      content = `${question}\n\n【选中文本】\n"${selectedText}"`
    }
    return await sendUserMessage(content, 'PDF选择')
  },

  toggleCollapse: () => {
    isCollapsed.value = !isCollapsed.value
    emit('toggle-collapse')
  },

  // 添加设置API配置的方法
  setApiConfig: (config: Partial<AIConfig>) => {
    if (config && config.apiKey) {
      aiConfig.value.apiKey = config.apiKey
      if (config.baseURL) aiConfig.value.baseURL = config.baseURL
      if (config.model) aiConfig.value.model = config.model
      localStorage.setItem('deepseek_api_key', config.apiKey)
    }
  },
})

// 发送用户消息
async function sendUserMessage(content: string, context: string | null = null) {
  // 检查API密钥
  if (!aiConfig.value.apiKey) {
    showToast('请先配置API密钥')
    return
  }

  // 添加用户消息
  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content: content.trim(),
    timestamp: new Date(),
    context: context,
  }

  messages.value.push(userMessage)
  scrollToBottom()

  // 如果侧边栏折叠，增加未读计数
  if (isCollapsed.value) {
    unreadCount.value++
  }

  // 添加AI加载消息
  const loadingMessage: Message = {
    id: generateId(),
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    loading: true,
  }

  messages.value.push(loadingMessage)
  scrollToBottom()

  // 调用真实API
  await callAIApi(content.trim())
}

// 生成消息ID
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// 调用真实AI API
async function callAIApi(content: string) {
  aiStatus.value = 'thinking'
  isLoading.value = true

  try {
    // 构建消息历史
    const history = messages.value
      .filter((msg) => msg.role && msg.content && !msg.loading)
      .map(
        (msg) =>
          ({
            role: msg.role,
            content: msg.content,
          }) as { role: 'user' | 'assistant' | 'system'; content: string },
      )

    // 构建请求数据
    const requestData: AIRequestData = {
      model: aiConfig.value.model,
      messages: [
        {
          role: 'system',
          content:
            '请你作为一个专业的AI助手，专门分析用户提供的PDF文档内容。请务必遵守以下几点要求：第一，全部回答必须使用中文。第二，回答内容需要做到详细且专业。第三，如果用户在提问时提供了从PDF中选中的具体文本，你的分析必须重点围绕这些文本展开。第四，回答中禁止使用任何Markdown格式符号，例如星号、井号、粗体符号等。第五，当回答涉及多个要点或步骤时，必须采用分点叙述的方式。分点时请使用“第一点”、“第二点”、“第三点”或“首先”、“其次”、“再次”、“最后”这类纯文本词语来清晰划分层次，不得使用项目符号列表。',
        },
        ...history.slice(-8), // 只保留最近8条消息作为上下文
      ],
      max_tokens: aiConfig.value.maxTokens,
      temperature: aiConfig.value.temperature,
      stream: false,
    }

    console.log('发送API请求到:', aiConfig.value.baseURL)

    // 调用API
    const response = await fetch(`${aiConfig.value.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiConfig.value.apiKey}`,
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      let errorText = ''
      try {
        errorText = await response.text()
      } catch (e) {
        errorText = '无法读取错误信息'
      }
      throw new Error(`API请求失败: ${response.status} - ${errorText}`)
    }

    const data: AIResponse = await response.json()

    // 移除加载消息
    messages.value = messages.value.filter((msg) => !msg.loading)

    // 添加AI回复
    const aiMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: data.choices[0]?.message?.content || '抱歉，没有收到有效的回复。',
      timestamp: new Date(),
    }

    messages.value.push(aiMessage)
    aiStatus.value = 'idle'
    isLoading.value = false
    scrollToBottom()
  } catch (error) {
    console.error('调用AI API失败:', error)

    // 移除加载消息
    messages.value = messages.value.filter((msg) => !msg.loading)

    // 根据错误类型显示不同的错误消息
    let errorMessage = '抱歉，暂时无法处理您的请求。'
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'API密钥无效，请重新配置。'
      } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请检查网络设置。'
      } else if (error.message.includes('429')) {
        errorMessage = '请求过于频繁，请稍后再试。'
      }
    }

    const errorResponse: Message = {
      id: generateId(),
      role: 'assistant',
      content: errorMessage,
      timestamp: new Date(),
    }

    messages.value.push(errorResponse)
    aiStatus.value = 'error'
    isLoading.value = false
    scrollToBottom()

    // 5秒后恢复在线状态
    setTimeout(() => {
      if (aiStatus.value === 'error') {
        aiStatus.value = 'idle'
      }
    }, 5000)
  }
}

// 发送消息
async function handleSend() {
  if (!inputMessage.value.trim() || isLoading.value) return

  const content = inputMessage.value.trim()
  inputMessage.value = ''

  await sendUserMessage(content)
  // 修复：发送后确保输入框仍然可以获得焦点
  nextTick(() => {
    messageInput.value?.focus()
  })
}

// 清空对话
function clearConversation() {
  if (messages.value.length > 1 && !isLoading.value) {
    if (confirm('确定要清空对话历史吗？')) {
      messages.value = []
      showToast('对话已清空')
    }
  }
}

// 显示提示
function showToast(message: string) {
  // 创建toast元素
  const toast = document.createElement('div')
  toast.className = 'toast-message'
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #5a3921;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(90, 57, 33, 0.3);
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2s;
  `

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease'
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 1700)
}

// 滚动到底部，增加防闪烁处理：强制重绘优化
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      // 使用 setTimeout 确保 DOM 更新完成后再滚动，减少闪烁
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      }, 20)
    }
  })
}

// 格式化时间
function formatTime(date: Date | string): string {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  // 如果是今天
  if (diffMs < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 侧边栏折叠切换
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  emit('toggle-collapse')
  // 切换后如果展开，重置未读计数并聚焦输入框
  if (!isCollapsed.value) {
    unreadCount.value = 0
    nextTick(() => {
      messageInput.value?.focus()
    })
  }
}
</script>

<style scoped>
/* 统一的朱砂印章风格 */
.ai-avatar-seal,
.collapsed-icon-seal {
  width: 36px;
  height: 36px;
  background-color: #b71c1c; /* 朱砂红 */
  color: #ffffff;
  border-radius: 4px; /* 方形印章微圆角 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'NO3', serif; /* 使用你页面定义的衬线体 */
  font-weight: bold;
  font-size: 18px;
  box-shadow: 1px 1px 0px rgba(0, 0, 0, 0.2); /* 增加一点立体感 */
  flex-shrink: 0;
}

/* 如果是欢迎界面大的那个头像 */
.ai-avatar-large.ai-avatar-seal {
  width: 48px;
  height: 48px;
  font-size: 24px;
}

/* 收起状态图标微调 */
.collapsed-icon-seal {
  width: 32px;
  height: 32px;
  font-size: 16px;
}
/* 基础布局 - 采用暖棕色系 #5a3921 为主色调 */
.ai-chat-sidebar {
  position: fixed;
  top: 0;
  right: 15px;
  top: 135px;
  height: calc(100vh - 135px);
  background-color: #faf7f2; /* 暖白底色 */
  border-left: 1px solid rgba(90, 57, 33, 0.25);
  box-shadow: -2px 0 12px rgba(90, 57, 33, 0.15);
  z-index: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
  border-radius: 12px 0 0 12px;
  overflow: hidden;
  width: 360px;
}

.ai-chat-sidebar.collapsed {
  width: 60px;
  background-color: #faf7f2;
}

/* 头部 */
.chat-header {
  height: 64px;
  background-color: #ffffff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(90, 57, 33, 0.2);
  flex-shrink: 0;
}

/* 收起状态时头部只显示图标框 */
.chat-header.collapsed-header-only {
  background: transparent;
  border-bottom: none;
  padding: 0;
  justify-content: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  background-color: #e8e0d5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #5a3921;
}

.header-info h3 {
  color: #5a3921;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.ai-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #e8e0d5;
  color: #5a3921;
}

.status-idle {
  background-color: #e0e8d5;
  color: #3e5a21;
}
.status-thinking {
  background-color: #f5e6d3;
  color: #8b5a2b;
}
.status-error {
  background-color: #f5d3d3;
  color: #a12b2b;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #e8e0d5;
  border: 1px solid rgba(90, 57, 33, 0.3);
  color: #5a3921;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}
.collapse-btn:hover {
  background: #d9cdbe;
}

.collapsed-header {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.collapsed-icon {
  font-size: 28px;
  color: #5a3921;
}

.unread-badge {
  position: absolute;
  top: 12px;
  right: 8px;
  background: #5a3921;
  color: white;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid #faf7f2;
}

/* 聊天内容区域 */
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #faf7f2;
}

/* API密钥提示 */
.api-key-prompt {
  padding: 16px;
  background-color: #fff1e0;
  border-bottom: 1px solid rgba(90, 57, 33, 0.25);
}

.prompt-content h4 {
  color: #5a3921;
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 600;
}

.prompt-content p {
  color: #5a3921;
  font-size: 13px;
  margin: 0 0 12px 0;
}

.api-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.api-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(90, 57, 33, 0.3);
  border-radius: 6px;
  font-size: 14px;
  background: white;
}
.api-input:focus {
  outline: none;
  border-color: #5a3921;
  box-shadow: 0 0 0 2px rgba(90, 57, 33, 0.2);
}

.api-save-btn {
  padding: 8px 16px;
  background-color: #5a3921;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.api-save-btn:hover {
  background-color: #3e2b18;
}

.api-help {
  font-size: 12px;
  color: #5a3921;
  margin-bottom: 0 !important;
}
.api-link {
  color: #5a3921;
  text-decoration: underline;
  font-weight: 500;
}
.api-link:hover {
  color: #3e2b18;
}

/* 欢迎消息 */
.welcome-message {
  padding: 24px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(90, 57, 33, 0.15);
  background-color: #ffffff;
  border-radius: 8px;
  margin-bottom: 8px;
}

.ai-avatar-large {
  width: 48px;
  height: 48px;
  background: #e8e0d5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  color: #5a3921;
}

.welcome-text h4 {
  color: #5a3921;
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.welcome-text p {
  color: #5a3921;
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
  opacity: 0.8;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: transparent;
  scroll-behavior: smooth;
}

/* 优化滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}
.messages-container::-webkit-scrollbar-track {
  background: rgba(90, 57, 33, 0.05);
  border-radius: 3px;
}
.messages-container::-webkit-scrollbar-thumb {
  background: rgba(90, 57, 33, 0.25);
  border-radius: 3px;
}
.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(90, 57, 33, 0.4);
}

.message-item {
  margin-bottom: 20px;
}

/* AI消息布局 */
.message-ai {
  display: flex;
  gap: 12px;
}
.message-user {
  display: flex;
  flex-direction: row-reverse;
  gap: 12px;
}

.ai-avatar-message {
  width: 32px;
  height: 32px;
  background: #e8e0d5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  color: #5a3921;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #5a3921;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: white;
  font-weight: 500;
  flex-shrink: 0;
}

.message-content-ai,
.message-content-user {
  max-width: calc(100% - 44px);
}

.message-bubble-ai {
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 16px 16px 16px 4px;
  box-shadow: 0 2px 8px rgba(90, 57, 33, 0.1);
  color: #2d1f0f;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  border: 1px solid rgba(90, 57, 33, 0.15);
}

.message-bubble-user {
  background: #5a3921;
  padding: 12px 16px;
  border-radius: 16px 16px 4px 16px;
  color: white;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  box-shadow: 0 2px 8px rgba(90, 57, 33, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.message-time {
  font-size: 11px;
  color: #5a3921;
  margin-top: 4px;
  padding-left: 8px;
  padding-right: 8px;
  opacity: 0.7;
}
.message-content-user .message-time {
  text-align: right;
  color: #5a3921;
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #ffffff;
  border-radius: 16px 16px 16px 4px;
  border: 1px solid rgba(90, 57, 33, 0.15);
}

.loading-dots {
  display: flex;
  gap: 4px;
  justify-content: center;
}
.loading-dots span {
  width: 8px;
  height: 8px;
  background: #5a3921;
  border-radius: 50%;
  animation: loadingDot 1.4s infinite;
}
.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes loadingDot {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  font-size: 13px;
  color: #5a3921;
  text-align: center;
}

/* ========== 输入区域 - 完全重写以确保可见和可交互 ========== */
.message-input-area {
  padding: 16px;
  border-top: 1px solid rgba(90, 57, 33, 0.2);
  background-color: #ffffff;
  width: 100%;
  box-sizing: border-box; /* 确保padding不会导致溢出 */
}

.textarea-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(90, 57, 33, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  resize: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background-color: #ffffff;
  color: #2d1f0f;
  box-sizing: border-box; /* 关键：防止padding导致宽度溢出 */
  display: block; /* 确保块级元素 */
}

textarea:focus {
  outline: none;
  border-color: #5a3921;
  box-shadow: 0 0 0 3px rgba(90, 57, 33, 0.2);
}

textarea:disabled {
  background-color: #f5f2ef;
  color: #8b7a6a;
  cursor: not-allowed;
}

/* 确保textarea可交互 - 移除任何可能遮挡的样式 */
textarea {
  pointer-events: auto;
  opacity: 1;
  z-index: 10;
  position: relative;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
}

.clear-btn,
.send-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s;
  box-sizing: border-box;
}

.clear-btn {
  background-color: #e8e0d5;
  color: #5a3921;
  border: 1px solid rgba(90, 57, 33, 0.2);
}
.clear-btn:hover:not(:disabled) {
  background-color: #d9cdbe;
}
.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn {
  background-color: #5a3921;
  color: white;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.send-btn:hover:not(:disabled) {
  background-color: #3e2b18;
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Toast消息 */
.toast-message {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #5a3921;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(90, 57, 33, 0.3);
  z-index: 10000;
}
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* 响应式 */
@media (max-width: 640px) {
  .ai-chat-sidebar {
    width: 100%;
    right: 0;
    border-radius: 0;
  }
  .ai-chat-sidebar.collapsed {
    width: 60px;
  }
}
</style>
