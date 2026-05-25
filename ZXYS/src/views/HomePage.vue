<template>
  <!-- 主内容区 -->
  <main class="main-content">
    <div class="content-section">
      <!-- 项目介绍区域 -->
      <div class="intro-block">
        <img src="/public/HomePage/001.png" alt="" class="HuaTuo" />
        <h2 class="intro-title">智学云枢 · AI赋能中医教育</h2>
        <p class="intro-text">
          智学云枢是一款以AI技术驱动的中医个性化仿真教学平台，围绕“用户认知—能力测评—个性化学习—实践训练—就业提升—复盘强化”的完整链路，为中医爱好者、学者及求职者提供一站式学习解决方案。
        </p>
        <p class="intro-text">
          平台集成多角色入口与智能画像系统，根据用户专业背景、学习目标及能力测评结果，动态规划个性化学习路径。通过AI智慧顾问、知识图谱、章节训练与综合测评等模块，帮助用户建立系统性中医知识框架。
        </p>
        <p class="intro-text">
          同时，平台提供虚拟针灸仿真实训、AI模拟面试、岗位推荐、方剂配伍、中医药膳查询等实用工具，实现“学、练、测、评、就”全流程闭环，让中医学习更智能、更高效、更实用。
        </p>
      </div>

      <!-- 分割线 -->
      <div class="divider-section">
        <div class="divider-line"></div>
        <span class="divider-text">基础功能模块</span>
        <div class="divider-line"></div>
      </div>

      <!-- 模块展示区域 -->
      <div class="modules-grid">
        <!-- <ModuleCard
          :module-id="1"
          module-name="中医穴位"
          module-desc="探索四季养生、食疗药膳、导引按摩等中医养生方法，学习'治未病'的预防医学思想。"
          link-to="/ZYXW/index"
          :image-url="ZYXW"
          @module-click="handleModuleClick"
        /> -->
        <ModuleCard
          :module-id="2"
          module-name="方剂配伍"
          module-desc="探索四季养生、食疗药膳、导引按摩等中医养生方法，学习'治未病'的预防医学思想。"
          link-to="/Hina/FJPW"
          :image-url="FJPW"
          @module-click="handleModuleClick"
        />
        <!--中医药膳 -->
        <ModuleCard
          :module-id="3"
          module-name="中医药膳"
          module-desc="探索四季养生、食疗药膳、导引按摩等中医养生方法，学习'治未病'的预防医学思想。"
          link-to="/Hina/ZYYS"
          :image-url="ZYYS"
          @module-click="handleModuleClick"
        />
        <!--中成药集 -->
        <ModuleCard
          :module-id="4"
          module-name="中成药集"
          module-desc="中成药是以中药材为原料，经过加工制成的药品，具有使用方便、疗效稳定等优点。"
          link-to="/Hina/ZCYJ"
          :image-url="ZCYJ"
          @module-click="handleModuleClick"
        />
        <!--古今换算 -->
        <ModuleCard
          :module-id="5"
          module-name="古今换算"
          module-desc="提供古代时间、长度、重量等单位与现代单位之间的转换工具，帮助用户更好地理解和应用中医药学中的古代计量单位。"
          link-to="/Hina/GJHS"
          :image-url="GJHS"
          @module-click="handleModuleClick"
        />
        <!--中医辞典 -->
        <ModuleCard
          :module-id="6"
          module-name="中医辞典"
          module-desc="中医药学术语的权威工具书，收录了大量的中医术语、方剂、病症等内容，提供详细的解释和相关信息。"
          link-to="/Hina/ZYCD"
          :image-url="ZYCD"
          @module-click="handleModuleClick"
        />


        <!--AI医生 -->
        <ModuleCard
          :module-id="8"
          module-name="AI医生"
          module-desc="通过观察舌头的形态、颜色、舌苔等特征来诊断疾病，提供舌诊图谱和相关信息，帮助用户了解舌诊的基本知识和应用。"
          link-to="/Hina/AIYS"
          :image-url="AIYS"
          @module-click="handleModuleClick"
        />
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import ModuleCard from '@/views/HomePage/ModuleCard.vue'
import ZYXW from '@/assets/HomePage/ZYXW/ZYXW.png'
import FJPW from '@/assets/HomePage/FJPW/FJPW.png'
import ZYYS from '@/assets/HomePage/ZYYS/ZYYS.png'
import ZCYJ from '@/assets/HomePage/ZCYJ/ZCYJ.png'
import GJHS from '@/assets/HomePage/GJHS/GJHS.png'
import ZYCD from '@/assets/HomePage/ZYCD/ZYCD.png'

import AIYS from '@/assets/HomePage/AIYS/AIYS.png'
import { onMounted } from 'vue'

const handleModuleClick = (data: {
  moduleId: number | string
  moduleName: string
  linkTo: string
}) => {
  console.log('模块被点击了:', data)
  // 这里可以添加业务逻辑，比如：
  // 1. 统计数据
  // 2. 显示提示
  // 3. 跳转到其他页面
  // 4. 记录用户行为
}

onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})
</script>

<style scoped>
/* 主要内容区域 */
.main-content {
  flex: 1;
  width: 100%;
  /* min-height: 200vh; */
}

/* 新增内容区域样式 */
.content-section {
  /* max-width: 1200px; */
  margin: 0 auto;
  padding: 40px 5%;
  position: relative;
  z-index: 1;
}

/* 项目介绍区域 */
.intro-block {
  max-width: 1200px;
  margin: auto;
  position: relative;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(139, 69, 19, 0.2);
}

.intro-title {
  font-size: 40px;
  color: #8b4513;
  margin-bottom: 30px;
  text-align: center;
  font-family: 'No3', sans-serif;
}

.intro-text {
  font-size: 24px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 20px;
  text-indent: 2em;
  font-family: 'No3', sans-serif;
}

.HuaTuo {
  position: absolute;
  right: 0px;
  bottom: 0px;
  width: 500px;
  height: auto;
  border-bottom-right-radius: 5%;
  opacity: 0.7;
  z-index: -2;
  pointer-events: none;
}

/* 分隔线 */
.divider-section {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  position: relative;
  gap: 20px; /* 控制文字与分隔线之间的间距 */
}

.divider-line {
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #8b4513 20%, #8b4513 80%, transparent 100%);
  position: relative;
  /* max-width: 30%; */
}

.divider-text {
  font-family: 'NO3', sans-serif;
  font-size: 48px;
  color: #8b4513;
  padding: 0 15px;
  white-space: nowrap;
  border-radius: 5px;
  /* 去掉了明显的毛玻璃效果 */
  /* backdrop-filter: blur(5px); */
}

.divider-line::before,
.divider-line::after {
  content: '❖';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #8b4513;
  font-size: 20px;
}

.divider-line::before {
  left: -15px;
}

.divider-line::after {
  right: -15px;
}

/* 模块组件区域样式 */
.modules-grid {
  display: grid;
  /* grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); */
  grid-template-columns: repeat(3, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 50px;
}
</style>
