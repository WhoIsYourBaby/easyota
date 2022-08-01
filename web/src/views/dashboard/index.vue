<template>
  <div class="dashboard-container"></div>
</template>

<script>
import {mapState} from 'vuex';
import AppCard from './components/AppCard.vue';

export default {
  name: 'Dashboard',
  components: {AppCard},
  data() {
    return {
      appList: []
    };
  },
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  created() {
    this.$store.dispatch('app/fetchList');
  }
};
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
