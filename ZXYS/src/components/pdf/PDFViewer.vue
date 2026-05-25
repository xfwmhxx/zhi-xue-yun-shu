<template>
  <div
    class="pdf-container"
    @contextmenu.prevent="handleContextMenu"
    @click="hideContextMenu"
    @mousemove="handleMouseMove"
  >
    <!-- PDF展示区域 -->
    <div class="pdf-viewer" :class="{ 'full-width': isSidebarCollapsed }">
      <div style="height: 100px"></div>
      <iframe
        @load="handleIframeLoad"
        id="elasticpdf-iframe"
        src="/pdfjs-3.2/web/viewer.html"
        frameborder="0"
        width="100%"
        height="100%"
        ref="pdfIframe"
      ></iframe>
    </div>

    <!-- 聊天侧边栏 -->
    <AiSidebar
      ref="chatSidebarRef"
      :collapsed="isSidebarCollapsed"
      @toggle-collapse="toggleSidebar"
    />

    <!-- 悬浮工具栏 -->
    <div
      v-if="showFloatingToolbar && selectedText.trim()"
      class="floating-toolbar"
      :style="{
        left: floatingX + 'px',
        top: floatingY - 50 + 'px',
        opacity: toolbarOpacity,
      }"
      @mouseenter="onToolbarMouseEnter"
      @mouseleave="onToolbarMouseLeave"
    >
      <div class="toolbar-header">
        <span class="toolbar-text-preview">{{ floatingTextPreview }}</span>
        <button @click="hideFloatingToolbar" class="toolbar-close" title="关闭">×</button>
      </div>
      <div class="toolbar-buttons">
        <button @click="quickCopy" class="toolbar-btn" title="复制">
          <i class="fas fa-copy btn-icon"></i>
          <span class="btn-text">复制</span>
        </button>
        <button @click="quickAskAI" class="toolbar-btn" title="AI问答">
          <i class="fas fa-robot btn-icon"></i>
          <span class="btn-text">AI问答</span>
        </button>
        <button @click="quickSendToChat" class="toolbar-btn" title="发送到讨论区">
          <i class="fas fa-paper-plane btn-icon"></i>
          <span class="btn-text">发送</span>
        </button>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="showContextMenu"
      class="context-menu"
      :style="{ left: menuX + 'px', top: menuY + 'px' }"
      @mousedown.stop
      @click.stop
    >
      <div class="menu-header">
        <span class="menu-title">操作菜单</span>
        <button class="menu-close" @click="hideContextMenu">×</button>
      </div>

      <!-- 选中文本预览 -->
      <div v-if="selectedText.trim()" class="selected-text-preview">
        "{{ selectedTextPreview }}"
      </div>
      <div v-else class="no-selection">未选中文本</div>

      <div class="menu-divider"></div>

      <!-- 菜单选项 -->
      <div class="menu-item" @click="copyToClipboard" :class="{ disabled: !selectedText.trim() }">
        <i class="fas fa-copy btn-icon"></i>
        <span class="menu-text">复制文本</span>
      </div>

      <div class="menu-item" @click="askAI" :class="{ disabled: !selectedText.trim() }">
        <i class="fas fa-robot btn-icon"></i>
        <span class="menu-text">AI问答</span>
      </div>

      <div class="menu-item" @click="sendToChat" :class="{ disabled: !selectedText.trim() }">
        <i class="fas fa-paper-plane btn-icon"></i>
        <span class="menu-text">发送到讨论区</span>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="toggleSidebar">
        <span class="menu-icon"
          ><i :class="isSidebarCollapsed ? 'fas fa-indent' : 'fas fa-outdent'"></i
        ></span>
        <span class="menu-text">{{ isSidebarCollapsed ? '显示讨论区' : '隐藏讨论区' }}</span>
      </div>
    </div>

    <!-- 右键菜单遮罩 -->
    <div v-if="showContextMenu" class="context-menu-mask" @click="hideContextMenu"></div>

    <!-- 快捷提示 -->
    <div v-if="showQuickToast" class="quick-toast">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import AiSidebar from './AiSidebar.vue'

