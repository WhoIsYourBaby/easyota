<template>
  <div class="dashboard-container">
    <div v-for="item in appList">
      <div>{{ item }}</div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex';
import AppCard from './components/AppCard.vue';

export default {
  name: 'Dashboard',
  components: {AppCard},
  data() {
    return {
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.user,
      appList: (state) => {
        return state.app.list;
      }
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
