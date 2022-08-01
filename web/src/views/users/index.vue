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
        <el-button type="primary" size="small" @click="onAddUser">创建用户</el-button>
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="this.size"
          :current-page="this.page"
          @current-change="onPageChanged"
        ></el-pagination>
      </div>
      <el-dialog title="新建用户" :visible.sync="isAddingUser">
        <el-form :model="userAdded">
          <el-form-item label="登录邮箱">
            <el-input v-model="userAdded.email"></el-input>
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="userAdded.nickname"></el-input>
          </el-form-item>
          <el-form-item label="上传头像">
            <el-upload
              class="avatar-uploader"
              action="https://jsonplaceholder.typicode.com/posts/"
              :show-file-list="false"
              :on-success="onAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="userAdded.avatar" :src="userAdded.avatar" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="isAddingUser = false">取 消</el-button>
          <el-button type="primary" @click="onAddUserSubmit">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <div v-else>你没有权限访问超级管理员功能</div>
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
      total: 0,
      isAddingUser: false,
      userAdded: {
        email: null,
        nickname: null,
        avatar: null
      }
    };
  },
  mounted() {
    this.fetchUserList(1);
  },
  methods: {
    beforeAvatarUpload(file) {
      const isAllowType = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isAllowType) {
        this.$message.error('上传头像图片只能是 JPG 或者 PNG 格式!');
      }
      if (!isLt10M) {
        this.$message.error('上传头像图片大小不能超过 10MB!');
      }
      return isAllowType && isLt10M;
    },
    onAvatarSuccess(res, file) {
      console.log(file);
    },
    //创建用户提交按钮
    onAddUserSubmit() {
      this.isAddingUser = false;
    },
    onAddUser() {
      this.isAddingUser = true;
    },
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
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>