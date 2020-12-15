<template>
  <div v-if="platform == null">
    <svg-icon :icon-class="icon" />
    <span slot="title">{{ title }}</span>
  </div>
  <div v-else>
    
  </div>
</template>


<script>
export default {
  name: 'MenuItem',
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    platform: {
      type: String,
      default: null
    }
  }
  // render(h, context) {
  //   const {icon, title} = context.props;
  //   const vnodes = [];

  //   if (icon) {
  //     if (icon.includes('el-icon')) {
  //       vnodes.push(<i class={[icon, 'sub-el-icon']} />);
  //     } else {
  //       vnodes.push(<svg-icon icon-class={icon} />);
  //     }
  //   }

  //   if (title) {
  //     vnodes.push(<span slot="title">{title}</span>);
  //   }
  //   return vnodes;
  // }
};
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}
</style>
