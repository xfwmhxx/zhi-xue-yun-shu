<template>
  <BreadcrumbNav title="古今换算"></BreadcrumbNav>
  <div class="app-container">
    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="converter-container">
        <h2 class="converter-title">古今计量单位换算器</h2>
        <div class="converter-body">
          <!-- 左侧输入组 -->
          <div class="input-group">
            <input
              type="number"
              class="converter-input"
              v-model.number="leftValue"
              min="0"
              step="0.01"
              @input="convertLeftToRight"
            />
            <div class="custom-select" id="left-unit-select">
              <div
                class="select-selected"
                :class="{ 'select-arrow-active': leftDropdownOpen }"
                @click.stop="toggleLeftDropdown"
              >
                {{ getUnitLabel(leftUnit) }}
              </div>
              <transition name="dropdown-fade">
                <div v-show="leftDropdownOpen" class="select-items">
                  <div
                    v-for="option in leftUnitOptions"
                    :key="option.value"
                    :class="{ 'same-as-selected': option.value === leftUnit }"
                    @click.stop="selectLeftUnit(option.value)"
                  >
                    {{ option.label }}
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <div class="equals-sign">{{ equalsSign }}</div>

          <!-- 右侧输入组 -->
          <div class="input-group">
            <input
              type="number"
              class="converter-input"
              v-model.number="rightValue"
              min="0"
              step="0.01"
              @input="convertRightToLeft"
            />
            <div class="custom-select" id="right-unit-select">
              <div
                class="select-selected"
                :class="{ 'select-arrow-active': rightDropdownOpen }"
                @click.stop="toggleRightDropdown"
              >
                {{ getUnitLabel(rightUnit) }}
              </div>
              <transition name="dropdown-fade">
                <div v-show="rightDropdownOpen" class="select-items">
                  <div
                    v-for="option in rightUnitOptions"
                    :key="option.value"
                    :class="{ 'same-as-selected': option.value === rightUnit }"
                    @click.stop="selectRightUnit(option.value)"
                  >
                    {{ option.label }}
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <div class="converter-description">
          <div class="description-title">换算说明</div>
          <p>1两 ≈ 50克 (不同朝代略有差异，此处采用汉代标准)</p>
          <p>1斤 = 16两 ≈ 500克</p>
          <p>1石 = 4钧 = 120斤 ≈ 60千克</p>
          <p>1尺 ≈ 23.1厘米 (汉代标准)</p>
          <p>1升 ≈ 200毫升 (汉代标准)</p>
          <p>修改任意一侧的数值或单位，另一侧会自动换算</p>

          <div class="description-title">特别提示</div>
          <p>梧桐子大 = 黄豆大</p>
          <p>1 方寸匙 = 金石类 2.74 克 = 药末约 2 克 = 草木类药末约 1 克</p>
          <p>一毫升 = 1 克</p>
          <p>蜀椒一升 = 50 克</p>
          <p>半方寸匙 = 1.5 克</p>
          <p>葶苈子一升 = 60 克</p>
          <p>一钱匙 = 1.5 - 1.8 克</p>
          <p>吴茱萸一升 = 60 克</p>
          <p>一铢 = 100 个泰米的重量</p>
          <p>半夏一升 = 130 克</p>
          <p>虻虫一升 = 16 克</p>
          <p>附子者大一枚 = 20 - 30 克</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

// 单位换算关系 (以克为基准)
const unitConversions = {
  // 重量单位
  dan: { type: 'weight', value: 60000, label: '石' },
  jun: { type: 'weight', value: 15000, label: '钧' },
  jin: { type: 'weight', value: 500, label: '斤' },
  liang: { type: 'weight', value: 50, label: '两' },
  cuo: { type: 'weight', value: 0.5, label: '撮' },
  daogui: { type: 'weight', value: 0.1, label: '刀圭' },
  qianshi: { type: 'weight', value: 1.5, label: '钱匙' },
  zhu: { type: 'weight', value: 0.65, label: '铢' },
  fen: { type: 'weight', value: 0.325, label: '分' },

  // 容量单位
  hu: { type: 'volume', value: 20000, label: '斛' },
  dou: { type: 'volume', value: 2000, label: '斗' },
  sheng: { type: 'volume', value: 200, label: '升' },
  ge: { type: 'volume', value: 20, label: '合' },
  yue: { type: 'volume', value: 10, label: '龠' },

  // 长度单位
  yin: { type: 'length', value: 2310, label: '引' },
  zhang: { type: 'length', value: 231, label: '丈' },
  chi: { type: 'length', value: 23.1, label: '尺' },
  cun: { type: 'length', value: 2.31, label: '寸' },

  // 现代单位
  gram: { type: 'weight', value: 1, label: '克(g)' },
  kilogram: { type: 'weight', value: 1000, label: '千克(kg)' },
  milliliter: { type: 'volume', value: 1, label: '毫升(ml)' },
  liter: { type: 'volume', value: 1000, label: '升(l)' },
  meter: { type: 'length', value: 100, label: '米(m)' },
  centimeter: { type: 'length', value: 1, label: '厘米(cm)' },
}

