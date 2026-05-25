<template>
  <div class="cert-center-subpage-wrapper">
    <!-- 仿古大框 -->
    <div class="ancient-frame">
      <!-- 1. 顶部标题栏：仿古籍签条 -->
      <div class="study-top-header">
        <div class="title-tab">
          <span class="tab-text">考证中心</span>
        </div>
        <div class="header-decoration-line"></div>
        <div class="header-seal">精进</div>
      </div>

      <!-- 2. 核心数据汇总区 -->
      <section class="cert-info-grid">
        <div class="info-card-mini">
          <span class="label">【证书总数】</span>
          <span class="val">{{ certList.length }}<small>项</small></span>
        </div>
        <div class="info-card-mini">
          <span class="label">【研习科目】</span>
          <span class="val">{{ totalSubjects }}<small>科</small></span>
        </div>
        <div class="info-card-mini tips">
          <p class="wisdom-quote">“学以致用 · 证验其功”</p>
        </div>
      </section>

      <!-- 3. 考证卡片网格区 -->
      <div class="cert-grid-section">
        <div class="grid-header">
          <span class="sub-title">〈 核心执业资格 〉</span>
          <span class="grid-hint">点击按钮开始研习</span>
        </div>

        <div class="cert-grid-container">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-placeholder">
            <div class="loading-spinner"></div>
            <p>正在调取考证档案...</p>
          </div>

          <!-- 证书卡片循环 -->
          <div v-for="item in certList" :key="item.id" class="cert-card">
            <!-- 卡片顶部装饰条 -->
            <div class="card-top-stripe" :class="getStripeClass(item.level)"></div>

            <!-- 卡片主体内容 -->
            <div class="card-body">
              <!-- 证书图标区 -->
              <div class="cert-icon-area" :class="getIconAreaClass(item.level)">
                <!-- 这里强制指定 fas 样式 -->
                <i :class="getCertIcon(item.type)" class="fas cert-icon-fa"></i>
              </div>

              <!-- 证书核心信息 -->
              <div class="cert-core-info">
                <div class="cert-name">{{ item.name }}</div>

                <div class="cert-meta-row">
                  <span class="cert-category">
                    <i class="fas fa-tag"></i>
                    {{ item.category }}
                  </span>
                  <span class="cert-level" :class="getLevelClass(item.level)">
                    <i class="fas fa-medal"></i>
                    {{ getLevelText(item.level) }}
                  </span>
                </div>

                <!-- 难度评级 -->
                <div class="difficulty-row">
                  <span class="diff-label">难度评级：</span>
                  <span class="stars">{{ getDifficultyStars(item.difficulty) }}</span>
                </div>

                <div class="cert-exam-meta">
                  <span><i class="fas fa-book-bookmark"></i> 考核：{{ item.examCount }}科</span>
                </div>
              </div>
            </div>

            <!-- 详情区 -->
            <div class="card-detail">
              <div class="exams-grid">
                <div v-for="exam in item.exams" :key="exam.name" class="exam-item">
                  <i class="fas fa-square-check"></i>
                  <span class="exam-name">{{ exam.name }}</span>
                </div>
              </div>

              <div class="detail-actions">
                <button class="action-btn study-btn" @click="handleStudy(item)">
                  <i class="fas fa-graduation-cap"></i> 考纲研习
                </button>
                <button class="action-btn test-btn" @click="handleTest(item)">
                  <i class="fas fa-file-signature"></i> 模拟刷题
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 考证寄语 -->
      <div class="cert-motivation">
        <div class="motivation-line"></div>
        <p class="motivation-text">“凡学之道，严师为难。师严然后道尊，道尊然后民知敬学。”</p>
        <div class="motivation-seal">劝学</div>
      </div>

      <!-- 5. 底部装饰 -->
      <div class="frame-footer">
        <div class="footer-line"></div>
        <div class="corner-mark-left"></div>
        <div class="corner-mark-right"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PopupPlugin } from '@/components/Popup'
import { useRouter } from 'vue-router'
const router = useRouter()

interface ExamItem {
  name: string
}

interface CertificateItem {
  id: number
  name: string
  type: string
  category: string
  level: number
  difficulty: number
  examCount: number
  exams?: ExamItem[]
}

const loading = ref(true)
const certList = ref<CertificateItem[]>([])

const totalSubjects = computed(() => {
  return certList.value.reduce((sum, cert) => sum + (cert.examCount || 0), 0)
})

const getDifficultyStars = (count: number) => {
  return '★'.repeat(count) + '☆'.repeat(5 - count)
}

