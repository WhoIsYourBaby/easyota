import apiUser from '@/api/user';
import {getToken, setToken, removeToken} from '@/utils/auth';
import {resetRouter} from '@/router';

const getDefaultState = () => {
  return {
    email: '',
    nickname: '',
    avatar: '',
    type: ''
  };
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: state => {
    Object.assign(state, getDefaultState());
  },
  SET_USER: (state, user) => {
    Object.assign(state, user);
  },
  SET_NICKNAME: (state, nickname) => {
    state.nickname = nickname;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
  SET_EMAIL: (state, email) => {
    state.email = email;
  }
};

const actions = {
  // user login
  login({commit}, userInfo) {
    const {username, password} = userInfo;
    return new Promise((resolve, reject) => {
      apiUser
        .login({email: username.trim(), password: password})
        .then(response => {
          const token = response.headers.authorization;
          commit('SET_USER', response.data.body);
          setToken(token);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // get user info
  getUser({commit}) {
    return new Promise((resolve, reject) => {
      apiUser
        .getUser()
        .then(response => {
          const user = response.data.body;
          commit('SET_USER', user);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // user logout
  logout({commit}) {
    return new Promise((resolve, reject) => {
      removeToken(); // must remove  token  first
      resetRouter();
      commit('RESET_STATE');
      resolve();
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
