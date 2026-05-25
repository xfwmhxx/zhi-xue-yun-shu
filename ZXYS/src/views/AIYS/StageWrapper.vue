<!-- StageWrapper.vue -->
<template>
  <div class="ai-content">
    <div class="ai-stage-wrapper">
      <div :class="['ai-stage', 'ai-bg', className]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StageWrapper',
  props: {
    className: {
      type: String,
      default: '',
    },
  },
})
</script>

<style lang="less" scoped>
.ai-content {
  min-height: 0;
  flex: 1;
}

.ai-stage-wrapper {
  position: relative;
  height: 100%;
  box-sizing: border-box;
}

.ai-stage {
  height: 100%;
  box-sizing: border-box;
  border: 1px solid var(--adm-color-border);
  display: flex;
  flex-direction: column;
  border-radius: 4px;
}

@media screen and (max-width: 768px) {
  .ai-stage-wrapper {
    padding: 0;
  }

  .ai-stage {
    border: none;
  }
}
</style>
