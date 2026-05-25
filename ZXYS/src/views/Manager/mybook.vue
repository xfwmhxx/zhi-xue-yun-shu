<template>
  <div class="my-bookcase-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <i class="fas fa-book"></i>
      <h1>我的书架</h1>
      <div class="header-badge">
        <i class="fas fa-leaf"></i> 杏林典藏 · 个人书库
      </div>
      <button class="btn-create" @click="openAddBookToShelf">
        <i class="fas fa-plus"></i> 添加书籍
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-mini-card">
        <i class="fas fa-book-open"></i>
        <div class="stat-num">{{ totalBooks }}</div>
        <div class="stat-label">藏书总数</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-bookmark"></i>
        <div class="stat-num">{{ readingBooks }}</div>
        <div class="stat-label">在读中</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-check-circle"></i>
        <div class="stat-num">{{ completedBooks }}</div>
        <div class="stat-label">已读完</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-heart"></i>
        <div class="stat-num">{{ favoriteBooks }}</div>
        <div class="stat-label">收藏夹</div>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-info-card xinglin-card">
      <div class="user-avatar-large" :style="{ backgroundColor: getAvatarColor(currentUserId) }">
        {{ currentUser?.nickname?.charAt(0) || 'U' }}
      </div>
      <div class="user-info-detail">
        <h3>{{ currentUser?.nickname || '选择用户' }}</h3>
        <p><i class="fas fa-envelope"></i> {{ currentUser?.email || '未选择' }}</p>
        <p><i class="fas fa-id-card"></i> 用户ID: #{{ currentUserId || '未选择' }}</p>
      </div>
      <div class="user-selector">
        <label><i class="fas fa-user-switch"></i> 切换用户：</label>
        <select v-model="currentUserId" @change="onUserChange">
          <option value="">请选择用户</option>
          <option v-for="user in userList" :key="user.id" :value="user.id">
            #{{ user.id }} - {{ user.nickname }}
          </option>
        </select>
      </div>
    </div>

    <!-- 工具栏：搜索 + 标签页 -->
    <div class="shelf-toolbar">
      <div class="search-area">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="搜索书籍名称/作者..." 
          v-model="searchKeyword"
          @input="onSearchChange"
        />
        <button v-if="searchKeyword" class="clear-search" @click="clearSearch">
          <i class="fas fa-times-circle"></i>
        </button>
      </div>
      <div class="shelf-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon"></i> {{ tab.label }}
          <span class="count-badge">{{ getTabCount(tab.key) }}</span>
        </button>
      </div>
    </div>

    <!-- 搜索结果提示 -->
    <div v-if="searchKeyword && filteredBookshelf.length > 0" class="search-result-info">
      <i class="fas fa-search"></i> 找到 <strong>{{ filteredBookshelf.length }}</strong> 本与“<strong>{{ searchKeyword }}</strong>”相关的书籍
    </div>
    <div v-if="searchKeyword && filteredBookshelf.length === 0 && currentUserId" class="search-result-info empty-result">
      <i class="fas fa-search"></i> 未找到与“<strong>{{ searchKeyword }}</strong>”相关的书籍
    </div>

    <!-- 书籍卡片网格 -->
    <div class="books-grid">
      <div v-for="item in filteredBookshelf" :key="item.id" class="book-card xinglin-card">
        <div class="book-cover-area">
          <img 
            v-if="item.book.coverUrl" 
            :src="item.book.coverUrl" 
            :alt="item.book.title"
            class="book-cover-img"
            @error="handleImageError"
          />
          <div v-else class="book-cover-fallback">
            <i class="fas fa-book-medical"></i>
          </div>
          <div class="book-badge" :class="getStatusClass(item.status)">
            {{ getStatusText(item.status) }}
          </div>
        </div>
        <div class="book-info">
          <h3 class="book-title" v-html="highlightKeyword(item.book.title)"></h3>
          <p class="book-author" v-html="highlightKeyword(item.book.author)"></p>
          <div class="book-meta">
            <span class="meta-tag"><i class="fas fa-tag"></i> {{ item.book.category || '医典' }}</span>
            <span class="meta-tag"><i class="fas fa-calendar"></i> {{ formatDate(item.addedAt) }}</span>
          </div>
          
          <!-- 阅读进度 -->
          <div class="reading-progress" v-if="item.status !== 'wish'">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
            </div>
            <div class="progress-info">
              <span>阅读进度 {{ item.progress }}%</span>
              <span v-if="item.currentPage">第 {{ item.currentPage }} / {{ item.totalPages }} 页</span>
            </div>
          </div>
          
          <!-- 笔记摘要 -->
          <div class="book-note" v-if="item.note">
            <i class="fas fa-pencil-alt"></i> {{ item.note.substring(0, 60) }}{{ item.note.length > 60 ? '...' : '' }}
          </div>
          
          <!-- 操作按钮 -->
          <div class="card-actions">
            <button class="action-btn read" @click="readBook(item)">
              <i class="fas fa-book-open"></i> 阅读
            </button>
            <button class="action-btn edit" @click="editBookItem(item)">
              <i class="fas fa-edit"></i> 编辑
            </button>
            <button class="action-btn delete" @click="removeFromShelf(item)">
              <i class="fas fa-trash-alt"></i> 移除
            </button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredBookshelf.length === 0 && currentUserId && !searchKeyword" class="empty-state">
        <i class="fas fa-book"></i>
        <p>暂无书籍，点击"添加书籍"将典籍加入书架</p>
      </div>
      <div v-if="filteredBookshelf.length === 0 && currentUserId && searchKeyword" class="empty-state">
        <i class="fas fa-search"></i>
        <p>未找到与“{{ searchKeyword }}”相关的书籍</p>
      </div>
      <div v-if="!currentUserId" class="empty-state">
        <i class="fas fa-user"></i>
        <p>请先选择用户</p>
      </div>
    </div>

    <!-- 添加书籍弹窗 -->
    <div id="addBookModal" style="display: none;"></div>
  </div>
