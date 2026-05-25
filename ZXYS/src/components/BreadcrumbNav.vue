<!-- BreadcrumbNav.vue -->
<template>
  <div class="detail-header">
    <div class="header-top-row">
      <!-- 返回按钮（仅在 showBack 为 true 时显示） -->
      <RouterLink v-if="showBack" to="#" class="back-button" @click.prevent="goBack">
        返回
      </RouterLink>

      <!-- 标题区域 -->
      <div class="title-container">
        <div class="detail-header-title">{{ title }}</div>
      </div>
    </div>

    <!-- 面包屑导航（仅在 showBack 为 true 时显示） -->
    <div v-if="showBack" class="breadcrumb-row">
      <div class="breadcrumb">
        <!-- 动态生成面包屑项 -->
        <template v-for="(item, index) in breadcrumbItems" :key="item.name">
          <RouterLink v-if="item.url" :to="item.url" class="breadcrumb-link">
            {{ item.name }}
          </RouterLink>
          <span v-else class="breadcrumb-current">
            {{ item.name }}
          </span>

          <!-- 分隔符（最后一个不显示） -->
          <span v-if="index < breadcrumbItems.length - 1" class="breadcrumb-separator"> &gt; </span>
        </template>
      </div>
    </div>
  </div>
  <!-- 面包屑占位符 -->
  <div class="breadcrumb-placeholder" v-if="!route.path.startsWith('/Hina/BookPDFReader')"></div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
const route = useRoute()

// 定义组件属性
const props = defineProps({
  // 主标题
  title: {
    type: String,
    default: '中成药集',
  },

  // 是否显示返回模块（包括返回按钮和面包屑导航）
  showBack: {
    type: Boolean,
    default: true,
  },
  // 返回按钮的跳转路径（可选）
  backTo: {
    type: String,
    default: '', // 默认为空，使用路由返回
  },

  // 面包屑导航项数组
  breadcrumbItems: {
    type: Array,
    default: () => [],
  },
})

// 获取路由实例
const router = useRouter()

// 返回上一页的函数
const goBack = () => {
  if (props.backTo) {
    router.push(props.backTo)
  } else {
    // 优先使用路由的返回功能
    if (window.history.length > 1) {
      router.go(-1)
    } else {
      // 如果没有历史记录，尝试跳转到首页
      router.push('/userhome')
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.breadcrumb-placeholder {
  height: calc(5vh + 15px);
}

.detail-header {
  width: 100%;
  height: 100px;
  /* 原本是auto */
  /* min-height: 100px; */
  background-color: rgba(139, 69, 19, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  padding: 0 5%;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: 'NO3', Arial, sans-serif;
  transition: all 0.3s ease;
}

/* 当不显示返回模块时，调整高度和内边距 */
.detail-header:not(.no-back) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.header-top-row {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  margin-bottom: 8px;
}

.back-button {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-size: 18px;
  font-family: 'NO3', Arial, sans-serif;
  position: absolute;
  left: 5%;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.back-button::before {
  content: '←';
  margin-right: 8px;
  font-size: 20px;
}

.back-button:hover {
  color: #f0f0f0;
  transform: translateX(-2px);
}

.title-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.detail-header-title {
  font-family: 'NO3', Arial, sans-serif;
  font-size: 32px;
  color: white;
  letter-spacing: 2px;
  text-align: center;
  font-weight: 500;
  line-height: 1.2;
}

.breadcrumb-row {
  width: 100%;
  padding-left: 5%;
  margin-bottom: 8px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-family: 'NO3', Arial, sans-serif;
  font-size: 16px;
  color: white;
  flex-wrap: wrap;
  line-height: 1.4;
}

.breadcrumb-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 0 5px;
  white-space: nowrap;
}

.breadcrumb-link:hover {
  color: white;
  text-decoration: underline;
}

.breadcrumb-current {
  font-weight: bold;
  color: white;
  margin: 0 5px;
  white-space: nowrap;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.5);
  user-select: none;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .detail-header {
    padding: 0 20px;
  }

  .detail-header-title {
    font-size: 28px;
  }

  .breadcrumb {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .detail-header {
    height: auto;
    min-height: 90px;
    padding: 8px 15px;
  }

  .back-button {
    position: relative;
    left: 0;
    margin-bottom: 4px;
  }

  .detail-header-title {
    text-align: left;
    font-size: 24px;
    margin-top: 4px;
  }

  .breadcrumb-row {
    margin-top: 4px;
  }

  .breadcrumb {
    font-size: 13px;
  }

  .header-top-row {
    margin-bottom: 4px;
  }
}

@media (max-width: 480px) {
  .back-button {
    font-size: 16px;
  }

  .breadcrumb {
    font-size: 12px;
  }

  .breadcrumb-separator {
    margin: 0 4px;
  }

  .detail-header-title {
    font-size: 22px;
  }
}
</style>

<!-- <BreadcrumbNav
    title="中成药集"
    :show-back="true"
    :back-to="'/homepage'"
    :breadcrumb-items="[
      { name: '首页', url: '../DY/a.html' },
      { name: '药品库', url: '/medicines' },
      { name: '中成药', url: '' },
    ]"
  /> -->
