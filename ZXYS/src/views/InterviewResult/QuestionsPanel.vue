<template>
  <div class="pane-fade">
    <div class="traditional-questions-container">
      <!-- 左侧：题名目录（类似于奏折索引） -->
      <aside class="questions-sidebar">
        <div class="sidebar-header">
          <i class="fas fa-scroll"></i>
          <h4>面试题名录</h4>
          <div class="header-line"></div>
        </div>

        <nav class="question-list-nav">
          <button
            v-for="(question, idx) in questions"
            :key="idx"
            :class="['trad-nav-btn', { active: selectedIndex === idx }]"
            @click="selectedIndex = idx"
          >
            <div class="btn-prefix">
              <span class="q-index">{{ idx + 1 }}</span>
            </div>
            <div class="btn-info">
              <span class="q-type-label">{{ question.type }}</span>
              <span class="q-score-seal" :class="getScoreClass(question.score)">
                {{ question.score }}分
              </span>
            </div>
            <i class="fas fa-chevron-right arrow-icon"></i>
          </button>
        </nav>
      </aside>

      <!-- 右侧：详卷内容（类似于卷轴展开） -->
      <section class="questions-detail" v-if="currentQuestion">
        <div class="detail-header-scroll">
          <div class="title-wrap">
            <span class="detail-num-seal">第 {{ selectedIndex + 1 }} 题</span>
            <h2 class="detail-type-text">{{ currentQuestion.type }}</h2>
          </div>
          <div class="status-wrap">
            <span v-if="currentQuestion.risk_tag" class="risk-stamp">
              <i class="fas fa-exclamation-triangle"></i> {{ currentQuestion.risk_tag }}
            </span>
            <div class="score-main-seal" :class="getScoreClass(currentQuestion.score)">
              <span class="seal-inner">
                <small>得分</small>
                <strong>{{ currentQuestion.score }}</strong>
              </span>
            </div>
          </div>
        </div>

        <div class="scroll-content-body">
          <!-- 题目内容 -->
          <div class="ink-block">
            <div class="block-head">
              <i class="fas fa-pen-fancy"></i>
              <span>题目原由</span>
            </div>
            <div class="block-body question-text">{{ currentQuestion.content }}</div>
          </div>

          <!-- 用户回答 -->
          <div class="ink-block answer-block">
            <div class="block-head">
              <i class="fas fa-comment-alt"></i>
              <span>用户自述</span>
            </div>
            <div class="block-body">{{ currentQuestion.user_answer || '此题未留墨迹' }}</div>
          </div>

          <!-- AI智能分析 -->
          <div class="ink-block ai-block" v-if="currentQuestion.ai_feedback">
            <div class="block-head">
              <i class="fas fa-magic"></i>
              <span>阅心师评语</span>
            </div>
            <div class="block-body feedback-text">{{ currentQuestion.ai_feedback }}</div>
          </div>

          <!-- 参考答案 -->
          <div class="ink-block model-block" v-if="currentQuestion.model_answer">
            <div class="block-head">
              <i class="fas fa-book-open"></i>
              <span>参考典籍</span>
            </div>
            <div class="block-body">{{ currentQuestion.model_answer }}</div>
          </div>

          <!-- 改进建议 -->
          <div class="ink-block suggest-block" v-if="currentQuestion.improvement">
            <div class="block-head">
              <i class="fas fa-lightbulb"></i>
              <span>修身建议</span>
            </div>
            <div class="block-body">{{ currentQuestion.improvement }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  questions: any[]
}>()

const selectedIndex = ref(0)
const currentQuestion = computed(() => props.questions[selectedIndex.value])

/**
 * 分数样式映射
 * 采用传统色彩：朱红(fail)、黛绿(excellent)、琥珀(pass/good)
 */
const getScoreClass = (score: number) => {
  if (score >= 85) return 'trad-excellent'
  if (score >= 70) return 'trad-good'
  if (score >= 60) return 'trad-pass'
  return 'trad-fail'
}
</script>

<style scoped>
/* 容器布局 */
.traditional-questions-container {
  display: flex;
  gap: 40px;
  min-height: 600px;
  background: transparent;
  font-family: 'NO3', serif;
}

