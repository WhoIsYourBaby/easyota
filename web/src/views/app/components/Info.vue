<template>
  <el-card shadow="hover">
    <div class="info">
      <el-image style="width: 120px; height: 120px" :src="data.icon" fit="fill"></el-image>
      <div class="attrs">
        <subtitle>中电达康</subtitle>
        <text-body>https://www.baidu.com</text-body>
        <text-body>{{ data.bundleId }}</text-body>
        <text-body>{{ platform(data.platform) }}</text-body>
        <text-body>{{ dateStr(data.createTime) }}</text-body>
      </div>
      <el-image style="width: 120px; height: 120px" :src="data.icon" fit="fill"></el-image>
    </div>
  </el-card>
</template>

<script>
import {formatPlatform, formatDate} from '@/utils/validate';
export default {
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  methods: {
    platform(str) {
      return formatPlatform(str);
    },
    dateStr(str) {
      return formatDate('yyyy-MM-dd hh:mm', str);
    }
  }
};
</script>


<style lang="scss" scoped>
.info {
  @include flexStart;
  padding: 20px;
  align-items: stretch;

  .attrs {
    @include flexAround;
    flex-direction: column;
    align-items: stretch;
    min-height: 120px;
    margin-left: 10px;
    flex-grow: 1;
  }
}
</style>