const getters = {
  sidebar: state => state.settings.sidebar,
  device: state => state.settings.device,
  avatar: state => state.user.avatar,
  name: state => state.user.nickname
}
export default getters
