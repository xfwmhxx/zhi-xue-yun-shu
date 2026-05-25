<template>
  <div class="login-container">
    <!-- 水墨画背景图 -->
    <!-- <BackGround002 /> -->

    <!-- 中央登陆注册框 -->
    <div class="border-container">
      <!-- 模糊玻璃效果 -->
      <div class="blur-background"></div>
      <!-- 中国节方框背景图（边框图） -->
      <img :src="BorderDiagram" alt="中式古典花纹边框" class="border-image" />

      <!-- 左侧部分 -->
      <div class="Left">
        <!-- 左上部分 -->
        <div class="LeftUp">
          <!-- 项目Logo -->
          <img src="/logo.png" alt="篆刻-渊远流长" class="Zk" />
          <div class="LogoName">智学云枢</div>
          <div class="EgLogoName">AI赋能的中医教学平台</div>
        </div>
        <!-- 左下部分 -->
        <div class="LeftDown">
          <p>良医处世，不矜名，不计利，</p>
          <p>此其立德也；</p>
          <p>挽回造化，立起沉疴，此其立功也；</p>
          <p>阐发蕴奥，聿著方书，此其立言也。</p>
          <p>一艺而三善咸备，</p>
          <p>医道之有关于世岂不重且大耶？</p>
          <p>——清·叶天士</p>
        </div>
      </div>

      <!-- 右侧部分 -->
      <div class="Right">
        <div class="tab-container">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'login' }"
            @click="switchTab('login')"
          >
            登 录
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'register' }"
            @click="switchTab('register')"
          >
            注 册
          </button>
        </div>

        <!-- 登录表单 -->
        <LoginForm
          v-if="showLoginForm"
          :active="activeTab === 'login'"
          :initial-data="loginForm"
          @submit="handleLogin"
          @switch-tab="switchTab('register')"
        />

        <!-- 注册表单 -->
        <RegisterForm
          v-if="showRegisterForm"
          :active="activeTab === 'register'"
          @submit="handleRegister"
          @switch-tab="switchTab('login')"
          @send-code="getVerificationCode"
        />
      </div>
    </div>
    <!-- 过渡组件 -->
    <PageTransition
      v-if="showTransition"
      mode="enter"
      :show-text="true"
      @animation-end="onLeaveAnimationEnd"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
// 引入登录表单组件
import LoginForm from '@/views/Auth/LoginForm.vue'
// 引入注册表单组件
import RegisterForm from '@/views/Auth/RegisterForm.vue'
// 引入过渡页面
import PageTransition from '@/components/PageTransition.vue'
// 引入消息提示组件
import { message } from '@/components/Notification'
// 引入弹窗组件
import { PopupPlugin } from '@/components/Popup'
import { sendCode, register, login } from '@/api/auth'
import { setUserId, setUserInfo } from '@/utils/storage'

// 导入资源
import BorderDiagram from '@/assets/Auth/002.png'

// 初始化GSAP插件
gsap.registerPlugin(CustomEase)
CustomEase.create('hop', '.8, 0, .3, 1')

const router = useRouter()

// 响应式数据
const activeTab = ref<'login' | 'register'>('login')
const showLoginForm = ref(true)
const showRegisterForm = ref(false)
const isLoggingIn = ref(false)
const isRegistering = ref(false)
const isCountingDown = ref(false)
const countdown = ref(0)

// 表单数据
const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false,
})

// 初始化过渡动画的状态，默认不启动
const showTransition = ref(false)
const targetRoute = ref('') // 存储目标路由

const startPageTransition = (route: string) => {
  console.log('✅ startPageTransition 被调用')
  console.log('✅ 设置 showTransition.value = true')
  targetRoute.value = route
  // 显示离开动画
  showTransition.value = true
}

const onLeaveAnimationEnd = () => {
  if (targetRoute.value) {
    router.push(targetRoute.value)
  } else {
    message.warning('状态错误', {
      note: '将跳转至默认页面',
      duration: 3000,
    })
    router.push('/Foundations/userhome')
  }
  // 重置过渡状态
  setTimeout(() => {
    showTransition.value = false
    targetRoute.value = ''
  }, 100)
}

// 动画初始化
const initAnimations = () => {
  gsap.set('.border-container', {
    opacity: 1,
    clipPath: 'polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%)',
  })

  const tl = gsap.timeline({ defaults: { ease: 'hop' } })

  tl.to(
    '.border-container',
    {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 0.8,
    },
    0.2,
  )
    .to('.Zk', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.6)
    .to('.LogoName', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.7)
    .to('.EgLogoName', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.8)
    .to('.Left', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.9)
    .to('.Right', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.0)
    .to('.tab-container', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.1)
    .to('.decoration5', { opacity: 0.8, duration: 0.6, ease: 'power2.out', stagger: 0.2 }, 0.5)
}

// 切换登录/注册表单
const switchTab = (tab: 'login' | 'register') => {
  if (tab === activeTab.value) return

  if (tab === 'login') {
    showLoginForm.value = true
    showRegisterForm.value = false
  } else {
    showLoginForm.value = false
    showRegisterForm.value = true
  }

  activeTab.value = tab
}

