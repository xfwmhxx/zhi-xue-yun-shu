<template>
  <div class="bookstore-manage-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <i class="fas fa-book-open"></i>
      <h1>杏林书城</h1>
      <div class="header-badge">
        <i class="fas fa-leaf"></i> 医道典藏 · 管理端
      </div>
      <button class="btn-create" @click="openAddBook">
        <i class="fas fa-plus"></i> 录入典籍
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-mini-card">
        <i class="fas fa-book"></i>
        <div class="stat-num">{{ books.length }}</div>
        <div class="stat-label">典藏总数</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-users"></i>
        <div class="stat-num">8</div>
        <div class="stat-label">研读学派</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-file-pdf"></i>
        <div class="stat-num">156</div>
        <div class="stat-label">PDF资源</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-chart-line"></i>
        <div class="stat-num">1,280</div>
        <div class="stat-label">今日阅读</div>
      </div>
    </div>

    <!-- 典籍卡片网格 -->
    <div class="books-grid">
      <div v-for="book in books" :key="book.id" class="book-card xinglin-card">
        <div class="book-cover-area">
          <img 
            v-if="book.coverUrl" 
            :src="book.coverUrl" 
            :alt="book.title"
            class="book-cover-img"
            @error="handleImageError"
          />
          <div v-else class="book-cover-fallback">
            <i class="fas fa-book-medical"></i>
          </div>
          <div class="book-badge">{{ book.badge }}</div>
        </div>
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">
            <i class="fas fa-feather-alt"></i> {{ book.author }} 撰
          </p>
          <div class="academic-tag">
            <i class="fas fa-trophy"></i> {{ book.academicStatus }}
          </div>
          <div class="school-tag">
            <i class="fas fa-project-diagram"></i> {{ book.influenceSchool }}
          </div>
          <div class="summary-preview">
            {{ book.summaryPreview }}...
          </div>
          
          <!-- URL 显示区域 -->
          <div class="url-display-area">
            <div class="url-item">
              <i class="fas fa-file-pdf"></i>
              <span class="url-label">PDF URL：</span>
              <code class="url-code">{{ book.pdfUrl }}</code>
              <button class="copy-btn" @click="copyToClipboard(book.pdfUrl)">
                <i class="fas fa-copy"></i>
              </button>
              <a :href="book.pdfUrl" target="_blank" class="open-link">
                <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
            <div class="url-item">
              <i class="fas fa-image"></i>
              <span class="url-label">图片 URL：</span>
              <code class="url-code">{{ book.imageUrl }}</code>
              <button class="copy-btn" @click="copyToClipboard(book.imageUrl)">
                <i class="fas fa-copy"></i>
              </button>
              <a :href="book.imageUrl" target="_blank" class="open-link">
                <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
          </div>

          <div class="card-actions">
            <button class="action-btn read" @click="editBook(book)">
              <i class="fas fa-edit"></i> 修改
            </button>
            <button class="action-btn delete" @click="deleteBook(book)">
              <i class="fas fa-trash-alt"></i> 删除
            </button>
            <button class="action-btn detail" @click="viewBookDetail(book)">
              <i class="fas fa-info-circle"></i> 详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="books.length === 0" class="empty-state">
      <i class="fas fa-book"></i>
      <p>暂无典籍，点击"录入典籍"添加</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookstoreManage',
  data() {
    return {
      books: [
        {
          id: 1,
          title: '伤寒论',
          author: '张仲景',
          badge: '经方之祖',
          academicStatus: '中医临床辨证论治奠基之作',
          influenceSchool: '伤寒学派 / 经方派',
          summaryPreview: '《伤寒论》是东汉医学家张仲景所著的中医典籍，原为其十六卷《伤寒杂病论》的外感病部分，后经西晋王叔和编次整理形成独立医典。全书以六经辨证体系为纲领，将外感热病分为太阳、阳明、少阳三阳证与太阴、少阴、厥阴三阴证，记载桂枝汤、麻黄汤等方剂',
          fullSummary: '《伤寒论》是东汉医学家张仲景所著的中医典籍，原为其十六卷《伤寒杂病论》的外感病部分，后经西晋王叔和编次整理形成独立医典。全书以六经辨证体系为纲领，将外感热病分为太阳、阳明、少阳三阳证与太阴、少阴、厥阴三阴证，记载桂枝汤、麻黄汤等方剂，系统阐述外感病的辨脉、审证及治法。该书现存版本为十卷二十二篇，原《伤寒杂病论》中论述内科杂病的部分另编为《金匮要略方论》。',
          coverUrl: '/public/ZYDJ/BookCover/1.png',
          pdfUrl: '/pdf/shanghanlun.pdf',
          imageUrl: '/images/shanghanlun.jpg'
        },
        {
          id: 2,
          title: '黄帝内经',
          author: '佚名',
          badge: '医家之宗',
          academicStatus: '中医理论体系奠基之作',
          influenceSchool: '医经学派 / 阴阳学派',
          summaryPreview: '《黄帝内经》分《灵枢》《素问》两部分，是中国最早的医学典籍，奠定了人体生理、病理、诊断以及治疗的基础',
          fullSummary: '《黄帝内经》是中国最早的医学典籍，传统医学四大经典著作之一。全书分为《素问》和《灵枢》两部分，系统论述了阴阳五行、藏象经络、病因病机、诊法治则等中医基础理论。',
          coverUrl: '/public/ZYDJ/BookCover/2.png',
          pdfUrl: '/pdf/huangdineijing.pdf',
          imageUrl: '/images/huangdineijing.jpg'
        },
        {
          id: 3,
          title: '中医基础理论',
          author: '王琦 等',
          badge: '现代教材',
          academicStatus: '高等中医药院校核心课程教材',
          influenceSchool: '现代中医学派',
          summaryPreview: '系统阐述中医学的基本理论、基本知识和基本思维方法，包括阴阳五行、藏象、气血津液、经络、病因病机等内容',
          fullSummary: '《中医基础理论》是高等中医药院校的核心课程教材，系统阐述了中医学的基本理论体系。全书涵盖阴阳五行学说、藏象学说、气血津液理论、经络学说、病因病机学说、防治原则等内容，是中医学入门和深入学习的基础。',
          coverUrl: '/public/ZYDJ/BookCover/3.png',
          pdfUrl: '/pdf/zhongyijichulilun.pdf',
          imageUrl: '/images/zhongyijichu.jpg'
        },
        {
          id: 4,
          title: '中医诊断学',
          author: '朱文锋 等',
          badge: '诊断要籍',
          academicStatus: '中医诊断学权威教材',
          influenceSchool: '现代诊断学派',
          summaryPreview: '系统介绍中医诊法、辨证的基本理论和技能，包括望、闻、问、切四诊和八纲辨证、脏腑辨证等辨证方法',
          fullSummary: '《中医诊断学》是高等中医药院校的核心课程教材，系统介绍了中医诊法与辨证的基本理论和技能。全书涵盖望诊、闻诊、问诊、切诊四诊方法，以及八纲辨证、脏腑辨证、六经辨证、卫气营血辨证等辨证体系。',
          coverUrl: '/public/ZYDJ/BookCover/4.png',
          pdfUrl: '/pdf/zhongyizhenduanxue.pdf',
          imageUrl: '/images/zhongyizhenduan.jpg'
        },
        {
          id: 5,
          title: '方剂学',
          author: '李飞 等',
          badge: '方剂宝典',
          academicStatus: '方剂学权威教材',
          influenceSchool: '方剂学派',
          summaryPreview: '系统研究方剂学的基本理论、方剂的组成原则、配伍规律及临床应用，收录经典方剂及现代研究成果',
          fullSummary: '《方剂学》是高等中医药院校的核心课程教材，系统研究方剂学的基本理论和临床应用。全书涵盖方剂的组成原则、配伍规律、剂型用法等基本知识，收录了历代经典方剂及现代研究成果。',
          coverUrl: '/public/ZYDJ/BookCover/5.png',
          pdfUrl: '/pdf/fangjixue.pdf',
          imageUrl: '/images/fangjixue.jpg'
        },
        {
          id: 6,
          title: '医学遗传学',
          author: '李璞 等',
          badge: '现代医学',
          academicStatus: '医学遗传学权威教材',
          influenceSchool: '现代医学派',
          summaryPreview: '系统介绍遗传学的基本原理及其在医学领域的应用，涵盖基因结构、遗传变异、遗传病诊断与防治等内容',
          fullSummary: '《医学遗传学》是高等医学院校的核心课程教材，系统介绍遗传学的基本原理及其在医学领域的应用。全书涵盖基因的结构与功能、遗传变异、遗传病的诊断与防治、基因组医学等内容。',
          coverUrl: '/public/ZYDJ/BookCover/6.png',
          pdfUrl: '/pdf/yixueyichuanxue.pdf',
          imageUrl: '/images/yixueyichuan.jpg'
        }
      ]
    }
  },
  mounted() {
    this.injectModalStyles()
  },
  methods: {
    handleImageError(e) {
      e.target.style.display = 'none'
      if (e.target.parentElement?.querySelector('.book-cover-fallback')) {
        e.target.parentElement.querySelector('.book-cover-fallback').style.display = 'flex'
      }
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('URL已复制到剪贴板')
      }).catch(() => {
        alert('复制失败，请手动复制')
      })
    },
    // 打开新增典籍弹窗
    openAddBook() {
      this.showBookFormModal(null)
    },
    // 编辑典籍
    editBook(book) {
      this.showBookFormModal(book)
    },
    // 删除典籍
    deleteBook(book) {
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
          <p style="font-size: 1rem; color: #4a2a12;">确定要删除典籍“${this.escapeHtml(book.title)}”吗？</p>
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
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
      
      modal.querySelector('.btn-submit').onclick = () => {
        const index = this.books.findIndex(b => b.id === book.id)
        if (index !== -1) {
          this.books.splice(index, 1)
          alert('典籍已删除')
        }
        closeModal()
      }
    },
    // 查看典籍详情
    viewBookDetail(book) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      
      const modal = document.createElement('div')
      modal.className = 'native-modal-container detail-modal'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-book"></i> ${this.escapeHtml(book.title)} · 典籍提要</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body detail-modal-body">
          <div class="detail-tags">
            <span class="detail-tag"><i class="fas fa-trophy"></i> ${this.escapeHtml(book.academicStatus)}</span>
            <span class="detail-tag"><i class="fas fa-project-diagram"></i> ${this.escapeHtml(book.influenceSchool)}</span>
          </div>
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-quote-left"></i> 【提要解说】</div>
            <div class="detail-text">${this.escapeHtml(book.fullSummary || book.summaryPreview)}</div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-link"></i> 资源链接</div>
            <div class="detail-urls">
              <div class="detail-url-item"><i class="fas fa-file-pdf"></i> PDF：<code>${this.escapeHtml(book.pdfUrl)}</code></div>
              <div class="detail-url-item"><i class="fas fa-image"></i> 图片：<code>${this.escapeHtml(book.imageUrl)}</code></div>
            </div>
          </div>
        </div>
        <div class="native-modal-footer">
          <button class="btn-submit" onclick="this.closest('.native-modal-overlay').remove()">关闭</button>
        </div>
      `
      
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
    },
    // 显示典籍表单弹窗
    showBookFormModal(book) {
      const isEdit = !!book
      const title = isEdit ? '编辑典籍' : '录入典籍'
      
      const formData = isEdit ? {
        title: book.title,
        author: book.author,
        badge: book.badge,
        academicStatus: book.academicStatus,
        influenceSchool: book.influenceSchool,
        summaryPreview: book.summaryPreview,
        fullSummary: book.fullSummary,
        pdfUrl: book.pdfUrl,
        imageUrl: book.imageUrl
      } : {
        title: '',
        author: '',
        badge: '',
        academicStatus: '',
        influenceSchool: '',
        summaryPreview: '',
        fullSummary: '',
        pdfUrl: '',
        imageUrl: ''
      }
      
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      
      const modal = document.createElement('div')
      modal.className = 'native-modal-container form-modal'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-edit"></i> ${title}</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body form-modal-body">
          <div class="form-row-2">
            <div class="form-group">
              <label>书名 <span class="required">*</span></label>
              <input type="text" id="bookTitle" value="${this.escapeHtml(formData.title)}" placeholder="请输入书名" />
            </div>
            <div class="form-group">
              <label>作者</label>
              <input type="text" id="bookAuthor" value="${this.escapeHtml(formData.author)}" placeholder="请输入作者" />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>角标</label>
              <input type="text" id="bookBadge" value="${this.escapeHtml(formData.badge)}" placeholder="如：经方之祖" />
            </div>
            <div class="form-group">
              <label>学术地位</label>
              <input type="text" id="academicStatus" value="${this.escapeHtml(formData.academicStatus)}" placeholder="学术地位" />
            </div>
          </div>
          <div class="form-group">
            <label>影响流派</label>
            <input type="text" id="influenceSchool" value="${this.escapeHtml(formData.influenceSchool)}" placeholder="影响流派" />
          </div>
          <div class="form-group">
            <label>简介预览</label>
            <textarea id="summaryPreview" rows="3" placeholder="请输入简介预览...">${this.escapeHtml(formData.summaryPreview)}</textarea>
          </div>
          <div class="form-group">
            <label>完整提要</label>
            <textarea id="fullSummary" rows="5" placeholder="请输入完整提要...">${this.escapeHtml(formData.fullSummary)}</textarea>
          </div>
          <div class="form-group">
            <label>PDF URL</label>
            <input type="url" id="pdfUrl" value="${this.escapeHtml(formData.pdfUrl)}" placeholder="/book.pdf" />
          </div>
          <div class="form-group">
            <label>封面图片 URL</label>
            <input type="url" id="imageUrl" value="${this.escapeHtml(formData.imageUrl)}" placeholder="/cover.jpg" />
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
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
      
      modal.querySelector('.btn-submit').onclick = () => {
        const newTitle = modal.querySelector('#bookTitle').value.trim()
        if (!newTitle) {
          alert('请填写书名')
          return
        }
        
        const bookData = {
          id: isEdit ? book.id : Date.now(),
          title: newTitle,
          author: modal.querySelector('#bookAuthor').value,
          badge: modal.querySelector('#bookBadge').value || '医典',
          academicStatus: modal.querySelector('#academicStatus').value,
          influenceSchool: modal.querySelector('#influenceSchool').value,
          summaryPreview: modal.querySelector('#summaryPreview').value,
          fullSummary: modal.querySelector('#fullSummary').value,
          pdfUrl: modal.querySelector('#pdfUrl').value,
          imageUrl: modal.querySelector('#imageUrl').value
        }
        
        if (isEdit) {
          const index = this.books.findIndex(b => b.id === book.id)
          if (index !== -1) {
            this.books[index] = { ...this.books[index], ...bookData }
            alert('典籍已更新')
          }
        } else {
          this.books.unshift(bookData)
          alert('典籍已添加')
        }
        closeModal()
      }
    },
    escapeHtml(str) {
      if (!str) return ''
      return str.replace(/[&<>]/g, function(m) {
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
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(60, 40, 20, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20000;
        }
        .native-modal-container {
          width: 90%;
          max-width: 600px;
          max-height: 85vh;
          background: rgba(250, 242, 228, 0.98);
          backdrop-filter: blur(12px);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: modalFadeIn 0.2s ease;
        }
        .native-modal-container.detail-modal {
          max-width: 650px;
        }
        .native-modal-container.form-modal {
          max-width: 700px;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .native-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(170, 125, 65, 0.4);
          background: rgba(250, 242, 228, 0.9);
        }
        .native-modal-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #4a2a12;
        }
        .native-modal-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #8b5a34;
          padding: 4px 8px;
          border-radius: 8px;
        }
        .native-modal-close:hover {
          background: rgba(170, 110, 55, 0.2);
        }
        .native-modal-body {
          padding: 24px;
          max-height: 60vh;
          overflow-y: auto;
        }
        .detail-modal-body {
          max-height: 70vh;
        }
        .form-modal-body {
          max-height: 65vh;
        }
        .native-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid rgba(170, 125, 65, 0.4);
          background: rgba(250, 242, 228, 0.9);
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #7a4e28;
          font-size: 0.85rem;
        }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 10px 14px;
          background: rgba(250, 245, 235, 0.9);
          border: 1px solid rgba(170, 110, 55, 0.4);
          border-radius: 16px;
          font-size: 0.9rem;
          color: #4a2a12;
          outline: none;
          box-sizing: border-box;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #b87a48;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .required {
          color: #c4713a;
        }
        .detail-tags {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .detail-tag {
          background: rgba(185, 125, 65, 0.15);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #7a4a28;
        }
        .detail-section {
          margin-bottom: 20px;
        }
        .detail-section-title {
          font-weight: 600;
          color: #7a4e28;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(170, 125, 65, 0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .detail-text {
          font-size: 0.9rem;
          line-height: 1.7;
          color: #4a301a;
          background: rgba(185, 125, 65, 0.05);
          padding: 12px;
          border-radius: 16px;
        }
        .detail-urls {
          background: rgba(170, 125, 65, 0.1);
          padding: 12px;
          border-radius: 16px;
        }
        .detail-url-item {
          font-size: 0.75rem;
          padding: 6px 0;
          word-break: break-all;
        }
        .detail-url-item code {
          background: rgba(80, 50, 20, 0.1);
          padding: 2px 6px;
          border-radius: 8px;
        }
        .btn-cancel {
          background: rgba(170, 110, 55, 0.2);
          border: 1px solid #bc8f5a;
          padding: 8px 20px;
          border-radius: 30px;
          cursor: pointer;
          color: #7a4a28;
        }
        .btn-submit {
          background: #b87a48;
          border: none;
          padding: 8px 20px;
          border-radius: 30px;
          color: #fff5e8;
          cursor: pointer;
        }
      `
      document.head.appendChild(style)
    }
  }
}
</script>

