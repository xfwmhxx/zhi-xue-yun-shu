<template>
  <div class="resume-wrapper fade-in">
    <div v-if="isLoading" class="loading-state">加载中...</div>
    <div v-else>
      <!-- 操作工具栏 -->
      <div class="resume-toolbar">
        <div class="status-info">
          <span v-if="isEditing" class="mode-tag editing"
            ><i class="fas fa-pen-nib"></i> 修缮模式</span
          >
          <span v-else class="mode-tag viewing"><i class="fas fa-eye"></i> 预览模式</span>
        </div>
        <div class="tool-buttons">
          <button class="tool-btn" @click="toggleEdit">
            {{ isEditing ? '完成修缮' : '修缮简历' }}
          </button>
          <button class="tool-btn ai-analyze" @click="showAIAnalyzer = true">
            <i class="fas fa-robot"></i> AI智能分析
          </button>
          <button class="tool-btn download" @click="downloadPDF" :disabled="isEditing">
            <i class="fas fa-file-pdf"></i> 导出卷轴
          </button>
        </div>
      </div>

      <!-- 简历主体 -->
      <div class="resume-paper" ref="resumeTarget" :class="{ 'is-editing-paper': isEditing }">
        <div class="paper-inner-border"></div>
        <div class="corner-decoration"></div>

        <!-- 1. 头部信息 -->
        <header class="resume-header">
          <div class="header-left">
            <input v-if="isEditing" v-model="resumeData.name" class="edit-input name-input" />
            <h1 v-else class="user-name">{{ resumeData.name }}</h1>

            <input v-if="isEditing" v-model="resumeData.motto" class="edit-input motto-input" />
            <p v-else class="user-motto">“{{ resumeData.motto }}”</p>
          </div>
          <div class="header-right">
            <div class="contact-info">
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <input
                  v-if="isEditing"
                  v-model="resumeData.contact.email"
                  class="edit-input mini"
                />
                <span v-else>{{ resumeData.contact.email }}</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-phone"></i>
                <input
                  v-if="isEditing"
                  v-model="resumeData.contact.phone"
                  class="edit-input mini"
                />
                <span v-else>{{ resumeData.contact.phone }}</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-map-marker-alt"></i>
                <input
                  v-if="isEditing"
                  v-model="resumeData.contact.location"
                  class="edit-input mini"
                />
                <span v-else>{{ resumeData.contact.location }}</span>
              </div>
            </div>
          </div>
        </header>

        <div class="resume-body">
          <!-- 动态模块渲染 -->
          <div v-for="(section, sIdx) in resumeData.sections" :key="sIdx" class="section-block">
            <div class="section-title-wrap">
              <input v-if="isEditing" v-model="section.title" class="edit-input title-input" />
              <h3 v-else class="section-title">{{ section.title }}</h3>
              <button v-if="isEditing" class="del-section-btn" @click="removeSection(sIdx)">
                删除模块
              </button>
            </div>

            <!-- 列表型布局 -->
            <div v-if="section.layout === 'list'" class="list-content">
              <div v-for="(_, iIdx) in section.items" :key="iIdx" class="list-item-wrap">
                <!-- 添加类型守卫解决 TS 报错 -->
                <textarea
                  v-if="isEditing"
                  v-model="section.items[iIdx] as string"
                  class="edit-textarea list-textarea"
                ></textarea>
                <div v-else class="list-text">
                  <i v-if="section.title.includes('荣誉')" class="fas fa-award"></i>
                  {{ section.items[iIdx] }}
                </div>
                <button v-if="isEditing" class="item-ctrl-btn del" @click="removeItem(sIdx, iIdx)">
                  ×
                </button>
              </div>
              <button v-if="isEditing" class="item-ctrl-btn add" @click="addItem(sIdx)">
                + 添加条目
              </button>
            </div>

            <!-- 时间轴型布局 -->
            <div v-if="section.layout === 'timeline'" class="timeline-content">
              <div v-for="(_, tIdx) in section.items" :key="tIdx" class="timeline-card">
                <template v-if="typeof section.items[tIdx] === 'object'">
                  <div class="item-header">
                    <input
                      v-if="isEditing"
                      v-model="(section.items[tIdx] as TimelineItem).main"
                      class="edit-input bold"
                    />
                    <span v-else class="main-text">{{
                      (section.items[tIdx] as TimelineItem).main
                    }}</span>

                    <input
                      v-if="isEditing"
                      v-model="(section.items[tIdx] as TimelineItem).date"
                      class="edit-input date"
                    />
                    <span v-else class="date-text">{{
                      (section.items[tIdx] as TimelineItem).date
                    }}</span>
                  </div>

                  <input
                    v-if="isEditing"
                    v-model="(section.items[tIdx] as TimelineItem).sub"
                    class="edit-input sub"
                  />
                  <p v-else class="sub-text">{{ (section.items[tIdx] as TimelineItem).sub }}</p>

                  <textarea
                    v-if="isEditing"
                    v-model="(section.items[tIdx] as TimelineItem).desc"
                    class="edit-textarea timeline-textarea"
                    placeholder="详细描述..."
                  ></textarea>
                  <p v-else class="desc-text">{{ (section.items[tIdx] as TimelineItem).desc }}</p>
                </template>

                <button v-if="isEditing" class="item-ctrl-btn del" @click="removeItem(sIdx, tIdx)">
                  删除此项
                </button>
              </div>
              <button v-if="isEditing" class="item-ctrl-btn add" @click="addItem(sIdx)">
                + 添加经历
              </button>
            </div>
          </div>

          <!-- 添加新模块 -->
          <div v-if="isEditing" class="add-section-area">
            <button class="add-section-btn" @click="addNewSection('list')">
              <i class="fas fa-th-list"></i> 新增列表模块
            </button>
            <button class="add-section-btn" @click="addNewSection('timeline')">
              <i class="fas fa-stream"></i> 新增经历模块
            </button>
          </div>
        </div>

        <!-- 底部印章 -->
        <div class="resume-footer-decor">
          <div class="seal-mark">杏林精选</div>
          <div class="ink-seal">履</div>
        </div>
      </div>
    </div>
    <!-- AI分析弹窗组件 -->
    <AIAnalyzer v-if="showAIAnalyzer" :resume-data="resumeData" @close="showAIAnalyzer = false" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getResume, updateResume } from '@/api/resume'
