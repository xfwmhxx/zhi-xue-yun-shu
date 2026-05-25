<template>
  <div class="ai-video-manage-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <i class="fas fa-video"></i>
      <h1>AI视频管理</h1>
      <div class="header-badge"><i class="fas fa-robot"></i> AI智能生成 · 杏林讲学</div>
      <button class="btn-create" @click="openCreateVideo">
        <i class="fas fa-plus"></i> 上传视频
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-mini-card">
        <i class="fas fa-video"></i>
        <div class="stat-num">{{ totalVideos }}</div>
        <div class="stat-label">视频总数</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-eye"></i>
        <div class="stat-num">{{ totalViews }}</div>
        <div class="stat-label">总观看数</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-comment"></i>
        <div class="stat-num">{{ totalComments }}</div>
        <div class="stat-label">总评论数</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-chart-line"></i>
        <div class="stat-num">+23%</div>
        <div class="stat-label">本周增长</div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-area">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="搜索视频标题/讲师..." v-model="searchKeyword" />
      </div>
      <div class="filter-area">
        <select v-model="filterCategory">
          <option value="">全部分类</option>
          <option value="中医基础">中医基础</option>
          <option value="经络穴位">经络穴位</option>
          <option value="方剂学">方剂学</option>
          <option value="诊断学">诊断学</option>
          <option value="针灸推拿">针灸推拿</option>
          <option value="经典解读">经典解读</option>
        </select>
        <select v-model="sortBy">
          <option value="updatedAt">按更新时间</option>
          <option value="views">按观看数</option>
          <option value="comments">按评论数</option>
        </select>
        <button class="filter-btn" @click="resetFilters">
          <i class="fas fa-undo-alt"></i> 重置
        </button>
      </div>
    </div>

    <!-- 视频卡片网格 -->
    <div class="videos-grid">
      <div v-for="video in paginatedVideos" :key="video.id" class="video-card xinglin-card">
        <div class="video-cover">
          <img
            :src="video.coverUrl"
            :alt="video.title"
            class="cover-img"
            @error="handleImageError"
          />
          <div class="play-overlay"><i class="fas fa-play-circle"></i></div>
          <div class="video-duration">{{ video.duration }}</div>
        </div>
        <div class="video-info">
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-description">{{ video.description }}</p>
          <div class="video-meta">
            <span class="meta-tag"
              ><i class="fas fa-chalkboard-teacher"></i> {{ video.instructor }}</span
            >
            <span class="meta-tag"><i class="fas fa-tag"></i> {{ video.category }}</span>
          </div>
          <div class="video-stats">
            <span class="stat-item"
              ><i class="fas fa-eye"></i> {{ formatNumber(video.views) }} 观看</span
            >
            <span class="stat-item"
              ><i class="fas fa-comment"></i> {{ formatNumber(video.comments) }} 评论</span
            >
            <span class="stat-item"
              ><i class="fas fa-thumbs-up"></i> {{ formatNumber(video.likes) }} 点赞</span
            >
            <span class="stat-item update-time"
              ><i class="fas fa-clock"></i> {{ formatDate(video.updatedAt) }}</span
            >
          </div>
          <div class="url-display-area">
            <div class="url-item">
              <i class="fas fa-link"></i><span class="url-label">视频URL：</span>
              <code class="url-code">{{ video.videoUrl }}</code>
              <button class="copy-btn" @click="copyToClipboard(video.videoUrl)">
                <i class="fas fa-copy"></i>
              </button>
              <a :href="video.videoUrl" target="_blank" class="open-link"
                ><i class="fas fa-play"></i> 播放</a
              >
            </div>
            
          </div>
          <div class="card-actions">
            <button class="action-btn edit" @click="editVideo(video)">
              <i class="fas fa-edit"></i> 编辑
            </button>
            <button class="action-btn delete" @click="deleteVideoItem(video)">
              <i class="fas fa-trash-alt"></i> 删除
            </button>
            <button class="action-btn view" @click="previewVideoItem(video)">
              <i class="fas fa-eye"></i> 预览
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="filteredVideos.length > pageSize">
      <button @click="currentPage--" :disabled="currentPage === 1">&lt;</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">&gt;</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AiVideoManage',
  data() {
    return {
      searchKeyword: '',
      filterCategory: '',
      sortBy: 'updatedAt',
      currentPage: 1,
      pageSize: 9,
      videos: [
        {
          id: 1,
          title: '《黄帝内经》养生智慧精讲',
          instructor: '张仲景AI',
          category: '经典解读',
          description: '深入解读《黄帝内经》中的养生智慧，结合现代AI技术还原古人养生理念。',
          coverUrl:
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
          videoUrl: '/videos/neijing-lecture.mp4',
          duration: '32:15',
          views: 15420,
          comments: 342,
          likes: 2100,
          updatedAt: '2026-04-11T10:30:00Z',
        },
        {
          id: 2,
          title: '十二经络循行与穴位详解',
          instructor: '李时珍AI',
          category: '经络穴位',
          description: '3D动画演示十二经络循行路线，详解主要穴位定位与主治功能。',
          coverUrl:
            'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80',
          videoUrl: '/videos/meridians.mp4',
          duration: '45:20',
          views: 9820,
          comments: 187,
          likes: 1560,
          updatedAt: '2026-04-10T14:20:00Z',
        },
        {
          id: 3,
          title: '伤寒论六经辨证入门',
          instructor: '张仲景AI',
          category: '经典解读',
          description: '系统讲解伤寒论六经辨证体系，帮助初学者快速掌握辨证要点。',
          coverUrl:
            'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
          videoUrl: '/videos/shanghanlun.mp4',
          duration: '58:42',
          views: 21350,
          comments: 521,
          likes: 3420,
          updatedAt: '2026-04-09T09:15:00Z',
        },
        {
          id: 4,
          title: '针灸手法实操教学',
          instructor: '华佗AI',
          category: '针灸推拿',
          description: '手把手教学针灸基本手法，包括提插、捻转、补泻等操作技巧。',
          coverUrl:
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
          videoUrl: '/videos/acupuncture.mp4',
          duration: '28:50',
          views: 7450,
          comments: 203,
          likes: 890,
          updatedAt: '2026-04-08T16:45:00Z',
        },
        {
          id: 5,
          title: '中药方剂配伍原理',
          instructor: '孙思邈AI',
          category: '方剂学',
          description: '讲解君臣佐使配伍原则，分析经典方剂的组成与功效。',
          coverUrl:
            'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
          videoUrl: '/videos/formulas.mp4',
          duration: '52:10',
          views: 6280,
          comments: 156,
          likes: 730,
          updatedAt: '2026-04-07T11:00:00Z',
        },
        {
          id: 6,
          title: '中医舌诊快速入门',
          instructor: '王清任AI',
          category: '诊断学',
          description: '通过真实病例讲解舌诊技巧，快速掌握望舌辨病的核心方法。',
          coverUrl:
            'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
          videoUrl: '/videos/tongue-diagnosis.mp4',
          duration: '38:25',
          views: 11230,
          comments: 278,
          likes: 1450,
          updatedAt: '2026-04-06T13:30:00Z',
        },
        {
          id: 7,
          title: '金匮要略杂病论治',
          instructor: '张仲景AI',
          category: '经典解读',
          description: '详解金匮要略中杂病的辨证论治方法，结合实际案例讲解。',
          coverUrl:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
          duration: '62:05',
          views: 4870,
          comments: 98,
          likes: 560,
          updatedAt: '2026-04-05T10:00:00Z',
        },
        {
          id: 8,
          title: 'AI辅助中医诊断技术',
          instructor: '扁鹊AI',
          category: '中医基础',
          description: '介绍AI技术在中医诊断中的应用，智能舌诊、问诊系统演示。',
          coverUrl:
            'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
          videoUrl: '/videos/ai-diagnosis.mp4',
          duration: '42:30',
          views: 15680,
          comments: 412,
          likes: 2340,
          updatedAt: '2026-04-04T15:20:00Z',
        },
        {
          id: 9,
          title: '八段锦养生功法详解',
          instructor: '华佗AI',
          category: '针灸推拿',
          description: '八段锦标准动作分解教学，配合呼吸导引，养生健身。',
          coverUrl:
            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
          videoUrl: '/videos/baduanjin.mp4',
          duration: '25:15',
          views: 21340,
          comments: 567,
          likes: 4120,
          updatedAt: '2026-04-03T08:45:00Z',
        },
      ],
    }
  },
  computed: {
    filteredVideos() {
      let result = [...this.videos]
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(
          (v) =>
            v.title.toLowerCase().includes(keyword) ||
            v.instructor.toLowerCase().includes(keyword) ||
            v.description.toLowerCase().includes(keyword),
        )
      }
      if (this.filterCategory) result = result.filter((v) => v.category === this.filterCategory)
      if (this.sortBy === 'views') result.sort((a, b) => b.views - a.views)
      else if (this.sortBy === 'comments') result.sort((a, b) => b.comments - a.comments)
      else if (this.sortBy === 'updatedAt')
        result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      return result
    },
    totalVideos() {
      return this.videos.length
    },
    totalViews() {
      return this.videos.reduce((sum, v) => sum + v.views, 0)
    },
    totalComments() {
      return this.videos.reduce((sum, v) => sum + v.comments, 0)
    },
    totalPages() {
      return Math.ceil(this.filteredVideos.length / this.pageSize)
    },
    paginatedVideos() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredVideos.slice(start, start + this.pageSize)
    },
  },
  watch: {
    searchKeyword() {
      this.currentPage = 1
    },
    filterCategory() {
      this.currentPage = 1
    },
    sortBy() {
      this.currentPage = 1
    },
  },
  mounted() {
    this.injectModalStyles()
  },
  methods: {
    formatNumber(num) {
      return num >= 10000 ? (num / 10000).toFixed(1) + 'w' : num.toString()
    },
    formatDate(dateStr) {
      const date = new Date(dateStr),
        now = new Date(),
        diff = now - date,
        days = Math.floor(diff / (1000 * 60 * 60 * 24))
      if (days === 0) return '今天'
      if (days === 1) return '昨天'
      if (days < 7) return `${days}天前`
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    handleImageError(e) {
      e.target.src = 'https://placehold.co/400x240/e8d9c5/8b4519?text=封面+加载失败'
    },
    copyToClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => alert('URL已复制'))
        .catch(() => alert('复制失败'))
    },
    resetFilters() {
      this.searchKeyword = ''
      this.filterCategory = ''
      this.sortBy = 'updatedAt'
      this.currentPage = 1
    },
    openCreateVideo() {
      this.showVideoFormModal(null)
    },
    editVideo(video) {
      this.showVideoFormModal(video)
    },
    deleteVideoItem(video) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      const modal = document.createElement('div')
      modal.className = 'native-modal-container'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-trash-alt"></i> 确认删除</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body">
          <p style="font-size: 1rem; color: #4a2a12;">确定要删除视频“${this.escapeHtml(video.title)}”吗？</p>
        </div>
        <div class="native-modal-footer">
          <button class="btn-cancel">取消</button>
          <button class="btn-submit">确认删除</button>
        </div>
      `
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      modal.querySelector('.btn-cancel').onclick = closeModal
      overlay.onclick = (e) => {
        if (e.target === overlay) closeModal()
      }
      modal.querySelector('.btn-submit').onclick = () => {
        const index = this.videos.findIndex((v) => v.id === video.id)
        if (index !== -1) {
          this.videos.splice(index, 1)
          alert('视频已删除')
        }
        closeModal()
      }
    },
    previewVideoItem(video) {
      this.showVideoPreviewModal(video)
    },
    showVideoPreviewModal(video) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      const modal = document.createElement('div')
      modal.className = 'native-modal-container preview-modal'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-play-circle"></i> ${this.escapeHtml(video.title)}</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body preview-body">
          <video src="${this.escapeHtml(video.videoUrl)}" controls class="preview-video" poster="${this.escapeHtml(video.coverUrl)}">您的浏览器不支持视频播放</video>
          <div class="preview-info">
            <p><strong>讲师：</strong> ${this.escapeHtml(video.instructor)}</p>
            <p><strong>分类：</strong> ${this.escapeHtml(video.category)}</p>
            <p><strong>描述：</strong> ${this.escapeHtml(video.description)}</p>
            <div class="preview-stats">
              <span><i class="fas fa-eye"></i> ${this.formatNumber(video.views)} 观看</span>
              <span><i class="fas fa-comment"></i> ${this.formatNumber(video.comments)} 评论</span>
            </div>
          </div>
        </div>
        <div class="native-modal-footer">
          <button class="btn-submit">关闭</button>
        </div>
      `
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      modal.querySelector('.btn-submit').onclick = closeModal
      overlay.onclick = (e) => {
        if (e.target === overlay) closeModal()
      }
    },
    showVideoFormModal(video) {
      const isEdit = !!video
      const title = isEdit ? '编辑视频' : '新增视频'
      const formData = isEdit
        ? {
            title: video.title,
            instructor: video.instructor,
            category: video.category,
            description: video.description,
            videoUrl: video.videoUrl,
            coverUrl: video.coverUrl,
            duration: video.duration,
            views: video.views,
          }
        : {
            title: '',
            instructor: '',
            category: '中医基础',
            description: '',
            videoUrl: '',
            coverUrl: '',
            duration: '',
            views: 0,
          }
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      const modal = document.createElement('div')
      modal.className = 'native-modal-container form-modal'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-video"></i> ${title}</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body form-modal-body">
          <div class="form-group"><label>视频标题 <span class="required">*</span></label><input type="text" id="videoTitle" value="${this.escapeHtml(formData.title)}" placeholder="请输入视频标题" /></div>
          <div class="form-row-2">
            <div class="form-group"><label>讲师</label><input type="text" id="videoInstructor" value="${this.escapeHtml(formData.instructor)}" placeholder="请输入讲师姓名" /></div>
            <div class="form-group"><label>分类</label><select id="videoCategory"><option value="中医基础" ${formData.category === '中医基础' ? 'selected' : ''}>中医基础</option><option value="经络穴位" ${formData.category === '经络穴位' ? 'selected' : ''}>经络穴位</option><option value="方剂学" ${formData.category === '方剂学' ? 'selected' : ''}>方剂学</option><option value="诊断学" ${formData.category === '诊断学' ? 'selected' : ''}>诊断学</option><option value="针灸推拿" ${formData.category === '针灸推拿' ? 'selected' : ''}>针灸推拿</option><option value="经典解读" ${formData.category === '经典解读' ? 'selected' : ''}>经典解读</option></select></div>
          </div>
          <div class="form-group"><label>视频描述</label><textarea id="videoDescription" rows="3" placeholder="请输入视频描述...">${this.escapeHtml(formData.description)}</textarea></div>
          <div class="form-row-2">
            <div class="form-group"><label>视频URL <span class="required">*</span></label><input type="url" id="videoUrl" value="${this.escapeHtml(formData.videoUrl)}" placeholder="/video.mp4" /></div>
            <div class="form-group"><label>封面URL <span class="required">*</span></label><input type="url" id="coverUrl" value="${this.escapeHtml(formData.coverUrl)}" placeholder="/cover.jpg" /></div>
          </div>
          <div class="form-row-2">
            <div class="form-group"><label>视频时长</label><input type="text" id="videoDuration" value="${this.escapeHtml(formData.duration)}" placeholder="如: 15:32" /></div>
            <div class="form-group"><label>初始观看数</label><input type="number" id="videoViews" value="${formData.views}" /></div>
          </div>
        </div>
        <div class="native-modal-footer">
          <button class="btn-cancel">取消</button>
          <button class="btn-submit">保存</button>
        </div>
      `
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      modal.querySelector('.btn-cancel').onclick = closeModal
      overlay.onclick = (e) => {
        if (e.target === overlay) closeModal()
      }
      modal.querySelector('.btn-submit').onclick = () => {
        const newTitle = modal.querySelector('#videoTitle').value.trim()
        const newVideoUrl = modal.querySelector('#videoUrl').value.trim()
        const newCoverUrl = modal.querySelector('#coverUrl').value.trim()
        if (!newTitle || !newVideoUrl || !newCoverUrl) {
          alert('请填写必填项：标题、视频URL、封面URL')
          return
        }
        const now = new Date().toISOString()
        const videoData = {
          id: isEdit ? video.id : Date.now(),
          title: newTitle,
          instructor: modal.querySelector('#videoInstructor').value,
          category: modal.querySelector('#videoCategory').value,
          description: modal.querySelector('#videoDescription').value,
          videoUrl: newVideoUrl,
          coverUrl: newCoverUrl,
          duration: modal.querySelector('#videoDuration').value,
          views: parseInt(modal.querySelector('#videoViews').value) || 0,
          comments: isEdit ? video.comments : 0,
          likes: isEdit ? video.likes : 0,
          updatedAt: now,
        }
        if (isEdit) {
          const index = this.videos.findIndex((v) => v.id === video.id)
          if (index !== -1) {
            this.videos[index] = { ...this.videos[index], ...videoData }
            alert('视频已更新')
          }
        } else {
          this.videos.unshift(videoData)
          alert('视频已添加')
        }
        closeModal()
      }
    },
    escapeHtml(str) {
      if (!str) return ''
      return str.replace(/[&<>]/g, (m) => {
        if (m === '&') return '&amp;'
        if (m === '<') return '&lt;'
        if (m === '>') return '&gt;'
        return m
      })
    },
    injectModalStyles() {
      if (document.getElementById('modal-styles')) return
      const style = document.createElement('style')
      style.id = 'modal-styles'
      style.textContent = `
        .native-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(60, 40, 20, 0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 20000;
        }
        .native-modal-container {
          width: 90%; max-width: 680px; max-height: 85vh;
          background: rgba(250, 242, 228, 0.98); backdrop-filter: blur(12px);
          border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          animation: modalFadeIn 0.2s ease;
        }
        .native-modal-container.preview-modal { max-width: 800px; }
        .native-modal-container.form-modal { max-width: 700px; }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .native-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px; border-bottom: 1px solid rgba(170,125,65,0.4);
          background: rgba(250,242,228,0.9);
        }
        .native-modal-header h3 { margin: 0; font-size: 1.2rem; font-weight: 600; color: #4a2a12; }
        .native-modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #8b5a34; padding: 4px 8px; border-radius: 8px; }
        .native-modal-close:hover { background: rgba(170,110,55,0.2); }
        .native-modal-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
        .form-modal-body { max-height: 65vh; }
        .preview-body { max-height: 70vh; }
        .native-modal-footer {
          display: flex; justify-content: flex-end; gap: 12px;
          padding: 16px 24px; border-top: 1px solid rgba(170,125,65,0.4);
          background: rgba(250,242,228,0.9);
        }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #7a4e28; font-size: 0.85rem; }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%; padding: 10px 14px; background: rgba(250,245,235,0.9);
          border: 1px solid rgba(170,110,55,0.4); border-radius: 16px;
          font-size: 0.9rem; color: #4a2a12; outline: none; box-sizing: border-box;
        }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .required { color: #c4713a; }
        .preview-video { width: 100%; border-radius: 16px; margin-bottom: 16px; }
        .preview-info { background: rgba(170,125,65,0.1); padding: 16px; border-radius: 20px; }
        .preview-info p { margin-bottom: 8px; color: #4a301a; }
        .preview-stats { display: flex; gap: 20px; margin-top: 12px; color: #8b6946; }
        .btn-cancel { background: rgba(170,110,55,0.2); border: 1px solid #bc8f5a; padding: 8px 20px; border-radius: 30px; cursor: pointer; color: #7a4a28; }
        .btn-submit { background: #b87a48; border: none; padding: 8px 20px; border-radius: 30px; color: #fff5e8; cursor: pointer; }
      `
      document.head.appendChild(style)
    },
  },
}
</script>

<style scoped>
.ai-video-manage-view {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  border-left: 5px solid #c27442;
  padding-left: 20px;
}
.page-header i:first-child {
  font-size: 1.8rem;
  color: #aa6b3c;
}
.page-header h1 {
  font-size: 1.8rem;
  font-weight: 500;
  color: #3e2410;
}
.header-badge {
  margin-left: auto;
  background: rgba(180, 115, 55, 0.2);
  padding: 6px 16px;
  border-radius: 60px;
  font-size: 0.85rem;
  border: 1px solid rgba(170, 100, 40, 0.5);
  color: #5a341a;
}
.btn-create {
  background: linear-gradient(135deg, #b87a48, #9a5e32);
  border: none;
  padding: 8px 20px;
  border-radius: 40px;
  color: #fff5e8;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.stat-mini-card {
  background: rgba(250, 242, 228, 0.7);
  backdrop-filter: blur(6px);
  border-radius: 24px;
  padding: 16px 20px;
  border: 1px solid rgba(190, 140, 75, 0.5);
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-mini-card i {
  font-size: 2rem;
  color: #b87a48;
}
.stat-num {
  font-size: 1.6rem;
  font-weight: 700;
  color: #4a2a12;
}
.stat-label {
  font-size: 0.75rem;
  color: #7a5432;
}

.toolbar {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}
.search-area {
  flex: 2;
  background: rgba(250, 242, 228, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 48px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(170, 110, 55, 0.4);
}
.search-area input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.9rem;
  color: #4a2a12;
}
.filter-area {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.filter-area select {
  background: rgba(250, 242, 228, 0.7);
  border: 1px solid rgba(170, 110, 55, 0.4);
  border-radius: 40px;
  padding: 10px 20px;
  font-size: 0.85rem;
  color: #4a2a12;
  outline: none;
  cursor: pointer;
}
.filter-btn {
  background: rgba(170, 110, 55, 0.2);
  border: 1px solid #bc8f5a;
  border-radius: 40px;
  padding: 10px 20px;
  cursor: pointer;
  color: #7a4a28;
  display: flex;
  align-items: center;
  gap: 6px;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}
.video-card {
  display: flex;
  flex-direction: column;
  background: rgba(250, 242, 228, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 28px;
  border: 1px solid rgba(190, 145, 85, 0.6);
  overflow: hidden;
  transition: all 0.25s ease;
}
.video-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(80, 50, 20, 0.12);
}
.video-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.video-card:hover .cover-img {
  transform: scale(1.05);
}
.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s;
}
.play-overlay i {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.video-card:hover .play-overlay {
  opacity: 1;
}
.video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
}
.video-info {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.video-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a2a12;
  line-height: 1.4;
}
.video-description {
  font-size: 0.8rem;
  color: #7a5432;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.video-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.meta-tag {
  font-size: 0.7rem;
  background: rgba(185, 125, 65, 0.15);
  padding: 3px 10px;
  border-radius: 20px;
  color: #7a4a28;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.video-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.7rem;
  color: #8b6946;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.update-time {
  margin-left: auto;
}
.url-display-area {
  background: rgba(160, 120, 70, 0.12);
  border-radius: 16px;
  padding: 10px;
  margin: 8px 0;
}
.url-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  padding: 6px 0;
  flex-wrap: wrap;
  border-bottom: 1px dotted rgba(170, 125, 65, 0.3);
}
.url-item:last-child {
  border-bottom: none;
}
.url-item i {
  font-size: 0.75rem;
  color: #b87a48;
  width: 20px;
}
.url-label {
  font-weight: 500;
  color: #7a4e28;
  font-size: 0.7rem;
}
.url-code {
  background: rgba(80, 50, 20, 0.08);
  padding: 2px 6px;
  border-radius: 8px;
  /* font-family: monospace; */
  font-size: 0.65rem;
  color: #5a341a;
  flex: 1;
  word-break: break-all;
}
.copy-btn,
.open-link {
  background: rgba(170, 110, 55, 0.15);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  color: #8b5a34;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
.copy-btn:hover,
.open-link:hover {
  background: rgba(170, 110, 55, 0.35);
}
.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.action-btn {
  flex: 1;
  padding: 8px 0;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}
.action-btn.edit {
  background: rgba(170, 110, 55, 0.2);
  border: 1px solid #b87a48;
  color: #7a4a28;
}
.action-btn.edit:hover {
  background: rgba(170, 110, 55, 0.35);
}
.action-btn.delete {
  background: rgba(200, 80, 50, 0.15);
  border: 1px solid #c4713a;
  color: #b85a2a;
}
.action-btn.delete:hover {
  background: rgba(200, 80, 50, 0.3);
}
.action-btn.view {
  background: #b87a48;
  border: none;
  color: #fff5e8;
}
.action-btn.view:hover {
  background: #9a5e32;
}
.pagination-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  align-items: center;
  padding: 20px 0;
}
.pagination-container button {
  background: rgba(170, 110, 55, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
}
.pagination-container button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
