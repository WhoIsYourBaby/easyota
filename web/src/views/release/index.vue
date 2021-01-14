<template>
  <div>
    <div>{{ $route.params.short }}</div>
    <div>{{ $route.params.verId }}</div>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log(this.$route.params);
  }
};
</script>