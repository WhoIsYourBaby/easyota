<template>
  <div class="mydefault">
    <el-image
      style="width: 120px; height: 120px; margin-top: 100px"
      :src="data.icon"
      fit="fill"
    ></el-image>
    <main-title style="margin-top: 20px">{{ this.data.name }}</main-title>
    <text-label style="margin-top: 20px">
      版本：{{ this.data.version.version }} (build {{ this.data.version.build }})
    </text-label>
    <text-label style="margin-top: 10px">
      大小：{{ Number(this.data.version.size / 1024 / 1024).toFixed(1) }} MB
    </text-label>
    <text-label style="margin-top: 10px">
      更新时间：{{ formatDate(this.data.version.createTime) }}
    </text-label>
    <el-button-group style="margin-top: 10px">
      <el-button type="primary" size="mini" @click="onInstallClick">下载APK</el-button>
      <el-button type="primary" size="mini" @click="onGooglePlayClick">Google Play</el-button>
      <el-button type="primary" size="mini" @click="onAppleStoreClick">Apple Store</el-button>
    </el-button-group>
    <div style="width: 90%; max-width: 500px">
      <el-divider></el-divider>
      <main-title>更新说明</main-title>
      <text-body style="margin-top: 20px">{{ this.data.version.vdesc }}</text-body>
    </div>
    <div style="width: 90%; max-width: 500px">
      <el-divider></el-divider>
      <main-title>应用介绍</main-title>
      <text-body style="margin-top: 20px">{{ this.data.adesc }}</text-body>
    </div>
    <div style="margin-bottom: 100px"></div>
  </div>
</template>

<script>
import {formatDate} from '@/utils/validate';
export default {
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  methods: {
    onInstallClick() {
      if (this.data.platform == 'ios') {
        const manifest = this.data.version.manifest;
        const otaurl = `itms-services://?action=download-manifest&url=${manifest}`;
        window.open(otaurl);
      } else {
        window.open(this.data.version.binUrl);
      }
    },
    onGooglePlayClick() {
      // window.open(this.data.googleplay);
      window.open('https://play.google.com/store/apps/details?id=com.kimoji.flutter.hyglight');
    },
    onAppleStoreClick() {
      // window.open(this.data.applestore);
      window.open('https://apps.apple.com/us/app/hyglight/id1619097490');
    },
    formatDate(value) {
      return formatDate('yyyy-MM-dd hh:mm', value);
    }
  }
};
</script>

<style lang="scss" scoped>
.mydefault {
  @include flexStart;
  align-items: center;
  flex-direction: column;
}
</style>
