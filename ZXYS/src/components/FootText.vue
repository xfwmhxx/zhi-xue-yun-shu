<template>
  <!-- 分隔线 -->
  <div class="divider-section">
    <div class="divider-line"></div>
  </div>

  <!-- 底部文本 -->

  <div class="foot-text">
    <p>表外实，下内实，忌</p>
    <p>世治外实，多用表剂。</p>
    <p>表则外虚，风寒得入，而病加剧。</p>
    <p>世治内实，多用下剂，下则内虚，肠胃气促，而肢不畅。</p>
    <p>华先生治府吏倪寻头痛身热，则下之，以其外实也。</p>
    <p>治李延头痛身热，则汗之，以其内实也。</p>
    <p>盖得外实忌表，内实忌下之秘也。</p>
    <p>又按内实则湿火上冲，犹地气之郁，正待四散也；</p>
    <p>外实则积垢中留，犹山间之水，正待下行也。</p>
    <p>其患头痛身热同，而治法异者，虽得之仙秘，实本天地之道也。</p>
    <p>余屡试之，果屡见效。</p>
    <p>——华佗治头痛身热要诀</p>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped>
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
  height: 50%;
  color: #8b4513;
  align-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
  box-sizing: border-box;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.5em;
  line-height: 1.5em;
  font-family: 'No1', sans-serif;
  font-size: 25px;
  transition: all 0.5s ease;
}
</style>
