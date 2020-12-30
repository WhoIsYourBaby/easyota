<template>
  <div :class="{'has-logo': showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
          :isCollapse="isCollapse"
        />
        <el-divider></el-divider>
        <sidebar-item
          v-for="route in transformToRoutes(appList)"
          :key="route.path"
          :item="route"
          :base-path="route.path"
          :isCollapse="isCollapse"
        />
        <div class="myupload">
          <el-upload
            :before-upload="beforeUpload"
            :http-request="myUpload"
            :on-progress="onProgress"
            action="https://jsonplaceholder.typicode.com/posts/"
          >
            <el-button size="medium" type="primary" style="width: 170px">点击上传ipa/apk</el-button>
          </el-upload>
        </div>
      </el-menu>
    </el-scrollbar>
    <app-update :data="appInfo" :visible="this.showUpdate" @on-finish="showUpdate = false;"></app-update>
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import variables from '@/styles/variables.scss';
import apiApp from '@/api/app';
import Layout from '@/layout';
import request from '@/utils/request';
import AppUpdate from '@/views/app/components/AppUpdate';

export default {
  components: {SidebarItem, Logo, AppUpdate},
  data() {
    return {
      appList: [],
      isUploading: false,
      uploadText: '点击上传ipa/apk',
      showUpdate: false,
      showNewApp: false,
      appInfo: {}
    };
  },
  computed: {
    ...mapState({
      settings: (state) => state.settings
    }),
    routes() {
      return this.$router.options.routes;
    },
    activeMenu() {
      const route = this.$route;
      const {meta, path} = route;
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.settings.sidebar.opened;
    }
  },
  created() {
    this.fetchAppList();
  },
  methods: {
    fetchAppList() {
      apiApp.fetchList().then((resp) => {
        this.appList = resp.data.body;
      });
    },
    transformToRoutes(appList) {
      const routes = appList.map((e) => {
        return {
          path: `/app/${e.id}`,
          component: Layout,
          children: [
            {
              path: `/app/${e.id}`,
              name: e.name,
              component: () => import('@/views/app/index'),
              meta: {title: e.name, icon: e.icon, app: true, platform: e.platform}
            }
          ]
        };
      });
      return routes;
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
    onProgress(event, file, filelist) {
      console.log(event);
    },
    onAppFinish(isNew) {
      if (isNew) {
        this.fetchAppList();
      } else {
        //刷新相应app版本列表
      }
      this.showUpdate = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.myupload {
  padding: 10px 0px 0px 20px;

  ::v-deep .el-upload-list__item {
    visibility: hidden;
  }
}
</style>