</template>

<script>
export default {
  name: 'MyBookcase',
  data() {
    return {
      activeTab: 'all',
      searchKeyword: '',
      tabs: [
        { key: 'all', label: '全部', icon: 'fas fa-book' },
        { key: 'reading', label: '在读', icon: 'fas fa-eye' },
        { key: 'completed', label: '已读完', icon: 'fas fa-check-circle' },
        { key: 'wish', label: '想读', icon: 'fas fa-star' }
      ],
      currentUserId: '',
      // 用户列表
      userList: [
        { id: 10001, nickname: '杏林医者', email: 'zhangyi@tcm.com', role: 'teacher' },
        { id: 10002, nickname: '当归', email: 'danggui@example.com', role: 'student' },
        { id: 10003, nickname: '甘草', email: 'gancao@example.com', role: 'student' },
        { id: 10004, nickname: '黄帝内经', email: 'huangdi@tcm.com', role: 'teacher' },
        { id: 10005, nickname: '扁鹊', email: 'bianque@tcm.com', role: 'admin' },
        { id: 10006, nickname: '华佗再世', email: 'huatuo@example.com', role: 'teacher' },
        { id: 10007, nickname: '山药', email: 'shanyao@example.com', role: 'student' },
        { id: 10008, nickname: '枸杞子', email: 'gouqi@example.com', role: 'student' }
      ],
      // 书籍库（所有可用书籍）
      bookLibrary: [
        { id: 1, title: '伤寒论', author: '张仲景', category: '经典解读', coverUrl: '', pdfUrl: 'https://example.com/pdf/shanghanlun.pdf' },
        { id: 2, title: '金匮要略方论', author: '张仲景', category: '经典解读', coverUrl: '', pdfUrl: 'https://example.com/pdf/jinkui.pdf' },
        { id: 3, title: '黄帝内经', author: '佚名', category: '经典解读', coverUrl: '', pdfUrl: 'https://example.com/pdf/neijing.pdf' },
        { id: 4, title: '温病条辨', author: '吴鞠通', category: '经典解读', coverUrl: '', pdfUrl: 'https://example.com/pdf/wenbing.pdf' },
        { id: 5, title: '针灸大成', author: '杨继洲', category: '针灸推拿', coverUrl: '', pdfUrl: 'https://example.com/pdf/zhenjiu.pdf' },
        { id: 6, title: '本草纲目', author: '李时珍', category: '中药学', coverUrl: '', pdfUrl: 'https://example.com/pdf/bencao.pdf' },
        { id: 7, title: '脉经', author: '王叔和', category: '诊断学', coverUrl: '', pdfUrl: 'https://example.com/pdf/maijing.pdf' },
        { id: 8, title: '医宗金鉴', author: '吴谦', category: '综合', coverUrl: '', pdfUrl: 'https://example.com/pdf/yizong.pdf' }
      ],
      // 用户书架数据（用户ID与书籍的关联）
      userBookshelf: {
        // 用户10001的书架
        10001: [
          { id: 's1', userId: 10001, bookId: 1, book: null, status: 'reading', progress: 65, currentPage: 245, totalPages: 380, note: '六经辨证体系非常精妙，太阳病篇已读完', addedAt: '2024-01-15T08:30:00Z', updatedAt: '2024-03-20T14:30:00Z' },
          { id: 's2', userId: 10001, bookId: 2, book: null, status: 'completed', progress: 100, currentPage: 262, totalPages: 262, note: '杂病论治的经典之作，值得反复研读', addedAt: '2024-02-10T10:15:00Z', updatedAt: '2024-04-05T16:20:00Z' },
          { id: 's3', userId: 10001, bookId: 4, book: null, status: 'wish', progress: 0, currentPage: 0, totalPages: 320, note: '', addedAt: '2024-03-01T09:00:00Z', updatedAt: '2024-03-01T09:00:00Z' }
        ],
        // 用户10002的书架
        10002: [
          { id: 's4', userId: 10002, bookId: 1, book: null, status: 'reading', progress: 30, currentPage: 114, totalPages: 380, note: '刚开始学习伤寒论，感觉很深奥', addedAt: '2024-02-20T11:00:00Z', updatedAt: '2024-04-10T15:30:00Z' },
          { id: 's5', userId: 10002, bookId: 3, book: null, status: 'reading', progress: 45, currentPage: 200, totalPages: 450, note: '上古天真论很有意思', addedAt: '2024-01-05T14:20:00Z', updatedAt: '2024-04-08T10:00:00Z' },
          { id: 's6', userId: 10002, bookId: 5, book: null, status: 'completed', progress: 100, currentPage: 280, totalPages: 280, note: '针灸入门必读', addedAt: '2023-12-10T09:30:00Z', updatedAt: '2024-02-15T11:45:00Z' }
        ],
        // 用户10003的书架
        10003: [
          { id: 's7', userId: 10003, bookId: 6, book: null, status: 'reading', progress: 20, currentPage: 150, totalPages: 750, note: '本草学巨著，需要慢慢消化', addedAt: '2024-03-15T10:00:00Z', updatedAt: '2024-04-12T14:00:00Z' },
          { id: 's8', userId: 10003, bookId: 2, book: null, status: 'wish', progress: 0, currentPage: 0, totalPages: 262, note: '', addedAt: '2024-04-01T08:30:00Z', updatedAt: '2024-04-01T08:30:00Z' }
        ]
      }
    }
  },
  computed: {
    currentUser() {
      return this.userList.find(u => u.id === this.currentUserId)
    },
    // 当前用户的书架（关联书籍信息）
    currentBookshelf() {
      const shelf = this.userBookshelf[this.currentUserId] || []
      return shelf.map(item => ({
        ...item,
        book: this.bookLibrary.find(b => b.id === item.bookId) || { title: '未知书籍', author: '未知', category: '未知' }
      }))
    },
    // 根据标签筛选
    tabFilteredBookshelf() {
      if (this.activeTab === 'all') return this.currentBookshelf
      return this.currentBookshelf.filter(item => item.status === this.activeTab)
    },
    // 根据搜索关键词筛选
    filteredBookshelf() {
      if (!this.searchKeyword.trim()) {
        return this.tabFilteredBookshelf
      }
      const keyword = this.searchKeyword.toLowerCase().trim()
      return this.tabFilteredBookshelf.filter(item => 
        item.book.title.toLowerCase().includes(keyword) ||
        item.book.author.toLowerCase().includes(keyword) ||
        (item.book.category && item.book.category.toLowerCase().includes(keyword))
      )
    },
    totalBooks() {
      return this.currentBookshelf.length
    },
    readingBooks() {
      return this.currentBookshelf.filter(item => item.status === 'reading').length
    },
    completedBooks() {
      return this.currentBookshelf.filter(item => item.status === 'completed').length
    },
    favoriteBooks() {
      return this.currentBookshelf.filter(item => item.status === 'wish').length
    }
  },
  watch: {
    currentUserId() {
      this.searchKeyword = ''
      this.activeTab = 'all'
    }
  },
  mounted() {
    this.injectModalStyles()
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '未知'
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    getAvatarColor(id) {
      const colors = ['#6ba5a5', '#c4a56e', '#8dab7f', '#e08f6e', '#7a6b8a', '#c4713a']
      return colors[(id || 0) % colors.length]
    },
    getStatusText(status) {
      const map = { reading: '在读', completed: '已读完', wish: '想读' }
      return map[status] || '未知'
    },
    getStatusClass(status) {
      const map = { reading: 'status-reading', completed: 'status-completed', wish: 'status-wish' }
      return map[status] || ''
    },
    getTabCount(tabKey) {
      if (tabKey === 'all') return this.totalBooks
      if (tabKey === 'reading') return this.readingBooks
      if (tabKey === 'completed') return this.completedBooks
      if (tabKey === 'wish') return this.favoriteBooks
      return 0
    },
    handleImageError(e) {
      e.target.style.display = 'none'
      if (e.target.parentElement?.querySelector('.book-cover-fallback')) {
        e.target.parentElement.querySelector('.book-cover-fallback').style.display = 'flex'
      }
    },
    onUserChange() {
      console.log('切换用户:', this.currentUserId)
      this.searchKeyword = ''
      this.activeTab = 'all'
    },
    onSearchChange() {
      // 搜索时自动重置到"全部"标签，让搜索结果更全面
      if (this.searchKeyword) {
        this.activeTab = 'all'
      }
    },
    clearSearch() {
      this.searchKeyword = ''
    },
    highlightKeyword(text) {
      if (!this.searchKeyword || !text) return text
      const keyword = this.searchKeyword.toLowerCase()
      const lowerText = text.toLowerCase()
      if (!lowerText.includes(keyword)) return text
      
      const regex = new RegExp(`(${this.escapeRegex(this.searchKeyword)})`, 'gi')
      return text.replace(regex, '<mark class="search-highlight">$1</mark>')
    },
    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    },
    // 打开添加书籍弹窗
    openAddBookToShelf() {
      if (!this.currentUserId) {
        alert('请先选择用户')
        return
      }
      
      const existingBookIds = (this.userBookshelf[this.currentUserId] || []).map(item => item.bookId)
      const availableBooks = this.bookLibrary.filter(book => !existingBookIds.includes(book.id))
      
      if (availableBooks.length === 0) {
        alert('所有书籍都已添加到书架')
        return
      }
      
      this.showAddBookModal(availableBooks)
    },
    // 显示添加书籍弹窗
    showAddBookModal(availableBooks) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      
      let booksHtml = ''
      for (const book of availableBooks) {
        booksHtml += `
          <div class="book-select-item" data-book-id="${book.id}" data-book-title="${this.escapeHtml(book.title)}" data-book-author="${this.escapeHtml(book.author)}">
            <div class="book-select-cover">
              <i class="fas fa-book"></i>
            </div>
            <div class="book-select-info">
              <div class="book-select-title">${this.escapeHtml(book.title)}</div>
              <div class="book-select-author">${this.escapeHtml(book.author)} 撰</div>
            </div>
          </div>
        `
      }
      
      const modal = document.createElement('div')
      modal.className = 'native-modal-container large'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-plus"></i> 添加书籍到书架</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body">
          <div class="book-select-list">
            ${booksHtml}
          </div>
        </div>
        <div class="native-modal-footer">
          <button class="btn-cancel">取消</button>
        </div>
      `
      
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      modal.querySelector('.btn-cancel').onclick = closeModal
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
      
      const bookItems = modal.querySelectorAll('.book-select-item')
      bookItems.forEach(item => {
        item.onclick = () => {
          const bookId = parseInt(item.dataset.bookId)
          const bookTitle = item.dataset.bookTitle
          this.showAddBookDetailModal(bookId, bookTitle)
          closeModal()
        }
      })
    },
    // 显示添加书籍详情弹窗
    showAddBookDetailModal(bookId, bookTitle) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      
      const modal = document.createElement('div')
      modal.className = 'native-modal-container'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-plus"></i> 添加《${this.escapeHtml(bookTitle)}》</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body">
          <div class="form-group">
            <label>阅读状态</label>
            <select id="bookStatus">
              <option value="reading">在读</option>
              <option value="wish">想读</option>
            </select>
          </div>
          <div class="form-group">
            <label>当前进度（页）</label>
            <input type="number" id="currentPage" value="0" min="0" />
          </div>
          <div class="form-group">
            <label>笔记</label>
            <textarea id="note" rows="3" placeholder="添加读书笔记..."></textarea>
          </div>
        </div>
        <div class="native-modal-footer">
          <button class="btn-cancel">取消</button>
          <button class="btn-submit">添加</button>
        </div>
      `
      
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      modal.querySelector('.btn-cancel').onclick = closeModal
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
      
      modal.querySelector('.btn-submit').onclick = () => {
        const status = modal.querySelector('#bookStatus').value
        const currentPage = parseInt(modal.querySelector('#currentPage').value) || 0
        const note = modal.querySelector('#note').value
        
        const book = this.bookLibrary.find(b => b.id === bookId)
        const totalPages = book?.totalPages || 300
        
        const progress = status === 'completed' ? 100 : Math.min(99, Math.floor((currentPage / totalPages) * 100))
        
        const newId = 's' + Date.now()
        const newItem = {
          id: newId,
          userId: this.currentUserId,
          bookId: bookId,
          book: null,
          status: status,
          progress: progress,
          currentPage: currentPage,
          totalPages: totalPages,
          note: note,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        if (!this.userBookshelf[this.currentUserId]) {
          this.$set(this.userBookshelf, this.currentUserId, [])
        }
        this.userBookshelf[this.currentUserId].push(newItem)
        alert(`《${bookTitle}》已添加到书架`)
        closeModal()
      }
    },
    // 编辑书架条目
    editBookItem(item) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      
      const modal = document.createElement('div')
      modal.className = 'native-modal-container'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-edit"></i> 编辑《${this.escapeHtml(item.book.title)}》</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body">
          <div class="form-group">
            <label>阅读状态</label>
            <select id="bookStatus">
              <option value="reading" ${item.status === 'reading' ? 'selected' : ''}>在读</option>
              <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>已读完</option>
              <option value="wish" ${item.status === 'wish' ? 'selected' : ''}>想读</option>
            </select>
          </div>
          <div class="form-group">
            <label>当前进度（页）</label>
            <input type="number" id="currentPage" value="${item.currentPage}" min="0" max="${item.totalPages}" />
          </div>
          <div class="form-group">
            <label>总页数</label>
            <input type="number" id="totalPages" value="${item.totalPages}" min="1" />
          </div>
          <div class="form-group">
            <label>笔记</label>
            <textarea id="note" rows="3">${this.escapeHtml(item.note || '')}</textarea>
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
        const status = modal.querySelector('#bookStatus').value
        const currentPage = parseInt(modal.querySelector('#currentPage').value) || 0
        const totalPages = parseInt(modal.querySelector('#totalPages').value) || item.totalPages
        const note = modal.querySelector('#note').value
        
        let progress = 0
        if (status === 'completed') {
          progress = 100
        } else if (status === 'reading' && totalPages > 0) {
          progress = Math.min(99, Math.floor((currentPage / totalPages) * 100))
        }
        
        const shelf = this.userBookshelf[this.currentUserId]
        const index = shelf.findIndex(i => i.id === item.id)
        if (index !== -1) {
          shelf[index] = {
            ...shelf[index],
            status: status,
            progress: progress,
            currentPage: currentPage,
            totalPages: totalPages,
            note: note,
            updatedAt: new Date().toISOString()
          }
          alert('已更新')
        }
        closeModal()
      }
    },
    // 从书架移除
    removeFromShelf(item) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      
      const modal = document.createElement('div')
      modal.className = 'native-modal-container'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-trash-alt"></i> 确认移除</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body">
          <p style="font-size: 1rem; color: #4a2a12;">确定要将《${this.escapeHtml(item.book.title)}》从书架移除吗？</p>
        </div>
        <div class="native-modal-footer">
          <button class="btn-cancel">取消</button>
          <button class="btn-submit">确认移除</button>
        </div>
      `
      
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      modal.querySelector('.btn-cancel').onclick = closeModal
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
      
      modal.querySelector('.btn-submit').onclick = () => {
        const shelf = this.userBookshelf[this.currentUserId]
        const index = shelf.findIndex(i => i.id === item.id)
        if (index !== -1) {
          shelf.splice(index, 1)
          alert('已从书架移除')
        }
        closeModal()
      }
    },
    // 阅读书籍
    readBook(item) {
      alert(`打开书籍：《${item.book.title}》\n当前进度：第${item.currentPage}/${item.totalPages}页 (${item.progress}%)\nPDF地址：${item.book.pdfUrl || '暂无'}`)
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
    // 注入全局弹窗样式
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
          max-width: 500px;
          max-height: 85vh;
          background: rgba(250, 242, 228, 0.98);
          backdrop-filter: blur(12px);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: modalFadeIn 0.2s ease;
        }
        .native-modal-container.large {
          max-width: 600px;
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
        .native-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid rgba(170, 125, 65, 0.4);
          background: rgba(250, 242, 228, 0.9);
        }
        .form-group {
          margin-bottom: 18px;
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
        .book-select-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .book-select-item {
          display: flex;
          gap: 16px;
          padding: 12px;
          background: rgba(185, 125, 65, 0.1);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .book-select-item:hover {
          background: rgba(185, 125, 65, 0.25);
          transform: translateX(4px);
        }
        .book-select-cover {
          width: 50px;
          height: 70px;
          background: rgba(170, 110, 55, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .book-select-cover i {
          font-size: 1.5rem;
          color: #b87a48;
        }
        .book-select-info {
          flex: 1;
        }
        .book-select-title {
          font-weight: 600;
          color: #4a2a12;
          margin-bottom: 4px;
        }
        .book-select-author {
          font-size: 0.75rem;
          color: #8b6946;
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
        .search-highlight {
          background: #f0a55a;
          color: #4a2a12;
          padding: 0 2px;
          border-radius: 4px;
        }
      `
      document.head.appendChild(style)
    }
  }
}
</script>