/* 左侧目录栏 */
.questions-sidebar {
  flex: 0 0 300px;
  background: rgba(253, 245, 230, 0.95);
  border: 1px solid #e0d8c3;
  border-radius: 4px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.05);
  padding: 25px 15px;
}

.sidebar-header {
  text-align: center;
  margin-bottom: 25px;
}

.sidebar-header i {
  font-size: 24px;
  color: #b71c1c;
  margin-bottom: 10px;
}

.sidebar-header h4 {
  font-size: 20px;
  color: #3e2723;
  letter-spacing: 2px;
}

.header-line {
  height: 1px;
  background: linear-gradient(to right, transparent, #b71c1c, transparent);
  margin-top: 8px;
}

/* 左侧按钮样式 */
.trad-nav-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px 10px;
  margin-bottom: 12px;
  border: 1px solid #e0d8c3;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.trad-nav-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: #b71c1c;
  transform: scaleY(0);
  transition: transform 0.3s;
}

.trad-nav-btn:hover {
  background: #fdf5e6;
  transform: translateX(5px);
}

.trad-nav-btn.active {
  background: #fdf5e6;
  border-color: #b71c1c;
}

.trad-nav-btn.active::before {
  transform: scaleY(1);
}

.btn-prefix {
  flex: 0 0 35px;
}

.q-index {
  font-weight: bold;
  color: #8b5e3c;
  font-size: 18px;
}

.btn-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.q-type-label {
  font-size: 14px;
  color: #5d4037;
}

.q-score-seal {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 2px;
  border: 1px solid transparent;
}

.arrow-icon {
  font-size: 12px;
  color: #e0d8c3;
}

.trad-nav-btn.active .arrow-icon {
  color: #b71c1c;
}

/* 右侧内容区 */
.questions-detail {
  flex: 1;
  background: #fdfcf9;
  border: 1px solid #e0d8c3;
  position: relative;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.detail-header-scroll {
  padding: 30px;
  background: #fdfaf5;
  border-bottom: 2px double #e0d8c3;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-num-seal {
  display: inline-block;
  padding: 4px 12px;
  border: 2px solid #b71c1c;
  color: #b71c1c;
  font-weight: bold;
  margin-bottom: 10px;
}

.detail-type-text {
  font-size: 28px;
  color: #3e2723;
  margin: 0;
}

.status-wrap {
  display: flex;
  align-items: center;
  gap: 20px;
}

.risk-stamp {
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.1);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.score-main-seal {
  width: 70px;
  height: 70px;
  border: 3px double currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(15deg);
  font-family: 'NO3';
}

.seal-inner {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.seal-inner strong {
  font-size: 24px;
}

/* 墨迹内容块 */
.scroll-content-body {
  padding: 30px;
  max-height: 700px;
  overflow-y: auto;
}

.ink-block {
  margin-bottom: 30px;
  border-left: 3px solid #e0d8c3;
  padding-left: 20px;
}

.block-head {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8b5e3c;
  margin-bottom: 12px;
  font-weight: bold;
}

.block-head i {
  font-size: 30px;
}

.block-body {
  color: #3e2723;
  line-height: 1.8;
  font-size: 24px;
  background: rgba(139, 94, 60, 0.03);
  padding: 15px;
  border-radius: 4px;
}

/* 针对不同地块的配色 */
.answer-block {
  border-color: #5d4037;
}
.ai-block {
  border-color: #3498db;
}
.ai-block .block-body {
  background: rgba(52, 152, 219, 0.05);
  border: 1px dashed rgba(52, 152, 219, 0.2);
}

.suggest-block {
  border-color: #b71c1c;
}
.suggest-block .block-body {
  color: #b71c1c;
  font-style: italic;
}

/* 分数色彩方案 */
.trad-excellent {
  color: #2e7d32;
  border-color: #2e7d32;
}
.trad-good {
  color: #ef6c00;
  border-color: #ef6c00;
}
.trad-pass {
  color: #8d6e63;
  border-color: #8d6e63;
}
.trad-fail {
  color: #c62828;
  border-color: #c62828;
}

/* 进场动画 */
.pane-fade {
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条美化 */
.scroll-content-body::-webkit-scrollbar {
  width: 6px;
}
.scroll-content-body::-webkit-scrollbar-thumb {
  background: #e0d8c3;
  border-radius: 3px;
}
</style>
