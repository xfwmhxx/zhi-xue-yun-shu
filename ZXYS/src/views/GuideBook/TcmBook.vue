<template>
  <div class="tcm-book-wrapper">
    <!-- 音频元素 -->
    <audio ref="pageTurnAudio" preload="auto">
      <source :src="TurnWav" type="audio/wav" />
      您的浏览器不支持音频元素。
    </audio>

    <!-- 控制按钮 -->
    <div class="control-buttons left-buttons">
      <button @click="prevPageWithSound" class="nav-button Dialogue001">
        ‹
        <div class="button-tooltip">上一页</div>
      </button>
      <button @click="jumpToTocWithSound" class="nav-button toc-btn Dialogue002">
        ≡
        <div class="button-tooltip">返回目录</div>
      </button>
    </div>

    <div class="control-buttons right-buttons">
      <button @click="nextPageWithSound" class="nav-button Dialogue003">
        ›
        <div class="button-tooltip">下一页</div>
      </button>
      <button
        v-if="showNextStepBtn"
        @click="handleNextStepWithSound"
        class="nav-button next-step-btn Dialogue004"
      >
        »
        <div class="button-tooltip">下一步</div>
      </button>
    </div>

    <!-- 核心修复：book-viewport 视口容器 -->
    <div class="book-viewport">
      <div ref="bookContainer" id="book-container" v-show="isBookReady">
        <!-- 0: 封面 -->
        <div class="page page-cover" data-density="hard">
          <div class="cover-decoration cover-decoration-1"></div>
          <div class="cover-decoration cover-decoration-2"></div>
          <div class="cover-title-wrap">
            <div class="subtitle">AI赋能中医教育 · 流程化学习平台</div>
            <h1>智学云枢用户指南</h1>
            <div class="volume">Version:2.0</div>
            <div class="footer-tag">云声知处项目组</div>
          </div>
        </div>

        <!-- 1: 目录页 -->
        <div class="page">
          <div class="page-border"></div>
          <div class="page-content">
            <h2 class="toc-title">项目指导书 · 内容导读</h2>
            <div class="toc-divider"></div>
            <div class="toc-list">
              <div class="toc-item" @click="jumpToPageWithSound(2)">
                <span>一、平台定位与设计理念</span>
                <div class="toc-dots"></div>
                <span>P.03</span>
              </div>
              <div class="toc-item" @click="jumpToPageWithSound(3)">
                <span>二、用户入口与角色画像</span>
                <div class="toc-dots"></div>
                <span>P.04</span>
              </div>
              <div class="toc-item" @click="jumpToPageWithSound(5)">
                <span>三、核心学习模块</span>
                <div class="toc-dots"></div>
                <span>P.06</span>
              </div>
              <div class="toc-item" @click="jumpToPageWithSound(7)">
                <span>四、仿真实训系统</span>
                <div class="toc-dots"></div>
                <span>P.08</span>
              </div>
              <div class="toc-item" @click="jumpToPageWithSound(9)">
                <span>五、就业提升与面试训练</span>
                <div class="toc-dots"></div>
                <span>P.10</span>
              </div>
              <div class="toc-item" @click="jumpToPageWithSound(11)">
                <span>六、智能小工具与复盘系统</span>
                <div class="toc-dots"></div>
                <span>P.12</span>
              </div>
            </div>
            <div class="page-footer">智学云枢 · 项目指导书</div>
          </div>
          <div class="herb-icon herb-icon-1">📖</div>
          <div class="herb-icon herb-icon-2">⚙️</div>
        </div>

        <!-- 2: 平台定位与设计理念 -->
        <div class="page page-intro">
          <div class="chapter-num">壹</div>
          <div class="decorator"></div>
          <h2>平台定位与设计理念</h2>
          <p>
            本系统采用模块化、流程化的界面设计思路，围绕“用户认知—能力测评—个性化学习—实践训练—就业提升—复盘强化”的完整链路展开。界面以中医学习场景为核心，兼顾学习、实训与就业三类需求，通过多角色入口、引导式操作和可视化数据展示，降低使用门槛，提高功能联动效率。
          </p>
          <div class="yin-yang">
            <svg class="yin-yang-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill="#5a3921" />
              <path
                d="M50,0 a50,50 0 0,1 0,100 25,25 0 0,1 0,-50 25,25 0 0,0 0,-50Z"
                fill="#f5e8d0"
              />
              <circle cx="50" cy="25" r="5" fill="#5a3921" />
              <circle cx="50" cy="75" r="5" fill="#f5e8d0" />
            </svg>
          </div>
        </div>

        <!-- 3: 用户入口与角色画像 -->
        <div class="page">
          <div class="page-border"></div>
          <div class="page-content">
            <div class="page-header">
              <span><span class="chapter-tag">第二章</span> 用户入口与角色画像</span
              ><span>P. 4</span>
            </div>
            <h3>多角色登录与个性化画像</h3>
            <p>
              系统首先设置登录与用户指南页面，介绍平台定位及使用流程。用户进入角色选择界面，可根据身份选择“中医爱好者”“中医学者”“中医求职者”等，不同角色影响后续功能推荐、学习计划侧重点及AI分析策略。
            </p>
            <div class="page-image">
              <img
                src="./DataImage/001.png"
                alt="角色选择界面"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>
            <p>
              基础信息录入阶段，系统引导用户填写专业、年龄、学习背景，并结合摸底测试生成初始能力评估。个人中心与用户画像主页通过图表、知识点掌握度分布和学习记录，直观展示各维度掌握情况。
            </p>
            <div class="page-footer">用户画像与测评体系</div>
          </div>
          <div class="herb-icon herb-icon-1">👤</div>
        </div>

        <!-- 4: 学习模块预览（过渡页） -->
        <div class="page">
          <div class="page-border"></div>
          <div class="page-content">
            <div class="page-header">
              <span><span class="chapter-tag">过渡</span> 学习引擎启动</span><span>P. 5</span>
            </div>
            <h3>AI驱动学习路径</h3>
            <p>
              完成用户画像后，系统自动规划个性化学习路径。所有学习资源均关联知识点标签，结合AI智慧顾问与知识图谱，实现从理论到实践的平滑过渡。平台内置中医典籍库（《伤寒论》《黄帝内经》等）及结构化教材，支持阅读、标注、划词提问等交互。
            </p>
            <div class="page-image">
              <img
                src="./DataImage/002.png"
                alt="个性化学习路径生成示意图"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>
            <p>下一章详细阐述核心学习模块的具体构成与使用方法。</p>
            <div class="page-footer">智学云枢 · 自适应学习</div>
          </div>
          <div class="herb-icon herb-icon-2">📚</div>
        </div>

        <!-- 5: 核心学习模块 P6 -->
        <div class="page">
          <div class="page-border"></div>
          <div class="page-content">
            <div class="page-header">
              <span><span class="chapter-tag">第三章</span> 核心学习模块</span><span>P. 6</span>
            </div>
            <h3>书架 · AI智慧顾问 · 知识图谱</h3>
            <p>
              书架页面支持用户浏览和管理中医典籍，如《伤寒论》《黄帝内经》《中医基础理论》等；阅读过程中可进行标注、注释和划词提问，相关内容可发送给AI进行解释分析。
            </p>
            <div class="page-image">
              <img
                src="./DataImage/003.png"
                alt="书架阅读 + AI划词提问界面"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>
            <p>
              AI智慧顾问界面基于书籍内容进行问答交互，知识图谱界面以结构化方式展示概念联系，帮助建立系统性知识框架。
            </p>
            <div class="page-footer">智能学习工具集</div>
          </div>
          <div class="herb-icon herb-icon-1">🤖</div>
        </div>

        <!-- 6: 章节训练与测评 P7 -->
        <div class="page">
          <div class="page-border"></div>
          <div class="page-content">
            <div class="page-header">
              <span><span class="chapter-tag">第三章</span> 核心学习模块 · 续</span
              ><span>P. 7</span>
            </div>
            <h3>章节训练与综合测评</h3>
            <p>
              系统根据用户当前知识点掌握情况，智能推送章节训练题，并提供综合测评模式。测评结果实时更新至能力雷达图，并影响后续AI推荐策略。
            </p>
            <div class="page-image">
              <img
                src="./DataImage/004.png"
                alt="知识点掌握度分布图与测评报告"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>
            <p>
              支持错题本与薄弱点强化练习，确保学习效率。数据基于结构化知识点映射，每个题目都关联明确的中医知识维度。
            </p>
            <div class="page-footer">精准评估 · 以练促学</div>
          </div>
          <div class="herb-icon herb-icon-2">📊</div>
        </div>

        <!-- 7: 仿真实训系统（导引风格）P8 -->
        <div
          class="page page-intro"
          style="background: linear-gradient(135deg, #2c522c 0%, #1e3a1e 100%)"
        >
          <div class="chapter-num">肆</div>
          <div class="decorator" style="background: linear-gradient(90deg, #d4a146, #f5e8d0)"></div>
          <h2>仿真实训系统</h2>
          <p>
            Unity三维模型 +
            手势识别交互，构建虚拟针灸实验室。支持手势完成模型缩放、旋转、聚焦和穴位查看，模拟实训模式下根据信息完成穴位定位与针灸动作训练。
          </p>
          <div class="yin-yang">
            <svg class="yin-yang-svg" viewBox="0 0 100 100">
              <path
                d="M50,10 C30,10 20,30 20,50 C20,70 30,90 50,90 C70,90 80,70 80,50 C80,30 70,10 50,10Z"
                fill="#d4a146"
                opacity="0.3"
              />
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke="#d4a146"
                stroke-width="2"
                stroke-dasharray="5,5"
              />
            </svg>
          </div>
        </div>

        <!-- 8: 仿真详细说明 P9 -->
        <div class="page">
          <div class="page-border"></div>
          <div class="page-content">
            <div class="page-header">
              <span><span class="chapter-tag">第四章</span> 仿真实训系统</span><span>P. 9</span>
            </div>
            <h3>虚拟针灸实验室</h3>
            <p>
              系统通过Unity引擎构建高精度人体经络模型，集成手势识别模块。用户可通过手势完成模型缩放、旋转、聚焦穴位等操作，并进入实训模式。
            </p>
            <div class="page-image">
              <img
                src="./DataImage/005.png"
                alt="三维针灸仿真操作界面"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>
            <p>
              根据系统提示的病症信息，独立完成穴位定位与虚拟针灸动作。系统实时反馈定位准确性与操作规范度，强化沉浸式体验。实训数据同步至复盘系统。
            </p>
            <div class="page-footer">手势交互 · 虚实结合</div>
          </div>
          <div class="herb-icon herb-icon-1">✋</div>
        </div>

        <!-- 9: 就业提升与面试训练 P10（导引风格） -->
        <div
          class="page page-intro"
          style="background: linear-gradient(135deg, #8c6239 0%, #6d4c2c 100%)"
        >
          <div class="chapter-num">伍</div>
          <div class="decorator" style="background: linear-gradient(90deg, #f5e8d0, #d4a146)"></div>
          <h2>就业提升与面试训练</h2>
          <p>
            简历填写、岗位推荐、模拟面试、面试报告四类页面。基于岗位库支持“中医主治医师”“针灸医师”等职位展示，集成AI智能推荐与自定义面试。
          </p>
          <div class="yin-yang">
            <svg class="yin-yang-svg" viewBox="0 0 100 100">
              <path d="M20,50 Q50,20 80,50 Q50,80 20,50Z" fill="#f5e8d0" opacity="0.3" />
              <circle cx="50" cy="50" r="10" fill="#f5e8d0" opacity="0.6" />
            </svg>
          </div>
        </div>

        <!-- 10: 面试闭环详细 P11 -->
        <div class="page">
          <div class="page-border"></div>
          <div class="page-content">
            <div class="page-header">
              <span><span class="chapter-tag">第五章</span> 就业提升与面试训练</span
              ><span>P. 11</span>
            </div>
            <h3>AI模拟面试与分析报告</h3>
            <p>
              岗位页面集成AI智能推荐与自定义面试功能，结合用户简历、学习情况和职业目标生成针对性训练路径。面试结束后，系统通过面试记录与分析报告展示面部表情分析、神态捕捉结果、回答评价和薄弱点总结。
            </p>
            <div class="page-image">
              <img
                src="./DataImage/006.png"
                alt="面试报告：表情分析+能力雷达"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>
            <p>
              岗位库涵盖中医主治医师、针灸医师、中医康复医师、中药师等职位，提供岗位要求、核心技能和标签信息。
            </p>
            <div class="page-footer">AI模拟面试 · 精准提升</div>
          </div>
          <div class="herb-icon herb-icon-2">💼</div>
        </div>

        <!-- 11: 小工具与复盘系统 P12（导引风格） -->
        <div
          class="page page-intro"
          style="background: linear-gradient(135deg, #5a3921 0%, #3d2818 100%)"
        >
          <div class="chapter-num">陆</div>
          <div class="decorator"></div>
          <h2>智能小工具 & 复盘系统</h2>
          <p>
            方剂配伍、中医药膳、中成药查询、古今单位换算、中医辞典等模块。昔日复盘页面，对多模块行为数据再分析，提炼薄弱点并生成个性化学习清单。
          </p>
          <div class="yin-yang">
            <svg class="yin-yang-svg" viewBox="0 0 100 100">
              <path
                d="M30,30 L70,70 M30,70 L70,30"
                stroke="#d4a146"
                stroke-width="3"
                opacity="0.5"
              />
              <circle cx="50" cy="50" r="20" fill="none" stroke="#d4a146" stroke-width="2" />
            </svg>
          </div>
        </div>

        <!-- 12: 小工具详细 P13 -->
        <div class="page">
          <div class="page-border"></div>
          <div class="page-content">
            <div class="page-header">
              <span><span class="chapter-tag">第六章</span> 智能小工具与复盘系统</span
              ><span>P. 13</span>
            </div>
            <h3>方剂配伍 · 中医辞典 · 昔日复盘</h3>
            <p>
              方剂配伍模块支持AI出题和自主研习两种模式；中医药膳、中成药和辞典模块承担资料查询与辅助学习作用，增强平台实用性。
            </p>
            <div class="page-image">
              <img
                src="./DataImage/007.png"
                alt="复盘看板：学习轨迹与薄弱点热力图"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>
            <p>
              昔日复盘页面汇聚学习、实训、面试等多维度数据，通过智能算法提炼知识薄弱点，生成个性化强化学习清单，实现精准训练与持续提升。
            </p>
            <div class="page-footer">数据驱动 · 持续进化</div>
          </div>
          <div class="herb-icon herb-icon-1">🔄</div>
        </div>

        <!-- 13: 封底 -->
        <div class="page page-cover" data-density="hard">
          <div class="cover-decoration cover-decoration-1"></div>
          <div class="cover-decoration cover-decoration-2"></div>
          <h2 style="font-size: 48px; color: #4a3620; z-index: 2">智学云枢</h2>
          <p style="opacity: 0.8; font-size: 18px; margin-top: 30px; color: #5a3921; z-index: 2">
            完整链路 · 个性化中医教育
          </p>
          <div
            style="
              width: 100px;
              height: 2px;
              background: linear-gradient(90deg, transparent, #8b6239, transparent);
              margin: 20px auto;
              z-index: 2;
            "
          ></div>
          <div style="margin-top: 80px; font-size: 14px; opacity: 0.7; color: #5a3921; z-index: 2">
            <p>云声知处项目组 出品</p>
            <p>传承经典 · AI赋能 · 知行合一</p>
            <p style="margin-top: 20px">乙巳年 冬月</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits, defineExpose, nextTick } from 'vue'