// 左侧所有单位选项
const leftUnitOptions = [
  { value: 'dan', label: '石' },
  { value: 'jun', label: '钧' },
  { value: 'jin', label: '斤' },
  { value: 'liang', label: '两' },
  { value: 'cuo', label: '撮' },
  { value: 'daogui', label: '刀圭' },
  { value: 'qianshi', label: '钱匙' },
  { value: 'zhu', label: '铢' },
  { value: 'fen', label: '分' },
  { value: 'hu', label: '斛' },
  { value: 'dou', label: '斗' },
  { value: 'sheng', label: '升' },
  { value: 'ge', label: '合' },
  { value: 'yue', label: '龠' },
  { value: 'yin', label: '引' },
  { value: 'zhang', label: '丈' },
  { value: 'chi', label: '尺' },
  { value: 'cun', label: '寸' },
]

// 右侧单位选项（动态计算）
const rightUnitOptions = ref([])

// 数据状态
const leftValue = ref(1)
const rightValue = ref(50)
const leftUnit = ref('liang')
const rightUnit = ref('gram')
const equalsSign = ref('=')

// 近似单位列表
const approxUnits = ['cuo', 'daogui', 'qianshi', 'zhu', 'fen', 'yue']

// 更新右侧单位选项
const updateRightUnitOptions = (leftUnitValue) => {
  const leftUnitType = unitConversions[leftUnitValue]?.type
  if (!leftUnitType) return

  if (leftUnitType === 'weight') {
    rightUnitOptions.value = [
      { value: 'gram', label: '克(g)' },
      { value: 'kilogram', label: '千克(kg)' },
    ]
    // 如果当前右侧单位不是有效类型，重置为第一个
    if (!['gram', 'kilogram'].includes(rightUnit.value)) {
      rightUnit.value = 'gram'
    }
  } else if (leftUnitType === 'volume') {
    rightUnitOptions.value = [
      { value: 'milliliter', label: '毫升(ml)' },
      { value: 'liter', label: '升(l)' },
    ]
    if (!['milliliter', 'liter'].includes(rightUnit.value)) {
      rightUnit.value = 'milliliter'
    }
  } else if (leftUnitType === 'length') {
    rightUnitOptions.value = [
      { value: 'meter', label: '米(m)' },
      { value: 'centimeter', label: '厘米(cm)' },
    ]
    if (!['meter', 'centimeter'].includes(rightUnit.value)) {
      rightUnit.value = 'meter'
    }
  }
}

// 左侧单位变化时
const onLeftUnitChange = (newUnit) => {
  updateRightUnitOptions(newUnit)
  convertLeftToRight()
}

// 下拉框显示状态
const leftDropdownOpen = ref(false)
const rightDropdownOpen = ref(false)

const getUnitLabel = (unitKey) => unitConversions[unitKey]?.label || ''

const closeAllSelect = () => {
  leftDropdownOpen.value = false
  rightDropdownOpen.value = false
}

const toggleLeftDropdown = () => {
  leftDropdownOpen.value = !leftDropdownOpen.value
  rightDropdownOpen.value = false
}

const toggleRightDropdown = () => {
  rightDropdownOpen.value = !rightDropdownOpen.value
  leftDropdownOpen.value = false
}

const selectLeftUnit = (unitValue) => {
  leftUnit.value = unitValue
  leftDropdownOpen.value = false
  onLeftUnitChange(unitValue)
}

const selectRightUnit = (unitValue) => {
  rightUnit.value = unitValue
  rightDropdownOpen.value = false
  convertLeftToRight()
}

const handleDocumentClick = (event) => {
  const target = event.target
  if (!(target instanceof Element)) return
  if (!target.closest('.custom-select')) {
    closeAllSelect()
  }
}

