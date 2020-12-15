<template>
  <div v-if="meta.app !== true">
    <svg-icon :icon-class="meta.icon" />
    <span slot="title">{{ meta.title }}</span>
  </div>
  <div v-else class="app-layout">
    <el-image style="width: 32px; height: 32px; margin-right: 12px;" :src="meta.icon" fit="fill"></el-image>
    <div>
      <div style="line-height: 20px">{{meta.title}}</div>
      <div style="line-height: 20px; font-size: 13px; color: grey;">{{platformStr(meta.platform)}}</div>
    </div>
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
  },
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
  padding-top: 8px;
}

</style>
