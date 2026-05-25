<template>
  <div class="certificate-manage-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <i class="fas fa-certificate"></i>
      <h1>资格证书管理</h1>
      <div class="header-badge">
        <i class="fas fa-leaf"></i> 杏林认证 · 中医师承
      </div>
      <button class="btn-create" @click="openAddCertificate">
        <i class="fas fa-plus"></i> 新增证书
      </button>
    </div>

    <!-- 证书卡片网格 -->
    <div class="certificates-grid">
      <div class="cert-card xinglin-card" v-for="cert in certificateList" :key="cert.id">
        <div class="cert-header">
          <div class="cert-icon">
            <i :class="cert.icon"></i>
          </div>
          <div class="cert-title-section">
            <h2 class="cert-title" v-html="cert.titleHtml"></h2>
            <span class="cert-type">{{ cert.type }}</span>
          </div>
        </div>
        <div class="cert-body">
          <p class="cert-description">{{ cert.description }}</p>
          <div class="cert-stats">
            <div class="stat-row" v-for="stat in cert.stats" :key="stat.label">
              <span class="stat-label"><i :class="stat.icon"></i> {{ stat.label }}：</span>
              <span class="stat-value" :class="{ highlight: stat.highlight }">{{ stat.value }}</span>
            </div>
          </div>
          <div class="exam-structure">
            <div class="structure-title">
              <i class="fas fa-sitemap"></i> 考试结构
            </div>
            <ul class="structure-list">
              <li v-for="item in cert.structure" :key="item"><i class="fas fa-check-circle"></i> {{ item }}</li>
            </ul>
          </div>
        </div>
        <div class="cert-footer">
          <button class="btn-manage" @click="showQuestionDialog(cert.id)">
            <i class="fas fa-database"></i> 题目管理 ({{ getQuestionCount(cert.id) }}题)
          </button>
          <button class="btn-edit-cert" @click="editCertificate(cert.id)">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 题目管理弹窗 -->
    <div v-if="showSimpleModal" class="simple-modal" @click="closeSimpleModal">
      <div class="simple-modal-content" @click.stop>
        <div class="simple-modal-header">
          <i class="fas fa-database"></i>
          <h3>{{ currentCertName }} · 题目管理 (共{{ allQuestions.length }}题)</h3>
          <button class="simple-modal-close" @click="closeSimpleModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="simple-modal-body">
          <div style="margin-bottom: 16px; display: flex; gap: 12px;">
            <button class="btn-add-question" @click="openAddQuestionSimple">
              <i class="fas fa-plus"></i> 新增题目
            </button>
            <button class="btn-filter" @click="filterType = ''" :class="{ active: filterType === '' }">全部</button>
            <button class="btn-filter" @click="filterType = 'A1'" :class="{ active: filterType === 'A1' }">A1型</button>
            <button class="btn-filter" @click="filterType = 'A2'" :class="{ active: filterType === 'A2' }">A2型</button>
          </div>
          
          <!-- 题目列表 -->
          <div class="question-list">
            <div v-for="(q, idx) in filteredQuestions" :key="q.id" class="question-item">
              <div class="question-header">
                <div class="question-left">
                  <span class="q-num">#{{ idx + 1 }}</span>
                  <span :class="['q-type-badge', q.type === 'A1' ? 'type-a1' : 'type-a2']">{{ q.type }}型</span>
                  <span class="q-code">{{ q.code || '未编号' }}</span>
                </div>
                <div class="q-actions">
                  <button class="q-edit" @click="editQuestionSimple(q)"><i class="fas fa-edit"></i> 编辑</button>
                  <button class="q-delete" @click="deleteQuestionSimple(q)"><i class="fas fa-trash-alt"></i> 删除</button>
                </div>
              </div>
              <div class="question-content">{{ q.content }}</div>
              <div v-if="q.options && q.options.length" class="question-options">
                <div v-for="(opt, optIdx) in q.options" :key="optIdx" class="option" :class="{ correct: opt.isCorrect }">
                  <span class="option-letter">{{ String.fromCharCode(65 + optIdx) }}.</span>
                  <span class="option-text">{{ opt.text }}</span>
                  <i v-if="opt.isCorrect" class="fas fa-check-circle correct-icon"></i>
                </div>
              </div>
              <div class="question-answer" v-if="q.answer">
                <span class="answer-label">参考答案：</span>
                <span class="answer-text">{{ q.answer }}</span>
              </div>
              <div class="question-explanation" v-if="q.explanation">
                <span class="explanation-label"><i class="fas fa-lightbulb"></i> 解析：</span>
                <span class="explanation-text">{{ q.explanation }}</span>
              </div>
            </div>
            <div v-if="filteredQuestions.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>暂无题目，点击"新增题目"添加</p>
            </div>
          </div>
        </div>
        <div class="simple-modal-footer">
          <button class="btn-secondary" @click="closeSimpleModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑题目的简单弹窗 -->
    <div v-if="showQuestionFormSimple" class="simple-modal" @click="closeQuestionFormSimple">
      <div class="simple-modal-content simple-modal-content-form" @click.stop>
        <div class="simple-modal-header">
          <i class="fas fa-edit"></i>
          <h3>{{ isEditQuestion ? '编辑题目' : '新增题目' }}</h3>
          <button class="simple-modal-close" @click="closeQuestionFormSimple"><i class="fas fa-times"></i></button>
        </div>
        <div class="simple-modal-body">
          <div class="form-group">
            <label>题型 <span class="required">*</span></label>
            <select v-model="questionForm.type">
              <option value="A1">A1型（单句型最佳选择题）</option>
              <option value="A2">A2型（病例摘要型最佳选择题）</option>
            </select>
          </div>
          <div class="form-group">
            <label>题目编号</label>
            <input type="text" v-model="questionForm.code" placeholder="如: ZY-2024-001" />
          </div>
          <div class="form-group">
            <label>题目内容 <span class="required">*</span></label>
            <textarea v-model="questionForm.content" rows="3" placeholder="请输入题目内容..."></textarea>
          </div>
          <div class="form-group">
            <label>选项设置</label>
            <div v-for="(opt, idx) in questionForm.options" :key="idx" class="option-input-row">
              <span class="option-letter">{{ String.fromCharCode(65 + idx) }}.</span>
              <input type="text" v-model="opt.text" placeholder="选项内容" class="flex-1" />
              <label class="correct-check">
                <input type="radio" :name="'correctOption'" :checked="opt.isCorrect" @change="setCorrectOption(idx)" /> 正确答案
              </label>
              <button class="remove-option" @click="removeOption(idx)" v-if="questionForm.options.length > 2">×</button>
            </div>
            <button class="add-option-btn" @click="addOption" type="button">+ 添加选项</button>
          </div>
          <div class="form-group">
            <label>题目解析（可选）</label>
            <textarea v-model="questionForm.explanation" rows="2" placeholder="请输入题目解析..."></textarea>
          </div>
        </div>
        <div class="simple-modal-footer">
          <button class="btn-secondary" @click="closeQuestionFormSimple">取消</button>
          <button class="btn-primary-sm" @click="saveQuestionSimple">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CertificateManage',
  data() {
    return {
      showSimpleModal: false,
      showQuestionFormSimple: false,
      isEditQuestion: false,
      currentCertId: null,
      currentEditQuestionId: null,
      filterType: '',
      questionForm: {
        type: 'A1',
        code: '',
        content: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        explanation: ''
      },
      certificateList: [
        {
          id: 1,
          icon: 'fas fa-stethoscope',
          titleHtml: '中医执业（助理）医师<br>实践技能证书',
          type: '执业资格',
          description: '适用于非科班人员通过师承或确有专长方式获取中医执业资格，是走向中医师承道路的关键凭证。',
          stats: [
            { label: '建议备考', value: '师承3年/专长考核', icon: 'fas fa-book' },
            { label: '通过率', value: '约70%', icon: 'fas fa-chart-line', highlight: true },
            { label: '主要题型', value: '综合笔试 + 专长评议', icon: 'fas fa-tasks' }
          ],
          structure: ['中医基础知识考核', '专长陈述与答辩', '临床实际操作']
        },
        {
          id: 2,
          icon: 'fas fa-user-md',
          titleHtml: '中医医师资格证',
          type: '医师资格',
          description: '中医医师资格证是从事中医临床工作的法定准入证书，通过国家统一考试取得，代表具备独立执业能力。',
          stats: [
            { label: '建议备考', value: '系统学习 + 真题训练', icon: 'fas fa-book' },
            { label: '通过率', value: '约45%', icon: 'fas fa-chart-line', highlight: true },
            { label: '主要题型', value: 'A1/A2型、A3/A4型、B型', icon: 'fas fa-tasks' }
          ],
          structure: ['中医基础理论', '中医诊断学', '中药学与方剂学', '中医内/外/妇/儿科', '针灸学']
        },
        {
          id: 3,
          icon: 'fas fa-hand-holding-heart',
          titleHtml: '中医医师资格证<br><span class="subtitle">（师承/专长方向）</span>',
          type: '师承专长',
          description: '适用于通过师承或确有专长方式报考的中医医师资格认证，突出专长领域的深度考核与实践能力。',
          stats: [
            { label: '建议备考', value: '师承出师考核 + 专长综述', icon: 'fas fa-book' },
            { label: '通过率', value: '约60%', icon: 'fas fa-chart-line', highlight: true },
            { label: '主要题型', value: '综合笔试 + 实践技能', icon: 'fas fa-tasks' }
          ],
          structure: ['专长理论笔试', '专长技术实操', '专家面试评议']
        }
      ],
      questionsData: {
        // 证书1：中医执业（助理）医师实践技能证书 的题目
        1: [
          { 
            id: 101, certId: 1, type: 'A1', code: 'SN-001', 
            content: '下列哪项不属于中医四诊内容？', 
            options: [
              { text: '望诊', isCorrect: false }, 
              { text: '闻诊', isCorrect: false }, 
              { text: '叩诊', isCorrect: true }, 
              { text: '切诊', isCorrect: false }
            ], 
            answer: 'C',
            explanation: '中医四诊包括望、闻、问、切。叩诊是现代医学的检查方法，不属于中医四诊范畴。'
          },
          { 
            id: 102, certId: 1, type: 'A1', code: 'SN-002', 
            content: '中医“五行”中，与“木”相对应的脏器是？', 
            options: [
              { text: '心', isCorrect: false }, 
              { text: '肝', isCorrect: true }, 
              { text: '脾', isCorrect: false }, 
              { text: '肾', isCorrect: false }
            ], 
            answer: 'B',
            explanation: '五行与五脏对应关系：木-肝、火-心、土-脾、金-肺、水-肾。'
          },
          { 
            id: 103, certId: 1, type: 'A2', code: 'SN-003', 
            content: '患者，男，35岁，恶寒发热，无汗，头痛身痛，舌苔薄白，脉浮紧。其证候属于？', 
            options: [
              { text: '风寒表证', isCorrect: true }, 
              { text: '风热表证', isCorrect: false }, 
              { text: '暑湿表证', isCorrect: false }, 
              { text: '气虚感冒', isCorrect: false }
            ], 
            answer: 'A',
            explanation: '恶寒发热、无汗、头痛身痛、脉浮紧为风寒表证的典型表现。'
          },
          { 
            id: 104, certId: 1, type: 'A1', code: 'SN-004', 
            content: '被称为“后天之本”的脏腑是？', 
            options: [
              { text: '心', isCorrect: false }, 
              { text: '肝', isCorrect: false }, 
              { text: '脾', isCorrect: true }, 
              { text: '肾', isCorrect: false }
            ], 
            answer: 'C',
            explanation: '脾主运化，为气血生化之源，被称为“后天之本”。肾为“先天之本”。'
          }
        ],
        // 证书2：中医医师资格证 的题目
        2: [
          { 
            id: 201, certId: 2, type: 'A1', code: 'ZY-001', 
            content: '下列哪项是中医“五行”中“木”的特性？', 
            options: [
              { text: '曲直', isCorrect: true }, 
              { text: '炎上', isCorrect: false }, 
              { text: '稼穑', isCorrect: false }, 
              { text: '从革', isCorrect: false }
            ], 
            answer: 'A',
            explanation: '木曰曲直，具有生长、升发、条达舒畅的特性。'
          },
          { 
            id: 202, certId: 2, type: 'A2', code: 'ZY-002', 
            content: '患者，男，45岁，胁肋胀痛，口苦纳呆，舌红苔黄腻，脉弦数。其辨证为何？', 
            options: [
              { text: '肝气郁结', isCorrect: false }, 
              { text: '肝胆湿热', isCorrect: true }, 
              { text: '肝火上炎', isCorrect: false }, 
              { text: '肝阴不足', isCorrect: false }
            ], 
            answer: 'B',
            explanation: '胁肋胀痛、口苦、苔黄腻、脉弦数为肝胆湿热的典型表现。'
          },
          { 
            id: 203, certId: 2, type: 'A1', code: 'ZY-003', 
            content: '下列哪味药物具有“补气固表”的功效？', 
            options: [
              { text: '当归', isCorrect: false }, 
              { text: '黄芪', isCorrect: true }, 
              { text: '党参', isCorrect: false }, 
              { text: '白术', isCorrect: false }
            ], 
            answer: 'B',
            explanation: '黄芪具有补气固表、利尿托毒、排脓敛疮生肌的功效。'
          },
          { 
            id: 204, certId: 2, type: 'A2', code: 'ZY-004', 
            content: '患者，女，28岁，月经周期紊乱，量少色淡，面色萎黄，头晕心悸，舌淡苔薄，脉细弱。治疗应首选？', 
            options: [
              { text: '四物汤', isCorrect: false }, 
              { text: '归脾汤', isCorrect: true }, 
              { text: '八珍汤', isCorrect: false }, 
              { text: '逍遥散', isCorrect: false }
            ], 
            answer: 'B',
            explanation: '心脾两虚导致的月经不调，归脾汤益气补血、健脾养心。'
          },
          { 
            id: 205, certId: 2, type: 'A1', code: 'ZY-005', 
            content: '“君相安位”指的是哪两脏的关系？', 
            options: [
              { text: '心与肺', isCorrect: false }, 
              { text: '心与肾', isCorrect: true }, 
              { text: '肝与肾', isCorrect: false }, 
              { text: '脾与肾', isCorrect: false }
            ], 
            answer: 'B',
            explanation: '心为君火，肾为相火，心肾相交、水火既济称为“君相安位”。'
          },
          { 
            id: 206, certId: 2, type: 'A2', code: 'ZY-006', 
            content: '患者，男，60岁，咳喘反复发作10年，近日加重，咳声低弱，气短难续，动则尤甚，痰白清稀，舌淡苔白，脉沉细。其证候属于？', 
            options: [
              { text: '风寒袭肺', isCorrect: false }, 
              { text: '痰湿阻肺', isCorrect: false }, 
              { text: '肺气虚证', isCorrect: true }, 
              { text: '肾不纳气', isCorrect: false }
            ], 
            answer: 'C',
            explanation: '咳声低弱、气短难续、动则尤甚为肺气虚的典型表现。'
          },
          { 
            id: 207, certId: 2, type: 'A1', code: 'ZY-007', 
            content: '下列哪项是“十八反”的内容？', 
            options: [
              { text: '甘草反甘遂', isCorrect: true }, 
              { text: '黄芪反白术', isCorrect: false }, 
              { text: '人参反五味子', isCorrect: false }, 
              { text: '当归反川芎', isCorrect: false }
            ], 
            answer: 'A',
            explanation: '十八反歌诀：本草明言十八反，半蒌贝蔹及攻乌，藻戟遂芫俱战草，诸参辛芍叛藜芦。'
          },
          { 
            id: 208, certId: 2, type: 'A2', code: 'ZY-008', 
            content: '患者，女，35岁，情绪抑郁，胸胁胀痛，善太息，月经不调，舌淡红苔薄白，脉弦。治疗应首选？', 
            options: [
              { text: '柴胡疏肝散', isCorrect: true }, 
              { text: '龙胆泻肝汤', isCorrect: false }, 
              { text: '逍遥散', isCorrect: false }, 
              { text: '半夏厚朴汤', isCorrect: false }
            ], 
            answer: 'A',
            explanation: '肝气郁结证，柴胡疏肝散疏肝理气、活血止痛。'
          }
        ],
        // 证书3：师承/专长方向 的题目
        3: [
          { 
            id: 301, certId: 3, type: 'A1', code: 'SC-001', 
            content: '师承出师考核中，专长陈述的时间一般为多少分钟？', 
            options: [
              { text: '5-10分钟', isCorrect: true }, 
              { text: '15-20分钟', isCorrect: false }, 
              { text: '30分钟', isCorrect: false }, 
              { text: '不限时', isCorrect: false }
            ], 
            answer: 'A',
            explanation: '师承出师考核中，专长陈述一般要求5-10分钟，需简明扼要地介绍自己的学术渊源和专长特色。'
          },
          { 
            id: 302, certId: 3, type: 'A1', code: 'SC-002', 
            content: '根据《中医药法》，师承人员跟师学习时间至少需要？', 
            options: [
              { text: '1年', isCorrect: false }, 
              { text: '2年', isCorrect: false }, 
              { text: '3年', isCorrect: true }, 
              { text: '5年', isCorrect: false }
            ], 
            answer: 'C',
            explanation: '《中医药法》规定，师承人员应当连续跟师学习中医满3年。'
          },
          { 
            id: 303, certId: 3, type: 'A2', code: 'SC-003', 
            content: '李某，师承学习中医3年，现准备参加出师考核。以下哪项不是出师考核的必要材料？', 
            options: [
              { text: '跟师学习记录', isCorrect: false }, 
              { text: '指导老师评价意见', isCorrect: false }, 
              { text: '学术论文发表证明', isCorrect: true }, 
              { text: '临床实践病历', isCorrect: false }
            ], 
            answer: 'C',
            explanation: '出师考核需要提供跟师学习记录、指导老师评价、临床实践病历等，学术论文非必要条件。'
          },
          { 
            id: 304, certId: 3, type: 'A1', code: 'SC-004', 
            content: '确有专长人员考核中，专长综述的撰写应重点突出？', 
            options: [
              { text: '学术理论创新', isCorrect: false }, 
              { text: '临床经验与特色', isCorrect: true }, 
              { text: '科研项目成果', isCorrect: false }, 
              { text: '著作出版情况', isCorrect: false }
            ], 
            answer: 'B',
            explanation: '确有专长考核重点考察申报人的临床经验和专长特色，综述应突出这一核心。'
          }
        ]
      }
    }
  },
  computed: {
    currentCertName() {
      const cert = this.certificateList.find(c => c.id === this.currentCertId)
      return cert?.titleHtml?.replace(/<br>|<br\/>|<\/?span[^>]*>/g, '') || '证书'
    },
    allQuestions() {
      if (!this.currentCertId) return []
      return this.questionsData[this.currentCertId] || []
    },
    filteredQuestions() {
      if (!this.filterType) return this.allQuestions
      return this.allQuestions.filter(q => q.type === this.filterType)
    }
  },
  methods: {
    getQuestionCount(certId) {
      return this.questionsData[certId]?.length || 0
    },
    showQuestionDialog(certId) {
      console.log('显示题目管理，证书ID:', certId)
      this.currentCertId = certId
      this.filterType = ''
      this.showSimpleModal = true
    },
    closeSimpleModal() {
      this.showSimpleModal = false
      this.currentCertId = null
    },
    openAddQuestionSimple() {
      this.isEditQuestion = false
      this.currentEditQuestionId = null
      this.questionForm = {
        type: 'A1',
        code: '',
        content: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        explanation: ''
      }
      this.showQuestionFormSimple = true
    },
    editQuestionSimple(question) {
      this.isEditQuestion = true
      this.currentEditQuestionId = question.id
      this.questionForm = {
        type: question.type,
        code: question.code || '',
        content: question.content,
        options: JSON.parse(JSON.stringify(question.options)),
        explanation: question.explanation || ''
      }
      this.showQuestionFormSimple = true
    },
    deleteQuestionSimple(question) {
      if (confirm(`确定要删除题目“${question.content.substring(0, 50)}...”吗？`)) {
        const questions = this.questionsData[this.currentCertId]
        const index = questions.findIndex(q => q.id === question.id)
        if (index !== -1) {
          questions.splice(index, 1)
          alert('题目已删除')
          this.$forceUpdate()
        }
      }
    },
    saveQuestionSimple() {
      if (!this.questionForm.content.trim()) {
        alert('请输入题目内容')
        return
      }
      const correctOptionIndex = this.questionForm.options.findIndex(opt => opt.isCorrect)
      if (correctOptionIndex === -1) {
        alert('请选择一个正确答案')
        return
      }
      const answerLetter = String.fromCharCode(65 + correctOptionIndex)
      const questionData = {
        id: this.isEditQuestion ? this.currentEditQuestionId : Date.now(),
        certId: this.currentCertId,
        type: this.questionForm.type,
        code: this.questionForm.code || `Q-${Date.now()}`,
        content: this.questionForm.content,
        options: this.questionForm.options.map(opt => ({ ...opt })),
        answer: answerLetter,
        explanation: this.questionForm.explanation || ''
      }
      if (this.isEditQuestion) {
        const questions = this.questionsData[this.currentCertId]
        const index = questions.findIndex(q => q.id === this.currentEditQuestionId)
        if (index !== -1) {
          questions[index] = questionData
          alert('题目已更新')
        }
      } else {
        if (!this.questionsData[this.currentCertId]) {
          this.$set(this.questionsData, this.currentCertId, [])
        }
        this.questionsData[this.currentCertId].push(questionData)
        alert('题目已添加')
      }
      this.closeQuestionFormSimple()
      this.$forceUpdate()
    },
    closeQuestionFormSimple() {
      this.showQuestionFormSimple = false
      this.isEditQuestion = false
      this.currentEditQuestionId = null
    },
    editCertificate(certId) {
      alert(`编辑证书：${this.certificateList.find(c => c.id === certId)?.titleHtml?.replace(/<br>|<br\/>|<\/?span[^>]*>/g, '')}`)
    },
    openAddCertificate() {
      alert('新增证书功能开发中')
    },
    addOption() {
      this.questionForm.options.push({ text: '', isCorrect: false })
    },
    removeOption(index) {
      this.questionForm.options.splice(index, 1)
    },
    setCorrectOption(index) {
      this.questionForm.options.forEach((opt, i) => {
        opt.isCorrect = (i === index)
      })
    }
  }
}
</script>

