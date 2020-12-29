<template>
  <el-dialog
    title="更新"
    :visible.sync="visible"
    width="280"
    modal-append-to-body
    append-to-body
    :close-on-click-modal="false"
    :before-close="onCancel"
  >
    <span>这是一段信息</span>
    <span slot="footer" class="dialog-footer">
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
</style>