// 组件引用
const chatSidebarRef = ref<InstanceType<typeof AiSidebar> | null>(null)
const pdfIframe = ref<HTMLIFrameElement | null>(null)

interface PDFMessageData {
  type: string
  text?: string
  page?: number
  timestamp?: number
  mouseX?: number
  mouseY?: number
  clientX?: number
  clientY?: number
  source?: string
  function_name?: string
  content?: {
    file_name?: string
    pdf_blob?: any
    pdf_base64?: string
    file_annotation?: any
  }
}

interface ElasticPDFViewer {
  pdfAnnotation: {
    outputAnnotations: () => {
      file_annotation: any
      file_name: string
    }
  }
}

const props = defineProps({
  pdfUrl: {
    type: String,
    required: true,
    default: '',
  },
  page: {
    type: Number,
    default: 1,
  },
})

// 监听page变化
watch(
  () => props.page,
  (newPage) => {
    if (newPage && newPage > 0) {
      goToPageInIframe(newPage)
    }
  },
  { immediate: true },
)

// 新增：跳转到指定页面
function goToPageInIframe(pageNumber: number) {
  if (!pdfIframe.value) return

  try {
    const iframeWindow = pdfIframe.value.contentWindow
    if (!iframeWindow) return

    if (iframeWindow.PDFViewerApplication) {
      iframeWindow.PDFViewerApplication.page = pageNumber
      return
    }
  } catch (error) {
    console.error('跳转页面失败:', error)
  }
}

// 右键菜单状态
const showContextMenu = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const selectedText = ref('')
const currentPage = ref(1)

// 悬浮工具栏状态
const showFloatingToolbar = ref(false)
const floatingX = ref(0)
const floatingY = ref(0)
const isToolbarHovered = ref(false)
const toolbarOpacity = ref(1)
const floatingTextPreview = ref('')

// 侧边栏折叠状态
const isSidebarCollapsed = ref(false)

// 快捷提示状态
const showQuickToast = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

// 悬浮工具栏自动隐藏定时器
let floatingToolbarTimer: ReturnType<typeof setTimeout> | null = null
let mouseX = 0
let mouseY = 0

// 声明全局变量（用于PDF编辑器）
declare global {
  interface Window {
    PDFViewerApplication?: {
      page?: number
    }
    elasticpdf_viewer?: ElasticPDFViewer
  }
}

// 计算选中文本的预览
const selectedTextPreview = computed(() => {
  if (!selectedText.value) return ''
  if (selectedText.value.length > 50) {
    return selectedText.value.substring(0, 50) + '...'
  }
  return selectedText.value
})

onMounted(() => {
  listenPDFEditorMessage()
  setupKeyboardShortcuts()
})

// 统一的iframe加载处理函数
function handleIframeLoad() {
  initialPDFEditor()

  // 跳转到指定页面
  if (props.page && props.page > 1) {
    setTimeout(() => {
      goToPageInIframe(props.page)
    }, 1500)
  }

  setTimeout(() => {
    setupPDFSelectionListener()
  }, 1000)

  // 延迟发射加载完成事件，确保PDF真正开始加载
  setTimeout(() => {
    emit('pdf-loaded')
  }, 500)
}

// 鼠标移动监听
function handleMouseMove(event: MouseEvent) {
  mouseX = event.clientX
  mouseY = event.clientY
}