// 监听activeTab变化，延迟显示表单
watch(
  () => activeTab.value,
  (newTab) => {
    if (newTab === 'login') {
      showLoginForm.value = true
      // 延迟显示注册表单，避免同时渲染导致的闪烁
      setTimeout(() => {
        showRegisterForm.value = false
      }, 10)
    } else {
      showRegisterForm.value = true
      // 延迟隐藏登录表单，避免同时渲染导致的闪烁
      setTimeout(() => {
        showLoginForm.value = false
      }, 10)
    }
  },
  { immediate: true },
)

// 获取验证码
const getVerificationCode = async (email: string) => {
  if (isCountingDown.value) return

  if (!email) {
    message.warning('警告', {
      note: '请输入邮箱！',
      duration: 3000,
    })
    return
  }

  isCountingDown.value = true
  countdown.value = 60

  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      isCountingDown.value = false
    }
  }, 1000)

  try {
    const response = await sendCode(email)

    if (response.code === 200) {
      message.success('成功!', {
        note: '请查收验证码！',
        duration: 3000,
      })
    } else {
      clearInterval(timer)
      isCountingDown.value = false
      countdown.value = 0
      message.error('错误', {
        note: '发送失败！',
        duration: 3000,
      })
    }
  } catch (error: any) {
    clearInterval(timer)
    isCountingDown.value = false
    countdown.value = 0
    message.error('错误', {
      note: '服务器异常！',
      duration: 3000,
    })
  }
}

// 处理登录
const handleLogin = async (formData: { email: string; password: string; rememberMe: boolean }) => {
  if (isLoggingIn.value) return

  isLoggingIn.value = true

  try {
    // 这里添加实际的登录逻辑
    console.log('登录信息:', formData)

    const response = await login({
      email: formData.email,
      password: formData.password,
    })
    if (response.code === 200) {
      message.success('登录成功', {
        note: '等待页面跳转',
        duration: 3000,
      })
      // 保存用户信息
      setUserId(response.data.id)
      setUserInfo({
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        user_type: response.data.user_type,
        is_initialized: response.data.is_initialized,
        is_today_registered: response.data.is_today_registered,
      })

      // 根据是否已初始化决定跳转路由
      const targetRoute = response.data.is_initialized
        ? '/Foundations/userhome' // 已初始化，跳转到主面板
        : '/initialize/guidebook' // 未初始化，跳转到新手指导

      console.log(response.data)

      // 等待消息显示后跳转
      setTimeout(() => {
        startPageTransition(targetRoute)
      }, 3000)
    } else {
      message.error('登录失败', {
        note: '账号或密码错误',
        duration: 3000,
      })
    }
  } catch (error) {
    message.error('登录失败', {
      note: '请检查后重试',
      duration: 3000,
    })
  } finally {
    isLoggingIn.value = false
  }
}

// 处理注册
const handleRegister = async (formData: {
  username: string
  email: string
  verificationCode: string
  password: string
  confirmPassword: string
}) => {
  if (isRegistering.value) return

  // 验证密码
  if (formData.password !== formData.confirmPassword) {
    message.error('密码错误', {
      note: '两次密码不一致',
      duration: 3000,
    })
    return
  }

  isRegistering.value = true

  try {
    const response = await register({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      code: formData.verificationCode,
    })
    if (response.code === 200) {
      message.success('注册成功', {
        note: '账号已成功注册',
        duration: 3000,
      })
      switchTab('login')
    } else {
      message.error('发生错误', {
        note: '未知错误!',
        duration: 3000,
      })
    }
  } catch (error) {
    message.error('注册失败', {
      note: '请检查后重试',
      duration: 3000,
    })
  } finally {
    isRegistering.value = false
  }
}

// 鼠标移动效果
// 这个效果是实现一个背景随鼠标移动而微动的效果，效果微小，如有不适可以去掉。
const handleMouseMove = (e: MouseEvent) => {
  const moveX = (e.clientX - window.innerWidth / 2) * 0.01
  const moveY = (e.clientY - window.innerHeight / 2) * 0.01
  const borderContainer = document.querySelector('.border-container') as HTMLElement
  if (borderContainer) {
    borderContainer.style.transform = `translate(${moveX}px, ${moveY}px)`
  }
}

// 生命周期钩子
onMounted(() => {
  // 检查是否有保存的用户名
  const rememberedUsername = localStorage.getItem('username')
  if (rememberedUsername) {
    loginForm.value.email = rememberedUsername
    loginForm.value.rememberMe = true
  }

  initAnimations()
  window.addEventListener('mousemove', handleMouseMove)

  // 禁用页面滚动
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'

  PopupPlugin.showType1({
    title: '欢迎各位评委老师使用本项目！',
    content: [
      '因为本项目部分功能如昨日学习总结、用户画像分析等功能只有老用户（也就是注册至少1天以上的用户）才能正常使用（因为新用户没有学习数据无法分析），所以这里给出测试账号供检测所有功能：',
      '邮箱：demo@example.com',
      '密码：123456',
      '注：点击确定后将自动填充至输入框',
    ],
    onConfirm: () => {
      console.log('确认')
      loginForm.value = {
        email: 'demo@example.com',
        password: '123456',
        rememberMe: false,
      }
    },
    onCancel: () => console.log('取消'),
  })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  // 离开页面时恢复滚动条
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  height: 100vh;
  width: 100vw;
  position: fixed;
  overflow: hidden;
  display: flex;
  justify-content: center;
  max-height: 100vh;
  align-items: center;
  font-family: 'No1', sans-serif;
}

.border-container {
  z-index: 5;
  position: relative;
  width: 55%;
  height: 65%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  clip-path: polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%);
  opacity: 0;
  overflow: hidden;
}

