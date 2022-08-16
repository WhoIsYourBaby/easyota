<template>
  <el-dialog
    :title="data.name"
    :visible="visible"
    width="500px"
    modal-append-to-body
    append-to-body
    :close-on-click-modal="false"
    :before-close="onCancel"
    :show-close="false"
    destroy-on-close
  >
    <el-form :model="appInfo">
      <el-form-item label="苹果商店">
        <el-input
          placeholder="请输入苹果商店下载链接"
          v-model="appInfo.applestore"
        ></el-input>
      </el-form-item>
      <el-form-item label="安卓商店">
        <el-input
          placeholder="请输入安卓商店下载链接"
          v-model="appInfo.androidstore"
        ></el-input>
      </el-form-item>
      <el-form-item label="应用简介">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="请输入内容"
          v-model="appInfo.adesc"
        ></el-input>
      </el-form-item>
      <el-form-item label="应用截图">
        <div class="pic-layout">
          <el-upload
            :before-upload="beforeUpload"
            :show-file-list="false"
            :http-request="uploadPic"
            action=""
            v-loading="loading"
            :element-loading-text="loadingText"
          >
            <div class="upload-image">
              <i
                class="el-icon-upload"
                style="font-size: 48px; margin-top: 60px"
              ></i>
              <div class="el-upload__text">
                <em>上传应用截图</em>
              </div>
            </div>
          </el-upload>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="onSaveClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from "@/utils/request.js";
export default {
  name: 'AppEdit',
  props: {
    data: {type: Object, default: null},
    visible: {type: Boolean, default: false}
  },
  data() {
    return {
      appInfo: this.data,
      loading: false,
      loadingText: ''
    };
  },
  methods: {
    onSaveClick() {
      this.$emit('update:visible');
    },
    onCancel() {},
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 10;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 或者 PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 10MB!');
      }
      return isJPG && isLt2M;
    },
    uploadPic(file) {
      let fd = new FormData();
      fd.append('file', file.file);
      this.loading = true;
      request({
        url: '/app/upload',
        method: 'post',
        headers: {'Content-Type': 'multipart/form-data'},
        data: fd,
        onUploadProgress: (event) => {
          const percent = (event.loaded / event.total) * 100;
          const loadingText = `${parseInt(percent)}% 上传中...`;
          this.loadingText = loadingText;
        }
      })
        .then((resp) => {
          const data = resp.data;
          if (data.code == 200) {
            const result = data.body;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.pic-layout {
  @include flexStart;
  width: 100%;
  overflow-x: scroll;
}

.upload-image {
  background-color: #fbfdff;
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  width: 150px;
  min-width: 150px;
  height: 250px;
  margin-right: 12px;
}
</style>
