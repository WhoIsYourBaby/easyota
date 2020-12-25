<template>
  <div class="app-container">
    <info :data="appDetail"></info>
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
      appDetail: {},
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

</style>