// 从左到右换算
const convertLeftToRight = () => {
  if (isNaN(leftValue.value)) return

  const leftFactor = unitConversions[leftUnit.value]?.value
  const rightFactor = unitConversions[rightUnit.value]?.value

  if (!leftFactor || !rightFactor) return

  let result = (leftValue.value * leftFactor) / rightFactor

  // 判断是否显示约等于号
  equalsSign.value = approxUnits.includes(leftUnit.value) ? '≈' : '='

  rightValue.value = parseFloat(result.toFixed(4))
}

// 从右到左换算
const convertRightToLeft = () => {
  if (isNaN(rightValue.value)) return

  const leftFactor = unitConversions[leftUnit.value]?.value
  const rightFactor = unitConversions[rightUnit.value]?.value

  if (!leftFactor || !rightFactor) return

  let result = (rightValue.value * rightFactor) / leftFactor

  equalsSign.value = approxUnits.includes(leftUnit.value) ? '≈' : '='

  leftValue.value = parseFloat(result.toFixed(4))
}

// 背景滚动效果
const bgBg = ref(null)
const brakePoint = ref(null)
let ticking = false

const updateBgPosition = () => {
  if (!bgBg.value || !brakePoint.value) return

  const scrollY = window.scrollY
  const bgBgHeight = bgBg.value.offsetHeight
  const brakePointRect = brakePoint.value.getBoundingClientRect()
  const dividerTop = brakePointRect.top + scrollY

  const bgBgBottom = scrollY + bgBgHeight

  if (bgBgBottom >= dividerTop) {
    const pushDistance = bgBgBottom - dividerTop
    bgBg.value.style.transform = `translateY(${-pushDistance}px)`
  } else {
    bgBg.value.style.transform = 'translateY(0)'
  }

  ticking = false
}

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(updateBgPosition)
    ticking = true
  }
}

const setBrakePointPosition = () => {
  if (!brakePoint.value) return
  const dividerSection = document.querySelector('.divider-section')
  if (dividerSection) {
    const dividerRect = dividerSection.getBoundingClientRect()
    const scrollTop = window.scrollY
    brakePoint.value.style.top = scrollTop + dividerRect.top + 'px'
  }
}

onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  // 初始化右侧单位选项
  updateRightUnitOptions(leftUnit.value)

  // 初始化换算
  nextTick(() => {
    convertLeftToRight()
    setBrakePointPosition()
  })

  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', setBrakePointPosition)
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', setBrakePointPosition)
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
/* === 基础重置 === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'No3', sans-serif;
  font-weight: 200;
}

/* === 背景容器样式 === */
body {
  font-family: 'NO3', sans-serif;
  background-image: url('./Use/images.jpg');
  background-repeat: repeat;
  background-size: 200px 200px;
  background-attachment: fixed;
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

/* === 详情页标题栏 === */
.detail-header {
  width: 100%;
  height: 100px;
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
}

.header-top-row {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.back-button {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-size: 18px;
  font-family: 'NO3', sans-serif;
  position: absolute;
  left: 5%;
}

.back-button::before {
  content: '←';
  margin-right: 8px;
  font-size: 20px;
}

.title-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.detail-header-title {
  font-family: 'No3', sans-serif;
  font-size: 32px;
  color: white;
  letter-spacing: 2px;
  text-align: center;
}

.breadcrumb-row {
  width: 100%;
  margin-top: 8px;
  padding-left: 5%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-family: 'NO3', sans-serif;
  font-size: 16px;
  color: white;
}

.breadcrumb a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  margin: 0 5px;
}

.breadcrumb a:hover {
  color: white;
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.5);
}

.breadcrumb-current {
  font-weight: bold;
  color: white;
}

/* === 主要内容区域 === */
.main-content {
  flex: 1;
  width: 100%;
  padding-top: 150px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.converter-container {
  width: 90%;
  max-width: 900px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.converter-title {
  font-size: 40px;
  color: #8b4513;
  text-align: center;
  margin-bottom: 30px;
}

.converter-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 250px;
  margin: 10px;
  position: relative;
}

.converter-input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #8b4513;
  border-radius: 5px;
  font-size: 18px;
  color: #333;
  background-color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s;
}

.converter-input:focus {
  outline: none;
  border-color: #5d2906;
  box-shadow: 0 0 5px rgba(139, 69, 19, 0.5);
}

