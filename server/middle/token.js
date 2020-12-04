const jwt = require('jsonwebtoken');

const key = 'easyota0';
module.exports.key = key;
module.exports.verify = async (ctx, next) => {
  const token = ctx.header.authorization;
  if (!!token) {
    try {
      let payload = jwt.verify(token.split(' ')[1], key);
      let user = await userModels.getUserByName(payload.username);
      if (!!user) {
        ctx.state.user = user;
      } else {
        ctx.body = {
          code: -1000,
          msg: '认证失败',
          body: err
        };
      }
    } catch (err) {
      ctx.body = {
        code: -1000,
        msg: '认证失败',
        body: err
      };
    }
  }
  await next();
};
