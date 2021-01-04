<template>
  <div>
    <el-timeline>
      <el-timeline-item
        v-for="(item, index) in versionList"
        :timestamp="formatDate(item.createTime)"
        placement="top"
        :key="index"
      >
        <el-card>
          <main-title>{{ item.version }} ( build {{ item.build }} )</main-title>
          <p>
            <text-body>{{ item.vdesc }}</text-body>
          </p>
          <div style="margin-bottom: 16px">
            <el-radio-group v-model="item.branch" size="small" @change="onVersionChanged(item)">
              <el-radio-button label="alpha"></el-radio-button>
              <el-radio-button label="beta"></el-radio-button>
              <el-radio-button label="rc"></el-radio-button>
            </el-radio-group>
          </div>
          <el-button-group>
            <el-button
              @click="onEditClick(item)"
              type="primary"
              icon="el-icon-edit"
              size="small"
            ></el-button>
            <el-button
              @click="onDownloadClick(item)"
              type="primary"
              icon="el-icon-download"
              size="small"
            ></el-button>
            <el-button
              @click="onLinkClick(item)"
              type="primary"
              icon="el-icon-link"
              size="small"
            ></el-button>
            <el-button
              @click="onDeleteClick(item)"
              type="primary"
              icon="el-icon-delete"
              size="small"
            ></el-button>
          </el-button-group>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <el-button v-if="!isPageEnd" type="info" round style="margin-left: 70px" @click="loadMore">
      加载更多版本
    </el-button>
  </div>
</template>

<script>
import apiApp from '@/api/app';
import {formatDate} from '@/utils/validate';
export default {
  props: {
    appId: {
      type: Number
    }
  },
  data() {
    return {
      versionList: [],
      page: 1,
      size: 10,
      isPageEnd: true,
      branch: 'alpha'
    };
  },
  watch: {
    appId(val) {
      if (val) {
        this.fetchVersionList(1);
      }
    }
  },
  mounted() {
    if (this.versionList.length === 0) {
      this.fetchVersionList(1);
    }
  },
  methods: {
    onLinkClick(item) {},
    onDeleteClick(item) {
      apiApp.versionDelete(item.id).then((resp) => {
        if (resp.data.code == 200) {
          this.fetchVersionList(1);
        }
      });
    },
    onEditClick(item) {},
    onDownloadClick(item) {
      window.open(item.binUrl);
    },
    onVersionChanged(item) {
      const params = {
        verId: item.id,
        vdesc: item.vdesc,
        branch: item.branch
      };
      apiApp.versionUpdate(params).then((resp) => {
        if (resp.data.code == 200) {
          this.$message({
            message: '更新成功',
            type: 'success'
          });
        }
      });
    },
    loadMore() {
      this.fetchVersionList(this.page + 1);
    },
    fetchVersionList(page) {
      apiApp.fetchVersionList(this.appId, page, this.size).then((resp) => {
        const data = resp.data;
        if (data.code == 200) {
          if (page == 1) {
            this.versionList = data.body;
          } else {
            this.versionList.push(...data.body);
          }
          this.isPageEnd = data.isPageEnd;
          this.page = page;
        }
      });
    },
    formatDate(value) {
      /*
      const date = value ? new Date(value) : new Date();
      const now = new Date();
      let dist = now - date;
      dist = dist / (1000 * 60); //in munite
      if (dist < 60) {
        return `${Math.floor(dist)}分钟前`;
      }
      dist = dist / 60; //in hour
      if (dist < 24) {
        return `${Math.floor(dist)}小时前`;
      }
      dist = dist / 24; //in day
      if (dist < 3) {
        return `${Math.floor(dist)}天前`;
      }
      */
      return formatDate('yyyy-MM-dd hh:mm', value);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>