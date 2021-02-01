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
    <el-button @click="onInstallClick" type="primary" round style="margin-top: 25px">
      下载安装
    </el-button>
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
      console.log(this.data);
      if (this.data.platform == 'ios') {
      } else {
        window.open(this.data.version.binUrl);
      }
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