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
          <h4>更新 Github 模板</h4>
          <p>王小虎 提交于 2018/4/12 20:46</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <el-button v-if="!isPageEnd" type="info" round style="margin-left: 70px">
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
      isPageEnd: false
    };
  },
  watch: {
    appId(val) {
      if (val) {
        this.fetchVersionList(1);
      }
    }
  },
  methods: {
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
      return formatDate('yyyy-MM-dd hh:mm', date);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>