<style scoped>
.bookstore-manage-view {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 页面头部 */
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

/* 统计行 */
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

/* 卡片网格 */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 24px;
}
.book-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: rgba(250, 242, 228, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 28px;
  border: 1px solid rgba(190, 145, 85, 0.6);
  transition: all 0.25s ease;
}
.book-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(80, 50, 20, 0.12);
}
.book-cover-area {
  flex-shrink: 0;
  width: 120px;
  position: relative;
}
.book-cover-img {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(170, 110, 55, 0.5);
  background: #f0e4ce;
}
.book-cover-fallback {
  width: 120px;
  height: 160px;
  background: rgba(185, 125, 65, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(170, 110, 55, 0.6);
}
.book-cover-fallback i {
  font-size: 2.5rem;
  color: #b87a48;
}
.book-badge {
  position: absolute;
  top: -8px;
  left: 0;
  background: #b87a48;
  color: #fff5e8;
  font-size: 0.6rem;
  padding: 2px 10px;
  border-radius: 20px;
  white-space: nowrap;
}
.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.book-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4a2a12;
}
.book-author {
  font-size: 0.8rem;
  color: #7a5432;
  display: flex;
  align-items: center;
  gap: 6px;
}
.academic-tag, .school-tag {
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(185, 125, 65, 0.15);
  padding: 3px 10px;
  border-radius: 20px;
  width: fit-content;
}
.summary-preview {
  font-size: 0.75rem;
  color: #5a3a1e;
  line-height: 1.5;
  margin: 6px 0;
}

/* URL 显示区域 */
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
.copy-btn, .open-link {
  background: rgba(170, 110, 55, 0.15);
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  cursor: pointer;
  color: #8b5a34;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  text-decoration: none;
}
.copy-btn:hover, .open-link:hover {
  background: rgba(170, 110, 55, 0.35);
}

/* 卡片操作按钮 */
.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.action-btn {
  flex: 1;
  padding: 7px 0;
  border-radius: 30px;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}
.action-btn.read {
  background: #b87a48;
  border: none;
  color: #fff5e8;
}
.action-btn.read:hover {
  background: #9a5e32;
}
.action-btn.delete {
  background: rgba(200, 80, 50, 0.15);
  border: 1px solid #c4713a;
  color: #b85a2a;
}
.action-btn.delete:hover {
  background: rgba(200, 80, 50, 0.3);
}
.action-btn.detail {
  background: rgba(100, 70, 40, 0.15);
  border: 1px solid #bc8f5a;
  color: #7a4a28;
}
.action-btn.detail:hover {
  background: rgba(100, 70, 40, 0.25);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8b6946;
}
.empty-state i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 响应式 */
@media (max-width: 1100px) {
  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>