<style scoped>
.my-bookcase-view {
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

/* 用户信息卡片 */
.user-info-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(250, 242, 228, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 28px;
  flex-wrap: wrap;
}
.user-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  font-weight: 600;
}
.user-info-detail {
  flex: 1;
}
.user-info-detail h3 {
  color: #4a2a12;
  margin-bottom: 8px;
}
.user-info-detail p {
  color: #7a5432;
  font-size: 0.85rem;
  margin: 4px 0;
}
.user-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-selector label {
  color: #7a4e28;
}
.user-selector select {
  padding: 8px 16px;
  background: rgba(250, 245, 235, 0.8);
  border: 1px solid rgba(170, 110, 55, 0.4);
  border-radius: 40px;
  font-size: 0.85rem;
  color: #4a2a12;
  outline: none;
}

/* 书架工具栏 */
.shelf-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.search-area {
  display: flex;
  align-items: center;
  background: rgba(250, 242, 228, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 48px;
  padding: 10px 20px;
  border: 1px solid rgba(170, 110, 55, 0.4);
}
.search-area i {
  color: #b87a48;
  margin-right: 10px;
}
.search-area input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.9rem;
  color: #4a2a12;
}
.search-area input::placeholder {
  color: #b89a6a;
}
.clear-search {
  background: none;
  border: none;
  cursor: pointer;
  color: #8b6946;
  font-size: 1rem;
  padding: 0 8px;
}
.clear-search:hover {
  color: #c4713a;
}

