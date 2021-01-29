<template>
  <div>
    <div>{{ $route.params.short }}</div>
    <div>{{ $route.params.verId }}</div>
    <div>{{ isMobile ? 'mobile' : 'desktop' }}</div>
  </div>
</template>

<script>
// 同时支持mobile、desktop
import ResizeMixin from '@/layout/mixin/ResizeHandler';
export default {
  mixins: [ResizeMixin],
  computed: {
    isMobile() {
      return this.$store.state.settings.device == 'mobile';
    }
  },
  mounted() {
    console.log(this.$route.params);
  }
};
</script>