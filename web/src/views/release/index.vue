<template>
  <div>{{ $route.params.short }}</div>
</template>

<script>
export default {
  mounted() {
    console.log(this.$route.params);
  }
};
</script>