.blur-background {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 10px;
  z-index: 0;
  transition: all 0.5s ease;
}

.border-image {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  transition: all 0.5s ease;
}

.decoration5 {
  position: fixed;
  right: 0px;
  top: 0;
  width: 100%;
  z-index: 1;
  opacity: 0.8;
  transition: all 0.5s ease;
  opacity: 0;
  animation: float 8s ease-in-out infinite;
  object-fit: cover;
  height: auto;
  margin-top: 250px;
}

.top-decoration {
  right: 0px;
  top: -230px;
}

.bottom-decoration {
  right: 0px;
  bottom: -230px;
  transform: rotate(180deg);
}

.Left {
  width: 50%;
  height: 100%;
  z-index: 5;
  position: relative;
  transition: all 0.5s ease;
  opacity: 0;
  transform: translateY(30px);
  overflow: hidden;
}

.Left::after {
  content: '';
  position: absolute;
  top: 5%;
  right: 0;
  width: 2px;
  height: 90%;
  background: #000;
  transition: all 0.5s ease;
}

.Right {
  width: 50%;
  height: 100%;
  z-index: 5;
  display: flex;
  flex-direction: column;
  padding: 40px;
  transition: all 0.5s ease;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
}

.LeftUp {
  z-index: 10;
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  transition: all 0.5s ease;
  overflow: hidden;
}

.LeftUp::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 90%;
  height: 3px;
  background: black;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.5s ease;
}

.LeftDown {
  z-index: 10;
  width: 100%;
  height: 50%;
  /* 原本是50px，但是在Mac系统上要-50px，应该是响应式不同问题 */
  padding-right: 50px;
  padding-top: 20px;
  padding-bottom: 20px;
  box-sizing: border-box;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.5em;
  line-height: 2em;
  font-family: 'No1', sans-serif;
  font-size: 17px;
  transition: all 0.5s ease;
  overflow: hidden;
}

.Zk {
  width: 15%;
  margin-top: 10%;
  display: block;
  transition: all 0.5s ease;
  animation: float 6s ease-in-out infinite;
  opacity: 0;
  transform: translateY(20px);
}

.LogoName {
  margin-top: 10px;
  font-family: 'No1', sans-serif;
  font-size: 80px;
  transition: all 0.5s ease;
  opacity: 0;
  transform: translateY(20px);
}

.EgLogoName {
  margin-top: 10px;
  font-weight: 200;
  font-family: 'No3', sans-serif;
  font-size: 1.5em;
  color: black;
  transition: all 0.5s ease;
  opacity: 0;
  transform: translateY(20px);
}

.tab-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  transition: all 0.5s ease;
  opacity: 0;
  transform: translateY(20px);
  flex-shrink: 0;
}

.tab-button {
  padding: 10px 30px;
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #666;
  position: relative;
  font-family: 'No1', sans-serif;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
}

.tab-button:hover {
  color: #333;
  transform: translateY(-2px);
}

.tab-button.active {
  color: #000;
  transform: translateY(-2px);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 20%;
  width: 60%;
  height: 2px;
  background-color: #000;
  animation: underlineSlide 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes underlineSlide {
  from {
    width: 0;
    left: 50%;
  }

  to {
    width: 60%;
    left: 20%;
  }
}

@media (max-height: 700px) {
  .border-container {
    height: 80%;
  }

  .tab-container {
    margin-bottom: 20px;
  }
}

@media (max-width: 1000px) {
  .border-container {
    width: 85%;
    height: 80%;
  }

  .LogoName {
    font-size: 60px;
  }
}

@media (max-width: 768px) {
  .border-container {
    flex-direction: column;
    height: auto;
    min-height: 80vh;
    width: 90%;
  }

  .Left,
  .Right {
    width: 100%;
    height: auto;
  }

  .Left {
    order: 1;
  }

  .Right {
    order: 2;
    padding: 20px;
  }

  .Left::after,
  .LeftUp::after {
    display: none;
  }

  .LeftDown {
    writing-mode: horizontal-tb;
    padding: 20px;
    text-align: center;
  }

  .LogoName {
    font-size: 3rem;
  }

  .tab-button {
    padding: 8px 20px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .border-container {
    width: 95%;
  }

  .LogoName {
    font-size: 2.5rem;
  }

  .EgLogoName {
    font-size: 1rem;
  }

  .LeftDown {
    font-size: 14px;
    letter-spacing: 0.2em;
  }
}
</style>
