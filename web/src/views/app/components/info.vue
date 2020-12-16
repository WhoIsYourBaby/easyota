<template>
  <el-card shadow="hover">
    <div class="info">
      <el-col style="min-width: 100px; max-width: 100px">
        <el-image style="width: 100px; height: 100px" :src="data.icon" fit="fill"></el-image>
        <div class="info-name">{{ data.name }}</div>
      </el-col>
      <el-col>
        <div class="info-attr-container">
          <div class="info-attr-container-item">{{ platform(data.platform) }}</div>
          <div class="info-attr-container-item">{{ data.createTime }}</div>
          <div class="info-attr-container-item">{{ platform(data.platform) }}</div>
          <div class="info-attr-container-item">{{ platform(data.platform) }}</div>
          <div class="info-attr-container-item">{{ platform(data.platform) }}</div>
          <div class="info-attr-container-item">{{ platform(data.platform) }}</div>
        </div>
      </el-col>
    </div>
  </el-card>
</template>

<script>
import { platformString } from "@/utils/validate";
export default {
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  methods: {
    platform(str) {
      return platformString(str);
    }
  }
};
</script>


<style lang="scss" scoped>
.info {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: 20px;
  &-name {
    text-align: center;
    max-width: 100px;
  }
  &-attr-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 10px;

    &-item {
      min-width: 200px;
      max-width: 200px;
      padding: 8px;
    }
  }
}
</style>