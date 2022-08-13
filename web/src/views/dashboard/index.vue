<template>
  <div class="app-container">
    <div class="flex-grid">
      <el-card v-for="item in appList" :key="item.id" class="app-card">
        <img :src="item.icon" width="80" height="80" />
        <div class="text-row">
          <span
            class="iconfont"
            :class="item.platform == 'ios' ? 'icon-ota-ios' : 'icon-ota-android'"
          ></span>
          <span style="margin-left: 4px">{{ item.name }}</span>
        </div>
        <div class="text-row">
          <div class="title">短连接:</div>
          <div class="content">{{ item.shortUrl }}</div>
        </div>
        <div class="text-row">
          <div class="title">{{ item.platform == 'ios' ? 'BundleID:' : 'PackageName:' }}</div>
          <div class="content">{{ item.bundleId }}</div>
        </div>
        <div class="text-row">{{ item.adesc }}</div>
      </el-card>
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
    return {};
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
