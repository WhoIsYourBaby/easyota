<template>
  <div class="app-container">
    <info :data="appDetail"></info>
    <div class="versions">
      <versions :appId="appDetail.id"></versions>
    </div>
  </div>
</template>

<script>
import Info from './components/Info';
import Versions from './components/Versions';
import apiApp from '@/api/app';
export default {
  components: {
    Info,
    Versions
  },
  data() {
    return {
      appDetail: {}
    };
  },
  created() {
    this.fetchAppDetail();
  },
  methods: {
    fetchAppDetail() {
      const appId = this.$route.params.id;
      apiApp.fetchApp(appId).then((resp) => {
        this.appDetail = resp.data.body;
        this.$route.meta.title = this.appDetail.name;
      });
    }
  }
};
</script>


<style lang="scss" scoped>
.versions {
  margin: 20px 0px 20px -20px;
}
</style>

