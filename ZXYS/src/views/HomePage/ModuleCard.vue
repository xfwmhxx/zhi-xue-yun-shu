<template>
  <!-- 通用模块组件 -->
  <div :class="['module-card', `module-${moduleId}`]" @click="handleCardClick">
    <div class="module-content">
      <h3 class="module-title">{{ moduleName }}</h3>
      <p class="module-desc">
        {{ truncateDesc(moduleDesc, 40) }}
      </p>
      <a v-if="useRouter" href="#" class="module-learn-more" @click.prevent="handleLearnMore">
        了解更多
      </a>
      <a v-else :href="linkTo" class="module-learn-more" target="_blank"> 了解更多 </a>
    </div>
    <div class="module-image" :style="imageStyle"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

// 定义 Props
const props = defineProps({
  // 模块ID (对应CSS类名)
  moduleId: {
    type: [Number, String],
    required: true,
  },
  // 模块名称
  moduleName: {
    type: String,
    required: true,
  },
  // 模块描述
  moduleDesc: {
    type: String,
    required: true,
  },
  // 跳转路径 (路由路径或链接)
  linkTo: {
    type: String,
    default: '#',
  },
  // 背景图片URL
  imageUrl: {
    type: String,
    default: '',
  },
  // 是否使用Vue Router (true: router.push, false: 直接跳转)
  useRouter: {
    type: Boolean,
    default: true,
  },
  // 是否在新窗口打开 (仅当 useRouter=false 时有效)
  openInNewTab: {
    type: Boolean,
    default: false,
  },
  // 自定义样式类
  customClass: {
    type: String,
    default: '',
  },
  // 额外的数据对象
  extraData: {
    type: Object,
    default: () => ({}),
  },
})

// 定义 Emits
const emit = defineEmits(['module-click', 'before-navigate', 'after-navigate'])

// 使用 Vue Router
const router = useRouter()

// 计算属性
const imageStyle = computed(() => {
  if (props.imageUrl) {
    return {
      backgroundImage: `url(${props.imageUrl})`,
      backgroundPosition: 'right center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return {}
})

// 处理卡片点击事件
const handleCardClick = () => {
  emit('module-click', {
    moduleId: props.moduleId,
    moduleName: props.moduleName,
    linkTo: props.linkTo,
    extraData: props.extraData,
  })
}

// 处理"了解更多"点击事件
const handleLearnMore = () => {
  // 触发导航前事件
  emit('before-navigate', {
    moduleId: props.moduleId,
    moduleName: props.moduleName,
    linkTo: props.linkTo,
  })

  // 执行导航
  if (props.useRouter && router) {
    router.push(props.linkTo)
  } else {
    if (props.openInNewTab) {
      window.open(props.linkTo, '_blank')
    } else {
      window.location.href = props.linkTo
    }
  }

  // 触发导航后事件
  emit('after-navigate', {
    moduleId: props.moduleId,
    moduleName: props.moduleName,
    linkTo: props.linkTo,
  })
}

// 截断描述文本的函数
const truncateDesc = (text, maxLength = 10) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
/* 基础模块样式 */
.module-card {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  overflow: hidden;
  display: flex;
  height: 250px;
  position: relative;
  border: 1px solid rgba(139, 69, 19, 0.1);
  cursor: pointer;

  font-family: 'No1', sans-serif;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
}

.module-content {
  flex: 1;
  padding: 0px 30px;
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
}

.module-title {
  font-family: 'NO3';
  font-size: 40px;
  color: #8b4513;
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.module-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: #8b4513;
  transition: width 0.3s ease;
}

.module-card:hover .module-title::after {
  width: 60px;
}

.module-desc {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.module-learn-more {
  display: inline-flex;
  align-items: center;
  color: #8b4513;
  font-size: 14px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.module-learn-more::after {
  content: '→';
  margin-left: 5px;
  transition: margin-left 0.3s ease;
}

.module-learn-more:hover {
  color: #6b2e00;
}

.module-learn-more:hover::after {
  margin-left: 8px;
}

.module-image {
  width: 200px;
  height: 100%;
  background-size: cover;
  background-position: center;
  /* background-size: 100%; */
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.module-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
}

.module-card:hover .module-image {
  transform: scale(1.05);
}
</style>
