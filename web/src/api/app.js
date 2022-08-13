import request from '@/utils/request';

const app = {
  fetchList() {
    return request({
      url: '/app/list',
      method: 'get'
    });
  },

  /**
   *
   * @param {appId} appId
   */
  fetchApp(appId) {
    const params = {appId: appId};
    return request({
      url: '/app',
      method: 'get',
      params
    });
  },

  create(data) {
    return request({
      url: '/app/create',
      method: 'post',
      data
    });
  },
  update(data) {
    return request({
      url: '/app/update',
      method: 'post',
      data
    });
  },
  fetchVersionList(appId, page, size) {
    const params = {appId: appId, page: page, size: size};
    return request({
      url: '/app/version/list',
      method: 'get',
      params
    });
  },
  versionCreate(data) {
    return request({
      url: '/app/version/create',
      method: 'post',
      data
    });
  },
  //vdesc/branch/verId
  versionUpdate(data) {
    return request({
      url: '/app/version/update',
      method: 'post',
      data
    });
  },
  //verId
  versionDelete(verId) {
    const data = {verId: verId};
    return request({
      url: '/app/version/delete',
      method: 'post',
      data
    });
  },
  //verId
  versionDefault(data) {
    return request({
      url: '/app/version/default',
      method: 'post',
      data
    });
  },
  release(data) {
    return request({
      url: '/app/release',
      method: 'get',
      params: data
    });
  },
  delete(appId) {
    return request({
      url: '/app/delete',
      method: 'post',
      data: {
        appId: appId
      }
    });
  }
};

export default app;
