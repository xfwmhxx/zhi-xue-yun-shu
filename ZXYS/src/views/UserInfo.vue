<template>
  <!-- 主容器 -->
  <div class="main-container">
    <!-- 页面进入动画 -->
    <PageTransition v-if="showTransition" mode="leave" @animation-end="onEnterAnimationEnd" />

    <!-- 顶部面包屑 -->
    <BreadcrumbNav :title="pageTitle" :show-back="false" />

    <!-- 页面内容 -->
    <div class="content-area">
      <div class="form-container">
        <!-- 标题 -->
        <div class="form-header">
          <h2 class="form-title">{{ formTitle }}</h2>
          <p class="form-subtitle">{{ formSubtitle }}</p>
        </div>

        <!-- 表单主体 -->
        <div class="form-main">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
            class="scholar-form"
          >
            <!-- 专业 -->
            <el-form-item label="所学专业" prop="major">
              <el-input
                v-model="formData.major"
                placeholder="例如：中医学、针灸推拿学"
                class="custom-input"
                clearable
              />
            </el-form-item>

            <!-- 年级或意向职业 -->
            <el-form-item :label="gradeLabel" prop="grade">
              <el-select
                v-model="formData.grade"
                :placeholder="gradePlaceholder"
                class="custom-select"
              >
                <template v-if="isScholar">
                  <el-option label="大一" value="大一" />
                  <el-option label="大二" value="大二" />
                  <el-option label="大三" value="大三" />
                  <el-option label="大四" value="大四" />
                  <el-option label="大五" value="大五" />
                  <el-option label="研一" value="研一" />
                  <el-option label="研二" value="研二" />
                  <el-option label="研三" value="研三" />
                  <el-option label="博士" value="博士" />
                  <el-option label="已毕业" value="毕业" />
                </template>
                <template v-else>
                  <el-option label="中医师" value="中医师" />
                  <el-option label="针灸师" value="针灸师" />
                  <el-option label="中药师" value="中药师" />
                  <el-option label="中医康复师" value="中医康复师" />
                  <el-option label="中医养生师" value="中医养生师" />
                  <el-option label="中医研究员" value="中医研究员" />
                  <el-option label="中医药管理者" value="中医药管理者" />
                  <el-option label="中医教师" value="中医教师" />
                  <el-option label="其他" value="其他" />
                </template>
              </el-select>
            </el-form-item>

            <!-- 学习目标 -->
            <el-form-item :label="goalLabel" prop="goal">
              <el-input
                v-model="formData.goal"
                type="textarea"
                :rows="3"
                :placeholder="goalPlaceholder"
                class="custom-textarea"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <!-- 按钮 -->
            <div class="form-actions">
              <el-button class="reset-btn" @click="resetForm"> 重置 </el-button>
              <el-button type="primary" class="submit-btn" @click="submitForm">
                确认并继续
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 页面退出动画 -->
    <PageTransition v-if="showTransition2" mode="enter" @animation-end="onLeaveAnimationEnd" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageTransition from '@/components/PageTransition.vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

const router = useRouter()
const route = useRoute()

const showTransition = ref(true)
const showTransition2 = ref(false)
const nextRoute = ref('')
const formRef = ref()

// 获取路由参数，默认值为2（中医学者）
const routeId = parseInt(route.params.id as string) || 2
const isScholar = ref(routeId === 2)

// 计算属性
const pageTitle = computed(() => (isScholar.value ? '中医学者档案' : '中医求职者档案'))
const formTitle = computed(() => (isScholar.value ? '中医学者档案' : '中医求职者档案'))
const formSubtitle = computed(() =>
  isScholar.value ? '完善信息，开启中医修行之路' : '完善信息，开启中医职业发展',
)

const gradeLabel = computed(() => (isScholar.value ? '年级' : '意向职业'))
const gradePlaceholder = computed(() => (isScholar.value ? '请选择年级' : '请选择意向职业'))
const goalLabel = computed(() => (isScholar.value ? '学习目标' : '职业目标'))
const goalPlaceholder = computed(() =>
  isScholar.value ? '请输入您的学习目标和计划' : '请输入您的职业发展规划和目标',
)

// 表单数据
const formData = reactive({
  major: '',
  grade: '',
  goal: '',
})

