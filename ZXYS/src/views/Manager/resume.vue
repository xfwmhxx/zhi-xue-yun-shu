<template>
  <div class="resume-manage-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <i class="fas fa-file-alt"></i>
      <h1>简历管理</h1>
      <div class="header-badge">
        <i class="fas fa-leaf"></i> 杏林人才 · 简历库
      </div>
      <button class="btn-create" @click="openAddResume">
        <i class="fas fa-plus"></i> 新增简历
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-mini-card">
        <i class="fas fa-users"></i>
        <div class="stat-num">{{ totalResumes }}</div>
        <div class="stat-label">简历总数</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-graduation-cap"></i>
        <div class="stat-num">{{ doctorCount }}</div>
        <div class="stat-label">博士学历</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-stethoscope"></i>
        <div class="stat-num">{{ experiencedCount }}</div>
        <div class="stat-label">5年以上经验</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-certificate"></i>
        <div class="stat-num">{{ certifiedCount }}</div>
        <div class="stat-label">持有执业证</div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-area">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="搜索姓名/邮箱/学校..." v-model="searchKeyword" />
      </div>
      <div class="filter-area">
        <select v-model="filterEducation">
          <option value="">全部学历</option>
          <option value="博士">博士</option>
          <option value="硕士">硕士</option>
          <option value="本科">本科</option>
        </select>
        <select v-model="filterExperience">
          <option value="">全部经验</option>
          <option value="3年以下">3年以下</option>
          <option value="3-5年">3-5年</option>
          <option value="5年以上">5年以上</option>
        </select>
        <button class="filter-btn" @click="resetFilters">
          <i class="fas fa-undo-alt"></i> 重置
        </button>
      </div>
    </div>

    <!-- 简历卡片网格 -->
    <div class="resumes-grid">
      <div v-for="resume in paginatedResumes" :key="resume.id" class="resume-card xinglin-card">
        <!-- 简历头部 -->
        <div class="resume-header">
          <div class="resume-avatar" :style="{ backgroundColor: getAvatarColor(resume.id) }">
            {{ resume.name.charAt(0) }}
          </div>
          <div class="resume-title-section">
            <h2 class="resume-name">{{ resume.name }}</h2>
            <div class="resume-quote">
              <i class="fas fa-quote-left"></i> {{ resume.motto || '勤求古训，博采众方' }}
            </div>
          </div>
          <div class="resume-actions">
            <button class="action-icon" @click="editResume(resume)" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-icon delete" @click="deleteResume(resume)" title="删除">
              <i class="fas fa-trash-alt"></i>
            </button>
            <button class="action-icon" @click="viewResumeDetail(resume)" title="预览">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>

        <!-- 联系信息 -->
        <div class="contact-info">
          <span><i class="fas fa-envelope"></i> {{ resume.email }}</span>
          <span><i class="fas fa-phone"></i> {{ resume.phone }}</span>
          <span><i class="fas fa-map-marker-alt"></i> {{ resume.location }}</span>
        </div>

        <!-- 核心技能 -->
        <div class="skill-section">
          <div class="section-title">
            <i class="fas fa-star"></i> 核心技能
          </div>
          <div class="skill-list">
            <span v-for="skill in resume.skills" :key="skill" class="skill-tag">
              <i class="fas fa-check-circle"></i> {{ skill }}
            </span>
          </div>
        </div>

        <!-- 教育背景 -->
        <div class="education-section">
          <div class="section-title">
            <i class="fas fa-graduation-cap"></i> 教育背景
          </div>
          <div class="education-item">
            <div class="edu-header">
              <span class="edu-school">{{ resume.education.school }}</span>
              <span class="edu-date">{{ resume.education.date }}</span>
            </div>
            <div class="edu-major">{{ resume.education.major }}</div>
            <div class="edu-courses">{{ resume.education.courses }}</div>
          </div>
        </div>

        <!-- 研习经历 -->
        <div class="experience-section">
          <div class="section-title">
            <i class="fas fa-briefcase"></i> 研习经历
          </div>
          <div v-for="exp in resume.experiences" :key="exp.id" class="experience-item">
            <div class="exp-header">
              <span class="exp-title">{{ exp.title }}</span>
              <span class="exp-date">{{ exp.date }}</span>
            </div>
            <div class="exp-desc">{{ exp.description }}</div>
            <div class="exp-achievement" v-if="exp.achievement">
              <i class="fas fa-trophy"></i> {{ exp.achievement }}
            </div>
          </div>
        </div>

        <!-- 荣誉证书 -->
        <div class="certificate-section">
          <div class="section-title">
            <i class="fas fa-certificate"></i> 荣誉证书
          </div>
          <div class="certificate-list">
            <span v-for="cert in resume.certificates" :key="cert" class="cert-tag">
              <i class="fas fa-award"></i> {{ cert }}
            </span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredResumes.length === 0" class="empty-state">
        <i class="fas fa-file-alt"></i>
        <p>暂无简历，点击"新增简历"添加</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="filteredResumes.length > pageSize">
      <button @click="currentPage--" :disabled="currentPage === 1">&lt;</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">&gt;</button>
    </div>

    <!-- 简历详情弹窗 -->
    <div id="resumeDetailModal" style="display: none;"></div>
    <!-- 简历编辑弹窗 -->
    <div id="resumeEditModal" style="display: none;"></div>
  </div>
