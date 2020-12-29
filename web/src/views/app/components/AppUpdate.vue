<template>
  <el-dialog
    :title="data.name"
    :visible.sync="visible"
    width="500px"
    modal-append-to-body
    append-to-body
    :close-on-click-modal="false"
    :before-close="onCancel"
  >
    <div class="app-update-info">
      <el-image style="width: 100px; height: 100px" :src="data.icon" fit="fill"></el-image>
      <div class="app-update-info-name">
        <el-input v-model="vinfo.name"></el-input>
        <text-body style="margin: 10px 0px 30px 0px">
          Version{{ data.version }}+{{ data.build }}
        </text-body>
        <el-input placeholder="短连接" v-model="vinfo.short" style="margin: 0px 0px 30px 0px">
          <template slot="prepend">Http://fir.im</template>
        </el-input>
        <el-input type="textarea" :rows="6" placeholder="更新日志" v-model="vinfo.adesc"></el-input>
      </div>
    </div>
    <span slot="footer" class="app-update-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="onSure">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    data: {type: Object, default: null},
    visible: {type: Boolean, default: false}
  },
  data() {
    return {
      vinfo: this.data
    };
  },
  methods: {
    onCancel() {
      this.$emit('on-finish');
    },
    onSure() {
      // todo: 提交数据
      // 关闭窗口
      this.$emit('on-finish');
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