<style scoped>
.certificate-manage-view {
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

/* 证书网格 */
.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}
.cert-card {
  background: rgba(250, 242, 228, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 28px;
  border: 1px solid rgba(190, 145, 85, 0.6);
  overflow: hidden;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 520px;
}
.cert-header {
  display: flex;
  gap: 16px;
  padding: 20px 20px 0 20px;
  flex-shrink: 0;
}
.cert-icon {
  width: 60px;
  height: 60px;
  background: rgba(185, 125, 65, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(170, 110, 50, 0.5);
  flex-shrink: 0;
}
.cert-icon i {
  font-size: 1.8rem;
  color: #b87a48;
}
.cert-title-section {
  flex: 1;
}
.cert-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4a2a12;
  line-height: 1.4;
}
.cert-title .subtitle {
  font-size: 0.9rem;
  font-weight: normal;
}
.cert-type {
  display: inline-block;
  background: rgba(185, 125, 65, 0.2);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  color: #7a4a28;
  margin-top: 6px;
}
.cert-body {
  padding: 16px 20px;
  flex: 1;
}
.cert-description {
  font-size: 0.85rem;
  color: #5a3a1e;
  line-height: 1.5;
  margin-bottom: 16px;
}
.cert-stats {
  background: rgba(170, 125, 65, 0.1);
  border-radius: 20px;
  padding: 12px;
  margin-bottom: 16px;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.8rem;
  border-bottom: 1px dotted rgba(170, 125, 65, 0.3);
}
.stat-row:last-child {
  border-bottom: none;
}
.stat-label {
  color: #7a4e28;
  display: flex;
  align-items: center;
  gap: 6px;
}
.stat-value {
  color: #4a2a12;
  font-weight: 500;
}
.stat-value.highlight {
  color: #c4713a;
}
.exam-structure {
  margin-top: 12px;
}
.structure-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #7a4e28;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.structure-list {
  list-style: none;
  padding-left: 20px;
}
.structure-list li {
  font-size: 0.75rem;
  color: #5a3a1e;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.structure-list li i {
  color: #b87a48;
  font-size: 0.7rem;
}
.cert-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(170, 125, 65, 0.4);
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}
.btn-manage {
  flex: 1;
  background: #b87a48;
  border: none;
  padding: 10px 0;
  border-radius: 30px;
  color: #fff5e8;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-manage:hover {
  background: #9a5e32;
}
.btn-edit-cert {
  background: rgba(170, 110, 55, 0.2);
  border: 1px solid #bc8f5a;
  width: 42px;
  border-radius: 30px;
  cursor: pointer;
  color: #7a4a28;
}