import { PageFlip } from 'page-flip'
import TurnWav from '@/assets/TcmBook/turn.wav'

// 定义属性
const props = defineProps({
  showNextStepBtn: {
    type: Boolean,
    default: true,
  },
})

// 定义事件
const emit = defineEmits(['next-step'])

const bookContainer = ref(null)
const pageTurnAudio = ref(null)
const pageFlip = ref(null)
const currentPage = ref(0)
const totalPages = ref(0)
const isBookReady = ref(false)

// 播放翻页音效
const playPageTurnSound = () => {
  if (pageTurnAudio.value) {
    pageTurnAudio.value.currentTime = 0
    pageTurnAudio.value.play().catch((e) => {
      console.log('音频播放失败，可能是用户尚未交互:', e)
    })
  }
}

// 带音效的翻页方法
const prevPageWithSound = () => {
  playPageTurnSound()
  pageFlip.value?.flipPrev()
}

const nextPageWithSound = () => {
  playPageTurnSound()
  pageFlip.value?.flipNext()
}

const jumpToPageWithSound = (index) => {
  playPageTurnSound()
  pageFlip.value?.flip(index)
}

const jumpToTocWithSound = () => {
  playPageTurnSound()
  pageFlip.value?.flip(1)
}

const handleNextStepWithSound = () => {
  emit('next-step', {
    currentPage: currentPage.value,
    totalPages: totalPages.value,
    isLastPage: currentPage.value === totalPages.value - 1,
    action: 'user-clicked-next-step',
  })
}

