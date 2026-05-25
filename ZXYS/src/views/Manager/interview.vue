<template>
  <div class="interview-manage-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <i class="fas fa-users"></i>
      <h1>面试管理</h1>
      <div class="header-badge">
        <i class="fas fa-leaf"></i> 杏林人才 · 面试记录
      </div>
      <button class="btn-create" @click="openAddInterview">
        <i class="fas fa-plus"></i> 新增面试
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-mini-card">
        <i class="fas fa-clipboard-list"></i>
        <div class="stat-num">{{ totalInterviews }}</div>
        <div class="stat-label">面试总数</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-check-circle"></i>
        <div class="stat-num">{{ highScoreCount }}</div>
        <div class="stat-label">综合评分≥85</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-chart-line"></i>
        <div class="stat-num">{{ avgScore }}</div>
        <div class="stat-label">平均评分</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-hourglass-half"></i>
        <div class="stat-num">{{ recentCount }}</div>
        <div class="stat-label">近7天面试</div>
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
        <p v-if="currentUser"><i class="fas fa-chart-simple"></i> 面试次数: {{ userInterviewCount }} 次</p>
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

    <!-- 面试记录列表 -->
    <div class="interviews-list" v-if="currentUserId && currentInterviews.length > 0">
      <div v-for="(interview, idx) in currentInterviews" :key="interview.id" class="interview-card xinglin-card">
        <!-- 面试时间 -->
        <div class="interview-time">
          <i class="fas fa-calendar-alt"></i> {{ formatDateTime(interview.date) }}
        </div>

        <!-- 心相格局汇总 -->
        <div class="emotion-summary">
          <div class="summary-title">
            <i class="fas fa-chart-pie"></i> 心相格局汇总
          </div>
          <div class="emotion-grid">
            <div v-for="emotion in interview.emotionSummary" :key="emotion.name" class="emotion-item" :class="emotion.level">
              <span class="emotion-level">{{ emotion.levelText }}</span>
              <span class="emotion-name">{{ emotion.name }}</span>
              <span class="emotion-meaning">{{ emotion.meaning }}</span>
              <span class="emotion-count">{{ emotion.count }} 次</span>
            </div>
          </div>
        </div>

        <!-- 瞬时洞察笔记 -->
        <div class="insight-notes">
          <div class="section-title">
            <i class="fas fa-eye"></i> 瞬时洞察笔记
          </div>
          <div class="notes-list">
            <div v-for="note in interview.insightNotes" :key="note.time" class="note-item">
              <div class="note-time">
                <i class="fas fa-clock"></i> {{ note.time }}
              </div>
              <div class="note-content">
                <span class="note-emotion" :class="getEmotionClass(note.emotion)">
                  {{ note.emotion }} · {{ note.meaning }}
                </span>
                <div class="note-text">{{ note.note }}</div>
                <div class="note-focus">
                  <i class="fas fa-heartbeat"></i> 心神定力 {{ note.focusPower }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 答题评分 -->
        <div class="score-section">
          <div class="section-title">
            <i class="fas fa-star"></i> 答题评分
          </div>
          <div class="score-list">
            <div v-for="item in interview.scores" :key="item.name" class="score-item">
              <span class="score-name">{{ item.name }}</span>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: item.score + '%' }"></div>
              </div>
              <span class="score-value">{{ item.score }}分</span>
            </div>
          </div>
        </div>

        <!-- 综合评分 -->
        <div class="total-score">
          <div class="total-score-value" :class="getScoreClass(interview.totalScore)">
            {{ interview.totalScore }}
          </div>
          <div class="total-score-label">综合评分</div>
        </div>

        <!-- 匹配度评估 -->
        <div class="match-section">
          <div class="match-title">
            <i class="fas fa-chart-line"></i> 匹配度：{{ interview.matchLevel }}
          </div>
          <div class="match-summary">{{ interview.matchSummary }}</div>
        </div>

        <!-- 面试详述总结 -->
        <div class="summary-section">
          <div class="section-title">
            <i class="fas fa-file-alt"></i> 面试详述总结
          </div>
          <div class="summary-text">{{ interview.detailSummary }}</div>
        </div>

        <!-- 人才画像标签 -->
        <div class="tags-section">
          <div class="tag-item risk" :class="getRiskClass(interview.riskLevel)">
            <i class="fas fa-shield-alt"></i> 风险：{{ interview.riskLevel }}
          </div>
          <div class="tag-item weakness">
            <i class="fas fa-exclamation-triangle"></i> 弱点：{{ interview.weakness }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions">
          <button class="action-btn edit" @click="editInterview(interview)">
            <i class="fas fa-edit"></i> 编辑
          </button>
          <button class="action-btn delete" @click="deleteInterview(interview)">
            <i class="fas fa-trash-alt"></i> 删除
          </button>
          <button class="action-btn view" @click="viewInterviewDetail(interview)">
            <i class="fas fa-eye"></i> 详情
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="currentUserId && currentInterviews.length === 0" class="empty-state">
      <i class="fas fa-clipboard-list"></i>
      <p>暂无面试记录，点击"新增面试"添加</p>
    </div>
    <div v-if="!currentUserId" class="empty-state">
      <i class="fas fa-user"></i>
      <p>请先选择用户</p>
    </div>

    <!-- 面试详情弹窗 -->
    <div id="interviewDetailModal" style="display: none;"></div>
    <!-- 面试表单弹窗 -->
    <div id="interviewFormModal" style="display: none;"></div>
  </div>
</template>

<script>
export default {
  name: 'InterviewManage',
  data() {
    return {
      currentUserId: '',
      // 用户列表
      userList: [
        { id: 10001, nickname: '杏林医者', email: 'zhangyi@tcm.com', role: 'teacher' },
        { id: 10002, nickname: '当归', email: 'danggui@example.com', role: 'student' },
        { id: 10003, nickname: '甘草', email: 'gancao@example.com', role: 'student' },
        { id: 10004, nickname: '黄帝内经', email: 'huangdi@tcm.com', role: 'teacher' },
        { id: 10005, nickname: '扁鹊', email: 'bianque@tcm.com', role: 'admin' }
      ],
      // 面试数据（按用户ID分组）
      interviewsData: {
        // 用户10002的面试记录
        10001: [
          {
            id: 'i1',
            userId: 10001,
            date: '2026-04-12T17:12:20',
            emotionSummary: [
              { name: '喜', meaning: '愉悦', level: '偶见', levelText: '偶见', count: 1 },
              { name: '怒', meaning: '愤怒', level: '未见', levelText: '未见', count: 0 },
              { name: '忧', meaning: '忧郁', level: '未见', levelText: '未见', count: 0 },
              { name: '思', meaning: '思虑', level: '偶见', levelText: '偶见', count: 2 },
              { name: '悲', meaning: '悲伤', level: '未见', levelText: '未见', count: 0 },
              { name: '恐', meaning: '恐惧', level: '未见', levelText: '未见', count: 0 },
              { name: '惊', meaning: '惊讶', level: '未见', levelText: '未见', count: 0 },
              { name: '厌', meaning: '厌恶', level: '偶见', levelText: '偶见', count: 1 },
              { name: '平', meaning: '中性', level: '多见', levelText: '多见', count: 3 }
            ],
            insightNotes: [
              { time: '17:12:20', emotion: '厌', meaning: '厌恶', note: '此时心神表现为厌恶，定力指数为42。', focusPower: 42 },
              { time: '17:12:00', emotion: '平', meaning: '中性', note: '神态平稳，未见明显情绪起伏。', focusPower: 53 },
              { time: '17:11:40', emotion: '平', meaning: '中性', note: '神态平稳，未见明显情绪起伏。', focusPower: 45 },
              { time: '17:11:20', emotion: '平', meaning: '中性', note: '神态平稳，未见明显情绪起伏。', focusPower: 58 },
              { time: '17:10:59', emotion: '喜', meaning: '开心', note: '面带笑意，心境颇为愉悦。', focusPower: 85 }
            ],
            scores: [
              { name: '自我介绍', score: 100 },
              { name: '中医基础理论', score: 0 },
              { name: '辨证论治能力', score: 0 },
              { name: '医患沟通技巧', score: 0 }
            ],
            totalScore: 85,
            matchLevel: '评估结论',
            matchSummary: '匹配度较高，建议进入下一轮',
            detailSummary: '候选人在回答中医康复医师的自我介绍题目时，能够正确使用专业术语，但存在一些逻辑和细节上的不足。在辨证论治能力方面，虽然给出了患者的症状描述和舌脉分析，但在给出具体治法时显得较为简略，缺乏详细的治疗方案。在医患沟通技巧方面，候选人能够理解并解释患者的失眠原因，但未能提供针对性的治疗方法或建议。整体表现良好，但仍有提升空间。',
            riskLevel: '低',
            weakness: '辨证论治能力需加强'
          },
          {
            id: 'i2',
            userId: 10001,
            date: '2026-04-10T14:30:00',
            emotionSummary: [
              { name: '喜', meaning: '愉悦', level: '偶见', levelText: '偶见', count: 2 },
              { name: '怒', meaning: '愤怒', level: '未见', levelText: '未见', count: 0 },
              { name: '忧', meaning: '忧郁', level: '未见', levelText: '未见', count: 0 },
              { name: '思', meaning: '思虑', level: '偶见', levelText: '偶见', count: 1 },
              { name: '悲', meaning: '悲伤', level: '未见', levelText: '未见', count: 0 },
              { name: '恐', meaning: '恐惧', level: '未见', levelText: '未见', count: 0 },
              { name: '惊', meaning: '惊讶', level: '偶见', levelText: '偶见', count: 1 },
              { name: '厌', meaning: '厌恶', level: '未见', levelText: '未见', count: 0 },
              { name: '平', meaning: '中性', level: '多见', levelText: '多见', count: 4 }
            ],
            insightNotes: [
              { time: '14:30:15', emotion: '喜', meaning: '开心', note: '回答问题时面带微笑，态度积极。', focusPower: 78 },
              { time: '14:29:30', emotion: '平', meaning: '中性', note: '专注聆听问题，神态平稳。', focusPower: 62 },
              { time: '14:28:45', emotion: '惊', meaning: '惊讶', note: '对专业问题表现出一定的惊讶。', focusPower: 55 }
            ],
            scores: [
              { name: '自我介绍', score: 92 },
              { name: '中医基础理论', score: 78 },
              { name: '辨证论治能力', score: 75 },
              { name: '医患沟通技巧', score: 88 }
            ],
            totalScore: 83,
            matchLevel: '评估结论',
            matchSummary: '匹配度良好，综合素质较高',
            detailSummary: '候选人在各项考核中表现均衡，中医基础理论扎实，沟通能力较强。在辨证论治方面有一定见解，但深度仍需加强。整体表现优秀，推荐进入下一轮面试。',
            riskLevel: '低',
            weakness: '辨证论治深度待加强'
          }
        ],
        // 用户10003的面试记录
        10003: [
          {
            id: 'i3',
            userId: 10003,
            date: '2026-04-09T10:00:00',
            emotionSummary: [
              { name: '喜', meaning: '愉悦', level: '偶见', levelText: '偶见', count: 1 },
              { name: '怒', meaning: '愤怒', level: '未见', levelText: '未见', count: 0 },
              { name: '忧', meaning: '忧郁', level: '偶见', levelText: '偶见', count: 1 },
              { name: '思', meaning: '思虑', level: '偶见', levelText: '偶见', count: 2 },
              { name: '悲', meaning: '悲伤', level: '未见', levelText: '未见', count: 0 },
              { name: '恐', meaning: '恐惧', level: '偶见', levelText: '偶见', count: 1 },
              { name: '惊', meaning: '惊讶', level: '未见', levelText: '未见', count: 0 },
              { name: '厌', meaning: '厌恶', level: '未见', levelText: '未见', count: 0 },
              { name: '平', meaning: '中性', level: '多见', levelText: '多见', count: 3 }
            ],
            insightNotes: [
              { time: '10:15:30', emotion: '恐', meaning: '恐惧', note: '面对专业提问时略显紧张，手指微颤。', focusPower: 38 },
              { time: '10:14:00', emotion: '思', meaning: '思虑', note: '思考问题时表情专注，有皱眉。', focusPower: 52 },
              { time: '10:12:30', emotion: '平', meaning: '中性', note: '回答问题时神态平稳。', focusPower: 48 }
            ],
            scores: [
              { name: '自我介绍', score: 85 },
              { name: '中医基础理论', score: 65 },
              { name: '辨证论治能力', score: 60 },
              { name: '医患沟通技巧', score: 70 }
            ],
            totalScore: 70,
            matchLevel: '评估结论',
            matchSummary: '匹配度一般，需进一步考察',
            detailSummary: '候选人在面试中表现出一定的基础知识，但在深度和广度上都有欠缺。临场发挥不够稳定，建议加强专业训练后再进行评估。',
            riskLevel: '中',
            weakness: '基础理论不扎实，临场表现不稳定'
          }
        ]
      }
    }
  },
  computed: {
    totalInterviews() {
      let total = 0
      for (const key in this.interviewsData) {
        total += this.interviewsData[key].length
      }
      return total
    },
    highScoreCount() {
      let count = 0
      for (const key in this.interviewsData) {
        count += this.interviewsData[key].filter(i => i.totalScore >= 85).length
      }
      return count
    },
    avgScore() {
      let total = 0
      let count = 0
      for (const key in this.interviewsData) {
        for (const interview of this.interviewsData[key]) {
          total += interview.totalScore
          count++
        }
      }
      return count > 0 ? Math.round(total / count) : 0
    },
    recentCount() {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      let count = 0
      for (const key in this.interviewsData) {
        count += this.interviewsData[key].filter(i => new Date(i.date) >= sevenDaysAgo).length
      }
      return count
    },
    currentUser() {
      return this.userList.find(u => u.id === this.currentUserId)
    },
    currentInterviews() {
      if (!this.currentUserId) return []
      return this.interviewsData[this.currentUserId] || []
    },
    userInterviewCount() {
      return this.currentInterviews.length
    }
  },
  mounted() {
    this.injectModalStyles()
  },
  methods: {
    formatDateTime(dateStr) {
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    },
    getAvatarColor(id) {
      const colors = ['#6ba5a5', '#c4a56e', '#8dab7f', '#e08f6e', '#7a6b8a', '#c4713a']
      return colors[(id || 0) % colors.length]
    },
    getEmotionClass(emotion) {
      const map = {
        '喜': 'emotion-xi',
        '怒': 'emotion-nu',
        '忧': 'emotion-you',
        '思': 'emotion-si',
        '悲': 'emotion-bei',
        '恐': 'emotion-kong',
        '惊': 'emotion-jing',
        '厌': 'emotion-yan',
        '平': 'emotion-ping'
      }
      return map[emotion] || ''
    },
    getScoreClass(score) {
      if (score >= 85) return 'score-high'
      if (score >= 70) return 'score-mid'
      return 'score-low'
    },
    getRiskClass(risk) {
      if (risk === '低') return 'risk-low'
      if (risk === '中') return 'risk-mid'
      return 'risk-high'
    },
    onUserChange() {
      console.log('切换用户:', this.currentUserId)
    },
    // 打开新增面试弹窗
    openAddInterview() {
      if (!this.currentUserId) {
        alert('请先选择用户')
        return
      }
      this.showInterviewFormModal(null)
    },
    // 编辑面试
    editInterview(interview) {
      this.showInterviewFormModal(interview)
    },
    // 删除面试
    deleteInterview(interview) {
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
          <p style="font-size: 1rem; color: #4a2a12;">确定要删除${this.formatDateTime(interview.date)}的面试记录吗？</p>
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
        const interviews = this.interviewsData[this.currentUserId]
        const index = interviews.findIndex(i => i.id === interview.id)
        if (index !== -1) {
          interviews.splice(index, 1)
          alert('面试记录已删除')
        }
        closeModal()
      }
    },
    // 查看面试详情
    viewInterviewDetail(interview) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      
      const emotionsHtml = interview.emotionSummary.map(e => `
        <div class="detail-emotion-item ${e.level}">
          <span class="detail-emotion-name">${e.name}·${e.meaning}</span>
          <span class="detail-emotion-count">${e.count} 次</span>
        </div>
      `).join('')
      
      const notesHtml = interview.insightNotes.map(n => `
        <div class="detail-note-item">
          <div class="detail-note-time">${n.time}</div>
          <div class="detail-note-content">
            <span class="detail-note-emotion ${this.getEmotionClass(n.emotion)}">${n.emotion}·${n.meaning}</span>
            <div class="detail-note-text">${this.escapeHtml(n.note)}</div>
            <div class="detail-note-focus">心神定力 ${n.focusPower}%</div>
          </div>
        </div>
      `).join('')
      
      const scoresHtml = interview.scores.map(s => `
        <div class="detail-score-item">
          <span class="detail-score-name">${s.name}</span>
          <div class="detail-score-bar"><div class="detail-score-fill" style="width: ${s.score}%"></div></div>
          <span class="detail-score-value">${s.score}分</span>
        </div>
      `).join('')
      
      const modal = document.createElement('div')
      modal.className = 'native-modal-container detail-modal'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-clipboard-list"></i> 面试详情 - ${this.formatDateTime(interview.date)}</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body detail-modal-body">
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-chart-pie"></i> 心相格局汇总</div>
            <div class="detail-emotion-grid">${emotionsHtml}</div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-eye"></i> 瞬时洞察笔记</div>
            <div class="detail-notes-list">${notesHtml}</div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-star"></i> 答题评分</div>
            <div class="detail-scores-list">${scoresHtml}</div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-chart-line"></i> 综合评分</div>
            <div class="detail-total-score ${this.getScoreClass(interview.totalScore)}">${interview.totalScore}分</div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-file-alt"></i> 面试详述总结</div>
            <div class="detail-summary-text">${this.escapeHtml(interview.detailSummary)}</div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title"><i class="fas fa-tags"></i> 人才画像标签</div>
            <div class="detail-tags">
              <span class="detail-risk ${this.getRiskClass(interview.riskLevel)}">风险：${interview.riskLevel}</span>
              <span class="detail-weakness">弱点：${interview.weakness}</span>
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
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
    },
    // 显示面试表单弹窗
    showInterviewFormModal(interview) {
      const isEdit = !!interview
      const title = isEdit ? '编辑面试记录' : '新增面试记录'
      
      const formData = isEdit ? {
        date: interview.date.slice(0, 16),
        totalScore: interview.totalScore,
        matchSummary: interview.matchSummary,
        detailSummary: interview.detailSummary,
        riskLevel: interview.riskLevel,
        weakness: interview.weakness
      } : {
        date: new Date().toISOString().slice(0, 16),
        totalScore: 85,
        matchSummary: '匹配度较高，建议进入下一轮',
        detailSummary: '',
        riskLevel: '低',
        weakness: ''
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
            <label>面试时间</label>
            <input type="datetime-local" id="date" value="${formData.date}" />
          </div>
          <div class="form-group">
            <label>综合评分</label>
            <input type="number" id="totalScore" value="${formData.totalScore}" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>匹配度评估</label>
            <input type="text" id="matchSummary" value="${this.escapeHtml(formData.matchSummary)}" placeholder="如：匹配度较高，建议进入下一轮" />
          </div>
          <div class="form-group">
            <label>风险等级</label>
            <select id="riskLevel">
              <option value="低" ${formData.riskLevel === '低' ? 'selected' : ''}>低</option>
              <option value="中" ${formData.riskLevel === '中' ? 'selected' : ''}>中</option>
              <option value="高" ${formData.riskLevel === '高' ? 'selected' : ''}>高</option>
            </select>
          </div>
          <div class="form-group">
            <label>弱点说明</label>
            <input type="text" id="weakness" value="${this.escapeHtml(formData.weakness)}" placeholder="如：辨证论治能力需加强" />
          </div>
          <div class="form-group">
            <label>面试详述总结</label>
            <textarea id="detailSummary" rows="5" placeholder="请输入面试详述总结...">${this.escapeHtml(formData.detailSummary)}</textarea>
          </div>
          <div class="form-note">注：心相格局、瞬时洞察笔记、答题评分暂不支持在线编辑，请在代码中修改</div>
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
        const newDate = modal.querySelector('#date').value
        const newTotalScore = parseInt(modal.querySelector('#totalScore').value) || 0
        const newMatchSummary = modal.querySelector('#matchSummary').value
        const newRiskLevel = modal.querySelector('#riskLevel').value
        const newWeakness = modal.querySelector('#weakness').value
        const newDetailSummary = modal.querySelector('#detailSummary').value
        
        if (!this.interviewsData[this.currentUserId]) {
          this.$set(this.interviewsData, this.currentUserId, [])
        }
        
        if (isEdit) {
          const index = this.interviewsData[this.currentUserId].findIndex(i => i.id === interview.id)
          if (index !== -1) {
            this.interviewsData[this.currentUserId][index] = {
              ...this.interviewsData[this.currentUserId][index],
              date: newDate,
              totalScore: newTotalScore,
              matchSummary: newMatchSummary,
              riskLevel: newRiskLevel,
              weakness: newWeakness,
              detailSummary: newDetailSummary
            }
            alert('面试记录已更新')
          }
        } else {
          const newId = 'i' + Date.now()
          this.interviewsData[this.currentUserId].push({
            id: newId,
            userId: this.currentUserId,
            date: newDate,
            emotionSummary: [
              { name: '喜', meaning: '愉悦', level: '偶见', levelText: '偶见', count: 0 },
              { name: '怒', meaning: '愤怒', level: '未见', levelText: '未见', count: 0 },
              { name: '忧', meaning: '忧郁', level: '未见', levelText: '未见', count: 0 },
              { name: '思', meaning: '思虑', level: '偶见', levelText: '偶见', count: 0 },
              { name: '悲', meaning: '悲伤', level: '未见', levelText: '未见', count: 0 },
              { name: '恐', meaning: '恐惧', level: '未见', levelText: '未见', count: 0 },
              { name: '惊', meaning: '惊讶', level: '未见', levelText: '未见', count: 0 },
              { name: '厌', meaning: '厌恶', level: '未见', levelText: '未见', count: 0 },
              { name: '平', meaning: '中性', level: '多见', levelText: '多见', count: 0 }
            ],
            insightNotes: [],
            scores: [
              { name: '自我介绍', score: 0 },
              { name: '中医基础理论', score: 0 },
              { name: '辨证论治能力', score: 0 },
              { name: '医患沟通技巧', score: 0 }
            ],
            totalScore: newTotalScore,
            matchLevel: '评估结论',
            matchSummary: newMatchSummary,
            detailSummary: newDetailSummary,
            riskLevel: newRiskLevel,
            weakness: newWeakness
          })
          alert('面试记录已添加')
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
        .form-note {
          font-size: 0.7rem;
          color: #8b6946;
          margin-top: 16px;
          padding: 8px;
          background: rgba(185, 125, 65, 0.1);
          border-radius: 12px;
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
        .detail-emotion-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .detail-emotion-item {
          background: rgba(185, 125, 65, 0.1);
          padding: 8px 12px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
        }
        .detail-emotion-item.偶见 { background: rgba(196, 165, 110, 0.2); }
        .detail-emotion-item.未见 { background: rgba(107, 165, 165, 0.15); }
        .detail-emotion-item.多见 { background: rgba(139, 69, 19, 0.15); }
        .detail-note-item {
          background: rgba(185, 125, 65, 0.08);
          padding: 12px;
          border-radius: 16px;
          margin-bottom: 12px;
        }
        .detail-note-time {
          font-size: 0.7rem;
          color: #8b6946;
          margin-bottom: 6px;
        }
        .detail-note-emotion {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 0.7rem;
          margin-bottom: 6px;
        }
        .detail-note-emotion.emotion-xi { background: #e08f6e; color: white; }
        .detail-note-text { font-size: 0.8rem; color: #4a2a12; margin-bottom: 6px; }
        .detail-note-focus { font-size: 0.7rem; color: #c4713a; }
        .detail-score-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .detail-score-name { width: 100px; font-size: 0.8rem; color: #4a2a12; }
        .detail-score-bar { flex: 1; height: 8px; background: rgba(170, 110, 55, 0.2); border-radius: 10px; overflow: hidden; }
        .detail-score-fill { height: 100%; background: #b87a48; border-radius: 10px; }
        .detail-score-value { width: 45px; font-size: 0.8rem; color: #7a4e28; }
        .detail-total-score { font-size: 2rem; font-weight: 700; text-align: center; padding: 16px; border-radius: 20px; }
        .detail-total-score.score-high { background: rgba(141, 171, 127, 0.2); color: #548235; }
        .detail-total-score.score-mid { background: rgba(196, 165, 110, 0.2); color: #c4a56e; }
        .detail-total-score.score-low { background: rgba(200, 80, 50, 0.15); color: #c4713a; }
        .detail-summary-text { line-height: 1.6; color: #5a3a1e; background: rgba(185, 125, 65, 0.05); padding: 12px; border-radius: 16px; }
        .detail-tags { display: flex; gap: 16px; flex-wrap: wrap; }
        .detail-risk { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
        .detail-risk.risk-low { background: rgba(141, 171, 127, 0.2); color: #548235; }
        .detail-risk.risk-mid { background: rgba(196, 165, 110, 0.2); color: #c4a56e; }
        .detail-risk.risk-high { background: rgba(200, 80, 50, 0.2); color: #c4713a; }
        .detail-weakness { background: rgba(200, 80, 50, 0.1); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; color: #c4713a; }
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
.interview-manage-view {
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

/* 面试卡片 */
.interviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.interview-card {
  background: rgba(250, 242, 228, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 28px;
  border: 1px solid rgba(190, 145, 85, 0.6);
  padding: 24px;
}
.interview-time {
  font-size: 0.8rem;
  color: #8b6946;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(170, 125, 65, 0.3);
}

/* 心相格局汇总 */
.emotion-summary {
  margin-bottom: 20px;
}
.summary-title, .section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #7a4e28;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.emotion-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.emotion-item {
  background: rgba(185, 125, 65, 0.1);
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}
.emotion-item.偶见 { background: rgba(196, 165, 110, 0.2); }
.emotion-item.未见 { background: rgba(107, 165, 165, 0.15); }
.emotion-item.多见 { background: rgba(139, 69, 19, 0.15); }
.emotion-level { color: #7a4e28; }
.emotion-name { font-weight: 500; color: #4a2a12; }
.emotion-meaning { color: #8b6946; }
.emotion-count { color: #c4713a; }

/* 瞬时洞察笔记 */
.insight-notes {
  margin-bottom: 20px;
}
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.note-item {
  background: rgba(185, 125, 65, 0.06);
  padding: 12px;
  border-radius: 16px;
}
.note-time {
  font-size: 0.7rem;
  color: #8b6946;
  margin-bottom: 6px;
}
.note-emotion {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  margin-bottom: 6px;
}
.note-emotion.emotion-xi { background: #e08f6e; color: white; }
.note-text { font-size: 0.8rem; color: #4a2a12; margin-bottom: 6px; }
.note-focus { font-size: 0.7rem; color: #c4713a; }

/* 答题评分 */
.score-section {
  margin-bottom: 20px;
}
.score-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.score-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.score-name {
  width: 100px;
  font-size: 0.8rem;
  color: #4a2a12;
}
.score-bar {
  flex: 1;
  height: 8px;
  background: rgba(170, 110, 55, 0.2);
  border-radius: 10px;
  overflow: hidden;
}
.score-fill {
  height: 100%;
  background: #b87a48;
  border-radius: 10px;
}
.score-value {
  width: 45px;
  font-size: 0.8rem;
  color: #7a4e28;
}

/* 综合评分 */
.total-score {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(185, 125, 65, 0.08);
  border-radius: 20px;
}
.total-score-value {
  font-size: 2rem;
  font-weight: 700;
}
.total-score-value.score-high { color: #548235; }
.total-score-value.score-mid { color: #c4a56e; }
.total-score-value.score-low { color: #c4713a; }
.total-score-label {
  font-size: 0.8rem;
  color: #7a5432;
}

/* 匹配度 */
.match-section {
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(185, 125, 65, 0.08);
  border-radius: 16px;
}
.match-title {
  font-weight: 600;
  color: #7a4e28;
  margin-bottom: 6px;
}
.match-summary {
  font-size: 0.85rem;
  color: #5a3a1e;
}

/* 面试详述总结 */
.summary-section {
  margin-bottom: 20px;
}
.summary-text {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #5a3a1e;
  background: rgba(185, 125, 65, 0.05);
  padding: 12px;
  border-radius: 16px;
}

/* 人才画像标签 */
.tags-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.tag-item {
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 0.75rem;
}
.tag-item.risk.risk-low { background: rgba(141, 171, 127, 0.2); color: #548235; }
.tag-item.risk.risk-mid { background: rgba(196, 165, 110, 0.2); color: #c4a56e; }
.tag-item.risk.risk-high { background: rgba(200, 80, 50, 0.2); color: #c4713a; }
.tag-item.weakness { background: rgba(200, 80, 50, 0.1); color: #c4713a; }

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(170, 125, 65, 0.3);
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
.action-btn.view {
  background: #b87a48;
  border: none;
  color: #fff5e8;
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
</style>