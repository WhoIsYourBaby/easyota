import request from '@/utils/request';

const app = {
  getList() {
    return request({
      url: '/app/list',
      method: '',
    });
  }
};

export default app;