// 动态校验规则
const formRules = computed(() => {
  const baseRules = {
    major: [{ required: true, message: '请输入所学专业', trigger: 'blur' }],
    goal: [
      {
        required: true,
        message: isScholar.value ? '请输入学习目标' : '请输入职业目标',
        trigger: 'blur',
      },
      {
        min: 10,
        message: isScholar.value ? '学习目标至少10个字符' : '职业目标至少10个字符',
        trigger: 'blur',
      },
    ],
  }

  if (isScholar.value) {
    return {
      ...baseRules,
      grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
    }
  } else {
    return {
      ...baseRules,
      grade: [{ required: true, message: '请选择意向职业', trigger: 'change' }],
    }
  }
})

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value?.validate()
    // 根据不同类型跳转到不同的页面
    nextRoute.value = isScholar.value ? '/initialize/entrancetest/2' : '/initialize/entrancetest/3'
    showTransition2.value = true
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 动画结束回调
const onEnterAnimationEnd = () => {
  showTransition.value = false
}

const onLeaveAnimationEnd = () => {
  router.push(nextRoute.value)
  setTimeout(() => {
    showTransition2.value = false
  }, 100)
}
</script>

<style scoped>
* {
  font-family: 'No3', sans-serif;
}
.main-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.content-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.form-container {
  width: 100%;
  max-width: 600px;
  animation: fadeIn 0.5s ease-out;
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

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-title {
  font-size: 64px;
  color: #5a3921;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: 2px;
}

.form-subtitle {
  font-size: 16px;
  color: #8b7355;
  opacity: 0.8;
}

.form-main {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(90, 57, 33, 0.1);
  border: 1px solid rgba(212, 180, 131, 0.2);
}

.scholar-form {
  width: 100%;
}

/* 表单项间距 */
:deep(.el-form-item) {
  margin-bottom: 28px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

/* 标签样式 */
:deep(.el-form-item__label) {
  color: #5a3921;
  font-weight: 500;
  font-size: 15px;
  padding-right: 20px;
}

/* 输入框样式 */
:deep(.custom-input .el-input__wrapper),
:deep(.custom-select .el-input__wrapper) {
  background: #f8f5f1;
  border: 1px solid rgba(212, 180, 131, 0.3);
  border-radius: 10px;
  transition: all 0.3s ease;
  height: 46px;
}

:deep(.custom-input .el-input__wrapper:hover),
:deep(.custom-select .el-input__wrapper:hover) {
  border-color: #c19a6b;
  background: white;
  box-shadow: 0 2px 8px rgba(166, 124, 82, 0.1);
}

:deep(.custom-input .el-input__wrapper.is-focus),
:deep(.custom-select .el-input__wrapper.is-focus) {
  border-color: #a67c52;
  box-shadow: 0 0 0 2px rgba(166, 124, 82, 0.2);
}

/* 文本域样式 */
:deep(.custom-textarea .el-textarea__inner) {
  background: #f8f5f1;
  border: 1px solid rgba(212, 180, 131, 0.3);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  transition: all 0.3s ease;
}

:deep(.custom-textarea .el-textarea__inner:hover) {
  border-color: #c19a6b;
  background: white;
  box-shadow: 0 2px 8px rgba(166, 124, 82, 0.1);
}

:deep(.custom-textarea .el-textarea__inner:focus) {
  border-color: #a67c52;
  box-shadow: 0 0 0 2px rgba(166, 124, 82, 0.2);
}

/* 按钮区域 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.reset-btn,
.submit-btn {
  padding: 12px 36px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 140px;
}

.reset-btn {
  background: white;
  color: #5a3921;
  border: 1px solid #a67c52;
}

.reset-btn:hover {
  background: #f8f5f1;
  border-color: #8b5a2e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(166, 124, 82, 0.15);
}

.submit-btn {
  background: #5a3921;
  border: none;
  color: white;
}

.submit-btn:hover {
  background: #4a3111;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(90, 57, 33, 0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  .form-container {
    max-width: 100%;
  }

  .form-main {
    padding: 30px 20px;
    border-radius: 15px;
  }

  .form-title {
    font-size: 32px;
  }

  .form-subtitle {
    font-size: 14px;
  }

  .form-actions {
    flex-direction: column;
    gap: 15px;
  }

  .reset-btn,
  .submit-btn {
    width: 100%;
  }

  :deep(.el-form-item__label) {
    width: auto !important;
    text-align: left;
  }
}
</style>
