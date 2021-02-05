<template>
  <div>
    <div v-if="user.type == 'admin'">i am vip</div>
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
  }
};
</script>