// 向PDF iframe注入选择监听脚本
function setupPDFSelectionListener() {
  if (!pdfIframe.value) return

  try {
    const iframeWindow = pdfIframe.value.contentWindow
    if (!iframeWindow) return

    const iframeDocument = iframeWindow.document

    // 注入监听脚本
    const script = `
      (function() {
        let lastSelection = ''
        let lastSelectionTime = 0
        let lastMouseX = 0
        let lastMouseY = 0
        
        // 监听鼠标移动
        document.addEventListener('mousemove', (e) => {
          lastMouseX = e.clientX
          lastMouseY = e.clientY
        })
        
        // 监听PDF iframe内的选择事件
        document.addEventListener('selectionchange', function() {
          const selection = window.getSelection()
          const text = selection ? selection.toString().trim() : ''
          
          if (text && text !== lastSelection) {
            lastSelection = text
            lastSelectionTime = Date.now()
            
            // 获取当前页码
            const pageNum = window.PDFViewerApplication?.page || 1
            
            // 发送选中文本到父窗口
            window.parent.postMessage({
              type: 'pdf-text-selected',
              text: text,
              page: pageNum,
              timestamp: lastSelectionTime,
              mouseX: lastMouseX,
              mouseY: lastMouseY
            }, '*')
          } else if (!text && lastSelection) {
            // 选择被清除
            lastSelection = ''
            window.parent.postMessage({
              type: 'pdf-text-cleared',
              timestamp: Date.now()
            }, '*')
          }
        })
        
        // 监听右键事件
        document.addEventListener('contextmenu', function(e) {
          const selection = window.getSelection()
          const text = selection ? selection.toString().trim() : ''
          
          if (text) {
            const pageNum = window.PDFViewerApplication?.page || 1
            
            window.parent.postMessage({
              type: 'pdf-contextmenu-selected',
              text: text,
              page: pageNum,
              timestamp: Date.now(),
              clientX: e.clientX,
              clientY: e.clientY
            }, '*')
          }
        })
        
        // 监听鼠标按下，用于隐藏悬浮工具栏
        document.addEventListener('mousedown', function(e) {
          if (e.button !== 2) { // 不是右键
            window.parent.postMessage({
              type: 'pdf-mousedown',
              timestamp: Date.now()
            }, '*')
          }
        })
      })()
    `

    const scriptEl = iframeDocument.createElement('script')
    scriptEl.textContent = script
    iframeDocument.head.appendChild(scriptEl)

    console.log('PDF选择监听脚本已注入')
  } catch (error) {
    console.error('注入PDF监听脚本失败:', error)
  }
}

// 监听PDF iframe的消息
function listenPDFEditorMessage() {
  window.addEventListener('message', (event: MessageEvent<PDFMessageData>) => {
    // 验证消息来源
    if (event.source !== pdfIframe.value?.contentWindow) return

    const data = event.data

    switch (data.type) {
      case 'pdf-text-selected':
        handlePDFTextSelected(data)
        break

      case 'pdf-contextmenu-selected':
        handlePDFContextMenuSelected(data)
        break

      case 'pdf-text-cleared':
        handlePDFTextCleared()
        break

      case 'pdf-mousedown':
        hideFloatingToolbar()
        break

      case 'initialized':
        console.log('PDF查看器已初始化')
        break
    }
  })

  // 原有的elasticpdf消息监听（保持兼容）
  window.addEventListener('message', (e: MessageEvent<PDFMessageData>) => {
    if (e.data.source !== 'elasticpdf') {
      return
    }

    if (e.data.function_name === 'downloadPDF') {
      const file_name = e.data.content?.file_name
      const pdf_base64 = e.data.content?.pdf_base64
      postService('upload-pdf-data', {
        file_name: file_name,
        file_id: '123ddasfsdffads',
        file_data: pdf_base64,
      })
    }

    if (e.data.function_name === 'annotationsModified') {
      const this_data = window.elasticpdf_viewer?.pdfAnnotation.outputAnnotations()
      const annotation_content = JSON.stringify(this_data?.file_annotation)
      const file_name = this_data?.file_name
      postService('upload-annotation-data', {
        file_name: file_name,
        file_id: '123ddasfsdffads',
        file_annotation: annotation_content,
      })
    }

    if (e.data.function_name === 'pdfLoaded') {
      console.log('PDF加载成功')
    }
  })
}

