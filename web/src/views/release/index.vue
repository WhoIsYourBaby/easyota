<template>
  <div>
    <div>{{ $route.params.short }}</div>
    <div>{{ $route.params.verId }}</div>
  </div>
</template>

<script>
// 同时支持mobile、desktop
export default {
  mounted() {
    console.log(this.$route.params);
  }
};
</script>