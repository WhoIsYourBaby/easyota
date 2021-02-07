<template>
  <div class="admin-container">
    <div v-if="user.type == 'admin'">
      <div>i am vip</div>
    </div>
    <div v-else>i am normal</div>
  </div>
</template>

<script>
import {mapState} from 'vuex';
import request from '@/utils/request';

export default {
  computed: {
    ...mapState({
      user: (state) => state.user
    })
  },
  data() {
    return {
      userList: []
    };
  },
  mounted() {
    request({
      url: '/user/config',
      method: 'get'
    }).then((res) => {
      this.form = res.data.body;
    });
  },
  methods: {
    onSubmit() {
      this.$confirm('确定要修改配置项吗？后续系统将使用最新的配置项', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '设定成功'
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.admin {
  &-container {
    margin: 30px;
  }
}
</style>