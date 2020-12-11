import { getToken } from "@/utils/auth"

const getters = {
  sidebar: state => state.settings.sidebar,
  device: state => state.settings.device,
  token: state => getToken(),
}
export default getters
