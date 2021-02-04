<template>
  <el-card shadow="hover">
    <div class="info">
      <div class="appaction">
        <el-image style="width: 120px; height: 120px" :src="data.icon" fit="fill"></el-image>
        <el-upload
          :before-upload="beforeUpload"
          :http-request="myUpload"
          action=""
          @on-progress="onProgress"
          style="margin-top: 10px; width: 96px; height: 36px"
        >
          <el-button size="medium" type="primary">更新版本</el-button>
        </el-upload>
      </div>
      <div class="attrs">
        <subtitle>中电达康</subtitle>
        <div>
          <el-link type="info" :href="data.shortUrl" target="_blank">
            {{ data.shortUrl }}
          </el-link>
        </div>
        <text-body>{{ data.bundleId }}</text-body>
        <text-body>{{ platform(data.platform) }}</text-body>
        <text-body>{{ dateStr(data.createTime) }}</text-body>
      </div>
      <vue-qr
        class="bicode"
        :text="data.shortUrl || ''"
        :size="150"
        :logoSrc="data.icon"
        :margin="8"
      ></vue-qr>
    </div>
    <div class="appdesc">
      <text-body>{{ data.adesc }}</text-body>
    </div>
    <app-update
      :data="upgradeAppInfo"
      :visible="this.showUpdate"
      @on-finish="onAppFinish"
    ></app-update>
  </el-card>
</template>

<script>
import VueQr from 'vue-qr';
import {formatPlatform, formatDate} from '@/utils/validate';
import request from '@/utils/request';
import AppUpdate from './AppUpdate';
export default {
  components: {VueQr, AppUpdate},
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      rootUrl: '',
      upgradeAppInfo: {}, //上传新版本后返回的数据
      showUpdate: false
    };
  },
  mounted() {
    this.rootUrl = process.env.VUE_APP_BASE_URL;
  },
  methods: {
    onAppFinish() {
      this.$EventBus.$emit('app-upgrade');
      this.showUpdate = false;
    },
    platform(str) {
      return formatPlatform(str);
    },
    dateStr(str) {
      return formatDate('yyyy-MM-dd hh:mm', str);
    },
    beforeUpload(file) {
      let isMyApp = false;
      if (this.data.platform == 'ios') {
        isMyApp = file.name.endsWith('.ipa');
      }
      if (this.data.platform == 'android') {
        isMyApp = file.name.endsWith('.apk');
      }
      if (!isMyApp) {
        this.$message({
          message: this.data.platform == 'ios' ? '请上传ipa！' : '请上传apk！',
          type: 'error'
        });
      }
      return isMyApp;
    },
    onProgress(event, file, filelist) {
      console.log(event);
    },
    myUpload(file) {
      let fd = new FormData();
      fd.append('file', file.file);
      request({
        url: '/app/upload',
        method: 'post',
        headers: {'Content-Type': 'multipart/form-data'},
        data: fd
      }).then((resp) => {
        const data = resp.data;
        if (data.code == 200) {
          if (data.body.bundleId != this.data.bundleId) {
            this.$message({
              message: '上传的版本不属于本App',
              type: 'error'
            });
          } else {
            this.upgradeAppInfo = data.body;
            this.showUpdate = true;
          }
        }
      });
    }
  }
};
</script>


<style lang="scss" scoped>
.info {
  @include flexStart;
  padding: 20px;
  align-items: stretch;

  .attrs {
    @include flexAround;
    flex-direction: column;
    align-items: stretch;
    min-height: 120px;
    margin-left: 10px;
    flex-grow: 1;
  }
  .appaction {
    @include flexStart;
    flex-direction: column;
  }

  ::v-deep .el-upload-list__item,
  .el-upload-list {
    visibility: hidden;
  }
}
.appdesc {
  margin: 10px 20px 0px 150px;
}
</style>