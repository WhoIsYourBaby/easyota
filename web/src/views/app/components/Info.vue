<template>
  <el-card shadow="hover">
    <div class="info">
      <div class="appaction">
        <el-image
          style="width: 168px; height: 168px"
          :src="data.icon"
          fit="fill"
        ></el-image>
      </div>
      <div class="attrs">
        <subtitle>{{ data.name }}</subtitle>
        <div>
          <el-link type="info" :href="data.shortUrl" target="_blank">
            {{ data.shortUrl }}
          </el-link>
        </div>
        <text-body>{{ data.bundleId }}</text-body>
        <text-body>{{ platform(data.platform) }}</text-body>
        <div class="tow-buttons">
          <el-upload
            :before-upload="beforeUpload"
            :show-file-list="false"
            :http-request="myUpload"
            action=""
            v-loading="loading"
            :element-loading-text="loadingText"
            style="margin-right: 12px"
          >
            <el-button size="mini" type="primary">更新</el-button>
          </el-upload>
          <el-button size="mini" type="primary" @click="onAppEditClick">
            编辑
          </el-button>
        </div>
      </div>
      <vue-qr
        class="bicode"
        :text="data.shortUrl || ''"
        :size="168"
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
    <app-edit :data="data" :visible.sync="showEdit"></app-edit>
  </el-card>
</template>

<script>
import VueQr from 'vue-qr';
import {formatPlatform, formatDate} from '@/utils/validate';
import request from '@/utils/request';
import AppUpdate from '@/components/AppUpdate';
import AppEdit from '@/components/AppEdit';
export default {
  components: {VueQr, AppUpdate, AppEdit},
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      upgradeAppInfo: {}, //上传新版本后返回的数据
      showUpdate: false,
      loading: false,
      loadingText: '',
      showEdit: false
    };
  },
  mounted() {},
  methods: {
    onAppEditClick() {
      this.showEdit = true;
    },
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
    myUpload(file) {
      let fd = new FormData();
      fd.append('file', file.file);
      this.loading = true;
      request({
        url: '/app/upload',
        method: 'post',
        headers: {'Content-Type': 'multipart/form-data'},
        data: fd,
        onUploadProgress: (event) => {
          const percent = (event.loaded / event.total) * 100;
          const loadingText = `${parseInt(percent)}% 上传中...`;
          this.loadingText = loadingText;
        }
      })
        .then((resp) => {
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
        })
        .finally(() => {
          this.loading = false;
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

    .tow-buttons {
      @include flexStart;
    }
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