/* 简单弹窗样式 */
.simple-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(60, 40, 20, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.simple-modal-content {
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  background: rgba(250, 242, 228, 0.98);
  backdrop-filter: blur(12px);
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
.simple-modal-content-form {
  max-width: 650px;
}
.simple-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(170, 125, 65, 0.4);
}
.simple-modal-header h3 {
  flex: 1;
  color: #4a2a12;
}
.simple-modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #8b5a34;
  padding: 4px 8px;
  border-radius: 8px;
}
.simple-modal-close:hover {
  background: rgba(170, 110, 55, 0.2);
}
.simple-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}
.simple-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(170, 125, 65, 0.4);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 筛选按钮 */
.btn-filter {
  background: rgba(170, 110, 55, 0.15);
  border: 1px solid rgba(170, 110, 55, 0.3);
  padding: 6px 16px;
  border-radius: 30px;
  cursor: pointer;
  color: #7a4a28;
  font-size: 0.8rem;
}
.btn-filter.active {
  background: #b87a48;
  color: #fff5e8;
  border-color: #b87a48;
}

/* 题目相关样式 */
.btn-add-question {
  background: #b87a48;
  border: none;
  padding: 8px 20px;
  border-radius: 30px;
  color: #fff5e8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
.question-item {
  background: rgba(250, 245, 235, 0.6);
  border-radius: 20px;
  padding: 16px;
  border: 1px solid rgba(170, 110, 55, 0.3);
}
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}
.question-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.q-num {
  font-weight: 600;
  color: #8b6946;
  font-size: 0.8rem;
}
.q-type-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}
.type-a1 {
  background: #6ba5a5;
  color: white;
}
.type-a2 {
  background: #c4a56e;
  color: white;
}
.q-code {
  /* font-family: monospace; */
  font-size: 0.7rem;
  color: #8b6946;
}
.q-actions {
  display: flex;
  gap: 8px;
}
.q-edit, .q-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
}
.q-edit {
  color: #7a4a28;
  border: 1px solid #bc8f5a;
}
.q-delete {
  color: #c4713a;
  border: 1px solid #c4713a;
}
.question-content {
  font-size: 0.95rem;
  color: #4a2a12;
  margin-bottom: 12px;
  line-height: 1.5;
  padding: 8px 12px;
  background: rgba(185, 125, 65, 0.05);
  border-radius: 12px;
}
.question-options {
  margin-left: 20px;
  margin-bottom: 12px;
}
.option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 0.85rem;
}
.option.correct {
  color: #548235;
}
.correct-icon {
  color: #548235;
  margin-left: auto;
}
.option-letter {
  font-weight: 600;
  width: 24px;
}
.question-answer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(170, 125, 65, 0.3);
  font-size: 0.85rem;
}
.answer-label {
  font-weight: 600;
  color: #7a4e28;
}
.answer-text {
  color: #548235;
  font-weight: 500;
}
.question-explanation {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #8b6946;
  background: rgba(185, 125, 65, 0.08);
  padding: 8px 12px;
  border-radius: 12px;
}
.explanation-label {
  font-weight: 500;
  color: #b87a48;
}
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

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #7a4e28;
}
.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px 14px;
  background: rgba(250, 245, 235, 0.8);
  border: 1px solid rgba(170, 110, 55, 0.4);
  border-radius: 16px;
  font-size: 0.9rem;
  color: #4a2a12;
  outline: none;
}
.option-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.option-input-row .flex-1 {
  flex: 1;
}
.correct-check {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  white-space: nowrap;
}
.remove-option {
  background: rgba(200, 80, 50, 0.2);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  color: #c4713a;
}
.add-option-btn {
  background: rgba(170, 110, 55, 0.15);
  border: 1px dashed #b87a48;
  padding: 8px 16px;
  border-radius: 30px;
  cursor: pointer;
  color: #7a4a28;
  margin-top: 8px;
}
.btn-secondary {
  background: rgba(170, 110, 55, 0.2);
  border: 1px solid #bc8f5a;
  padding: 8px 20px;
  border-radius: 30px;
  cursor: pointer;
  color: #7a4a28;
}
.btn-primary-sm {
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
.flex-1 {
  flex: 1;
}
</style>