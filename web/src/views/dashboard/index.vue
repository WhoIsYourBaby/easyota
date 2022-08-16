<template>
  <div class="app-container">
    <div class="flex-grid">
      <div>
        <el-card class="app-card" v-loading="loading" :element-loading-text="loadingText">
          <el-upload :before-upload="beforeUpload" :http-request="myUpload" action="" drag :show-file-list="false">
            <i class="el-icon-upload" style="font-size: 66px"></i>
            <div class="el-upload__text">
              <em>点击上传ipa/apk，不超过200M</em>
            </div>
          </el-upload>
        </el-card>
      </div>
      <div v-for="item in appList" :key="item.id" @click="onAppCardClick(item)">
        <el-card class="app-card">
          <img :src="item.icon" width="80" height="80" />
          <div class="text-row">
            <span class="iconfont" :class="item.platform == 'ios' ? 'icon-ota-ios' : 'icon-ota-android'"></span>
            <span style="margin-left: 4px">{{ item.name }}</span>
          </div>
          <div class="text-row">
            <text-body class="title">短连接:</text-body>
            <text-body class="content">{{ item.shortUrl }}</text-body>
          </div>
          <div class="text-row">
            <text-body class="title">{{ item.platform == 'ios' ? 'BundleID:' : 'PackageName:' }}</text-body>
            <text-body class="content">{{ item.bundleId }}</text-body>
          </div>
          <text-body class="text-desc">{{ item.adesc }}</text-body>
          <el-button @click.stop="onDeleteClick(item)" icon="el-icon-delete" circle class="delete-button"></el-button>
        </el-card>
      </div>
    </div>
    <app-update :data="appInfo" :visible="this.showUpdate" @on-finish="onAppFinish"></app-update>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import request from '@/utils/request';
import AppUpdate from '@/components/AppUpdate.vue';
export default {
  name: 'Dashboard',
  components: { AppUpdate },
  data() {
    return {
      appInfo: {},
      showUpdate: false,
      loading: false,
      loadingText: ''
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.user,
      appList: (state) => {
        return state.app.list;
      }
    })
  },
  created() {
    this.$store.dispatch('app/fetchList');
  },
  methods: {
    onAppCardClick(app) {
      const appId = app.id;
      this.$router.push({
        path: `/app/${appId}`
      });
    },
    async onDeleteClick(item) {
      await this.$store.dispatch('app/deleteApp', item.id);
      await this.$store.dispatch('app/fetchList');
    },
    beforeUpload(file) {
      const isApp = file.name.endsWith('.ipa') || file.name.endsWith('.apk');
      if (!isApp) {
        this.$message({
          message: '请上传ipa或apk！',
          type: 'error'
        });
      }
      return isApp;
    },
    myUpload(file) {
      let fd = new FormData();
      fd.append('file', file.file);
      this.loading = true;
      request({
        url: '/app/upload',
        method: 'post',
        headers: { 'Content-Type': 'multipart/form-data' },
        data: fd,
        onUploadProgress: (event) => {
          const percent = event.loaded / event.total * 100;
          const loadingText = `${parseInt(percent)}% 上传中...`;
          this.loadingText = loadingText;
        }
      }).then((resp) => {
        const data = resp.data;
        if (data.code == 200) {
          this.appInfo = data.body;
          this.showUpdate = true;
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    onAppFinish(isNew) {
      this.$store.dispatch('app/fetchList');
      this.showUpdate = false;
    }
  }
};
</script>