import { getUserId as getStoredUserId } from '@/utils/storage'
import { message } from '@/components/Notification'
// @ts-ignore
import html2pdf from 'html2pdf.js'
// 在现有 import 后面添加
import AIAnalyzer from './ResumeSection/AIAnalyzer.vue'

// --- 类型定义 ---
interface TimelineItem {
  main: string
  sub: string
  date: string
  desc: string
}

interface Section {
  title: string
  layout: 'list' | 'timeline'
  items: (string | TimelineItem)[]
}

interface ResumeData {
  name: string
  motto: string
  contact: {
    email: string
    phone: string
    location: string
  }
  sections: Section[]
}

// AI分析简历
const showAIAnalyzer = ref(false)

// --- 响应式数据 ---
const isEditing = ref(false)
const resumeTarget = ref<HTMLElement | null>(null)

const resumeData = ref<ResumeData>({
  name: '',
  motto: '勤求古训，博采众方',
  contact: {
    email: '',
    phone: '',
    location: '',
  },
  sections: [
    {
      title: '核心技能',
      layout: 'list',
      items: ['', '', '', ''],
    },
    {
      title: '教育背景',
      layout: 'timeline',
      items: [
        {
          main: '',
          sub: '',
          date: '',
          desc: '',
        },
      ],
    },
    {
      title: '研习经历',
      layout: 'timeline',
      items: [
        {
          main: '',
          sub: '',
          date: '',
          desc: '',
        },
      ],
    },
  ],
})

const userId = ref<number | null>(null)
const isLoading = ref(true)
// --- 逻辑方法 ---

