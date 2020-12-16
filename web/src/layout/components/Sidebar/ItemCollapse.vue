<template>
  <div v-if="meta.app !== true" class="app-layout">
    <svg-icon :icon-class="meta.icon" />
  </div>
  <div v-else class="app-layout">
    <el-image style="width: 32px; height: 32px" :src="meta.icon" fit="fill"></el-image>
  </div>
</template>


<script>
export default {
  name: 'MenuItem',
  props: {
    meta: {
      type: Object,
      default: null
    }
  },
  created() {
    console.log(this.meta);
  },
  methods: {
    platformStr(platform) {
      if (platform === 'ios') {
        return 'iOS';
      } else {
        return 'Android';
      }
    }
  }
};
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}

.app-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
