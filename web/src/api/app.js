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
  fetchVersionList(appId) {
    const params = {appId: appId};
    return request({
      url: '/app/version/list',
      method: 'get',
      params
    });
  },
  create(name, short, appDesc, verDesc, uploadId, icon) {
    const data = {
      name: name,
      short: short,
      appDesc: appDesc,
      verDesc: verDesc,
      uploadId: uploadId,
      icon: icon
    };
    return request({
      url: '/app/create',
      method: 'post',
      data
    });
  },
  update(appId, name, short, verDesc) {
    const data = {name: name, short: short, appId: appId, verDesc: verDesc};
    return request({
      url: '/app/update',
      method: 'post',
      data
    });
  }
};

export default app;