// 修改后的图标映射，使用更稳定、版本兼容性更好的图标类
const getCertIcon = (type: string) => {
  const map: Record<string, string> = {
    技能: 'fa-stethoscope', // 实践技能
    资格: 'fa-address-card', // 医师资格
    师承: 'fa-user-graduate', // 师承专长
  }
  return map[type] || 'fa-certificate'
}

const getStripeClass = (level: number) => {
  const map: Record<number, string> = {
    1: 'stripe-primary',
    2: 'stripe-intermediate',
    3: 'stripe-advanced',
  }
  return map[level] || 'stripe-primary'
}

const getIconAreaClass = (level: number) => {
  const map: Record<number, string> = {
    1: 'icon-area-primary',
    2: 'icon-area-intermediate',
    3: 'icon-area-advanced',
  }
  return map[level] || 'icon-area-primary'
}

const getLevelClass = (level: number) => {
  const map: Record<number, string> = {
    1: 'level-primary',
    2: 'level-intermediate',
    3: 'level-advanced',
  }
  return map[level] || 'level-primary'
}

const getLevelText = (level: number) => {
  const map: Record<number, string> = { 1: '基础', 2: '进阶', 3: '高级' }
  return map[level] || '初级'
}

const handleStudy = (item: CertificateItem) => {
  console.log('学习:', item.name)
}

const handleTest = (item: CertificateItem) => {
  PopupPlugin.showType1({
    title: '模拟考试提醒',
    content: [
      '模拟形式：AI智能组卷，仿真人机交互操作环境',

      '核心目标：强化实践技能，提前适应考试节奏与题型',
      '建议准备：复习重点病证诊疗方案、针灸穴位定位、方剂配伍等实操知识点',
      '请确认以“考生”身份进入模拟考试系统吗？​',
      '我们将带您沉浸式体验考试实景，助您从容应对，稳步通关！',
    ],
    onConfirm: async () => {
      router.push({
        path: '/Hina/SimulatedPracticeExercises',
        // query: { certId, title: certName },
      })
    },
    onCancel: () => console.log('取消'),
  })
}

const loadCertData = async () => {
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 600))

  certList.value = [
    {
      id: 1,
      name: '中医执业（助理）医师实践技能证书',
      type: '技能',
      category: '国家医学考试',
      level: 1,
      difficulty: 2,
      examCount: 3,
      exams: [{ name: '中医辨证论治' }, { name: '中医技术操作' }, { name: '临床答辩' }],
    },
    {
      id: 2,
      name: '中医医师资格证',
      type: '资格',
      category: '执业资格',
      level: 3,
      difficulty: 5,
      examCount: 4,
      exams: [
        { name: '医学综合笔试' },
        { name: '中医基础理论' },
        { name: '临床专业知识' },
        { name: '医学法规' },
      ],
    },
    {
      id: 3,
      name: '中医资格证（师承/专长）',
      type: '师承',
      category: '传统医学评估',
      level: 2,
      difficulty: 4,
      examCount: 2,
      exams: [{ name: '师承出师考核' }, { name: '专长实践技能' }],
    },
  ]
  loading.value = false
}

onMounted(() => {
  loadCertData()
})
</script>

<style scoped>
/* 1. 字体防御设置：极其重要 */
.cert-center-subpage-wrapper,
.cert-center-subpage-wrapper *:not(.fas):not(.fab):not(.far):not(.fa):not([class*='fa-']) {
  font-family: 'NO3', serif !important;
}

/* 2. 图标强制还原：极其重要 */
.fas,
.fa {
  font-family: 'Font Awesome 6 Free' !important;
  font-weight: 900 !important; /* 实心图标必须 900 */
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
}

.cert-center-subpage-wrapper {
  padding: 15px;
  background: #fdfaf5;
}

.ancient-frame {
  border: 2px solid rgba(139, 69, 19, 0.9);
  padding: 25px;
  position: relative;
  background: #fdfaf5;
}

/* 顶部签条 */
.study-top-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.title-tab {
  background: rgba(139, 69, 19, 0.95);
  color: #fff;
  padding: 8px 30px;
  font-size: 22px;
  clip-path: polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%);
}

.header-decoration-line {
  flex: 1;
  height: 1px;
  background: rgba(139, 69, 19, 0.2);
  margin: 0 15px;
}

.header-seal {
  border: 1px solid rgba(139, 69, 19, 0.8);
  color: rgba(139, 69, 19, 0.8);
  padding: 4px 8px;
  font-size: 14px;
  writing-mode: vertical-rl;
}

