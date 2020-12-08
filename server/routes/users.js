const router = require('koa-router')();
const mysql = require('mysql');
const dbhealper = require('../utils/dbhealper');
const jwt = require('jsonwebtoken');

router.prefix('/users');

router.post('/login', async (ctx, next) => {
  const qbody = ctx.request.body;
  const email = qbody.email;
  const password = qbody.password;
  const conn = mysql.createConnection(dbhealper.config);
  conn.connect();
  const query = 'select * from user where email=? and password=?;';
  const users = await dbhealper.makePromise(conn, query, [email, password]);
  if (users.length > 0) {
    const us = users[0];
    const payload = {
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      id: us.id,
      type: us.type,
      email: us.email
    };
    const token = jwt.sign(payload, 'easyota0');
    ctx.set('Authorization', 'Bearer ' + token);
    ctx.body = {code: 200, msg: 'ok', body: us};
  } else {
    ctx.body = {code: 407, msg: '您没有相应权限', body: null};
  }
});

router.post('/register', async (ctx, next) => {
  const qbody = ctx.request.body;
  const email = qbody.email;
  const password = qbody.password;
  const nickname = qbody.nickname;
  const conn = mysql.createConnection(dbhealper.config);
  conn.connect();
  const query = 'select * from user where email=?;';
  const users = await dbhealper.makePromise(conn, query, [email]);
  if (users.length > 0) {
    ctx.body = {code: 500, msg: '该邮箱地址已被他人注册', body: null};
  } else {
    const type = 'user';
    const insert = 'insert into user (email, password, nickname, type) values (?, ?, ?, ?)';
    const prom = await dbhealper.makePromise(conn, insert, [email, password, nickname, type]);
    const payload = {
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      id: prom.insertId,
      type: type,
      email: email
    };
    const token = jwt.sign(payload, 'easyota0');
    ctx.set('Authorization', 'Bearer ' + token);
    ctx.body = {
      code: 200,
      msg: '注册成功',
      body: {
        id: prom.insertId,
        email: email,
        nickname: nickname,
        type: type
      }
    };
  }
});

router.get('/list', async (ctx, next) => {
  const user = ctx.state.user;
  if (user.type === 'admin') {
    const conn = mysql.createConnection(dbhealper.config);
    conn.connect();
    const chaptersQuery = 'select * from user;';
    const apps = await dbhealper.makePromise(conn, chaptersQuery);
    ctx.body = {
      code: 200,
      msg: 'ok',
      body: apps
    };
  } else {
    ctx.body = {code: 403, msg: '您没有相应权限', body: null};
  }
});

module.exports = router;
