<template>
  <div class="app-container">
    <div>{{ $route.params.id }}</div>
    <info></info>
  </div>
</template>

<script>
import Info from './components/info';
import apiApp from '@/api/app';
export default {
  components: {
    Info
  },
  data() {
    return {
      appDetail: null,
      versionList: []
    };
  },
  created() {
    this.fetchAppDetail();
    this.fetchVersionList();
  },
  methods: {
    fetchAppDetail() {
      const appId = this.$route.params.id;
      apiApp.fetchApp(appId).then((resp) => {
        this.appDetail = resp.data.body;
      });
    },
    fetchVersionList() {
      const appId = this.$route.params.id;
      apiApp.fetchVersionList(appId).then((resp) => {
        this.versionList = resp.data.body;
      });
    }
  }
};
</script>


<style lang="scss" scoped>
.app {
  &-container {
    margin: 30px;
  }
}
</style>

