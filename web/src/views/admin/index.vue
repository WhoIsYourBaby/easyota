<template>
  <div class="admin-container">
    <div v-if="user.type == 'admin'">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="允许注册">
          <el-switch v-model="form.allowRegister"></el-switch>
        </el-form-item>
        <el-form-item label="存储方式">
          <el-radio-group v-model="form.store" @change="onStoreChanged">
            <el-radio label="local">本地存储</el-radio>
            <el-radio label="qiniu">七牛云OSS</el-radio>
            <el-radio label="ali">阿里云OSS</el-radio>
            <el-radio label="tecent">腾讯云COS</el-radio>
          </el-radio-group>
        </el-form-item>
        <div>
          <el-form-item label="key">
            <el-input
              v-model="form.oss.key"
              placeholder="Access Key"
              :disabled="form.store == 'local'"
            ></el-input>
          </el-form-item>
          <el-form-item label="secret">
            <el-input
              v-model="form.oss.secret"
              placeholder="Secret Key"
              :disabled="form.store == 'local'"
            ></el-input>
          </el-form-item>
          <el-form-item label="endpoint">
            <el-input
              v-model="form.oss.endpoint"
              placeholder="Endpoint"
              :disabled="form.store == 'local'"
            ></el-input>
          </el-form-item>
          <el-form-item label="bucket">
            <el-input
              v-model="form.oss.bucket"
              placeholder="Bucket"
              :disabled="form.store == 'local'"
            ></el-input>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">立即保存</el-button>
        </el-form-item>
      </el-form>
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
      form: {
        store: 'local',
        allowRegister: false,
        oss: {
          key: null,
          secret: null,
          endpoint: null,
          bucket: null
        }
      }
    };
  },
  methods: {
    onStoreChanged() {
      this.form.oss = {
        key: null,
        secret: null,
        endpoint: null,
        bucket: null
      };
    },
    onSubmit() {
      console.log(this.form);
      request({
        url: '/user/config',
        method: 'post',
        data: this.form
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