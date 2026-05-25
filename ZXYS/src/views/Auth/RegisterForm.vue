<template>
  <div id="register-form" class="form-content" :class="{ active: active }">
    <div class="form-scroll-container" :class="{ 'smooth-scroll': isScrollReady }">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="register-username">用户名</label>
          <input
            type="text"
            id="register-username"
            v-model="formData.username"
            class="form-control"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label for="register-email">电子邮箱</label>
          <input
            type="email"
            id="register-email"
            v-model="formData.email"
            class="form-control"
            placeholder="请输入电子邮箱"
            required
          />
        </div>
        <div class="verification-group">
          <div class="verification-input">
            <label for="register-verification">验证码</label>
            <input
              type="text"
              id="register-verification"
              v-model="formData.verificationCode"
              class="form-control"
              placeholder="请输入验证码"
              required
            />
          </div>
          <button
            type="button"
            class="verification-btn"
            :disabled="isCountingDown || !canSendCode"
            @click="getVerificationCode"
          >
            {{ countdownText }}
          </button>
        </div>
        <div class="form-group">
          <label for="register-password">密码</label>
          <input
            type="password"
            id="register-password"
            v-model="formData.password"
            class="form-control"
            placeholder="请输入密码"
            required
          />
        </div>
        <div class="form-group">
          <label for="register-confirm-password">确认密码</label>
          <input
            type="password"
            id="register-confirm-password"
            v-model="formData.confirmPassword"
            class="form-control"
            placeholder="请再次输入密码"
            required
          />
        </div>
        <button type="submit" class="btn" :disabled="isSubmitting">
          {{ isSubmitting ? '注册中...' : '注 册' }}
        </button>
      </form>
    </div>
    <div class="form-footer">
      已有账号?
      <a href="#" class="switch-tab" @click.prevent="onSwitchTab">立即登录</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps<{
  active: boolean
}>()

const emit = defineEmits<{
  submit: [
    data: {
      username: string
      email: string
      verificationCode: string
      password: string
      confirmPassword: string
    },
  ]
  switchTab: []
  sendCode: [email: string]
}>()

const formData = ref({
  username: '',
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const isCountingDown = ref(false)
const countdown = ref(0)
const isScrollReady = ref(false)

const canSendCode = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return formData.value.email && emailRegex.test(formData.value.email)
})

const countdownText = computed(() => {
  if (isCountingDown.value && countdown.value > 0) {
    return `${countdown.value}秒后重新获取`
  }
  return '获取验证码'
})

const handleSubmit = async () => {
  if (isSubmitting.value) return
  if (formData.value.password !== formData.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  isSubmitting.value = true
  try {
    emit('submit', { ...formData.value })
  } finally {
    isSubmitting.value = false
  }
}

const getVerificationCode = () => {
  if (isCountingDown.value || !canSendCode.value) return

  isCountingDown.value = true
  countdown.value = 60

  emit('sendCode', formData.value.email)

  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      isCountingDown.value = false
    }
  }, 1000)
}

const onSwitchTab = () => {
  emit('switchTab')
}

// 动画控制
const initAnimations = () => {
  if (!props.active) {
    isScrollReady.value = false
    return
  }

  // 初始化所有元素状态，确保它们在动画开始前是隐藏的
  gsap.set(`.form-scroll-container`, { opacity: 0, y: 10 })
  gsap.set(`.form-group`, { opacity: 0, y: 20 })
  gsap.set(`.verification-group`, { opacity: 0, y: 20 })
  gsap.set(`.verification-btn`, { opacity: 0, y: 20 }) // 明确设置按钮初始状态
  gsap.set(`.btn`, { opacity: 0, y: 20 })
  gsap.set(`.form-footer`, { opacity: 0, y: 20 })

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

  tl.to(`.form-scroll-container`, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    onComplete: () => {
      isScrollReady.value = true
    },
  })
    .to(
      `.form-group`,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
      },
      0.1,
    )
    .to(
      [`.verification-group`, `.verification-btn`], // 同时动画组和按钮
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
      },
      0.4,
    )
    .to(
      `.btn`,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
      },
      0.6,
    )
    .to(
      `.form-footer`,
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
    }
  },
  { immediate: true },
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

.verification-group {
  display: flex;
  align-items: flex-end;
  margin-bottom: 25px;
  width: 100%;
  opacity: 0;
  transform: translateY(20px);
}

.verification-input {
  flex: 1;
  margin-right: 15px;
  width: calc(100% - 155px);
}

.verification-input .form-control {
  width: 100%;
}

.verification-btn {
  width: 140px;
  padding: 12px 8px;
  background: linear-gradient(135deg, #8b4513, #a0522d);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'No1', sans-serif;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
  opacity: 0;
  transform: translateY(20px);
  display: block; /* 确保是块级显示 */
}

.verification-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.verification-btn:hover {
  background: linear-gradient(135deg, #a0522d, #8b4513);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.4);
}

.verification-btn:hover::before {
  left: 100%;
}

.verification-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(139, 69, 19, 0.3);
}

.verification-btn:disabled {
  background: linear-gradient(135deg, #cccccc, #999999);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.verification-btn:disabled:hover::before {
  left: -100%;
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