.custom-select {
  position: relative;
  margin-left: 10px;
  min-width: 120px;
  width: 120px;
  flex: 0 0 120px;
}

.select-selected {
  background-color: rgba(255, 255, 255, 0.8);
  border: 2px solid #8b4513;
  border-radius: 5px;
  padding: 12px;
  cursor: pointer;
  user-select: none;
  font-size: 16px;
  color: #333;
  transition: all 0.3s;
  position: relative;
}

.select-selected:after {
  position: absolute;
  content: '';
  top: 50%;
  right: 10px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-color: #8b4513 transparent transparent transparent;
  transform: translateY(-50%);
}

.select-selected.select-arrow-active:after {
  border-color: transparent transparent #8b4513 transparent;
  top: 40%;
}
.select-items {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.95);
  border: 2px solid #8b4513;
  border-top: none;
  border-radius: 0 0 5px 5px;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 99;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.select-items div {
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
  color: #5d2906;
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.2s;
}

.select-items div:hover {
  background-color: rgba(139, 69, 19, 0.1);
}

.select-items .same-as-selected {
  background-color: rgba(139, 69, 19, 0.2);
}

.select-hide {
  display: none;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
  transform-origin: top center;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scaleY(0.96);
}

.equals-sign {
  font-size: 24px;
  color: #8b4513;
  margin: 0 20px;
  font-weight: bold;
}

.converter-description {
  margin-top: 30px;
  padding: 15px;
  background-color: rgba(139, 69, 19, 0.1);
  border-radius: 5px;
  color: #5d2906;
  font-size: 16px;
  line-height: 1.6;
}

.converter-description p {
  font-size: 25px;
}

.description-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #8b4513;
  text-align: center;
  font-size: 30px;
}

/* === 装饰元素 === */
.ZS010 {
  z-index: -2;
  width: 300px;
  position: fixed;
  top: 100px;
  left: 0;
  pointer-events: none;
}

.ZS008 {
  z-index: -2;
  width: 300px;
  position: fixed;
  top: 100px;
  right: 0;
  pointer-events: none;
}

.BgBg {
  z-index: -2;
  position: fixed;
  width: 100%;
  bottom: 0;
  left: 0;
  pointer-events: none;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

/* === 分隔线 === */
.divider-section {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 40px 0;
  position: relative;
}

.divider-line {
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #8b4513 20%, #8b4513 80%, transparent 100%);
  position: relative;
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

/* === 底部文本 === */
.foot-text {
  z-index: 5;
  width: 100%;
  color: #8b4513;
  align-content: center;
  padding: 20px 0;
  box-sizing: border-box;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.5em;
  line-height: 2em;
  font-family: 'No1', sans-serif;
  font-size: 25px;
  transition: all 0.5s ease;
  text-align: center;
}

.foot-text p {
  margin: 0;
  padding: 0;
}

/* === 页脚 === */
.footer {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px 0;
  text-align: center;
  margin-top: auto;
}

.footer p {
  margin: 5px 0;
  padding: 0 20px;
  font-size: 20px;
  font-family: 'NO3', sans-serif;
}

/* === 刹车点 === */
.brake-point {
  position: absolute;
  width: 100%;
  height: 1px;
  top: 100vh;
  left: 0;
  pointer-events: none;
}

/* === 响应式调整 === */
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
    height: 110px;
    padding: 10px 15px;
  }

  .back-button {
    position: relative;
    left: 0;
    margin-bottom: 5px;
  }

  .detail-header-title {
    text-align: left;
    font-size: 24px;
    margin-top: 5px;
  }

  .breadcrumb-row {
    margin-top: 5px;
  }

  .ZS010,
  .ZS008 {
    top: 110px;
  }

  .main-content {
    padding-top: 130px;
  }

  .converter-body {
    flex-direction: column;
  }

  .equals-sign {
    margin: 20px 0;
    transform: rotate(90deg);
  }

  .input-group {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .back-button {
    font-size: 16px;
  }

  .breadcrumb {
    font-size: 12px;
  }

  .converter-container {
    padding: 20px;
  }

  .converter-title {
    font-size: 20px;
  }

  .converter-input {
    padding: 10px;
    font-size: 16px;
  }

  .converter-description p {
    font-size: 18px;
  }

  .description-title {
    font-size: 22px;
  }

  .foot-text {
    font-size: 18px;
  }
}
</style>
