<template>
  <div v-if="meta.app !== true">
    <svg-icon :icon-class="meta.icon" />
    <span>{{ meta.title }}</span>
  </div>
  <div v-else class="app-layout">
    <el-image
      style="width: 32px; height: 32px; margin-right: 12px"
      :src="meta.icon"
      fit="fill"
    ></el-image>
    <div>
      <div style="line-height: 20px">{{ meta.title }}</div>
      <div style="line-height: 20px; font-size: 13px; color: grey">
        {{ platform(meta.platform) }}
      </div>
    </div>
  </div>
</template>


<script>
import { platformString } from "@/utils/validate";
export default {
  name: 'MenuItem',
  props: {
    meta: {
      type: Object,
      default: null
    }
  },
  methods: {
    platform(str) {
      return platformString(str);
    }
  }
};
</script>

<style scoped>
.svg-icon {
  margin-right: 12px;
}
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}

.app-layout {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
}
</style>
