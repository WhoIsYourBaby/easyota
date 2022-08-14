<template>
  <div>
    <component :is="currentComp" v-if="releaseData" :data="releaseData"></component>
  </div>
</template>

<script>
// 同时支持mobile、desktop
import ResizeMixin from '@/layout/mixin/ResizeHandler';
import apiApp from '@/api/app';
import DesktopDefault from './desktop/Default';
import MobileDefault from './mobile/Default';

const templates = ['DesktopDefault', 'MobileDefault'];
export default {
  mixins: [ResizeMixin],
  components: {DesktopDefault, MobileDefault},
  computed: {
    isMobile() {
      return this.$store.state.device.device == 'mobile';
    }
  },
  watch: {
    isMobile(val) {
      if (this.releaseData) {
        this.currentComp = val ? this.releaseData.tmobile : this.releaseData.tdesktop;
      } else {
        this.currentComp = val ? 'MobileDefault' : 'DesktopDefault';
      }
    }
  },
  data() {
    return {
      currentComp: 'DesktopDefault',
      releaseData: null
    };
  },
  mounted() {
    apiApp
      .release({
        short: this.$route.params.short,
        branch: this.$route.query.branch,
        verUuid: this.$route.query.verUuid
      })
      .then((res) => {
        this.releaseData = res.data.body;
      });
  }
};
</script>
