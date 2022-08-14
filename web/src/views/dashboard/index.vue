<template>
  <div class="app-container">
    <div class="flex-grid">
      <div>
        <el-card>
          <el-upload :before-upload="beforeUpload" :http-request="myUpload" action="" drag>
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
            <span
              class="iconfont"
              :class="item.platform == 'ios' ? 'icon-ota-ios' : 'icon-ota-android'"
            ></span>
            <span style="margin-left: 4px">{{ item.name }}</span>
          </div>
          <div class="text-row">
            <div class="title">短连接:</div>
            <div class="content">{{ item.shortUrl }}</div>
          </div>
          <div class="text-row">
            <div class="title">{{ item.platform == 'ios' ? 'BundleID:' : 'PackageName:' }}</div>
            <div class="content">{{ item.bundleId }}</div>
          </div>
          <div class="text-desc">{{ item.adesc }}</div>
          <el-button
            @click.stop="onDeleteClick(item)"
            icon="el-icon-delete"
            circle
            class="delete-button"
          ></el-button>
        </el-card>
      </div>
    </div>
    <app-update :data="appInfo" :visible="this.showUpdate" @on-finish="onAppFinish"></app-update>
  </div>
</template>

<script>
import {mapState} from 'vuex';
import AppCard from './components/AppCard.vue';
import request from '@/utils/request';
import AppUpdate from '@/components/AppUpdate.vue';
export default {
  name: 'Dashboard',
  components: {AppCard, AppUpdate},
  data() {
    return {
      appInfo: {},
      showUpdate: false
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
    onUploadClick() {
      console.log('aaaa');
    },
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
      request({
        url: '/app/upload',
        method: 'post',
        headers: {'Content-Type': 'multipart/form-data'},
        data: fd
      }).then((resp) => {
        const data = resp.data;
        if (data.code == 200) {
          this.appInfo = data.body;
          this.showUpdate = true;
        }
      });
    },
    onAppFinish(isNew) {
      if (isNew) {
        this.$store.dispatch('app/fetchList');
      } else {
        this.$EventBus.$emit('app-upgrade');
      }
      this.showUpdate = false;
    }
  }
};
</script>
