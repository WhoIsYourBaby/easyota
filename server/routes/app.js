const router = require('koa-router')();
const dbhealper = require('../utils/dbhealper');

router.prefix('/app');

router.get('/list', async (ctx, next) => {
  const user = ctx.state.user;
  let query;
  if (user.type === 'admin') {
    query = 'select * from app;';
  } else {
    query = 'select * from app where user_id=?';
  }
  const apps = await dbhealper.makePromise(ctx.state.sqlconn, query, [user.id]);
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: apps
  };
});

router.post('/upload', async (ctx, next) => {
  
});

module.exports = router;