// 处理PDF文本选择
function handlePDFTextSelected(data: PDFMessageData) {
  if (data.text && data.text.trim() && pdfIframe.value) {
    selectedText.value = data.text.trim()
    currentPage.value = data.page || 1

    // 更新悬浮工具栏文本预览
    floatingTextPreview.value =
      data.text.length > 30 ? data.text.substring(0, 30) + '...' : data.text

    // 显示悬浮工具栏
    showFloatingToolbar.value = true
    toolbarOpacity.value = 1

    // 设置悬浮工具栏位置
    if (data.mouseX !== undefined && data.mouseY !== undefined) {
      const iframeRect = pdfIframe.value.getBoundingClientRect()
      floatingX.value = iframeRect.left + data.mouseX
      floatingY.value = iframeRect.top + data.mouseY
    } else {
      floatingX.value = mouseX
      floatingY.value = mouseY
    }

    // 调整位置，确保不会超出屏幕
    nextTick(() => {
      adjustFloatingToolbarPosition()
    })

    // 5秒后自动隐藏悬浮工具栏
    resetFloatingToolbarTimer()
  }
}

// 处理右键时的选择
function handlePDFContextMenuSelected(data: PDFMessageData) {
  if (data.text && data.text.trim() && pdfIframe.value) {
    selectedText.value = data.text.trim()
    if (data.page) {
      currentPage.value = data.page
    }

    // 更新菜单位置为iframe内的坐标
    if (data.clientX && data.clientY) {
      const iframeRect = pdfIframe.value.getBoundingClientRect()
      menuX.value = iframeRect.left + data.clientX
      menuY.value = iframeRect.top + data.clientY
    }
  }
}

// 处理文本清除
function handlePDFTextCleared() {
  selectedText.value = ''
}

// 调整悬浮工具栏位置，确保不会超出屏幕
function adjustFloatingToolbarPosition() {
  const toolbar = document.querySelector('.floating-toolbar') as HTMLElement
  if (!toolbar) return

  const rect = toolbar.getBoundingClientRect()
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  let adjustedX = floatingX.value
  let adjustedY = floatingY.value - 50 // 默认显示在选择上方

  // 检查右侧边界
  if (rect.right > windowWidth) {
    adjustedX = windowWidth - rect.width - 10
  }

  // 检查左侧边界
  if (adjustedX < 10) {
    adjustedX = 10
  }

  // 检查上侧边界
  if (adjustedY < 10) {
    adjustedY = floatingY.value + 20 // 显示在选择下方
  }

  // 检查下侧边界
  if (adjustedY + rect.height > windowHeight - 10) {
    adjustedY = windowHeight - rect.height - 10
  }

  floatingX.value = adjustedX
  floatingY.value = adjustedY
}

// 重置悬浮工具栏定时器
function resetFloatingToolbarTimer() {
  if (floatingToolbarTimer) {
    clearTimeout(floatingToolbarTimer)
  }
  floatingToolbarTimer = setTimeout(() => {
    if (!isToolbarHovered.value) {
      hideFloatingToolbar()
    }
  }, 5000)
}

// 悬浮工具栏鼠标进入
function onToolbarMouseEnter() {
  isToolbarHovered.value = true
  toolbarOpacity.value = 1
  if (floatingToolbarTimer) {
    clearTimeout(floatingToolbarTimer)
  }
}

// 悬浮工具栏鼠标离开
function onToolbarMouseLeave() {
  isToolbarHovered.value = false
  resetFloatingToolbarTimer()
}

// 隐藏悬浮工具栏
function hideFloatingToolbar() {
  showFloatingToolbar.value = false
  if (floatingToolbarTimer) {
    clearTimeout(floatingToolbarTimer)
  }
}

// 显示快捷提示
function showToast(message: string, duration = 2000) {
  toastMessage.value = message
  showQuickToast.value = true

  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  toastTimer = setTimeout(() => {
    showQuickToast.value = false
  }, duration)
}

// 悬浮工具栏操作函数
function quickCopy() {
  copyToClipboard()
  hideFloatingToolbar()
}

function quickAskAI() {
  askAI()
  hideFloatingToolbar()
}

function quickSendToChat() {
  sendToChat()
  hideFloatingToolbar()
}

