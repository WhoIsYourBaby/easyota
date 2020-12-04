const router = require('koa-router')();
const mysql = require('mysql');
const dbhealper = require('../utils/dbhealper');
const jwt = require('jsonwebtoken');

router.prefix('/users');

router.post('/login', async (ctx, next) => {
  const qbody = ctx.request.body;
  const email = qbody.email;
  const secret = qbody.password;
  const conn = mysql.createConnection(dbhealper.config);
  conn.connect();
  const query = 'select * from user where email=? and secret=?;';
  const users = await dbhealper.makePromise(conn, query);
  if (users.length > 0) {
    const token = jwt.sign(users[1], 'easyota0', { expiresIn: '24h' });
    ctx.response.header.Authentication = token;
    ctx.body = {code: 1, msg: 'ok', body: users[1]};
  } else {
    ctx.body = {code: 1, msg: 'user not exist', body: null};
  }
});

router.get('/list', async (ctx, next) => {
  const conn = mysql.createConnection(dbhealper.config);
  conn.connect();
  const chaptersQuery = 'select * from user;';
  const apps = await dbhealper.makePromise(conn, chaptersQuery);
  ctx.body = {
    code: 1,
    msg: 'ok',
    body: apps
  };
});

module.exports = router;