/* 统计 */
.cert-info-grid {
  display: grid;
  grid-template-columns: 180px 180px 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.info-card-mini {
  border: 1px solid rgba(139, 69, 19, 0.3);
  padding: 15px;
  background: rgba(139, 69, 19, 0.03);
}

.info-card-mini .label {
  font-size: 14px;
  color: #8d6e63;
}
.info-card-mini .val {
  font-size: 28px;
  color: #8b4513;
  font-weight: bold;
}

.wisdom-quote {
  font-style: italic;
  color: rgba(139, 69, 19, 0.6);
  font-size: 16px;
  text-align: right;
  line-height: 50px;
  margin: 0;
}

/* 列表区 */
.grid-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(139, 69, 19, 0.2);
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.sub-title {
  font-size: 20px;
  color: #3e2723;
  font-weight: bold;
}

.cert-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 25px;
}

/* 卡片 */
.cert-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: transform 0.3s;
}

.cert-card:hover {
  transform: translateY(-5px);
}

.card-top-stripe {
  height: 6px;
}
.stripe-primary {
  background: #bcaaa4;
}
.stripe-intermediate {
  background: #8d6e63;
}
.stripe-advanced {
  background: #5d4037;
}

.card-body {
  padding: 20px;
  display: flex;
  gap: 20px;
}

.cert-icon-area {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-area-primary {
  background: #fdf5f2;
}
.icon-area-intermediate {
  background: #f7ede2;
}
.icon-area-advanced {
  background: #efdfd5;
}

.cert-icon-fa {
  font-size: 32px;
  color: #8b4513;
}

.cert-name {
  font-size: 19px;
  font-weight: bold;
  color: #2c1810;
  margin-bottom: 10px;
}

.cert-meta-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.cert-category {
  font-size: 13px;
  color: #8d6e63;
}
.cert-category i {
  margin-right: 4px;
}

.cert-level {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}
.level-primary {
  background: #f5f5f5;
  color: #9e9e9e;
}
.level-intermediate {
  background: #fff3e0;
  color: #fb8c00;
}
.level-advanced {
  background: #efebe9;
  color: #5d4037;
}

.difficulty-row {
  margin-bottom: 8px;
  font-size: 14px;
}
.diff-label {
  color: #a1887f;
}
.stars {
  color: #ffb300;
  letter-spacing: 2px;
}

.cert-exam-meta {
  font-size: 13px;
  color: #bdbdbd;
}

/* 科目区 */
.card-detail {
  padding: 15px 20px;
  background: #fafafa;
  border-top: 1px dashed #eee;
}

.exams-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.exam-item {
  font-size: 12px;
  color: #6d4c41;
  background: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.exam-item i {
  color: #8b4513;
  margin-right: 4px;
  font-size: 10px;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #8b4513;
  background: #fff;
  color: #8b4513;
  transition: all 0.2s;
}

.action-btn i {
  margin-right: 6px;
}
.study-btn:hover {
  background: #8b4513;
  color: #fff;
}
.test-btn {
  border-color: #90a4ae;
  color: #90a4ae;
}
.test-btn:hover {
  background: #90a4ae;
  color: #fff;
}

/* 装饰 */
.cert-motivation {
  margin-top: 30px;
  padding: 15px;
  background: #fdfaf5;
  border-left: 4px solid #8b4513;
  display: flex;
  align-items: center;
  gap: 15px;
}

.motivation-text {
  flex: 1;
  font-style: italic;
  color: #5d4037;
  margin: 0;
}
.motivation-seal {
  border: 1px solid #8b4513;
  padding: 2px 8px;
  color: #8b4513;
  transform: rotate(5deg);
}

.frame-footer {
  margin-top: 20px;
  position: relative;
}
.footer-line {
  height: 4px;
  border-top: 1px solid #8b4513;
  border-bottom: 1px solid #8b4513;
}
.corner-mark-left,
.corner-mark-right {
  position: absolute;
  bottom: -5px;
  width: 15px;
  height: 15px;
  border: 2px solid #8b4513;
}
.corner-mark-left {
  left: -5px;
  border-right: none;
  border-top: none;
}
.corner-mark-right {
  right: -5px;
  border-left: none;
  border-top: none;
}

.loading-placeholder {
  grid-column: 1/-1;
  text-align: center;
  padding: 40px;
}

@media (max-width: 800px) {
  .cert-grid-container {
    grid-template-columns: 1fr;
  }
  .cert-info-grid {
    grid-template-columns: 1fr 1fr;
  }
  .tips {
    grid-column: span 2;
  }
}
</style>
