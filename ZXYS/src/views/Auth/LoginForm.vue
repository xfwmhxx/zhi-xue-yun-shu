<template>
  <div id="login-form" class="form-content" :class="{ active: active }">
    <div class="form-scroll-container" :class="{ 'smooth-scroll': isScrollReady }">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="login-username">邮箱</label>
          <input
            type="text"
            id="login-username"
            v-model="formData.email"
            class="form-control"
            placeholder="请输入邮箱"
            required
          />
        </div>
        <div class="form-group">
          <label for="login-password">密码</label>
          <input
            type="password"
            id="login-password"
            v-model="formData.password"
            class="form-control"
            placeholder="请输入密码"
            required
          />
        </div>
        <div class="remember-forgot">
          <div class="remember-me">
            <input type="checkbox" id="remember-me" v-model="formData.rememberMe" />
            <label for="remember-me">记住我</label>
          </div>
          <div class="forgot-password">
            <a href="#" class="switch-tab" @click.prevent="onSwitchTab">忘记密码?</a>
          </div>
          <div class="test-account">
            <a href="#" class="test-btn" @click.prevent="fillTestAccount">一键填充测试账号</a>
          </div>
        </div>
        <button type="submit" class="btn" :disabled="isSubmitting">
          {{ isSubmitting ? '登录中...' : '登 录' }}
        </button>
      </form>
    </div>
    <div class="form-footer">
      还没有账号?
      <a href="#" class="switch-tab" @click.prevent="onSwitchTab">立即注册</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps<{
  active: boolean
  initialData?: {
    email?: string
    password?: string
    rememberMe?: boolean
  }
}>()

const emit = defineEmits<{
  submit: [data: { email: string; password: string; rememberMe: boolean }]
  switchTab: []
}>()

const formData = ref({
  email: props.initialData?.email || '',
  password: props.initialData?.password || '',
  rememberMe: props.initialData?.rememberMe || false,
})

const isSubmitting = ref(false)
const isScrollReady = ref(false)

const handleSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    emit('submit', { ...formData.value })
  } finally {
    isSubmitting.value = false
  }
}

const onSwitchTab = () => {
  emit('switchTab')
}

// 一键填充测试账号
const fillTestAccount = () => {
  formData.value = {
    email: 'demo@example.com',
    password: '123456',
    rememberMe: false,
  }
}
// 动画控制
const initAnimations = () => {
  if (!props.active) {
    isScrollReady.value = false
    return
  }

  gsap.set(`#login-form .form-scroll-container`, { opacity: 0, y: 10 })
  gsap.set(`#login-form .form-group`, { opacity: 0, y: 20 })
  gsap.set(`#login-form .remember-forgot`, { opacity: 0, y: 20 })
  gsap.set(`#login-form .btn`, { opacity: 0, y: 20 })
  gsap.set(`#login-form .form-footer`, { opacity: 0, y: 20 })

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

  tl.to(`#login-form .form-scroll-container`, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    onComplete: () => {
      isScrollReady.value = true
    },
  })
    .to(
      `#login-form .form-group`,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
      },
      0.1,
    )
    .to(
      `#login-form .remember-forgot`,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
      },
      0.5,
    )
    .to(
      `#login-form .btn`,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
      },
      0.6,
    )
    .to(
      `#login-form .form-footer`,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
      },
      0.7,
    )
}

// 监听active变化
watch(
  () => props.active,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        initAnimations()
      })
    } else {
      isScrollReady.value = false
      gsap.set(`#login-form .form-scroll-container`, { opacity: 0, y: 10 })
    }
  },
)

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      console.log('收到初始数据更新:', newData) // 调试用
      formData.value = {
        email: newData.email || '',
        password: newData.password || '',
        rememberMe: newData.rememberMe || false,
      }
    }
  },
  { deep: true, immediate: true }, // immediate 确保初始值也能正确设置
)

onMounted(() => {
  if (props.active) {
    nextTick(() => {
      initAnimations()
    })
  }
})
</script>

<style scoped>
.form-content {
  display: none;
  width: 100%;
  height: calc(100% - 80px);
  overflow: visible !important;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease;
}

.form-content.active {
  display: flex;
  flex-direction: column;
  opacity: 1;
  transform: translateY(0);
}

.form-group {
  margin-bottom: 25px;
  flex-shrink: 0;
  width: 100%;
  opacity: 0;
  transform: translateY(20px);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: #333;
  font-family: 'No1', sans-serif;
}

.form-control {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid #999;
  font-size: 16px;
  background: transparent;
  transition: all 0.3s ease;
  font-family: 'No1', sans-serif;
}

.form-control:focus {
  border-bottom-color: #000;
  outline: none;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.form-control:hover {
  border-bottom-color: #666;
}

.btn {
  width: 100%;
  padding: 12px;
  background-color: #000;
  border-radius: 15px;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 30px;
  font-family: 'No1', sans-serif;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn:hover::before {
  left: 100%;
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn:disabled:hover::before {
  left: -100%;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
  font-family: 'No1', sans-serif;
  flex-shrink: 0;
  height: 24px;
  width: 100%;
  opacity: 0;
  transform: translateY(20px);
}

.form-footer a {
  color: #000;
  text-decoration: none;
  font-weight: bold;
  position: relative;
  transition: all 0.3s ease;
  display: inline-block;
}

.form-footer a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #000;
  transition: width 0.3s ease;
  transform: translateY(0);
}

.form-footer a:hover {
  text-decoration: none;
}

.form-footer a:hover::after {
  width: 100%;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  flex-shrink: 0;
  width: 100%;
  opacity: 0;
  transform: translateY(20px);
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 5px;
  transform: scale(1.2);
  transition: all 0.3s ease;
}

.remember-me input:hover {
  transform: scale(1.3);
}

.forgot-password a {
  color: #000;
  text-decoration: none;
  font-size: 14px;
  position: relative;
  transition: all 0.3s ease;
}

.forgot-password a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #000;
  transition: width 0.3s ease;
}

.forgot-password a:hover::after {
  width: 100%;
}

.test-account {
  font-family: 'No3';
  margin-left: 15px;
}

.test-account a {
  color: #000;
  text-decoration: none;
  font-size: 14px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.test-account a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #000;
  transition: width 0.3s ease;
}

.test-account a:hover::after {
  width: 100%;
}

.form-scroll-container {
  flex-grow: 1;
  overflow-y: hidden;
  padding-right: 10px;
  margin-right: -4px;
  width: 100%;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(10px);
}

.form-content.active .form-scroll-container {
  opacity: 1;
  transform: translateY(0);
}

.form-scroll-container.smooth-scroll {
  overflow-y: auto;
}

.form-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.form-scroll-container.smooth-scroll::-webkit-scrollbar {
  opacity: 1;
}

.form-scroll-container::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
  margin: 5px 0;
}

.form-scroll-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.form-scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

.form-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.form-control::placeholder {
  color: #999;
  transition: all 0.3s ease;
}

.form-control:focus::placeholder {
  color: #666;
  transform: translateY(-5px);
  font-size: 12px;
}
</style>
