<template>
  <div class="job-list-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <i class="fas fa-briefcase"></i>
      <h1>职位列表</h1>
      <div class="header-badge">
        <i class="fas fa-leaf"></i> 杏林纳贤
      </div>
      <button class="btn-create" @click="openAddJob">
        <i class="fas fa-plus"></i> 发布职位
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-mini-card">
        <i class="fas fa-briefcase"></i>
        <div class="stat-num">{{ jobs.length }}</div>
        <div class="stat-label">在招职位</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-users"></i>
        <div class="stat-num">156</div>
        <div class="stat-label">本周应聘</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-chart-line"></i>
        <div class="stat-num">23%</div>
        <div class="stat-label">增长率</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-building"></i>
        <div class="stat-num">12</div>
        <div class="stat-label">合作机构</div>
      </div>
    </div>

    <!-- 职位卡片网格 -->
    <div class="jobs-grid">
      <div v-for="job in jobs" :key="job.id" class="job-card xinglin-card">
        <div class="job-header">
          <div class="job-icon">
            <i :class="job.icon"></i>
          </div>
          <div class="job-title-section">
            <h2 class="job-title">{{ job.title }}</h2>
            <div class="job-tags">
              <span class="tag tag-fulltime"><i class="fas fa-clock"></i> {{ job.type }}</span>
              <span class="tag tag-level"><i class="fas fa-star"></i> {{ job.level }}</span>
              <span class="tag tag-salary"><i class="fas fa-yen-sign"></i> {{ job.salary }}</span>
            </div>
          </div>
          <button class="btn-edit" @click="editJob(job)">
            <i class="fas fa-edit"></i>
          </button>
        </div>

        <!-- 职位描述 -->
        <div class="job-section">
          <div class="section-title">
            <i class="fas fa-file-alt"></i>
            <span>职位描述</span>
          </div>
          <p class="section-content">{{ job.description }}</p>
        </div>

        <!-- 任职要求 -->
        <div class="job-section">
          <div class="section-title">
            <i class="fas fa-check-circle"></i>
            <span>任职要求</span>
          </div>
          <ul class="requirement-list">
            <li v-for="req in job.requirements" :key="req"><i class="fas fa-graduation-cap"></i> {{ req }}</li>
          </ul>
        </div>

        <!-- 核心能力 -->
        <div class="job-section">
          <div class="section-title">
            <i class="fas fa-bolt"></i>
            <span>核心能力</span>
          </div>
          <div class="skills-wrapper">
            <span v-for="skill in job.skills" :key="skill" class="skill-badge">
              <i class="fas fa-check-circle"></i> {{ skill }}
            </span>
          </div>
        </div>

        <!-- 卡片底部操作 -->
        <div class="job-footer">
          <div class="update-info">
            <i class="fas fa-calendar-alt"></i> 更新于 {{ job.updateDate }}
          </div>
          <div class="action-buttons">
            <button class="btn-outline-sm" @click="previewJob(job)"><i class="fas fa-eye"></i> 预览</button>
            <button class="btn-primary-sm" @click="manageApplicants(job)"><i class="fas fa-envelope"></i> 应聘管理</button>
            <button class="btn-delete-sm" @click="deleteJob(job)"><i class="fas fa-trash-alt"></i> 删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="jobs.length === 0" class="empty-state">
      <i class="fas fa-briefcase"></i>
      <p>暂无职位，点击"发布职位"添加</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JobList',
  data() {
    return {
      jobs: [
        {
          id: 1,
          icon: 'fas fa-user-md',
          title: '中医主治医师',
          type: '全职',
          level: '主治医师',
          salary: '15-25K',
          description: '负责中医门诊诊疗工作，运用中医理论进行辨证论治，为患者提供个性化的中医治疗方案。负责中医科日常诊疗工作，能够独立处理常见病、多发病，参与科室会诊和病例讨论。',
          requirements: [
            '中医学、针灸推拿学等相关专业本科及以上学历',
            '持有中医执业医师资格证书',
            '3年以上中医临床工作经验',
            '熟练掌握中医四诊、辨证论治'
          ],
          skills: ['中医辨证', '针灸技术', '方剂应用', '医患沟通'],
          updateDate: '2026-04-12',
          applicants: 12
        },
        {
          id: 2,
          icon: 'fas fa-hand-holding-heart',
          title: '针灸推拿医师',
          type: '全职',
          level: '执业医师',
          salary: '12-20K',
          description: '运用针刺、艾灸、推拿等中医适宜技术治疗颈肩腰腿痛及内科杂病，制定个性化康复方案。参与科室科研项目，指导实习生临床实践。',
          requirements: [
            '针灸推拿专业本科及以上学历',
            '持有中医执业医师资格证',
            '精通经络腧穴及推拿手法',
            '有3年以上临床经验者优先'
          ],
          skills: ['针刺技术', '艾灸疗法', '推拿正骨', '康复指导'],
          updateDate: '2026-04-10',
          applicants: 8
        },
        {
          id: 3,
          icon: 'fas fa-mortar-pestle',
          title: '中药师',
          type: '全职',
          level: '主管药师',
          salary: '10-16K',
          description: '负责中药饮片调剂、审核处方、药品质量管理及用药咨询，参与中药制剂研发。指导患者合理用药，开展中药知识科普。',
          requirements: [
            '中药学本科及以上学历',
            '持有中药师资格证',
            '熟悉中药炮制及鉴定规范',
            '有医院药房工作经验者优先'
          ],
          skills: ['处方审核', '库存管理', '药事法规', '用药指导'],
          updateDate: '2026-04-08',
          applicants: 6
        },
        {
          id: 4,
          icon: 'fas fa-child',
          title: '中医儿科医师',
          type: '全职',
          level: '主治医师',
          salary: '18-28K',
          description: '负责儿科门诊诊疗工作，擅长小儿常见病、多发病的中医诊治，运用中药、推拿等综合疗法治疗儿科疾病。',
          requirements: [
            '中医儿科或中医学专业本科及以上学历',
            '持有中医执业医师资格证',
            '5年以上儿科临床经验',
            '熟练掌握小儿推拿技术'
          ],
          skills: ['儿科辨证', '小儿推拿', '中药调理', '家长沟通'],
          updateDate: '2026-04-07',
          applicants: 5
        },
        {
          id: 5,
          icon: 'fas fa-female',
          title: '中医妇科医师',
          type: '全职',
          level: '副主任医师',
          salary: '20-35K',
          description: '负责妇科门诊诊疗，擅长月经不调、不孕症、更年期综合征等妇科疾病的中医诊治，开展中西医结合治疗。',
          requirements: [
            '中医妇科专业硕士及以上学历',
            '持有中医执业医师资格证',
            '8年以上妇科临床经验',
            '熟悉宫腔镜等现代诊疗技术'
          ],
          skills: ['妇科辨证', '经方应用', '针灸调理', '医患沟通'],
          updateDate: '2026-04-05',
          applicants: 4
        },
        {
          id: 6,
          icon: 'fas fa-lungs',
          title: '中医内科医师',
          type: '全职',
          level: '执业医师',
          salary: '12-18K',
          description: '负责内科常见病、多发病的中医诊治，擅长呼吸、消化系统疾病的中医治疗，参与住院部查房工作。',
          requirements: [
            '中医学专业本科及以上学历',
            '持有中医执业医师资格证',
            '2年以上内科临床经验',
            '能独立完成病历书写'
          ],
          skills: ['内科辨证', '方剂配伍', '病历书写', '急症处理'],
          updateDate: '2026-04-03',
          applicants: 7
        }
      ]
    }
  },
  mounted() {
    this.injectModalStyles()
  },
  methods: {
    // 打开新增职位弹窗
    openAddJob() {
      this.showJobFormModal(null)
    },
    // 编辑职位
    editJob(job) {
      this.showJobFormModal(job)
    },
    // 删除职位
    deleteJob(job) {
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
          <p style="font-size: 1rem; color: #4a2a12;">确定要删除职位“${this.escapeHtml(job.title)}”吗？</p>
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
        const index = this.jobs.findIndex(j => j.id === job.id)
        if (index !== -1) {
          this.jobs.splice(index, 1)
          alert('职位已删除')
        }
        closeModal()
      }
    },
    // 预览职位
    previewJob(job) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      
      const requirementsHtml = job.requirements.map(req => `<li><i class="fas fa-check-circle"></i> ${this.escapeHtml(req)}</li>`).join('')
      const skillsHtml = job.skills.map(skill => `<span class="detail-skill">${this.escapeHtml(skill)}</span>`).join('')
      
      const modal = document.createElement('div')
      modal.className = 'native-modal-container detail-modal'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-briefcase"></i> ${this.escapeHtml(job.title)} · 职位详情</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body detail-modal-body">
          <div class="detail-tags">
            <span class="detail-tag"><i class="fas fa-clock"></i> ${job.type}</span>
            <span class="detail-tag"><i class="fas fa-star"></i> ${job.level}</span>
            <span class="detail-tag"><i class="fas fa-yen-sign"></i> ${job.salary}</span>
          </div>
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-file-alt"></i> 职位描述</div>
            <div class="detail-text">${this.escapeHtml(job.description)}</div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-check-circle"></i> 任职要求</div>
            <ul class="detail-list">${requirementsHtml}</ul>
          </div>
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-bolt"></i> 核心能力</div>
            <div class="detail-skills">${skillsHtml}</div>
          </div>
          <div class="detail-info">
            <div><i class="fas fa-calendar-alt"></i> 更新于 ${job.updateDate}</div>
            <div><i class="fas fa-users"></i> 当前应聘 ${job.applicants} 人</div>
          </div>
        </div>
        <div class="native-modal-footer">
          <button class="btn-primary-sm" onclick="this.closest('.native-modal-overlay').remove()">关闭</button>
        </div>
      `
      
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
    },
    // 应聘管理
    manageApplicants(job) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      
      const modal = document.createElement('div')
      modal.className = 'native-modal-container'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-users"></i> ${this.escapeHtml(job.title)} · 应聘列表</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body">
          <div class="applicant-list">
            <div class="applicant-item">
              <div class="applicant-avatar">李</div>
              <div class="applicant-info">
                <div class="applicant-name">李明远</div>
                <div class="applicant-detail">中医主治医师 · 8年经验 · 硕士</div>
              </div>
              <div class="applicant-status pending">待审核</div>
              <button class="applicant-btn">查看简历</button>
            </div>
            <div class="applicant-item">
              <div class="applicant-avatar">王</div>
              <div class="applicant-info">
                <div class="applicant-name">王若溪</div>
                <div class="applicant-detail">针灸推拿医师 · 5年经验 · 本科</div>
              </div>
              <div class="applicant-status reviewing">审核中</div>
              <button class="applicant-btn">查看简历</button>
            </div>
            <div class="applicant-item">
              <div class="applicant-avatar">张</div>
              <div class="applicant-info">
                <div class="applicant-name">张仲景</div>
                <div class="applicant-detail">中医内科医师 · 10年经验 · 博士</div>
              </div>
              <div class="applicant-status approved">已通过</div>
              <button class="applicant-btn">查看简历</button>
            </div>
          </div>
        </div>
        <div class="native-modal-footer">
          <button class="btn-cancel" onclick="this.closest('.native-modal-overlay').remove()">关闭</button>
        </div>
      `
      
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
    },
    // 显示职位表单弹窗
    showJobFormModal(job) {
      const isEdit = !!job
      const title = isEdit ? '编辑职位' : '发布职位'
      
      const formData = isEdit ? {
        title: job.title,
        type: job.type,
        level: job.level,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements.join('\n'),
        skills: job.skills.join('\n')
      } : {
        title: '',
        type: '全职',
        level: '执业医师',
        salary: '',
        description: '',
        requirements: '',
        skills: ''
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
          <div class="form-group">
            <label>职位名称 <span class="required">*</span></label>
            <input type="text" id="jobTitle" value="${this.escapeHtml(formData.title)}" placeholder="请输入职位名称" />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>工作类型</label>
              <select id="jobType">
                <option value="全职" ${formData.type === '全职' ? 'selected' : ''}>全职</option>
                <option value="兼职" ${formData.type === '兼职' ? 'selected' : ''}>兼职</option>
                <option value="实习" ${formData.type === '实习' ? 'selected' : ''}>实习</option>
              </select>
            </div>
            <div class="form-group">
              <label>职称级别</label>
              <select id="jobLevel">
                <option value="执业医师" ${formData.level === '执业医师' ? 'selected' : ''}>执业医师</option>
                <option value="主治医师" ${formData.level === '主治医师' ? 'selected' : ''}>主治医师</option>
                <option value="副主任医师" ${formData.level === '副主任医师' ? 'selected' : ''}>副主任医师</option>
                <option value="主任医师" ${formData.level === '主任医师' ? 'selected' : ''}>主任医师</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>薪资范围</label>
            <input type="text" id="jobSalary" value="${this.escapeHtml(formData.salary)}" placeholder="如: 15-25K" />
          </div>
          <div class="form-group">
            <label>职位描述 <span class="required">*</span></label>
            <textarea id="jobDescription" rows="4" placeholder="请输入职位描述...">${this.escapeHtml(formData.description)}</textarea>
          </div>
          <div class="form-group">
            <label>任职要求（每行一个）</label>
            <textarea id="jobRequirements" rows="4" placeholder="每行一个任职要求...">${this.escapeHtml(formData.requirements)}</textarea>
          </div>
          <div class="form-group">
            <label>核心能力（每行一个）</label>
            <textarea id="jobSkills" rows="3" placeholder="每行一个核心能力...">${this.escapeHtml(formData.skills)}</textarea>
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
        const newTitle = modal.querySelector('#jobTitle').value.trim()
        if (!newTitle) {
          alert('请填写职位名称')
          return
        }
        
        const newDescription = modal.querySelector('#jobDescription').value.trim()
        if (!newDescription) {
          alert('请填写职位描述')
          return
        }
        
        const requirementsText = modal.querySelector('#jobRequirements').value
        const requirements = requirementsText.split('\n').filter(r => r.trim())
        
        const skillsText = modal.querySelector('#jobSkills').value
        const skills = skillsText.split('\n').filter(s => s.trim())
        
        const jobData = {
          id: isEdit ? job.id : Date.now(),
          icon: 'fas fa-briefcase',
          title: newTitle,
          type: modal.querySelector('#jobType').value,
          level: modal.querySelector('#jobLevel').value,
          salary: modal.querySelector('#jobSalary').value,
          description: newDescription,
          requirements: requirements,
          skills: skills,
          updateDate: new Date().toISOString().slice(0, 10),
          applicants: isEdit ? job.applicants : 0
        }
        
        if (isEdit) {
          const index = this.jobs.findIndex(j => j.id === job.id)
          if (index !== -1) {
            this.jobs[index] = { ...this.jobs[index], ...jobData }
            alert('职位已更新')
          }
        } else {
          this.jobs.unshift(jobData)
          alert('职位已发布')
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
          line-height: 1.6;
          color: #5a3a1e;
          background: rgba(185, 125, 65, 0.05);
          padding: 12px;
          border-radius: 16px;
        }
        .detail-list {
          list-style: none;
          padding-left: 0;
        }
        .detail-list li {
          padding: 6px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #5a3a1e;
        }
        .detail-list li i {
          color: #b87a48;
        }
        .detail-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .detail-skill {
          background: rgba(185, 125, 65, 0.12);
          padding: 5px 14px;
          border-radius: 25px;
          font-size: 0.8rem;
          color: #5a3a1e;
        }
        .detail-info {
          display: flex;
          gap: 20px;
          padding: 12px;
          background: rgba(185, 125, 65, 0.08);
          border-radius: 16px;
          font-size: 0.75rem;
          color: #8b6946;
        }
        .applicant-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .applicant-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: rgba(185, 125, 65, 0.08);
          border-radius: 20px;
          flex-wrap: wrap;
        }
        .applicant-avatar {
          width: 44px;
          height: 44px;
          background: #b87a48;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }
        .applicant-info {
          flex: 1;
        }
        .applicant-name {
          font-weight: 600;
          color: #4a2a12;
        }
        .applicant-detail {
          font-size: 0.7rem;
          color: #8b6946;
        }
        .applicant-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
        }
        .applicant-status.pending {
          background: rgba(196, 165, 110, 0.2);
          color: #c4a56e;
        }
        .applicant-status.reviewing {
          background: rgba(107, 165, 165, 0.2);
          color: #6ba5a5;
        }
        .applicant-status.approved {
          background: rgba(141, 171, 127, 0.2);
          color: #548235;
        }
        .applicant-btn {
          background: rgba(170, 110, 55, 0.15);
          border: none;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          color: #7a4a28;
          font-size: 0.7rem;
        }
        .btn-cancel {
          background: rgba(170, 110, 55, 0.2);
          border: 1px solid #bc8f5a;
          padding: 8px 20px;
          border-radius: 30px;
          cursor: pointer;
          color: #7a4a28;
        }
        .btn-submit, .btn-primary-sm {
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
.job-list-view {
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
.btn-create:hover {
  background: linear-gradient(135deg, #9a5e32, #7e461f);
  transform: translateY(-1px);
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

/* 职位网格 */
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(460px, 1fr));
  gap: 24px;
}

/* 职位卡片 */
.job-card {
  background: rgba(250, 242, 228, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 28px;
  border: 1px solid rgba(190, 145, 85, 0.6);
  padding: 1.5rem;
  transition: all 0.25s ease;
}
.job-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(80, 50, 20, 0.12);
  border-color: rgba(170, 120, 55, 0.8);
}

/* 卡片头部 */
.job-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px dashed rgba(170, 125, 65, 0.5);
}
.job-icon {
  width: 56px;
  height: 56px;
  background: rgba(185, 125, 65, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(170, 110, 50, 0.5);
}
.job-icon i {
  font-size: 1.8rem;
  color: #b87a48;
}
.job-title-section {
  flex: 1;
}
.job-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #4a2a12;
  margin-bottom: 8px;
}
.job-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.tag {
  font-size: 0.7rem;
  padding: 3px 10px;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.tag-fulltime {
  background: rgba(100, 70, 35, 0.2);
  color: #5a3a1e;
}
.tag-level {
  background: rgba(200, 130, 70, 0.25);
  color: #9a5530;
}
.tag-salary {
  background: rgba(107, 165, 165, 0.2);
  color: #6ba5a5;
}
.btn-edit {
  background: rgba(170, 120, 70, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 12px;
  cursor: pointer;
  color: #8b5a34;
  transition: all 0.2s;
}
.btn-edit:hover {
  background: rgba(170, 120, 70, 0.4);
  color: #b85c2a;
}

/* 区块样式 */
.job-section {
  margin-bottom: 20px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #7a4e28;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}
.section-title i {
  font-size: 0.95rem;
  color: #b87a48;
}
.section-content {
  font-size: 0.9rem;
  line-height: 1.55;
  color: #4a301a;
  padding-left: 26px;
}
.requirement-list {
  list-style: none;
  padding-left: 26px;
}
.requirement-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  padding: 6px 0;
  color: #4e331c;
  border-bottom: 1px dotted rgba(150, 110, 60, 0.2);
}
.requirement-list li i {
  width: 20px;
  color: #b87a48;
  font-size: 0.8rem;
}
.skills-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-left: 26px;
}
.skill-badge {
  background: rgba(185, 125, 65, 0.2);
  border: 1px solid rgba(170, 110, 55, 0.5);
  padding: 5px 14px;
  border-radius: 40px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #5a351c;
  transition: all 0.2s;
}
.skill-badge i {
  font-size: 0.75rem;
  color: #b16d3c;
}
.skill-badge:hover {
  background: rgba(185, 125, 65, 0.35);
  transform: translateY(-1px);
}

/* 卡片底部 */
.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(170, 125, 65, 0.4);
  flex-wrap: wrap;
  gap: 12px;
}
.update-info {
  font-size: 0.7rem;
  color: #8b6946;
  display: flex;
  align-items: center;
  gap: 6px;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
.btn-outline-sm {
  background: transparent;
  border: 1px solid #bc8f5a;
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 0.75rem;
  color: #6e4628;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-outline-sm:hover {
  background: rgba(190, 140, 75, 0.2);
}
.btn-primary-sm {
  background: #b87a48;
  border: none;
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 0.75rem;
  color: #fff5e8;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-primary-sm:hover {
  background: #9a5e32;
}
.btn-delete-sm {
  background: rgba(200, 80, 50, 0.15);
  border: 1px solid #c4713a;
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 0.75rem;
  color: #b85a2a;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-delete-sm:hover {
  background: rgba(200, 80, 50, 0.3);
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
@media (max-width: 1000px) {
  .jobs-grid {
    grid-template-columns: 1fr;
  }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>