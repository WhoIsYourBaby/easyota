<template>
  <div class="container">
    <div class="size-box">
      <div class="app-info">
        <img :src="appData.icon" alt="appData.icon" class="icon-part" />
        <div class="text-part">
          <div class="name text-margin">
            <span
              class="iconfont"
              :class="
                appData.platform == 'ios' ? 'icon-ota-ios' : 'icon-ota-android'
              "
            ></span>
            {{ this.appData.name }}
          </div>
          <div class="version text-margin">
            V{{ (appData.version || {}).version }} (build
            {{ (appData.version || {}).build }}) - {{ size }} MB
          </div>
          <div class="version text-margin">
            更新于 {{ formatDate((appData.version || {}).createTime) }}
          </div>
          <el-button-group>
            <el-button type="primary" size="mini" @click="onInstallClick">
              下载安装
            </el-button>
            <el-button type="primary" size="mini" @click="onGooglePlayClick">
              安卓商店
            </el-button>
            <el-button type="primary" size="mini" @click="onAppleStoreClick">
              苹果商店
            </el-button>
          </el-button-group>
        </div>
        <div class="flex-space"></div>
        <vue-qr
          class="qr-part"
          :text="qrUrl"
          :logoSrc="appData.icon"
          :margin="8"
        ></vue-qr>
      </div>
      <el-divider></el-divider>
      <div class="previews" v-if="hasPreviews">
        <el-image
          :src="item.url"
          fit="cover"
          class="image"
          v-for="item in appData.previews"
          :key="item.id"
        ></el-image>
      </div>
      <el-divider v-if="hasPreviews"></el-divider>
      <div class="name name-margin">应用简介</div>
      <text-body class="name-margin" style="margin-top: 1.5%">
        {{ appData.adesc }}
      </text-body>
      <el-divider></el-divider>
      <div class="name name-margin">更新日志</div>
      <text-body class="name-margin" style="margin-top: 1.5%">
        {{ appData.version ? appData.version.vdesc : '' }}
      </text-body>
      <el-divider></el-divider>
      <text-label class="name-margin" style="margin-top: 10%">
        EASYOTA 开源应用内测托管平台
      </text-label>
      <text-label
        class="name-margin"
        style="margin-top: 1.5%; padding-bottom: 20px"
      >
        APP/公众号/小程序开发请加微信：yangliu945404
      </text-label>
    </div>
  </div>
</template>

<script>
// 同时支持mobile、desktop
import ResizeMixin from '@/layout/mixin/ResizeHandler';
import apiApp from '@/api/app';
import {formatDate} from '@/utils/validate';
import VueQr from 'vue-qr';
export default {
  mixins: [ResizeMixin],
  components: {
    VueQr
  },
  computed: {
    qrUrl() {
      return window.location.href;
    },
    isMobile() {
      return this.$store.state.device.device == 'mobile';
    },
    hasPreviews() {
      const previews = this.appData.previews ?? [];
      return previews.length > 0;
    },
    size() {
      const version = this.appData.version ?? {};
      const size = version.size ?? 0;
      const sizeMB = Number(size / 1024 / 1024).toFixed(1);
      return sizeMB;
    }
  },
  data() {
    return {
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
    },
    onInstallClick() {
      if (this.appData.platform == 'ios') {
        const manifest = this.appData.version.manifest;
        const otaurl = `itms-services://?action=download-manifest&url=${manifest}`;
        window.open(otaurl);
      } else {
        window.open(this.appData.version.binUrl);
      }
    },
    onGooglePlayClick() {
      window.open(this.appData.androidstore);
    },
    onAppleStoreClick() {
      window.open(this.appData.applestore);
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  @include flexStart;
  align-items: center;
  flex-direction: column;
  .size-box {
    height: 100%;
    max-width: 1100px;
    width: 100%;
    // background-color: grey;
    .app-info {
      @include flexCenter;
      align-items: flex-start;
      flex-direction: row;
      flex-wrap: wrap;
      margin-top: 8%;
      padding: 2%;
      .icon-part {
        border-radius: 22%;
        border: 1px solid lightgray;
        width: 30%;
        max-width: 220px;
        height: auto;
        margin-bottom: 4%;
      }
      .qr-part {
        width: 30%;
        max-width: 220px;
        aspect-ratio: 1;
      }
      .text-part {
        @include flexStart;
        flex-direction: column;
        align-items: flex-start;
        margin-left: 3%;
        padding-top: 2%;
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
  .previews {
    @include flexStart;
    overflow: auto;
    .image {
      width: 35%;
      min-width: 180px;
      margin: 1%;
      border-radius: 8px;
    }
  }
}

.flex-space {
  flex-grow: 100;
}
.text-margin {
  margin-bottom: 8%;
  @media screen and (max-width: 768px) {
    margin-bottom: 6%;
  }
  @media screen and (max-width: 568px) {
    margin-bottom: 3%;
  }
}
.name {
  font-size: 24px;
  line-height: 1.25;
  font-weight: 700;
  color: #1d1d1f;
}
.name-margin {
  padding-left: 2%;
}
</style>
