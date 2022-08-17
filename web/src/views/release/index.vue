<template>
  <div class="container">
    <div class="size-box">
      <div class="app-info">
        <img :src="appData.icon" alt="appData.icon" class="icon-part" />
        <div class="text-part">
          <div class="name">
            <span
              class="iconfont"
              :class="
                appData.platform == 'ios' ? 'icon-ota-ios' : 'icon-ota-android'
              "
            ></span>
            {{ this.appData.name }}
          </div>
          <div class="version">
            版本：{{ (appData.version || {}).version }} (build
            {{ (appData.version || {}).build }})
          </div>
          <div class="version">
            更新于 {{ formatDate((appData.version || {}).createTime) }}
          </div>
          <el-button-group>
            <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button type="primary" size="mini" icon="el-icon-share"></el-button>
            <el-button type="primary" size="mini" icon="el-icon-delete"></el-button>
          </el-button-group>
        </div>
        <div class="flex-space"></div>
        <div class="qr-part"></div>
      </div>
    </div>
  </div>
</template>

<script>
// 同时支持mobile、desktop
import ResizeMixin from '@/layout/mixin/ResizeHandler';
import apiApp from '@/api/app';
import {formatDate} from '@/utils/validate';
export default {
  mixins: [ResizeMixin],
  computed: {
    isMobile() {
      return this.$store.state.device.device == 'mobile';
    }
  },
  watch: {
    isMobile(val) {
      if (this.appData) {
        this.currentComp = val ? this.appData.tmobile : this.appData.tdesktop;
      } else {
        this.currentComp = val ? 'MobileDefault' : 'DesktopDefault';
      }
    }
  },
  data() {
    return {
      currentComp: 'DesktopDefault',
      appData: {}
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
        this.appData = res.data.body;
        document.title = this.appData.name;
      });
  },
  methods: {
    formatDate(value) {
      return formatDate('yyyy-MM-dd hh:mm', value);
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  @include flexStart;
  align-items: center;
  flex-direction: column;
  .size-box {
    max-width: 1024px;
    width: 100%;
    min-height: 100px;
    // background-color: grey;
    .app-info {
      @include flexStart;
      flex-direction: row;
      margin-top: 4%;
      padding: 2%;
      .icon-part {
        border-radius: 22%;
        width: 30%;
        max-width: 220px;
        height: auto;
      }
      .text-part {
        height: 100%;
        .iconfont {
          font-size: 24px;
        }
        .name {
          font-size: 24px;
          line-height: 1.25;
          font-weight: 700;
          color: #1d1d1f;
        }
        .link {
          font-size: 18px;
          line-height: 1.22226;
          font-weight: 400;
          color: #0070c9;
        }
        .version {
          font-size: 16px;
          line-height: 1.22226;
          font-weight: 400;
          color: $fontText;
        }
      }
    }
  }
}

.flex-space {
  flex-grow: 100;
}
</style>
