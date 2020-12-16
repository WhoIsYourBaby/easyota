<template>
  <el-card shadow="hover">
    <el-row>
      <el-col style="min-width: 100px; max-width: 100px">
        <el-image style="width: 100px; height: 100px" :src="data.icon" fit="fill"></el-image>
        <div class="info-name">{{ data.name }}</div>
      </el-col>
      <el-col style="min-width: 100px; max-width: 100px">
        <div></div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: null
    }
  }
};
</script>


<style lang="scss" scoped>
.info {
  &-name {
    text-align: center;
    max-width: 100px;
  }
  &-attr-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>