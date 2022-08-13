import appApi from '@/api/app';

const state = {
  list: []
};

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list;
  }
};

const actions = {
  fetchList({commit}) {
    return appApi.fetchList().then((res) => {
      commit('SET_LIST', res.data.body);
    });
  },
  deleteApp({commit}, appId) {
    return appApi.delete(appId);
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