// 右键菜单处理
function handleContextMenu(event: MouseEvent) {
  event.preventDefault()

  // 如果是从PDF iframe触发的右键，位置已经由handlePDFContextMenuSelected设置
  // 否则使用主窗口的右键位置
  if (pdfIframe.value && event.target instanceof Node) {
    const targetElement = event.target as HTMLElement
    if (!targetElement.closest('iframe') || targetElement.closest('iframe') !== pdfIframe.value) {
      menuX.value = event.clientX
      menuY.value = event.clientY
    }
  } else {
    menuX.value = event.clientX
    menuY.value = event.clientY
  }

  // 调整菜单位置，确保不会超出屏幕
  nextTick(() => {
    const menu = document.querySelector('.context-menu') as HTMLElement
    if (menu) {
      const rect = menu.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      if (rect.right > windowWidth) {
        menuX.value = windowWidth - rect.width - 10
      }
      if (rect.bottom > windowHeight) {
        menuY.value = windowHeight - rect.height - 10
      }
    }
  })

  showContextMenu.value = true
  hideFloatingToolbar()
}

// 隐藏右键菜单
function hideContextMenu() {
  showContextMenu.value = false
}

// 复制到剪贴板
async function copyToClipboard() {
  if (!selectedText.value.trim()) {
    alert('请先选中文本')
    return
  }

  try {
    await navigator.clipboard.writeText(selectedText.value)
    showToast('文本已复制到剪贴板')
    hideContextMenu()
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = selectedText.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('文本已复制')
    hideContextMenu()
  }
}

// AI问答
function askAI() {
  if (!selectedText.value.trim()) {
    alert('请先选中文本')
    return
  }

  const pageInfo = currentPage.value > 1 ? `（第${currentPage.value}页）` : ''
  const question = `🤖 关于这段话${pageInfo}："${selectedText.value}"\n\n请问这是什么意思？`
  chatSidebarRef.value?.sendMessage(question)
  showToast('已发送到AI讨论区')
  hideContextMenu()
}

// 发送到讨论区
function sendToChat() {
  if (!selectedText.value.trim()) {
    alert('请先选中文本')
    return
  }

  const pageInfo = currentPage.value > 1 ? `（第${currentPage.value}页）` : ''
  const message = `📄 引用文本${pageInfo}：\n"${selectedText.value}"`
  chatSidebarRef.value?.sendMessage(message)
  showToast('已发送到讨论区')
  hideContextMenu()
}

// 侧边栏折叠切换
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  hideContextMenu()
}

// 设置键盘快捷键
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return
    }

    // ESC键隐藏悬浮工具栏和右键菜单
    if (e.key === 'Escape') {
      hideFloatingToolbar()
      hideContextMenu()
    }

    // Ctrl/Cmd + C：复制选中文本
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      if (selectedText.value.trim()) {
        e.preventDefault()
        copyToClipboard()
      }
    }

    // Ctrl/Cmd + Shift + A：AI问答
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'a') {
      e.preventDefault()
      if (selectedText.value.trim()) {
        askAI()
      }
    }

    // Ctrl/Cmd + Shift + S：发送到讨论区
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
      e.preventDefault()
      if (selectedText.value.trim()) {
        sendToChat()
      }
    }
  })
}

// 初始化PDF编辑器
function initialPDFEditor() {
  const iframeElement = document.getElementById('elasticpdf-iframe') as HTMLIFrameElement
  if (!iframeElement) return

  const iframeWindow = iframeElement.contentWindow
  if (!iframeWindow) return
  let pdf_url = props.pdfUrl

  if (!pdf_url) {
    emit('pdf-load-error')
    return
  }

  try {
    // 调用iframe中的初始化函数
    ;(iframeWindow as any).initialApp?.({
      language: 'zh-cn',
      read_only: true,
      show_annotation_list: true,
      pdf_url: pdf_url,
      member_info: {
        id: 'elasticpdf_id',
        name: 'elasticpdf',
      },
    })
  } catch (error) {
    console.error('PDF初始化失败:', error)
    emit('pdf-load-error')
  }
}

// 暴露方法给父组件
defineExpose({
  toggleSidebar,
  sendMessage: (content: string) => {
    if (chatSidebarRef.value) {
      chatSidebarRef.value.sendMessage(content)
    }
  },
})

