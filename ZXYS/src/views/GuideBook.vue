<template>
  <div class="user-guide-page">
    <PageTransition
      v-if="showTransition"
      mode="leave"
      :show-text="true"
      @animation-end="onEnterAnimationEnd"
    />
    <BreadcrumbNav title="用户指南" :show-back="false" />

    <TcmBook
      ref="tcmBookRef"
      :show-next-step-btn="isNextStepEnabled"
      @next-step="handleStepSignal"
    />
    <PageTransition
      v-if="showTransition2"
      mode="enter"
      :show-text="true"
      @animation-end="onLeaveAnimationEnd"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// 引入过渡页面组件
import PageTransition from '@/components/PageTransition.vue'
// 引入面包屑导航
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
// 引入指导书组件
import TcmBook from '@/views/GuideBook/TcmBook.vue'
// 引入对话组件
import { tcd } from '@/components/Dialogue'
// 引入弹窗组件
import { PopupPlugin } from '@/components/Popup'

const router = useRouter()
const showTransition = ref(false)
// 初始化离开的过渡动画的状态，默认不启动
const showTransition2 = ref(false)
// 是否启用下一步按钮，默认启用
const isNextStepEnabled = ref(true)
const tcmBookRef = ref(null) // 引用子组件

onMounted(() => {
  // 页面挂载时显示进入动画
  showTransition.value = true
  // 以下两行作用是禁用此页面的滚动条，防止用户在引导过程中滚动页面导致体验不佳。
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  // 核心修复：在这里初始化子组件的书本！
  tcmBookRef.value.initPageFlip()
  setTimeout(() => {
    startGuide()
  }, 1000) // 等待1秒
})

const onEnterAnimationEnd = () => {
  showTransition.value = false
}

const startPageTransition = () => {
  console.log('✅ startPageTransition 被调用')
  console.log('✅ 设置 showTransition.value = true')
  // 显示离开动画
  showTransition2.value = true
}

const onLeaveAnimationEnd = () => {
  // 动画完成后跳转到角色身份选择页面
  router.push('/initialize/chooserole')
  // 重置过渡状态
  setTimeout(() => {
    showTransition2.value = false
  }, 100)
}
// 提示框配置
const startGuide = () => {
  tcd.show({
    steps: [
      {
        text: '欢迎使用智学云枢——AI赋能中医教育平台！目前您看到的是我们为用户准备的使用指南！',
        hintText: '点击任意处继续',
      },
      {
        text: '点击这里可以翻到上一页，继续学习更多内容。',
        // 这里的关键：通过 CSS 选择器定位子组件中的元素
        highlightSelector: '.Dialogue001', // 高亮对应类的容器
        hintText: '点击任意处继续',
      },
      {
        text: '点击这里可以翻到下一页，继续学习更多内容。',
        highlightSelector: '.Dialogue003', // 高亮对应类的容器
        hintText: '点击任意处继续',
      },
      {
        text: '当你阅读到中间部分，想要快捷回到目录，可以点击这个按钮。',
        highlightSelector: '.Dialogue002', // 高亮对应类的容器
        hintText: '点击任意处继续',
      },
      {
        text: '当您阅读完所有内容、或者感觉已经充分了解我们平台的使用流程，则可点击这个按钮，进入下一个流程。',
        highlightSelector: '.Dialogue004', // 高亮对应类的容器
        hintText: '点击任意处继续',
      },
      {
        text: '现在您可以自由探索本页面了。祝您使用愉快！',
        hintText: '点击任意处关闭',
      },
    ],
    typingSpeed: 50,
    defaultHintText: '点击继续',
    onHighlightClick: (index) => {
      console.log(`高亮区域被点击，步骤索引: ${index}`)
    },
    onStepComplete: (index) => {
      console.log(`步骤 ${index + 1} 完成`)
    },
    onAllComplete: () => {
      console.log('所有向导步骤完成')
    },
  })
}

const handleStepSignal = (data) => {
  if (data.currentPage + 1 != data.totalPages) {
    PopupPlugin.showType1({
      title: '检测到您还未看完指导手册！',
      content: [
        '确认进入下一步吗？下一步将进入角色选择环节。',
        '（注：目前正处于新用户向导环节！您所作的一切选择将无法撤销！）',
        '如果您还需要再看一看指导书，请点击取消返回；如果您确认已经看完了整本指导书，那么就点击确认。',
      ],
      onConfirm: () => startPageTransition(),
      onCancel: () => console.log('取消'),
    })
  } else {
    PopupPlugin.showType2({
      title: '请确认',
      content: [
        '确认进入下一步吗？下一步将进入角色选择环节。',
        '（注：目前正处于新用户向导环节！您所作的一切选择将无法撤销！）',
        '如果您还需要再看一看指导书，请点击取消返回；如果您确认已经看完了整本指导书，那么就点击确认。',
      ],
      onConfirm: () => startPageTransition(),
      onCancel: () => console.log('取消'),
    })
  }
}

onUnmounted(() => {
  // 离开页面时恢复滚动条
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})
</script>

<style scoped></style>
