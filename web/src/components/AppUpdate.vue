<template>
  <el-dialog
    :title="data.name"
    :visible.sync="visible"
    width="500px"
    modal-append-to-body
    append-to-body
    :close-on-click-modal="false"
    :before-close="onCancel"
    destroy-on-close
    @open="onOpen"
  >
    <div class="app-update-info">
      <el-image style="width: 100px; height: 100px" :src="data.icon" fit="fill"></el-image>
      <div class="app-update-info-name">
        <el-input v-model="vinfo.name"></el-input>
        <text-body style="margin: 10px 0px 30px 0px">
          Version{{ data.version }}+{{ data.build }}
        </text-body>
        <el-input placeholder="短连接" v-model="vinfo.short" style="margin: 0px 0px 30px 0px">
          <template slot="prepend">{{ vinfo.shortDomain }}/</template>
        </el-input>
        <el-radio-group
          v-model="vinfo.branch"
          border
          style="margin-bottom: 30px; display: inline-block"
        >
          <el-radio-button label="alpha"></el-radio-button>
          <el-radio-button label="beta"></el-radio-button>
          <el-radio-button label="rc"></el-radio-button>
        </el-radio-group>
        <el-input
          type="textarea"
          :rows="4"
          placeholder="更新日志"
          v-model="vinfo.vdesc"
          style="margin: 0px 0px 30px 0px"
        ></el-input>
        <el-input
          type="textarea"
          :rows="6"
          placeholder="应用介绍"
          v-model="vinfo.adesc"
          v-if="vinfo.isNew"
        ></el-input>
      </div>
    </div>
    <span slot="footer" class="app-update-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="onSure">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import apiApp from '@/api/app';
export default {
  props: {
    data: {type: Object, default: null},
    visible: {type: Boolean, default: false}
  },
  data() {
    return {
      vinfo: this.data,
    };
  },
  methods: {
    onCancel() {
      this.$emit('on-finish');
    },
    onSure() {
      const name = (typeof this.vinfo.name) == 'string' ? this.vinfo.name : this.vinfo.name.toString();
      if (this.vinfo.isNew) {
        const data = {
          name: name,
          short: this.vinfo.short,
          appDesc: this.vinfo.adesc,
          vdesc: this.vinfo.vdesc,
          uploadId: this.vinfo.uploadId,
          icon: this.vinfo.icon,
          manifest: this.vinfo.manifest
        };
        apiApp.create(data).then(this.onResponse);
      } else {
        const data = {
          appId: this.vinfo.appId,
          uploadId: this.vinfo.uploadId,
          name: name,
          short: this.vinfo.short,
          vdesc: this.vinfo.vdesc,
          icon: this.vinfo.icon,
          branch: this.vinfo.branch,
          manifest: this.vinfo.manifest
        };
        apiApp.versionCreate(data).then(this.onResponse);
      }
    },
    onOpen() {
      this.vinfo = this.data;
    },
    onResponse(resp) {
      if (resp.data.code == 200) {
        this.$message({
          message: '创建App版本成功',
          type: 'success'
        });
        // 关闭窗口
        this.$emit('on-finish', this.vinfo.isNew);
      } else {
        this.$message({
          message: '创建App版本失败',
          type: 'error'
        });
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.app-update {
  &-info {
    @include flexStart;
    align-items: flex-start;
    &-name {
      margin-left: 10px;
      margin-top: 10px;
      @include flexStart;
      flex-direction: column;
      align-items: flex-start;
    }
  }
  &-footer {
    margin-right: 60px;
  }
}
</style>