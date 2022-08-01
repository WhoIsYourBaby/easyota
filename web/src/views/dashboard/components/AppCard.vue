<template>
  <div class="app-card">
    {{ appInfo }}
  </div>
</template>

<script>
export default {
  name: 'AppCard',
  props: {
    appInfo: {
      type: Object,
      default: null
    }
  }
};
</script>

<style lang="scss" scoped></style>