</template>

<script>
export default {
  name: 'ResumeManage',
  data() {
    return {
      searchKeyword: '',
      filterEducation: '',
      filterExperience: '',
      currentPage: 1,
      pageSize: 6,
      resumes: [
        {
          id: 1,
          name: 'hxx',
          motto: '勤求古训，博采众方',
          email: 'demo@example.com',
          phone: '13800000000',
          location: '浙江·温州',
          skills: [
            '中医四诊辨证: 精通望闻问切，尤其擅长舌诊与脉诊',
            '经方运用: 熟练运用《伤寒论》《金匮要略》经典方剂',
            '针灸推拿: 掌握传统针刺手法与推拿正骨技术',
            '中医养生: 擅长四季养生调理与食疗方制定'
          ],
          education: {
            school: '南京中医药大学',
            date: '2017.09 - 2025.06',
            major: '中医学（本硕博连读）',
            courses: '主修中医基础理论、中药学、方剂学、中医诊断学'
          },
          experiences: [
            {
              id: 1,
              title: '南京市中医院实习',
              date: '2022.07 - 2023.01',
              description: '协助主治医师辨证施治，独立完成病例书写',
              achievement: '参与"冬病夏治"三伏贴项目，服务患者500余人'
            }
          ],
          certificates: [
            '2025计算机设计大赛国家二等奖'
          ],
          educationLevel: '博士',
          experienceYears: '5年以上'
        },
        {
          id: 2,
          name: '李明远',
          motto: '大医精诚，仁心仁术',
          email: 'limingyuan@tcm.com',
          phone: '13812345678',
          location: '北京·朝阳',
          skills: [
            '中医内科: 擅长脾胃病、肝胆病诊治',
            '经方应用: 灵活运用经方治疗疑难杂症',
            '中医儿科: 小儿推拿与中药调理',
            '中医文献: 擅长古籍整理与研究'
          ],
          education: {
            school: '北京中医药大学',
            date: '2015.09 - 2023.06',
            major: '中医学（本硕连读）',
            courses: '主修中医内科学、伤寒论、金匮要略'
          },
          experiences: [
            {
              id: 1,
              title: '中国中医科学院广安门医院规培',
              date: '2020.08 - 2023.07',
              description: '完成中医内科住院医师规范化培训',
              achievement: '获评优秀规培医师'
            },
            {
              id: 2,
              title: '跟师学习',
              date: '2018.09 - 2023.06',
              description: '跟随国家级名老中医学习临床经验',
              achievement: '整理名医医案50余例'
            }
          ],
          certificates: [
            '中医执业医师资格证',
            '2023全国中医经典知识大赛一等奖',
            'SCI论文2篇'
          ],
          educationLevel: '硕士',
          experienceYears: '5年以上'
        },
        {
          id: 3,
          name: '王若溪',
          motto: '上工治未病',
          email: 'wangruoxi@tcm.com',
          phone: '15987654321',
          location: '上海·浦东',
          skills: [
            '针灸推拿: 擅长针灸治疗颈肩腰腿痛',
            '中医妇科: 月经不调、不孕症调理',
            '中医美容: 面部针灸与中药面膜',
            '中医养生: 体质辨识与调理'
          ],
          education: {
            school: '上海中医药大学',
            date: '2018.09 - 2022.06',
            major: '针灸推拿学（本科）',
            courses: '主修针灸学、推拿学、经络腧穴学'
          },
          experiences: [
            {
              id: 1,
              title: '龙华医院针灸科实习',
              date: '2021.07 - 2022.03',
              description: '协助针灸治疗，独立完成针刺操作',
              achievement: '参与社区义诊活动10余次'
            }
          ],
          certificates: [
            '针灸师资格证',
            '2024上海市针灸技能大赛三等奖',
            '高级保健按摩师'
          ],
          educationLevel: '本科',
          experienceYears: '3年以下'
        },
        {
          id: 4,
          name: '陈明远',
          motto: '博极医源，精勤不倦',
          email: 'chenmingyuan@tcm.com',
          phone: '13765432109',
          location: '广东·广州',
          skills: [
            '中医肿瘤: 擅长肿瘤术后调理',
            '经方运用: 深入研究经方抗肿瘤应用',
            '中医科研: 中医药抗肿瘤机制研究',
            '临床试验: GCP规范与临床试验设计'
          ],
          education: {
            school: '广州中医药大学',
            date: '2016.09 - 2024.06',
            major: '中医内科学（博士）',
            courses: '主修中医肿瘤学、临床研究方法学'
          },
          experiences: [
            {
              id: 1,
              title: '广东省中医院肿瘤科',
              date: '2020.09 - 2024.06',
              description: '参与肿瘤患者中西医结合诊疗',
              achievement: '发表SCI论文3篇，参与国家级课题2项'
            }
          ],
          certificates: [
            '中医执业医师资格证',
            'GCP证书',
            '2024广东省科技进步二等奖'
          ],
          educationLevel: '博士',
          experienceYears: '5年以上'
        }
      ]
    }
  },
  computed: {
    totalResumes() {
      return this.resumes.length
    },
    doctorCount() {
      return this.resumes.filter(r => r.educationLevel === '博士').length
    },
    experiencedCount() {
      return this.resumes.filter(r => r.experienceYears === '5年以上').length
    },
    certifiedCount() {
      return this.resumes.filter(r => r.certificates.some(c => c.includes('执业医师'))).length
    },
    filteredResumes() {
      let result = [...this.resumes]
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(r => 
          r.name.toLowerCase().includes(keyword) ||
          r.email.toLowerCase().includes(keyword) ||
          r.education.school.toLowerCase().includes(keyword)
        )
      }
      if (this.filterEducation) {
        result = result.filter(r => r.educationLevel === this.filterEducation)
      }
      if (this.filterExperience) {
        result = result.filter(r => r.experienceYears === this.filterExperience)
      }
      return result
    },
    totalPages() {
      return Math.ceil(this.filteredResumes.length / this.pageSize)
    },
    paginatedResumes() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredResumes.slice(start, end)
    }
  },
  watch: {
    searchKeyword() {
      this.currentPage = 1
    },
    filterEducation() {
      this.currentPage = 1
    },
    filterExperience() {
      this.currentPage = 1
    }
  },
  mounted() {
    this.injectModalStyles()
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '未知'
      return dateStr
    },
    getAvatarColor(id) {
      const colors = ['#6ba5a5', '#c4a56e', '#8dab7f', '#e08f6e', '#7a6b8a', '#c4713a']
      return colors[(id || 0) % colors.length]
    },
    resetFilters() {
      this.searchKeyword = ''
      this.filterEducation = ''
      this.filterExperience = ''
      this.currentPage = 1
    },
    // 打开新增简历弹窗
    openAddResume() {
      this.showResumeFormModal(null)
    },
    // 编辑简历
    editResume(resume) {
      this.showResumeFormModal(resume)
    },
    // 删除简历
    deleteResume(resume) {
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
          <p style="font-size: 1rem; color: #4a2a12;">确定要删除简历“${this.escapeHtml(resume.name)}”吗？</p>
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
        const index = this.resumes.findIndex(r => r.id === resume.id)
        if (index !== -1) {
          this.resumes.splice(index, 1)
          alert('简历已删除')
        }
        closeModal()
      }
    },
    // 查看简历详情
    viewResumeDetail(resume) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      
      const skillsHtml = resume.skills.map(s => `<div class="detail-skill-item"><i class="fas fa-check-circle"></i> ${this.escapeHtml(s)}</div>`).join('')
      const certificatesHtml = resume.certificates.map(c => `<span class="detail-cert-tag"><i class="fas fa-award"></i> ${this.escapeHtml(c)}</span>`).join('')
      const experiencesHtml = resume.experiences.map(exp => `
        <div class="detail-exp-item">
          <div class="detail-exp-header">
            <span class="detail-exp-title">${this.escapeHtml(exp.title)}</span>
            <span class="detail-exp-date">${this.escapeHtml(exp.date)}</span>
          </div>
          <div class="detail-exp-desc">${this.escapeHtml(exp.description)}</div>
          ${exp.achievement ? `<div class="detail-exp-achievement"><i class="fas fa-trophy"></i> ${this.escapeHtml(exp.achievement)}</div>` : ''}
        </div>
      `).join('')
      
      const modal = document.createElement('div')
      modal.className = 'native-modal-container detail-modal'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-file-alt"></i> ${this.escapeHtml(resume.name)} · 简历详情</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body detail-modal-body">
          <div class="detail-quote">
            <i class="fas fa-quote-left"></i> ${this.escapeHtml(resume.motto || '勤求古训，博采众方')}
          </div>
          <div class="detail-contact">
            <span><i class="fas fa-envelope"></i> ${this.escapeHtml(resume.email)}</span>
            <span><i class="fas fa-phone"></i> ${this.escapeHtml(resume.phone)}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(resume.location)}</span>
          </div>
          
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-star"></i> 核心技能</div>
            <div class="detail-skills">${skillsHtml}</div>
          </div>
          
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-graduation-cap"></i> 教育背景</div>
            <div class="detail-edu">
              <div class="detail-edu-header">
                <span class="detail-edu-school">${this.escapeHtml(resume.education.school)}</span>
                <span class="detail-edu-date">${this.escapeHtml(resume.education.date)}</span>
              </div>
              <div class="detail-edu-major">${this.escapeHtml(resume.education.major)}</div>
              <div class="detail-edu-courses">${this.escapeHtml(resume.education.courses)}</div>
            </div>
          </div>
          
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-briefcase"></i> 研习经历</div>
            <div class="detail-experiences">${experiencesHtml}</div>
          </div>
          
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-certificate"></i> 荣誉证书</div>
            <div class="detail-certificates">${certificatesHtml}</div>
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
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
    },
    // 显示简历表单弹窗（新增/编辑）
    showResumeFormModal(resume) {
      const isEdit = !!resume
      const title = isEdit ? '编辑简历' : '新增简历'
      
      const formData = isEdit ? {
        name: resume.name,
        motto: resume.motto || '',
        email: resume.email,
        phone: resume.phone,
        location: resume.location,
        skills: resume.skills.join('\n'),
        school: resume.education.school,
        eduDate: resume.education.date,
        major: resume.education.major,
        courses: resume.education.courses,
        certificates: resume.certificates.join('\n'),
        educationLevel: resume.educationLevel,
        experienceYears: resume.experienceYears
      } : {
        name: '',
        motto: '',
        email: '',
        phone: '',
        location: '',
        skills: '',
        school: '',
        eduDate: '',
        major: '',
        courses: '',
        certificates: '',
        educationLevel: '本科',
        experienceYears: '3年以下'
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
              <label>姓名 <span class="required">*</span></label>
              <input type="text" id="name" value="${this.escapeHtml(formData.name)}" placeholder="请输入姓名" />
            </div>
            <div class="form-group">
              <label>座右铭</label>
              <input type="text" id="motto" value="${this.escapeHtml(formData.motto)}" placeholder="如：勤求古训，博采众方" />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>邮箱 <span class="required">*</span></label>
              <input type="email" id="email" value="${this.escapeHtml(formData.email)}" placeholder="example@tcm.com" />
            </div>
            <div class="form-group">
              <label>电话</label>
              <input type="tel" id="phone" value="${this.escapeHtml(formData.phone)}" placeholder="手机号码" />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>所在地</label>
              <input type="text" id="location" value="${this.escapeHtml(formData.location)}" placeholder="如：浙江·温州" />
            </div>
            <div class="form-group">
              <label>学历</label>
              <select id="educationLevel">
                <option value="本科" ${formData.educationLevel === '本科' ? 'selected' : ''}>本科</option>
                <option value="硕士" ${formData.educationLevel === '硕士' ? 'selected' : ''}>硕士</option>
                <option value="博士" ${formData.educationLevel === '博士' ? 'selected' : ''}>博士</option>
              </select>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>经验年限</label>
              <select id="experienceYears">
                <option value="3年以下" ${formData.experienceYears === '3年以下' ? 'selected' : ''}>3年以下</option>
                <option value="3-5年" ${formData.experienceYears === '3-5年' ? 'selected' : ''}>3-5年</option>
                <option value="5年以上" ${formData.experienceYears === '5年以上' ? 'selected' : ''}>5年以上</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>核心技能（每行一个）</label>
            <textarea id="skills" rows="4" placeholder="每行一个技能">${this.escapeHtml(formData.skills)}</textarea>
          </div>
          <div class="form-section-title">教育背景</div>
          <div class="form-row-2">
            <div class="form-group">
              <label>学校</label>
              <input type="text" id="school" value="${this.escapeHtml(formData.school)}" placeholder="学校名称" />
            </div>
            <div class="form-group">
              <label>时间</label>
              <input type="text" id="eduDate" value="${this.escapeHtml(formData.eduDate)}" placeholder="如：2017.09 - 2025.06" />
            </div>
          </div>
          <div class="form-group">
            <label>专业</label>
            <input type="text" id="major" value="${this.escapeHtml(formData.major)}" placeholder="专业名称" />
          </div>
          <div class="form-group">
            <label>主修课程</label>
            <input type="text" id="courses" value="${this.escapeHtml(formData.courses)}" placeholder="主修课程" />
          </div>
          <div class="form-section-title">荣誉证书</div>
          <div class="form-group">
            <label>证书（每行一个）</label>
            <textarea id="certificates" rows="3" placeholder="每行一个证书">${this.escapeHtml(formData.certificates)}</textarea>
          </div>
          <div class="form-note">注：研习经历暂不支持在线编辑，请通过"编辑简历"功能修改</div>
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
        const newName = modal.querySelector('#name').value.trim()
        if (!newName) {
          alert('请填写姓名')
          return
        }
        
        const newEmail = modal.querySelector('#email').value.trim()
        if (!newEmail) {
          alert('请填写邮箱')
          return
        }
        
        const skillsText = modal.querySelector('#skills').value
        const skills = skillsText.split('\n').filter(s => s.trim())
        
        const certificatesText = modal.querySelector('#certificates').value
        const certificates = certificatesText.split('\n').filter(c => c.trim())
        
        const resumeData = {
          name: newName,
          motto: modal.querySelector('#motto').value || '勤求古训，博采众方',
          email: newEmail,
          phone: modal.querySelector('#phone').value,
          location: modal.querySelector('#location').value,
          skills: skills,
          education: {
            school: modal.querySelector('#school').value,
            date: modal.querySelector('#eduDate').value,
            major: modal.querySelector('#major').value,
            courses: modal.querySelector('#courses').value
          },
          certificates: certificates,
          educationLevel: modal.querySelector('#educationLevel').value,
          experienceYears: modal.querySelector('#experienceYears').value,
          experiences: isEdit ? resume.experiences : []
        }
        
        if (isEdit) {
          const index = this.resumes.findIndex(r => r.id === resume.id)
          if (index !== -1) {
            this.resumes[index] = { ...this.resumes[index], ...resumeData }
            alert('简历已更新')
          }
        } else {
          const newId = Math.max(...this.resumes.map(r => r.id), 0) + 1
          this.resumes.push({
            id: newId,
            ...resumeData,
            experiences: []
          })
          alert('简历已添加')
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
          max-width: 700px;
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
          max-width: 750px;
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
        .form-section-title {
          font-weight: 600;
          color: #7a4e28;
          margin: 16px 0 12px 0;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(170, 125, 65, 0.3);
        }
        .form-note {
          font-size: 0.7rem;
          color: #8b6946;
          margin-top: 16px;
          padding: 8px;
          background: rgba(185, 125, 65, 0.1);
          border-radius: 12px;
        }
        .detail-quote {
          text-align: center;
          font-style: italic;
          color: #7a5432;
          padding: 8px;
          background: rgba(185, 125, 65, 0.1);
          border-radius: 20px;
          margin-bottom: 16px;
        }
        .detail-contact {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          padding: 12px;
          background: rgba(170, 110, 55, 0.08);
          border-radius: 20px;
          margin-bottom: 20px;
        }
        .detail-contact span {
          font-size: 0.85rem;
          color: #5a3a1e;
        }
        .detail-section {
          margin-bottom: 20px;
        }
        .detail-section-title {
          font-weight: 600;
          color: #7a4e28;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(170, 125, 65, 0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .detail-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .detail-skill-item {
          background: rgba(185, 125, 65, 0.15);
          padding: 6px 14px;
          border-radius: 25px;
          font-size: 0.8rem;
          color: #5a3a1e;
        }
        .detail-skill-item i {
          color: #b87a48;
          margin-right: 6px;
          font-size: 0.7rem;
        }
        .detail-edu {
          background: rgba(185, 125, 65, 0.08);
          padding: 12px;
          border-radius: 16px;
        }
        .detail-edu-header {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .detail-edu-school {
          font-weight: 600;
          color: #4a2a12;
        }
        .detail-edu-date {
          font-size: 0.75rem;
          color: #8b6946;
        }
        .detail-edu-major {
          font-size: 0.85rem;
          color: #7a5432;
          margin-bottom: 6px;
        }
        .detail-edu-courses {
          font-size: 0.75rem;
          color: #8b6946;
        }
        .detail-exp-item {
          background: rgba(185, 125, 65, 0.08);
          padding: 12px;
          border-radius: 16px;
          margin-bottom: 12px;
        }
        .detail-exp-header {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .detail-exp-title {
          font-weight: 600;
          color: #4a2a12;
        }
        .detail-exp-date {
          font-size: 0.7rem;
          color: #8b6946;
        }
        .detail-exp-desc {
          font-size: 0.8rem;
          color: #7a5432;
          margin-bottom: 6px;
        }
        .detail-exp-achievement {
          font-size: 0.75rem;
          color: #c4713a;
          margin-top: 6px;
        }
        .detail-certificates {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .detail-cert-tag {
          background: rgba(185, 125, 65, 0.12);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #5a3a1e;
        }
        .detail-cert-tag i {
          color: #b87a48;
          margin-right: 4px;
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
        .required {
          color: #c4713a;
        }
      `
      document.head.appendChild(style)
    }
  }
}
</script>

<style scoped>
.resume-manage-view {
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

/* 简历卡片网格 */
.resumes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 24px;
}
.resume-card {
  background: rgba(250, 242, 228, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 28px;
  border: 1px solid rgba(190, 145, 85, 0.6);
  padding: 20px;
  transition: all 0.25s ease;
}
.resume-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(80, 50, 20, 0.12);
}

/* 简历头部 */
.resume-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(170, 125, 65, 0.3);
}
.resume-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.6rem;
  font-weight: 600;
  flex-shrink: 0;
}
.resume-title-section {
  flex: 1;
}
.resume-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #4a2a12;
  margin-bottom: 4px;
}
.resume-quote {
  font-size: 0.75rem;
  color: #8b6946;
  font-style: italic;
}
.resume-actions {
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

/* 联系信息 */
.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(170, 125, 65, 0.2);
  margin-bottom: 12px;
}
.contact-info span {
  font-size: 0.75rem;
  color: #7a5432;
  display: flex;
  align-items: center;
  gap: 6px;
}
.contact-info i {
  color: #b87a48;
  width: 14px;
}

/* 区块样式 */
.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #7a4e28;
  margin: 12px 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.skill-tag {
  background: rgba(185, 125, 65, 0.12);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  color: #5a3a1e;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.skill-tag i {
  color: #b87a48;
  font-size: 0.65rem;
}
.education-item, .experience-item {
  background: rgba(185, 125, 65, 0.06);
  padding: 10px 12px;
  border-radius: 16px;
  margin-bottom: 10px;
}
.edu-header, .exp-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.edu-school, .exp-title {
  font-weight: 600;
  color: #4a2a12;
  font-size: 0.8rem;
}
.edu-date, .exp-date {
  font-size: 0.65rem;
  color: #8b6946;
}
.edu-major, .exp-desc {
  font-size: 0.7rem;
  color: #7a5432;
  margin-bottom: 4px;
}
.edu-courses {
  font-size: 0.65rem;
  color: #8b6946;
}
.exp-achievement {
  font-size: 0.65rem;
  color: #c4713a;
  margin-top: 4px;
}
.certificate-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cert-tag {
  background: rgba(185, 125, 65, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.65rem;
  color: #5a3a1e;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.cert-tag i {
  color: #b87a48;
}

/* 分页 */
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

/* 空状态 */
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