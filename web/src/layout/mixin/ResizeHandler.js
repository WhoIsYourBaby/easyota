import store from '@/store'

const { body } = document
const WIDTH = 600 // 手机和桌面的界定标准宽度

export default {
  beforeMount() {
    window.addEventListener('resize', this.$_resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.$_resizeHandler)
  },
  mounted() {
    const isMobile = this.$_isMobile()
    if (isMobile) {
      store.dispatch('settings/toggleDevice', 'mobile')
    } else {
      store.dispatch('settings/toggleDevice', 'desktop')
    }
  },
  methods: {
    // use $_ for mixins properties
    // https://vuejs.org/v2/style-guide/index.html#Private-property-names-essential
    $_isMobile() {
      const rect = body.getBoundingClientRect()
      return rect.width - 1 < WIDTH
    },
    $_resizeHandler() {
      if (!document.hidden) {
        const isMobile = this.$_isMobile()
        store.dispatch('settings/toggleDevice', isMobile ? 'mobile' : 'desktop')
      }
    }
  }
}
