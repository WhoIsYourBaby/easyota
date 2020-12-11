import request from '@/utils/request'


const user = {
  /**
   * 
   * @param {email, password} data 
   */
  login(data) {
    return request({
      url: '/user/login',
      method: 'post',
      data
    })
  },
  getUser() {
    return request({
      url: '/user',
      method: 'get',
    })
  },
  /**
   * 注册
   * @param {email, password, avatar, nickname} data 
   */
  register(data) {
    return request({
      url: '/user/register',
      method: 'post',
      data
    });
  }
};

export default user;