/* 标签页 */
.shelf-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(170, 125, 65, 0.3);
  padding-bottom: 12px;
}
.tab-btn {
  background: rgba(170, 110, 55, 0.15);
  border: none;
  padding: 8px 20px;
  border-radius: 30px;
  cursor: pointer;
  color: #7a4a28;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}
.tab-btn.active {
  background: #b87a48;
  color: #fff5e8;
}
.count-badge {
  background: rgba(0,0,0,0.1);
  border-radius: 20px;
  padding: 0 6px;
  font-size: 0.7rem;
}
.tab-btn.active .count-badge {
  background: rgba(255,255,255,0.2);
}

/* 搜索结果提示 */
.search-result-info {
  padding: 8px 16px;
  background: rgba(185, 125, 65, 0.15);
  border-radius: 30px;
  font-size: 0.85rem;
  color: #7a5432;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
}
.search-result-info i {
  color: #b87a48;
}
.search-result-info.empty-result {
  background: rgba(200, 80, 50, 0.1);
  color: #b85a2a;
}

/* 书籍网格 */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
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
  width: 100px;
  position: relative;
}
.book-cover-img {
  width: 100px;
  height: 130px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(170, 110, 55, 0.5);
  background: #f0e4ce;
}
.book-cover-fallback {
  width: 100px;
  height: 130px;
  background: rgba(185, 125, 65, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(170, 110, 55, 0.6);
}
.book-cover-fallback i {
  font-size: 2rem;
  color: #b87a48;
}
.book-badge {
  position: absolute;
  top: -8px;
  left: 0;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.6rem;
  white-space: nowrap;
}
.status-reading {
  background: #6ba5a5;
  color: white;
}
.status-completed {
  background: #8dab7f;
  color: white;
}
.status-wish {
  background: #c4a56e;
  color: white;
}
.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.book-title {
  font-size: 1.1rem;
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
.book-meta {
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
.reading-progress {
  margin: 8px 0;
}
.progress-bar {
  height: 6px;
  background: rgba(170, 110, 55, 0.2);
  border-radius: 10px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #b87a48;
  border-radius: 10px;
  transition: width 0.3s;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #8b6946;
  margin-top: 4px;
}
.book-note {
  font-size: 0.7rem;
  color: #7a5432;
  background: rgba(185, 125, 65, 0.1);
  padding: 6px 10px;
  border-radius: 12px;
}
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
.action-btn.edit {
  background: rgba(170, 110, 55, 0.2);
  border: 1px solid #b87a48;
  color: #7a4a28;
}
.action-btn.delete {
  background: rgba(200, 80, 50, 0.15);
  border: 1px solid #c4713a;
  color: #b85a2a;
}
.empty-state {
  grid-column: span 2;
  text-align: center;
  padding: 60px 20px;
  color: #8b6946;
}
.empty-state i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}
</style>