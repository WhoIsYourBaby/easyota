import request from '@/utils/request';

const app = {
  fetchList() {
    return request({
      url: '/app/list',
      method: 'get',
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
  }
};

export default app;
