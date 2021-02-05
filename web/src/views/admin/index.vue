<template>
  <div class="admin-container">
    <div v-if="user.type == 'admin'">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="活动名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="允许注册">
          <el-switch v-model="form.delivery"></el-switch>
        </el-form-item>
        <el-form-item label="存储方式">
          <el-radio-group v-model="form.store">
            <el-radio label="local">本地存储</el-radio>
            <el-radio label="qiniu">七牛云OSS</el-radio>
            <el-radio label="ali">阿里云OSS</el-radio>
            <el-radio label="tecent">腾讯云COS</el-radio>
          </el-radio-group>
        </el-form-item>
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

export default {
  computed: {
    ...mapState({
      user: (state) => state.user
    })
  },
  data() {
    return {
      form: {
        name: '',
        store: 'local',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
    };
  },
  methods: {
    onSubmit() {}
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