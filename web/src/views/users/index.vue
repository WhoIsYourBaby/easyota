<template>
  <div class="admin-container">
    <div v-if="user.type == 'admin'">
      <el-table :data="userList" stripe style="width: 100%" height="578">
        <el-table-column prop="email" label="登录邮箱"></el-table-column>
        <el-table-column prop="nickname" label="昵称"></el-table-column>
        <el-table-column prop="type" label="类型"></el-table-column>
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <div>{{ formatDate(scope.row.createTime) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="onUserDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="admin-bottom">
        <el-button type="primary" size="small">创建用户</el-button>
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="this.size"
          :current-page="this.page"
          @current-change="onPageChanged"
        ></el-pagination>
      </div>
    </div>
    <div v-else>i am normal</div>
  </div>
</template>

<script>
import {mapState} from 'vuex';
import request from '@/utils/request';
import {formatDate} from '@/utils/validate';
export default {
  computed: {
    ...mapState({
      user: (state) => state.user
    })
  },
  data() {
    return {
      userList: [],
      page: 1,
      size: 10,
      total: 0
    };
  },
  mounted() {
    this.fetchUserList(1);
  },
  methods: {
    onUserDelete(user) {
      this.$confirm(`确定要删除${user.email}这个用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/user/delete',
          method: 'post',
          data: {
            id: user.id
          }
        }).then((res) => {
          if (res.code == 200) {
            this.$message({
              type: 'success',
              message: '设定成功'
            });
          }
          this.fetchUserList(this.page);
        });
      });
    },
    onPageChanged(currentPage) {
      this.fetchUserList(currentPage);
    },
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
    },
    fetchUserList(page) {
      request({
        url: '/user/list',
        method: 'get',
        params: {
          page: page,
          size: this.size
        }
      }).then((res) => {
        this.userList = res.data.body;
        this.page = page;
        this.total = res.data.count;
      });
    },
    formatDate(value) {
      return formatDate('yyyy-MM-dd hh:mm', value);
    }
  }
};
</script>

<style lang="scss" scoped>
.admin {
  &-container {
    margin: 30px;
  }

  &-bottom {
    padding-top: 20px;
    @include flexBetween;
    flex-direction: row;
  }
}
</style>