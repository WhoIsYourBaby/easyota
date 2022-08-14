<template>
  <el-dialog
    :title="`Version${vinfo.version}+${vinfo.build}`"
    :visible.sync="visible"
    width="500px"
    modal-append-to-body
    append-to-body
    :close-on-click-modal="false"
    :before-close="onCancel"
    destroy-on-close
    @open="onOpen"
  >
    <div class="version-update-info">
      <el-input
        type="textarea"
        :rows="4"
        placeholder="更新日志"
        v-model="vinfo.vdesc"
        style="margin: 0px 0px 30px 0px"
      ></el-input>
    </div>
    <span slot="footer" class="version-update-footer">
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
      vinfo: {}
    };
  },
  methods: {
    onCancel() {
      this.$emit('on-finish');
    },
    onSure() {
      apiApp
        .versionUpdate({
          vdesc: this.vinfo.vdesc,
          branch: this.vinfo.branch,
          verId: this.vinfo.id
        })
        .then(this.onResponse);
    },
    onOpen() {
      
      this.vinfo = JSON.parse(JSON.stringify(this.data));
    },
    onResponse(resp) {
      if (resp.data.code == 200) {
        this.$message({
          message: '更新成功',
          type: 'success'
        });
        // 关闭窗口，将更新后的数据回调
        this.$emit('on-finish', this.vinfo);
      } else {
        this.$message({
          message: '更新失败',
          type: 'error'
        });
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.version-update {
  &-info {
    margin-left: 10px;
    margin-top: 10px;
    @include flexStart;
    flex-direction: column;
    align-items: flex-start;
  }
  &-footer {
    margin-right: 60px;
  }
}
</style>