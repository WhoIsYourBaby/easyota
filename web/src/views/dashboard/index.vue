<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ user.nickname }}</div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapState({
      user: (state) => state.user
    })
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
