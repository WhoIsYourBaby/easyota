const router = require('koa-router')();
const mysql = require('mysql');
const dbhealper = require('../utils/dbhealper');

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  });
});

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string';
});

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  };
});

router.get('/mysql', async (ctx, next) => {
    console.log(dbhealper.config);
  const conn = mysql.createConnection(dbhealper.config);
  conn.connect();
  const chaptersQuery =
    "select * from app;";
  const apps = await dbhealper.makePromise(conn, chaptersQuery);
  ctx.body = {
      code: 200,
      msg: 'ok',
      body: apps,
  };
});

module.exports = router;
