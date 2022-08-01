import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import settings from './modules/settings'
import user from './modules/user'
import app from './modules/app'
import device from './modules/device'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    device,
    settings,
    user,
    app,
  },
  getters
})

export default store
