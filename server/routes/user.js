'use strict';
const router = require('koa-router')();
const dbhealper = require('../utils/dbhealper');
const jwt = require('jsonwebtoken');

router.prefix('/user');

router.post('/login', async (ctx, next) => {
  const qbody = ctx.request.body;
  const email = qbody.email;
  const password = qbody.password;
  const query = 'select * from user where email=? and password=?;';
  const users = await dbhealper.makePromise(ctx.state.sqlconn, query, [email, password]);
  if (users.length > 0) {
    const us = users[0];
    const payload = {
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      id: us.id,
      type: us.type,
      email: us.email
    };
    const token = jwt.sign(payload, 'easyota0');
    ctx.set('authorization', 'Bearer ' + token);
    ctx.set('Access-Control-Expose-Headers', 'authorization');
    ctx.body = {
      code: 200,
      msg: 'ok',
      body: {
        email: us.email,
        nickname: us.nickname
      }
    };
  } else {
    ctx.body = {code: 403, msg: '登录失败，错误的用户名或密码', body: null};
  }
});

router.get('/', async (ctx, next) => {
  const uid = ctx.state.user.id;
  const userInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select email, nickname from user where id=?',
    [uid]
  );
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: userInDb.length > 0 ? userInDb[0] : null
  };
});

router.post('/register', async (ctx, next) => {
  const qbody = ctx.request.body;
  const email = qbody.email;
  const password = qbody.password;
  const nickname = qbody.nickname;
  const query = 'select * from user where email=?;';
  const users = await dbhealper.makePromise(ctx.state.sqlconn, query, [email]);
  if (users.length > 0) {
    ctx.body = {code: 500, msg: '该邮箱地址已被他人注册', body: null};
  } else {
    const type = 'user';
    const insert = 'insert into user (email, password, nickname, type) values (?, ?, ?, ?)';
    const insertResult = await dbhealper.makePromise(ctx.state.sqlconn, insert, [
      email,
      password,
      nickname,
      type
    ]);
    const payload = {
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      id: insertResult.insertId,
      type: type,
      email: email
    };
    const token = jwt.sign(payload, 'easyota0');
    ctx.set('authorization', 'Bearer ' + token);
    ctx.body = {
      code: 200,
      msg: '注册成功',
      body: {
        email: email,
        nickname: nickname
      }
    };
  }
});

router.get('/list', async (ctx, next) => {
  const user = ctx.state.user;
  if (user.type === 'admin') {
    const chaptersQuery = 'select id, create_time as createTime, email, nickname, type from user;';
    const users = await dbhealper.makePromise(ctx.state.sqlconn, chaptersQuery);
    ctx.body = {
      code: 200,
      msg: 'ok',
      body: users
    };
  } else {
    ctx.body = {code: 403, msg: '您没有相应权限', body: null};
  }
});

module.exports = router;