// 关键：暴露给父组件的初始化函数
const initPageFlip = async () => {
  if (!bookContainer.value) {
    console.error('bookContainer 未找到')
    return
  }

  try {
    await nextTick()

    if (pageFlip.value) {
      pageFlip.value.destroy()
      pageFlip.value = null
    }

    pageFlip.value = new PageFlip(bookContainer.value, {
      width: 480,
      height: 640,
      size: 'fixed',
      showCover: true,
      drawShadow: true,
      maxShadowOpacity: 0.5,
      flippingTime: 800,
      mobileScrollSupport: false,
      clickEventForward: false,
      useMouseEvents: true,
      swipeDistance: 30,
    })

    const pages = bookContainer.value.querySelectorAll('.page')
    if (pages.length === 0) return

    pageFlip.value.loadFromHTML(pages)
    totalPages.value = pageFlip.value.getPageCount()

    pageFlip.value.on('flip', (e) => {
      currentPage.value = e.data
      adjustBookPosition(e.data)
      rebindImageClick()
    })

    isBookReady.value = true

    setTimeout(() => {
      if (pageFlip.value) {
        pageFlip.value.update()
        adjustBookPosition(0)
      }
    }, 150)
  } catch (error) {
    console.error('PageFlip 初始化失败:', error)
  }
}

