<template>
  <div class="mydefault">
    <el-image
      style="width: 120px; height: 120px; margin-top: 120px"
      :src="data.icon"
      fit="fill"
    ></el-image>
    <main-title style="margin-top: 20px">{{ this.data.name }}</main-title>
    <text-label style="margin-top: 20px">
      版本：{{ this.data.version.version }} (build {{ this.data.version.build }})
    </text-label>
    <text-label style="margin-top: 10px">大小：39.1 MB</text-label>
    <text-label style="margin-top: 10px">更新时间：{{ formatDate(this.data.version.createTime) }}</text-label>
  </div>
</template>

<script>
import {formatDate} from '@/utils/validate';
export default {
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  methods: {
    formatDate(value) {
      return formatDate('yyyy-MM-dd hh:mm', value);
    }
  }
};
</script>

<style lang="scss" scoped>
.mydefault {
  @include flexStart;
  align-items: center;
  flex-direction: column;
}
</style>