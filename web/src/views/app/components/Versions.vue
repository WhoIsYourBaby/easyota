<template>
  <div>
    <el-timeline>
      <el-timeline-item
        v-for="(item, index) in versionList"
        placement="top"
        :key="index"
        :timestamp="
          item.isDefault
            ? formatDate(item.createTime) + '  (默认下载版本)'
            : formatDate(item.createTime)
        "
      >
        <div @mouseenter="hoverIndex = index" @mouseleave="hoverIndex = null">
          <el-card>
            <div class="first-line">
              <main-title>{{ item.version }} ( build {{ item.build }} )</main-title>
              <el-button
                type="primary"
                :icon="item.isDefault ? `el-icon-star-off` : `el-icon-star-on`"
                circle
                size="small"
                v-show="index == hoverIndex || item.isDefault"
                @click="onTopClick(item)"
              ></el-button>
            </div>
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
              <el-popconfirm title="确定删除这个版本吗？" @onConfirm="onDeleteClick(item)">
                <el-button
                  slot="reference"
                  type="primary"
                  icon="el-icon-delete"
                  size="small"
                ></el-button>
              </el-popconfirm>
            </el-button-group>
          </el-card>
        </div>
      </el-timeline-item>
    </el-timeline>
    <el-button v-if="!isPageEnd" type="info" round style="margin-left: 70px" @click="loadMore">
      加载更多版本
    </el-button>
    <version-update
      :data="editVersion"
      :visible="isEditing"
      @on-finish="onVersionEdited"
    ></version-update>
  </div>
</template>

<script>
import apiApp from '@/api/app';
import {formatDate} from '@/utils/validate';
import VersionUpdate from './VersionUpdate';
export default {
  components: {
    VersionUpdate
  },
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
      branch: 'alpha',
      hoverIndex: null,
      editVersion: {},
      isEditing: false
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
    //app-upgrade
    this.$EventBus.$on('app-upgrade', () => {
      this.fetchVersionList(1);
    });
  },
  methods: {
    onVersionEdited(verData) {
      if (verData) {
        const index = this.versionList.findIndex((item) => {
          return item.id == verData.id;
        });
        this.versionList.splice(index, 1, verData);
      }
      this.isEditing = false;
    },
    onTopClick(item) {
      apiApp.versionDefault({appId: item.appId, verId: item.id}).then((resp) => {
        if (resp.data && resp.data.code == 200) {
          this.fetchVersionList(1);
        }
      });
    },
    onLinkClick(item) {
      console.log(item);
    },
    onDeleteClick(item) {
      apiApp.versionDelete(item.id).then((resp) => {
        if (resp.data.code == 200) {
          this.fetchVersionList(1);
        }
      });
    },
    onEditClick(item) {
      console.log(item);
      this.editVersion = item;
      this.isEditing = true;
    },
    onDownloadClick(item) {
      window.open(item.binUrl);
    },
    onVersionChanged(item) {
      const params = {
        verId: item.id,
        vdesc: item.vdesc,
        branch: item.branch
      };
      apiApp.versionUpdate(params);
    },
    loadMore() {
      this.fetchVersionList(this.page + 1);
    },
    fetchVersionList(page) {
      if (this.appId == undefined) {
        return;
      }
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
.first-line {
  @include flexBetween;
  align-items: flex-start;
  height: 24px;
}
</style>