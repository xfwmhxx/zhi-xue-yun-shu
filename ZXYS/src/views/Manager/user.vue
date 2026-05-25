<template>
  <div class="user-manage-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <i class="fas fa-users"></i>
      <h1>用户管理</h1>
      <div class="header-badge"><i class="fas fa-leaf"></i> 杏林用户 · 管理端</div>
      <button class="btn-create" @click="openAddUser"><i class="fas fa-plus"></i> 新增用户</button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-mini-card">
        <i class="fas fa-user"></i>
        <div class="stat-num">{{ totalUsers }}</div>
        <div class="stat-label">总用户数</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-user-check"></i>
        <div class="stat-num">{{ activeUsers }}</div>
        <div class="stat-label">活跃用户</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-user-graduate"></i>
        <div class="stat-num">{{ teacherUsers }}</div>
        <div class="stat-label">管理员用户</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-chart-line"></i>
        <div class="stat-num">+12%</div>
        <div class="stat-label">月增长率</div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-area">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="搜索用户昵称/邮箱/ID..." v-model="searchKeyword" />
      </div>
      <div class="filter-area">
        <select v-model="filterRole">
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="teacher">教师</option>
          <option value="student">学生</option>
        </select>
        <select v-model="filterStatus">
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">停用</option>
        </select>
        <button class="filter-btn" @click="resetFilters">
          <i class="fas fa-undo-alt"></i> 重置
        </button>
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="xinglin-card">
      <div class="table-wrapper">
        <table class="user-table">
          <thead>
            <tr>
              <th>用户ID</th>
              <th>昵称</th>
              <th>邮箱</th>
              <th>密码</th>
              <th>角色</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td class="user-id">#{{ user.id }}</td>
              <td class="user-name">
                <div class="user-avatar" :style="{ backgroundColor: getAvatarColor(user.id) }">
                  {{ user.nickname.charAt(0) }}
                </div>
                <span>{{ user.nickname }}</span>
              </td>
              <td>{{ user.email }}</td>
              <td class="password-cell">
                <span class="password-mask">{{ passwordMask }}</span>
                <button class="show-pwd-btn" @click="showPassword(user)" title="显示密码">
                  <i class="fas fa-eye"></i>
                </button>
              </td>
              <td>
                <span :class="['role-badge', getRoleClass(user.role)]">
                  <i :class="getRoleIcon(user.role)"></i> {{ getRoleName(user.role) }}
                </span>
              </td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    user.status === 'active' ? 'status-active' : 'status-inactive',
                  ]"
                  @click="toggleUserStatus(user)"
                >
                  {{ user.status === 'active' ? '活跃' : '停用' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td class="action-cell">
                <button class="action-icon" @click="editUser(user)" title="编辑">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-icon delete" @click="deleteUser(user)" title="删除">
                  <i class="fas fa-trash-alt"></i>
                </button>
                <button class="action-icon" @click="viewUserDetail(user)" title="详情">
                  <i class="fas fa-info-circle"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span>共 {{ filteredUsers.length }} 条记录</span>
        <div class="pagination">
          <button @click="currentPage--" :disabled="currentPage === 1">&lt;</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserManage',
  data() {
    return {
      searchKeyword: '',
      filterRole: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 10,
      passwordMask: '********',
      // 用户数据
      users: [
        {
          id: 10001,
          nickname: '杏林医者',
          email: 'zhangyi@tcm.com',
          password: 'zhang123456',
          role: 'teacher',
          status: 'active',
          bio: '从事中医临床工作15年，擅长针灸推拿',
          createdAt: '2026-01-15T08:30:00Z',
        },
        {
          id: 10002,
          nickname: '当归',
          email: 'danggui@example.com',
          password: 'danggui2024',
          role: 'student',
          status: 'active',
          bio: '中医爱好者，正在学习伤寒论',
          createdAt: '2026-02-20T10:15:00Z',
        },
        {
          id: 10003,
          nickname: '甘草',
          email: 'gancao@example.com',
          password: 'gancao123',
          role: 'student',
          status: 'inactive',
          bio: '学习中草药学',
          createdAt: '2026-03-10T14:45:00Z',
        },
        {
          id: 10004,
          nickname: '黄帝内经',
          email: 'huangdi@tcm.com',
          password: 'huangdi2024',
          role: 'teacher',
          status: 'active',
          bio: '中医经典讲师，主讲内经、伤寒论',
          createdAt: '2026-01-05T09:20:00Z',
        },
        {
          id: 10005,
          nickname: '扁鹊',
          email: 'bianque@tcm.com',
          password: 'bianque123',
          role: 'admin',
          status: 'active',
          bio: '系统管理员，负责平台运营',
          createdAt: '2025-12-01T11:00:00Z',
        },
        {
          id: 10006,
          nickname: '华佗再世',
          email: 'huatuo@example.com',
          password: 'huatuo2024',
          role: 'teacher',
          status: 'active',
          bio: '针灸推拿专业教师',
          createdAt: '2026-04-18T16:30:00Z',
        },
        {
          id: 10007,
          nickname: '山药',
          email: 'shanyao@example.com',
          password: 'shanyao123',
          role: 'student',
          status: 'active',
          bio: '正在备考中医执业医师',
          createdAt: '2026-05-22T13:20:00Z',
        },
        {
          id: 10008,
          nickname: '枸杞子',
          email: 'gouqi@example.com',
          password: 'gouqi2024',
          role: 'student',
          status: 'inactive',
          bio: '',
          createdAt: '2026-06-10T09:45:00Z',
        },
        {
          id: 10009,
          nickname: '孙思邈',
          email: 'sun simiao@tcm.com',
          password: 'sun123456',
          role: 'teacher',
          status: 'active',
          bio: '千金方研究专家',
          createdAt: '2026-01-20T15:30:00Z',
        },
      ],
    }
  },
  computed: {
    totalUsers() {
      return this.users.length
    },
    activeUsers() {
      return this.users.filter((u) => u.status === 'active').length
    },
    teacherUsers() {
      return this.users.filter((u) => u.role === 'teacher' || u.role === 'admin').length
    },
    filteredUsers() {
      let result = [...this.users]
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(
          (u) =>
            u.nickname.toLowerCase().includes(keyword) ||
            u.email.toLowerCase().includes(keyword) ||
            u.id.toString().includes(keyword),
        )
      }
      if (this.filterRole) {
        result = result.filter((u) => u.role === this.filterRole)
      }
      if (this.filterStatus) {
        result = result.filter((u) => u.status === this.filterStatus)
      }
      return result
    },
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.pageSize)
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredUsers.slice(start, end)
    },
  },
  watch: {
    searchKeyword() {
      this.currentPage = 1
    },
    filterRole() {
      this.currentPage = 1
    },
    filterStatus() {
      this.currentPage = 1
    },
  },
  mounted() {
    // 添加全局弹窗样式
    this.injectModalStyles()
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '未知'
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    getRoleName(role) {
      const roleMap = {
        admin: '管理员',
        teacher: '教师',
        student: '学生',
      }
      return roleMap[role] || '未知'
    },
    getRoleClass(role) {
      const classMap = {
        admin: 'role-admin',
        teacher: 'role-teacher',
        student: 'role-student',
      }
      return classMap[role] || ''
    },
    getRoleIcon(role) {
      const iconMap = {
        admin: 'fas fa-crown',
        teacher: 'fas fa-chalkboard-teacher',
        student: 'fas fa-graduation-cap',
      }
      return iconMap[role] || 'fas fa-user'
    },
    getAvatarColor(id) {
      const colors = ['#6ba5a5', '#c4a56e', '#8dab7f', '#e08f6e', '#7a6b8a', '#c4713a']
      return colors[id % colors.length]
    },
    showPassword(user) {
      alert(`用户 ${user.nickname} 的密码是：${user.password}`)
    },
    resetFilters() {
      this.searchKeyword = ''
      this.filterRole = ''
      this.filterStatus = ''
      this.currentPage = 1
    },
    // 打开新增用户弹窗
    openAddUser() {
      this.showFormModal({
        title: '新增用户',
        fields: [
          { name: 'nickname', label: '昵称', type: 'text', required: true },
          { name: 'email', label: '邮箱', type: 'email', required: true },
          {
            name: 'password',
            label: '密码',
            type: 'password',
            required: true,
            placeholder: '6-20位',
          },
          {
            name: 'role',
            label: '角色',
            type: 'select',
            options: ['student', 'teacher', 'admin'],
            required: true,
          },
          { name: 'bio', label: '简介', type: 'textarea', required: false },
        ],
        onSubmit: (data) => {
          const newId = Math.max(...this.users.map((u) => u.id), 10000) + 1
          this.users.unshift({
            id: newId,
            nickname: data.nickname,
            email: data.email,
            password: data.password,
            role: data.role,
            status: 'active',
            bio: data.bio || '',
            createdAt: new Date().toISOString(),
          })
          alert('用户已添加')
        },
      })
    },
    // 编辑用户
    editUser(user) {
      this.showFormModal({
        title: '编辑用户',
        fields: [
          { name: 'nickname', label: '昵称', type: 'text', value: user.nickname, required: true },
          { name: 'email', label: '邮箱', type: 'email', value: user.email, required: true },
          {
            name: 'password',
            label: '密码',
            type: 'password',
            value: '',
            placeholder: '留空则不修改',
            required: false,
          },
          {
            name: 'role',
            label: '角色',
            type: 'select',
            options: ['student', 'teacher', 'admin'],
            value: user.role,
            required: true,
          },
          { name: 'bio', label: '简介', type: 'textarea', value: user.bio || '', required: false },
        ],
        onSubmit: (data) => {
          user.nickname = data.nickname
          user.email = data.email
          if (data.password && data.password.length >= 6) user.password = data.password
          user.role = data.role
          user.bio = data.bio || ''
          alert('用户信息已更新')
        },
      })
    },
    // 删除用户
    deleteUser(user) {
      this.showConfirmModal({
        title: '确认删除',
        message: `确定要删除用户“${user.nickname}”吗？此操作不可恢复。`,
        onConfirm: () => {
          const index = this.users.findIndex((u) => u.id === user.id)
          if (index !== -1) {
            this.users.splice(index, 1)
            alert('用户已删除')
          }
        },
      })
    },
    // 切换用户状态
    toggleUserStatus(user) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      this.showConfirmModal({
        title: '确认操作',
        message: `确定要将用户“${user.nickname}”状态改为${newStatus === 'active' ? '活跃' : '停用'}吗？`,
        onConfirm: () => {
          user.status = newStatus
          alert('状态已更新')
        },
      })
    },
    // 查看用户详情
    viewUserDetail(user) {
      this.showDetailModal({
        title: '用户详情',
        user: user,
      })
    },
    // 注入全局样式
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
          max-width: 550px;
        }
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
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
        .required-star {
          color: #c4713a;
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
        .detail-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px dotted rgba(170, 125, 65, 0.2);
        }
        .detail-label {
          width: 80px;
          font-weight: 600;
          color: #7a4e28;
          flex-shrink: 0;
        }
        .detail-value {
          color: #4a2a12;
          flex: 1;
        }
        .detail-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 16px;
        }
      `
      document.head.appendChild(style)
    },
    // 显示表单弹窗
    showFormModal(config) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'

      const modal = document.createElement('div')
      modal.className = 'native-modal-container'

      // 头部
      const header = document.createElement('div')
      header.className = 'native-modal-header'
      header.innerHTML = `
        <h3><i class="fas fa-user-edit"></i> ${config.title}</h3>
        <button class="native-modal-close"><i class="fas fa-times"></i></button>
      `

      // 内容区域
      const body = document.createElement('div')
      body.className = 'native-modal-body'

      let formHtml = ''
      for (const field of config.fields) {
        const value = field.value || ''
        const requiredHtml = field.required ? '<span class="required-star"> *</span>' : ''

        if (field.type === 'textarea') {
          formHtml += `
            <div class="form-group">
              <label>${field.label}${requiredHtml}</label>
              <textarea name="${field.name}" rows="3" placeholder="${field.placeholder || ''}">${escapeHtml(value)}</textarea>
            </div>
          `
        } else if (field.type === 'select') {
          let optionsHtml = ''
          for (const opt of field.options) {
            const selected = value === opt ? 'selected' : ''
            optionsHtml += `<option value="${opt}" ${selected}>${this.getRoleName(opt)}</option>`
          }
          formHtml += `
            <div class="form-group">
              <label>${field.label}${requiredHtml}</label>
              <select name="${field.name}">
                ${optionsHtml}
              </select>
            </div>
          `
        } else {
          formHtml += `
            <div class="form-group">
              <label>${field.label}${requiredHtml}</label>
              <input type="${field.type}" name="${field.name}" value="${escapeHtml(value)}" placeholder="${field.placeholder || ''}" />
            </div>
          `
        }
      }

      body.innerHTML = formHtml

      // 底部按钮
      const footer = document.createElement('div')
      footer.className = 'native-modal-footer'
      footer.innerHTML = `
        <button class="btn-cancel">取消</button>
        <button class="btn-submit">保存</button>
      `

      modal.appendChild(header)
      modal.appendChild(body)
      modal.appendChild(footer)
      overlay.appendChild(modal)
      document.body.appendChild(overlay)

      // 关闭事件
      const closeModal = () => {
        overlay.remove()
      }

      header.querySelector('.native-modal-close').onclick = closeModal
      footer.querySelector('.btn-cancel').onclick = closeModal
      overlay.onclick = (e) => {
        if (e.target === overlay) closeModal()
      }

      // 提交事件
      footer.querySelector('.btn-submit').onclick = () => {
        const formData = {}
        let isValid = true

        for (const field of config.fields) {
          const input = body.querySelector(`[name="${field.name}"]`)
          const value = input ? input.value.trim() : ''

          if (field.required && !value) {
            alert(`请填写${field.label}`)
            isValid = false
            break
          }

          if (field.name === 'password' && value && value.length < 6 && value.length > 0) {
            alert('密码长度至少6位')
            isValid = false
            break
          }

          if (field.name === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) {
              alert('请输入有效的邮箱地址')
              isValid = false
              break
            }
          }

          formData[field.name] = value
        }

        if (isValid) {
          config.onSubmit(formData)
          closeModal()
        }
      }

      function escapeHtml(str) {
        if (!str) return ''
        return str.replace(/[&<>]/g, function (m) {
          if (m === '&') return '&amp;'
          if (m === '<') return '&lt;'
          if (m === '>') return '&gt;'
          return m
        })
      }
    },
    // 显示确认弹窗
    showConfirmModal(config) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'

      const modal = document.createElement('div')
      modal.className = 'native-modal-container'

      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-question-circle"></i> ${config.title}</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body">
          <p style="font-size: 1rem; color: #4a2a12;">${config.message}</p>
        </div>
        <div class="native-modal-footer">
          <button class="btn-cancel">取消</button>
          <button class="btn-submit">确认</button>
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
        config.onConfirm()
        closeModal()
      }
    },
    // 显示详情弹窗
    showDetailModal(config) {
      const user = config.user
      const avatarColor = this.getAvatarColor(user.id)

      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'

      const modal = document.createElement('div')
      modal.className = 'native-modal-container large'

      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-user-circle"></i> ${config.title}</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body">
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div class="detail-avatar" style="background-color: ${avatarColor}">
              ${user.nickname.charAt(0)}
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-label">用户ID：</span>
            <span class="detail-value">#${user.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">昵称：</span>
            <span class="detail-value">${escapeHtml(user.nickname)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">邮箱：</span>
            <span class="detail-value">${escapeHtml(user.email)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">角色：</span>
            <span class="detail-value">${this.getRoleName(user.role)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">状态：</span>
            <span class="detail-value">${user.status === 'active' ? '活跃' : '停用'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">注册时间：</span>
            <span class="detail-value">${this.formatDate(user.createdAt)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">个人简介：</span>
            <span class="detail-value">${escapeHtml(user.bio || '暂无简介')}</span>
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

      function escapeHtml(str) {
        if (!str) return ''
        return str.replace(/[&<>]/g, function (m) {
          if (m === '&') return '&amp;'
          if (m === '<') return '&lt;'
          if (m === '>') return '&gt;'
          return m
        })
      }
    },
  },
}
</script>

<style scoped>
.user-manage-view {
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

/* 工具栏 */
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

/* 表格 */
.table-wrapper {
  overflow-x: auto;
}
.user-table {
  width: 100%;
  border-collapse: collapse;
}
.user-table th,
.user-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(170, 125, 65, 0.3);
}
.user-table th {
  font-weight: 600;
  color: #7a4e28;
  background: rgba(200, 170, 130, 0.2);
}
.user-id {
  font-weight: 600;
  color: #b87a48;
}
.user-name {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}
.password-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.password-mask {
  color: #8b6946;
}
.show-pwd-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #b87a48;
  font-size: 0.9rem;
}
.role-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.role-admin {
  background: #c4713a;
  color: white;
}
.role-teacher {
  background: #6ba5a5;
  color: white;
}
.role-student {
  background: #8dab7f;
  color: white;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  cursor: pointer;
  display: inline-block;
}
.status-active {
  background: #8dab7f;
  color: white;
}
.status-inactive {
  background: #c4a56e;
  color: white;
}
.action-cell {
  display: flex;
  gap: 8px;
}
.action-icon {
  background: rgba(170, 110, 55, 0.15);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  cursor: pointer;
  color: #7a4a28;
  transition: all 0.2s;
}
.action-icon:hover {
  background: rgba(170, 110, 55, 0.35);
}
.action-icon.delete:hover {
  background: rgba(200, 80, 50, 0.3);
  color: #c4713a;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 0;
  margin-top: 16px;
  border-top: 1px solid rgba(170, 125, 65, 0.3);
}
.pagination {
  display: flex;
  gap: 12px;
  align-items: center;
}
.pagination button {
  background: rgba(170, 110, 55, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  cursor: pointer;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
