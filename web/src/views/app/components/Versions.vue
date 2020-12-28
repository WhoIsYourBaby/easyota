<template>
  <div>
    <el-timeline></el-timeline>
  </div>
</template>

<script>
export default {
  props: {
    appId: {type: String, default: null}
  },
  data() {
    return {
      verList: []
    };
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
</style>