defineExpose({
  initPageFlip,
})

const adjustBookPosition = (index) => {
  if (!bookContainer.value || !pageFlip.value) return
  if (index === 0) {
    bookContainer.value.style.transform = 'translateX(-25%)'
  } else if (index === totalPages.value - 1) {
    bookContainer.value.style.transform = 'translateX(25%)'
  } else {
    bookContainer.value.style.transform = 'translateX(0)'
  }
}

const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft') {
    playPageTurnSound()
    pageFlip.value?.flipPrev()
  }
  if (e.key === 'ArrowRight') {
    playPageTurnSound()
    pageFlip.value?.flipNext()
  }
}

// 图片预览功能
// 图片预览功能
const showImagePreview = (imgSrc, altText) => {
  // 创建遮罩层
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  `

  // 创建图片容器
  const imgContainer = document.createElement('div')
  imgContainer.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: fadeIn 0.2s ease;
  `

  // 创建图片
  const img = document.createElement('img')
  img.src = imgSrc
  img.alt = altText || '预览图片'
  img.style.cssText = `
    max-width: 100%;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  `

  // 创建关闭提示
  const tip = document.createElement('div')
  tip.textContent = '点击任意位置关闭'
  tip.style.cssText = `
    margin-top: 16px;
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    font-family: system-ui;
  `

  imgContainer.appendChild(img)
  imgContainer.appendChild(tip)
  overlay.appendChild(imgContainer)

  // 添加动画样式
  const style = document.createElement('style')
  style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`
  document.head.appendChild(style)

  // 点击关闭（带动画效果）
  overlay.onclick = () => {
    overlay.style.animation = 'fadeOut 0.2s ease forwards'
    setTimeout(() => {
      overlay.remove()
      style.remove()
    }, 200)
  }

  document.body.appendChild(overlay)
}

// 给所有 .page-image 内的图片添加点击事件
const bindImageClick = () => {
  const images = document.querySelectorAll('.page-image img')
  images.forEach((img) => {
    img.style.cursor = 'pointer'
    img.onclick = (e) => {
      e.stopPropagation()
      showImagePreview(img.src, img.alt)
    }
  })
}

// 在翻页后重新绑定图片点击事件（因为翻页后DOM会变化）
const rebindImageClick = () => {
  setTimeout(() => {
    bindImageClick()
  }, 100)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  setTimeout(() => {
    const contents = document.querySelectorAll('.page-content')
    contents.forEach((el) => {
      el.addEventListener('mousedown', (e) => e.stopPropagation())
    })
    bindImageClick()
  }, 800)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (pageFlip.value) {
    pageFlip.value.destroy()
  }
})
</script>

<style scoped>
/* === 包装容器样式 === */
.tcm-book-wrapper {
  position: relative;
  width: 100%;
  height: 92vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimSun', serif;
  box-sizing: border-box;
}

/* === 音频元素样式 === */
audio {
  display: none;
  visibility: hidden;
  position: absolute;
  z-index: -1;
}

/* 核心布局修复：视口容器 */
.book-viewport {
  position: relative;
  width: 100vw;
  height: 640px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

#book-container {
  position: absolute;
  width: 480px;
  height: 640px;
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
}

/* === 页面通用样式 === */
.page {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 30px 35px;
  background-color: #f9f3e9;
  box-sizing: border-box;
  border: 1px solid #b8a286;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: inset 0 0 20px rgba(139, 119, 101, 0.1);
}

/* 自定义滚动条 - 优雅处理溢出内容 */
.page::-webkit-scrollbar {
  width: 4px;
}
.page::-webkit-scrollbar-track {
  background: #e8ddd0;
  border-radius: 4px;
}
.page::-webkit-scrollbar-thumb {
  background: #b8a286;
  border-radius: 4px;
}

:deep(.st-page) {
  display: block !important;
}

/* 纸张纹理效果 */
.page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(90deg, transparent 95%, rgba(139, 119, 101, 0.05) 100%),
    linear-gradient(rgba(139, 119, 101, 0.05) 1px, transparent 1px);
  background-size:
    30px 100%,
    100% 30px;
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;
  user-select: text;
}

/* === 封面/封底样式 === */
.page-cover {
  background: linear-gradient(135deg, #d4b483 0%, #b8945c 100%);
  color: #4a3620;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 2px solid #8b6239;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 0 50px rgba(255, 248, 220, 0.3);
  overflow: hidden;
}

.page-cover::after {
  content: '';
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  border: 1px solid rgba(74, 54, 32, 0.2);
  pointer-events: none;
}

.cover-title-wrap h1 {
  font-size: 42px;
  margin-bottom: 20px;
  letter-spacing: 6px;
  font-family: 'STKaiti', 'KaiTi', serif;
  color: #4a3620;
  text-shadow: 1px 1px 2px rgba(255, 248, 220, 0.8);
  position: relative;
  padding-bottom: 20px;
}

.cover-title-wrap h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #8b6239, transparent);
}

.subtitle {
  font-size: 14px;
  letter-spacing: 5px;
  opacity: 0.8;
  margin-bottom: 20px;
}
.volume {
  margin-top: 30px;
  font-size: 18px;
  opacity: 0.9;
}
.footer-tag {
  margin-top: 100px;
  font-size: 16px;
  opacity: 0.7;
}

.cover-decoration {
  position: absolute;
  width: 150px;
  height: 150px;
  opacity: 0.15;
  pointer-events: none;
}
.cover-decoration-1 {
  top: 20px;
  left: 20px;
  background:
    radial-gradient(circle, transparent 60%, #4a3620 60%),
    repeating-linear-gradient(45deg, transparent, transparent 10px, #4a3620 10px, #4a3620 20px);
  transform: rotate(15deg);
}
.cover-decoration-2 {
  bottom: 20px;
  right: 20px;
  background:
    radial-gradient(circle, transparent 60%, #4a3620 60%),
    repeating-linear-gradient(-45deg, transparent, transparent 10px, #4a3620 10px, #4a3620 20px);
  transform: rotate(-15deg);
}

/* === 目录样式 === */
.toc-title {
  font-family: 'STKaiti', 'KaiTi', serif;
  margin-top: 0;
  margin-bottom: 10px;
  text-align: center;
  font-size: 28px;
}
.toc-divider {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #8b5a2b, transparent);
  margin: 10px auto 30px;
}
.toc-list {
  width: 100%;
  margin-top: 20px;
  flex: 1;
}
.toc-item {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  cursor: pointer;
  padding: 10px 12px;
  transition: all 0.3s;
  border-bottom: 1px solid #d4c4b4;
  background: rgba(255, 255, 255, 0.05);
}
.toc-item::before {
  content: '❁';
  margin-right: 12px;
  color: #a08060;
  font-size: 14px;
}
.toc-item:hover {
  background-color: rgba(160, 128, 96, 0.1);
  padding-left: 20px;
  color: #8b5a2b;
  transform: translateX(3px);
}
.toc-dots {
  flex-grow: 1;
  border-bottom: 1px dotted #a08060;
  margin: 0 8px;
  position: relative;
  top: -2px;
}

/* === 章节导引页 === */
.page-intro {
  background: linear-gradient(135deg, #5a3921 0%, #3d2818 100%);
  color: #f5e8d0;
  padding: 40px 35px;
  overflow: hidden;
}
.page-intro p {
  color: #f5e8d0 !important;
  text-indent: 0 !important;
  text-align: left !important;
  opacity: 1 !important;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  margin-top: 20px;
  line-height: 1.7;
}
.chapter-num {
  font-size: 100px;
  font-weight: bold;
  opacity: 0.12;
  position: absolute;
  right: 30px;
  top: 20px;
  font-family: serif;
}
.page-intro h2 {
  font-size: 40px;
  font-family: 'STKaiti', 'KaiTi', serif;
  margin-bottom: 15px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
.decorator {
  width: 70px;
  height: 3px;
  background: linear-gradient(90deg, #d4a146, #f5e8d0);
  margin-bottom: 25px;
  position: relative;
}
.decorator::before {
  content: '❈';
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  color: #d4a146;
  font-size: 18px;
}
.yin-yang {
  position: absolute;
  bottom: 25px;
  right: 25px;
  width: 55px;
  height: 55px;
  opacity: 0.25;
}

/* === 内容细节样式 === */
.page-header {
  font-size: 12px;
  color: #8b5a2b;
  border-bottom: 1px solid #d4c4b4;
  padding-bottom: 10px;
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
}
.chapter-tag {
  background: linear-gradient(135deg, #8b5a2b, #a08060);
  padding: 2px 8px;
  color: white;
  border-radius: 3px;
  margin-right: 8px;
  font-size: 11px;
}
h3 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #5a3921;
  font-family: 'STKaiti', 'KaiTi', serif;
  position: relative;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0d0c0;
}
h3::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 50px;
  height: 2px;
  background-color: #8b5a2b;
}
p {
  font-size: 14px;
  line-height: 1.65;
  color: #5a3921;
  margin-bottom: 14px;
  text-align: justify;
  text-indent: 2em;
}
.page-image {
  width: 100%;
  min-height: 100px;
  background: #f2ece1;
  margin: 12px 0;
  border: 1px solid #d4c4b4;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 10px;
  box-sizing: border-box;
}

.page-image img {
  max-width: 100%;
  max-height: 280px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.page-image::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a08060' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  background-repeat: repeat;
  pointer-events: none; /* 添加这行：让伪元素不拦截点击 */
  z-index: 0; /* 添加这行：确保图片在上层 */
}
.page-footer {
  margin-top: auto;
  text-align: center;
  font-size: 11px;
  color: #a08060;
  padding-top: 12px;
  border-top: 1px solid #d4c4b4;
  letter-spacing: 1px;
}
.page-border {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 1px solid rgba(139, 119, 101, 0.2);
  pointer-events: none;
  z-index: 1;
}
.herb-icon {
  position: absolute;
  opacity: 0.12;
  font-size: 32px;
  z-index: 1;
  pointer-events: none;
}
.herb-icon-1 {
  top: 15px;
  right: 15px;
}
.herb-icon-2 {
  bottom: 15px;
  left: 15px;
}

/* === 按钮样式 === */
.control-buttons {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.left-buttons {
  left: 30px;
}
.right-buttons {
  right: 30px;
}
.nav-button {
  width: 55px;
  height: 55px;
  border-radius: 12px;
  background-color: #8b4513;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  font-size: 22px;
  transition: all 0.3s;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.nav-button:hover {
  background-color: #5d2e0f;
  transform: scale(1.08);
  box-shadow: 0 6px 18px rgba(139, 69, 19, 0.3);
}
.button-tooltip {
  position: absolute;
  background: rgba(139, 69, 19, 0.92);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 11px;
  opacity: 0;
  pointer-events: none;
  transition: 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  z-index: 101;
}
.nav-button:hover .button-tooltip {
  opacity: 1;
}
.left-buttons .button-tooltip {
  left: 65px;
}
.right-buttons .button-tooltip {
  right: 65px;
}

/* === 响应式调整 === */
@media (max-width: 768px) {
  .book-viewport,
  #book-container {
    width: 90vw;
    height: 60vh;
  }
  .nav-button {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
  .page {
    padding: 20px 25px;
  }
  .cover-title-wrap h1 {
    font-size: 28px;
  }
  .page-intro h2 {
    font-size: 32px;
  }
  .chapter-num {
    font-size: 70px;
  }
}
</style>
