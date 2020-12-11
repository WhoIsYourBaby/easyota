import { getToken } from "@/utils/auth"

const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => getToken(),
}
export default getters
