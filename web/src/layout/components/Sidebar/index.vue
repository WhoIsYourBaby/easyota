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
        />
        <el-divider></el-divider>
        <sidebar-item
          v-for="route in transformToRoutes(appList)"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import variables from '@/styles/variables.scss';
import apiApp from '@/api/app';
import Layout from '@/layout';

export default {
  components: {SidebarItem, Logo},
  data() {
    return {
      appList: []
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
      console.log(appList);
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
    }
  }
};
</script>