// 修改 loadResume 函数
const loadResume = async () => {
  const userIdStr = getStoredUserId()
  if (!userIdStr) {
    message.error('身份错误', { note: '请先登录', duration: 2000 })
    return
  }

  const id = parseInt(userIdStr)
  userId.value = id
  isLoading.value = true

  try {
    const result = await getResume(id)
    if (result.code === 200 && result.data) {
      resumeData.value = result.data
    }
  } catch (error) {
    console.error('加载简历失败:', error)
    message.error('加载失败', { note: '无法加载简历数据', duration: 2000 })
  } finally {
    isLoading.value = false
  }
}
const toggleEdit = async () => {
  if (isEditing.value) {
    if (!userId.value) {
      message.error('错误', { note: '用户未登录', duration: 3000 })
      return
    }

    try {
      const result = await updateResume(userId.value, resumeData.value)
      if (result.code === 200) {
        message.success('已更新', {
          note: '简历信息已更新',
          duration: 3000,
        })
      } else {
        message.error('错误', {
          note: '简历更新失败',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('更新简历失败:', error)
      message.error('错误', {
        note: '简历更新失败',
        duration: 3000,
      })
    }
  }
  isEditing.value = !isEditing.value
}

const addItem = (sIdx: number) => {
  const section = resumeData.value.sections[sIdx]
  if (!section) return
  if (section.layout === 'list') {
    section.items.push('新条目内容')
  } else {
    section.items.push({
      main: '新项标题',
      sub: '副标题/职位',
      date: '时间区间',
      desc: '详细描述内容',
    })
  }
}

const removeItem = (sIdx: number, iIdx: number) => {
  const section = resumeData.value.sections[sIdx]
  if (!section) return
  section.items.splice(iIdx, 1)
}

const addNewSection = (layout: 'list' | 'timeline') => {
  resumeData.value.sections.push({
    title: '新模块名称',
    layout: layout,
    items:
      layout === 'list'
        ? ['新内容']
        : [{ main: '标题', sub: '副标题', date: '时间', desc: '描述' }],
  })
}

const removeSection = (sIdx: number) => {
  if (window.confirm('确定要删除整个模块吗？')) {
    resumeData.value.sections.splice(sIdx, 1)
  }
}

// 导出 PDF (已优化：无白边全铺满，禁止模块被跨页夹断)
const downloadPDF = () => {
  const element = resumeTarget.value
  if (!element) return

  const opt = {
    margin: 0, // 修改为0，去除四周白边，让简历背景铺满
    filename: `${resumeData.value.name}_简历卷轴.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      windowWidth: element.scrollWidth, // 保证宽度按当前DOM正确截取
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    // 强制开启分页控制，让html2pdf遵守CSS的 page-break-inside 规则
    pagebreak: { mode: ['css', 'legacy'] },
  }
  html2pdf().set(opt).from(element).save()
}

onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  loadResume()
})
</script>

<style scoped>
.resume-wrapper {
  width: 100%;
  padding-bottom: 50px;
  font-family: 'No3', 'STKaiti', 'SimSun', serif;
}

/* 工具栏样式升级 */
.resume-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 25px;
  border-radius: 16px;
  border: 1px solid rgba(166, 124, 82, 0.3);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.mode-tag {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 20px;
  font-weight: 400;
  white-space: nowrap;
}
.mode-tag.editing {
  background: #fff1f0;
  color: #cf1322;
  border: 1px solid #ffa39e;
}
.mode-tag.viewing {
  background: #f6ffed;
  color: #389e0d;
  border: 1px solid #b7eb8f;
}

.tool-buttons {
  display: flex;
  gap: 12px;
  white-space: nowrap;
}

.tool-btn {
  padding: 10px 24px;
  border-radius: 25px;
  border: 1px solid #a67c52;
  background: #fff;
  color: #a67c52;
  cursor: pointer;
  font-family: 'No3';
  transition: all 0.3s;
  font-weight: 400;
  font-size: 20px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.tool-btn:hover {
  background: #a67c52;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(166, 124, 82, 0.3);
}
.tool-btn.download {
  background: #3d2b1f;
  color: #fff;
  border-color: #3d2b1f;
}
.tool-btn.download:hover {
  background: #5a4130;
  box-shadow: 0 4px 12px rgba(61, 43, 31, 0.3);
}
.tool-btn.download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.tool-btn.download:disabled:hover {
  background: #3d2b1f;
  color: #fff;
}

/* 在 .tool-btn.download 后面添加 */
.tool-btn.ai-analyze {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
}
.tool-btn.ai-analyze:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 简历纸张 */
.resume-paper {
  background: #fffdf7;
  border: 1px solid rgba(166, 124, 82, 0.4);
  padding: 50px 60px;
  position: relative;
  box-shadow: 0 12px 50px rgba(0, 0, 0, 0.1);
  color: #3d2b1f;
  transition: all 0.3s;
  min-height: 800px;
}

.is-editing-paper {
  border-color: #cf1322;
  box-shadow: 0 12px 50px rgba(207, 19, 34, 0.15);
}

.paper-inner-border {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border: 1px solid rgba(166, 124, 82, 0.15);
  pointer-events: none;
}

.corner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  margin: auto;
  background:
    linear-gradient(to bottom, #a67c52 2px, transparent 2px) 0 0,
    linear-gradient(to right, #a67c52 2px, transparent 2px) 0 0,
    linear-gradient(to bottom, #a67c52 2px, transparent 2px) 100% 0,
    linear-gradient(to left, #a67c52 2px, transparent 2px) 100% 0,
    linear-gradient(to top, #a67c52 2px, transparent 2px) 0 100%,
    linear-gradient(to right, #a67c52 2px, transparent 2px) 0 100%,
    linear-gradient(to top, #a67c52 2px, transparent 2px) 100% 100%,
    linear-gradient(to left, #a67c52 2px, transparent 2px) 100% 100%;
  background-repeat: no-repeat;
  background-size: 15px 15px;
  opacity: 0.4;
  pointer-events: none;
}

/* 输入框优化 */
.edit-input {
  border: none;
  background: rgba(166, 124, 82, 0.05);
  border-bottom: 2px dashed #a67c52;
  padding: 8px 12px;
  font-family: inherit;
  color: #cf1322;
  width: 100%;
  outline: none;
  transition: all 0.3s;
  font-size: 16px;
  border-radius: 4px 4px 0 0;
  margin: 2px 0;
}
.edit-input:focus {
  background: rgba(166, 124, 82, 0.1);
  border-bottom: 2px solid #cf1322;
}
.edit-input.mini {
  font-size: 14px;
  padding: 6px 10px;
  width: 180px;
}
.name-input {
  font-size: 28px;
  font-weight: bold;
  padding: 12px 16px;
  background: rgba(166, 124, 82, 0.08);
  border: 2px dashed #a67c52;
  border-radius: 8px;
}
.motto-input {
  font-size: 18px;
  font-style: italic;
  color: #8b7355;
  padding: 10px 14px;
  border: 1px dashed #8b7355;
  border-radius: 6px;
  background: rgba(139, 115, 85, 0.05);
}
.title-input {
  font-size: 20px;
  font-weight: bold;
  color: #a67c52;
  background: rgba(166, 124, 82, 0.1);
  padding: 10px 15px;
  border: 1px dashed #a67c52;
  border-radius: 6px;
  margin-right: 15px;
}
.edit-input.bold {
  font-size: 19px;
  font-weight: bold;
  color: #3d2b1f;
  padding: 8px 12px;
  border-bottom: 2px dotted #a67c52;
}
.edit-input.date {
  font-size: 14px;
  color: #8b7355;
  font-style: italic;
  width: 140px;
  text-align: right;
  border-bottom: 1px dotted #8b7355;
}
.edit-input.sub {
  font-size: 16px;
  color: #a67c52;
  font-weight: bold;
  padding: 8px 12px;
  border-bottom: 1px dashed #a67c52;
  background: rgba(166, 124, 82, 0.05);
  width: 100%;
  box-sizing: border-box;
}

/* 文本域优化 */
.edit-textarea {
  border: none;
  background: rgba(166, 124, 82, 0.05);
  border: 1px dashed #a67c52;
  padding: 12px 15px;
  font-family: inherit;
  color: #5d4632;
  width: 100%;
  outline: none;
  transition: all 0.3s;
  font-size: 15px;
  line-height: 1.6;
  border-radius: 8px;
  min-height: 60px;
  resize: vertical;
  margin-top: 8px;
}
.edit-textarea:focus {
  background: rgba(166, 124, 82, 0.1);
  border: 1px solid #cf1322;
  box-shadow: 0 0 0 2px rgba(207, 19, 34, 0.1);
}
.list-textarea {
  flex: 1;
  min-height: 40px;
  font-size: 15px;
  padding: 10px 14px;
  border: 1px solid #d9c7b0;
  background: #fff;
  border-radius: 6px;
  margin-right: 8px;
}
.timeline-textarea {
  background: rgba(255, 253, 247, 0.8);
  border: 1px dashed #8b7355;
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 6px;
  margin-top: 8px;
  width: 100%;
  box-sizing: border-box;
  min-height: 80px;
}

/* 头部样式及防分页 */
.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid #a67c52;
  padding-bottom: 25px;
  margin-bottom: 35px;
  flex-wrap: wrap;
  gap: 20px;
  page-break-inside: avoid; /* 防头部被切断 */
  break-inside: avoid;
}
.header-left {
  flex: 1;
  min-width: 300px;
}
.header-right {
  flex-shrink: 0;
}
.user-name {
  font-size: 48px;
  letter-spacing: 6px;
  margin: 0 0 10px 0;
  font-weight: bold;
  color: #3d2b1f;
  line-height: 1.2;
}
.user-motto {
  font-size: 20px;
  color: #8b7355;
  font-style: italic;
  margin: 0;
  line-height: 1.4;
}

.contact-info {
  text-align: right;
  min-width: 250px;
}
.contact-item {
  font-size: 15px;
  margin-bottom: 8px;
  color: #5d4632;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  white-space: nowrap;
}
.contact-item i {
  color: #a67c52;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}
.contact-item span {
  word-break: break-all;
  white-space: normal;
  text-align: right;
  max-width: 200px;
}

/* 模块布局及防分页（核心修复点） */
.section-block {
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(166, 124, 82, 0.1);
  page-break-inside: avoid; /* 防止整个大模块跨页 */
  break-inside: avoid; /* 兼容现代浏览器写法 */
}
.section-block:last-child {
  border-bottom: none;
  margin-bottom: 20px;
}
.section-title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 6px solid #a67c52;
  padding: 12px 20px;
  margin-bottom: 25px;
  background: linear-gradient(to right, rgba(166, 124, 82, 0.08), transparent);
  border-radius: 0 8px 8px 0;
  min-height: 52px;
}
.section-title {
  font-size: 30px;
  margin: 0;
  letter-spacing: 3px;
  color: #a67c52;
  font-weight: 500;
  line-height: 1.3;
}

/* 列表型布局 */
.list-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.list-item-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 44px;
  gap: 10px;
  page-break-inside: avoid; /* 防单行列表跨页 */
  break-inside: avoid;
}
.list-text {
  background: rgba(166, 124, 82, 0.08);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 24px;
  border: 1px solid rgba(166, 124, 82, 0.15);
  flex: 1;
  min-height: 44px;
  display: flex;
  align-items: center;
  word-break: break-word;
  line-height: 1.5;
}
.list-text i {
  color: #b71c1c;
  margin-right: 10px;
  flex-shrink: 0;
}

/* 时间轴布局 */
.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.timeline-card {
  position: relative;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 253, 247, 0.7);
  border: 1px solid rgba(166, 124, 82, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  page-break-inside: avoid; /* 防止时间轴内卡片内容上下切断 */
  break-inside: avoid;
}
.timeline-card:hover {
  box-shadow: 0 6px 20px rgba(166, 124, 82, 0.15);
  border-color: rgba(166, 124, 82, 0.4);
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}
.main-text {
  font-size: 30px;
  font-weight: bold;
  color: #3d2b1f;
  line-height: 1.3;
}
.date-text {
  font-size: 15px;
  color: #8b7355;
  font-style: italic;
  white-space: nowrap;
}
.sub-text {
  color: #a67c52;
  font-weight: 400;
  margin-bottom: 15px;
  font-size: 30px;
  line-height: 1.4;
}
.desc-text {
  font-size: 25px;
  line-height: 1.8;
  text-align: justify;
  color: #5d4632;
  margin: 0;
  padding-top: 8px;
  border-top: 1px solid rgba(166, 124, 82, 0.1);
}

/* 交互按钮样式优化 */
.item-ctrl-btn {
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
  font-weight: bold;
  white-space: nowrap;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-ctrl-btn.add {
  background: #fff;
  color: #a67c52;
  border: 2px dashed #a67c52;
  width: 100%;
  margin-top: 15px;
  font-size: 14px;
  padding: 12px;
}
.item-ctrl-btn.add:hover {
  background: #a67c52;
  color: #fff;
  border-style: solid;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(166, 124, 82, 0.3);
}
.item-ctrl-btn.del {
  background: #fff1f0;
  color: #cf1322;
  border: 1px solid #ffa39e;
  font-size: 12px;
  padding: 6px 12px;
  min-height: 32px;
  white-space: nowrap;
}
.item-ctrl-btn.del:hover {
  background: #ffccc7;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(207, 19, 34, 0.2);
}

.add-section-area {
  margin-top: 50px;
  padding: 30px;
  border: 3px dashed rgba(166, 124, 82, 0.4);
  display: flex;
  gap: 20px;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255, 253, 247, 0.7);
  flex-wrap: wrap;
}
.add-section-btn {
  padding: 16px 30px;
  background: #fff;
  color: #a67c52;
  border: 2px solid #a67c52;
  cursor: pointer;
  border-radius: 30px;
  font-family: 'No3';
  font-weight: bold;
  transition: all 0.3s;
  font-size: 16px;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  white-space: nowrap;
  min-height: 54px;
}
.add-section-btn:hover {
  background: #a67c52;
  color: #fff;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(166, 124, 82, 0.3);
}
.add-section-btn i {
  font-size: 18px;
}

.del-section-btn {
  background: #cf1322;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.del-section-btn:hover {
  background: #d9363e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(207, 19, 34, 0.3);
}

/* 印章及防分页 */
.resume-footer-decor {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 60px;
  padding-top: 30px;
  border-top: 2px dashed rgba(166, 124, 82, 0.3);
  page-break-inside: avoid; /* 防止印章区域被切断 */
  break-inside: avoid;
}
.seal-mark {
  border: 3px solid #b71c1c;
  color: #b71c1c;
  padding: 8px 20px;
  font-weight: 400;
  font-size: 18px;
  letter-spacing: 4px;
  border-radius: 4px;
  background: rgba(255, 253, 247, 0.8);
  box-shadow: 2px 2px 0 rgba(183, 28, 28, 0.1);
}
.ink-seal {
  width: 80px;
  height: 80px;
  background: #b71c1c;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 48px;
  letter-spacing: 2px;
  border-radius: 4px;
  box-shadow: 4px 4px 0 rgba(183, 28, 28, 0.3);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
}
.ink-seal:hover {
  transform: rotate(5deg) scale(1.05);
  box-shadow: 6px 6px 0 rgba(183, 28, 28, 0.4);
}

/* 导出 PDF 时的隐藏处理和页面优化 */
@media print {
  .resume-toolbar,
  .item-ctrl-btn,
  .add-section-area,
  .del-section-btn {
    display: none !important;
  }
  .resume-paper {
    border: none !important;
    box-shadow: none !important;
    /* 保持 padding 以作为纯内容的间距，而整体背景因为没有 margin 会完美贴边铺满 */
    padding: 30px 40px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .paper-inner-border,
  .corner-decoration {
    display: none;
  }
  .ink-seal {
    box-shadow: none;
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .resume-paper {
    padding: 30px 20px;
  }
  .resume-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .contact-info {
    text-align: left;
    width: 100%;
  }
  .contact-item {
    justify-content: flex-start;
  }
  .contact-item span {
    text-align: left;
  }
  .tool-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  .add-section-area {
    flex-direction: column;
    align-items: center;
  }
  .add-section-btn {
    width: 100%;
  }
  .edit-input.mini {
    width: 100%;
  }
  .edit-input.date {
    width: 100%;
    text-align: left;
  }
  .item-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .section-title-wrap {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .del-section-btn {
    align-self: flex-end;
  }
}
</style>