async function postService(url: string, data: any) {
  console.log(`Posting to ${url}:`, data)
  // 这里应该是实际的API调用
  return null
}

const emit = defineEmits<{
  (e: 'pdf-loaded'): void
  (e: 'pdf-load-error'): void
}>()
</script>

<style scoped>
/* 悬浮工具栏样式 */
.floating-toolbar {
  position: fixed;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10000;
  animation: floatIn 0.2s ease;
  border: 1px solid #e0e0e0;
  min-width: 200px;
  max-width: 300px;
  backdrop-filter: blur(10px);
  transition: opacity 0.3s ease;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.toolbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.toolbar-text-preview {
  font-size: 12px;
  color: #666;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  padding-right: 8px;
}

.toolbar-close {
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toolbar-close:hover {
  background: #f0f0f0;
  color: #666;
}

.toolbar-buttons {
  display: flex;
  padding: 8px 12px 10px 12px;
  gap: 6px;
}

.toolbar-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
}

.toolbar-btn:hover {
  background: rgba(139, 69, 19, 0.9) !important;
  border-color: rgba(139, 69, 19, 1) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.toolbar-btn:hover .btn-icon,
.toolbar-btn:hover .btn-text {
  color: white !important;
}

.btn-icon {
  font-size: 16px;
  margin-bottom: 4px;
  color: #666;
  transition: color 0.2s;
}

.btn-text {
  font-size: 11px;
  font-weight: 500;
  color: #666;
  transition: color 0.2s;
}

/* 快捷提示样式 */
.quick-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #667eea;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  z-index: 10001;
  animation:
    toastIn 0.3s ease,
    toastOut 0.3s ease 1.7s;
  font-size: 14px;
  max-width: 300px;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(20px);
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
    transform: translateY(20px);
  }
}

/* PDF容器样式 */
.pdf-container {
  display: flex;
  height: calc(100vh - 8vh -15px);
  width: 100%;
  overflow: hidden;
  position: relative;
}

.pdf-viewer {
  flex: 1;
  height: 100%;
  background: #f5f5f5;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.pdf-viewer.full-width {
  margin-right: 0;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  z-index: 10000;
  background: white;
  border-radius: 8px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 280px;
  max-width: 400px;
  border: 1px solid #e0e0e0;
  animation: menuAppear 0.15s ease-out;
  overflow: hidden;
}

@keyframes menuAppear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.menu-title {
  font-size: 14px;
  font-weight: 600;
}

.menu-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.menu-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.selected-text-preview {
  padding: 12px 16px;
  background: #f8f9fa;
  color: #495057;
  font-size: 13px;
  line-height: 1.5;
  border-bottom: 1px solid #e9ecef;
  max-height: 120px;
  overflow-y: auto;
  font-style: italic;
  border-left: 3px solid #667eea;
  margin: 0 8px;
  border-radius: 0 4px 4px 0;
}

.menu-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
  font-size: 14px;
  animation: slideIn 0.2s ease-out;
  animation-fill-mode: both;
}

.menu-item:nth-child(1) {
  animation-delay: 0.05s;
}
.menu-item:nth-child(2) {
  animation-delay: 0.1s;
}
.menu-item:nth-child(3) {
  animation-delay: 0.15s;
}
.menu-item:nth-child(4) {
  animation-delay: 0.2s;
}
.menu-item:nth-child(5) {
  animation-delay: 0.25s;
}

.menu-item:hover {
  background: rgba(139, 69, 19, 0.1) !important; /* 浅色背景 */
  color: rgba(139, 69, 19, 1);
}

.menu-item:active {
  background: #e0e0e0;
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-text {
  flex: 1;
}

.context-menu-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: transparent;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 选中文本高亮效果 */
::selection {
  background: rgba(102, 126, 234, 0.3);
}

/* iframe样式 */
#elasticpdf-iframe {
  /* 使得占据全屏 */
  height: calc(100vh - 100px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .context-menu {
    min-width: 250px;
    max-width: 90vw;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%);
    max-height: 80vh;
    overflow-y: auto;
  }

  .pdf-container {
    flex-direction: column-reverse;
  }
}
</style>
