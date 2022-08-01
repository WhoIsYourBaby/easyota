import appApi from "@/api/app";

const state = {
  list: [],
}

const actions = {
  fetchList({commit}) {
    return appApi.fetchList().then(res => {
      console.log(res);
    });
  }
}

export default {
  namespaced: true,
  state,
  actions
}