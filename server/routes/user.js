'use strict';
const router = require('koa-router')();
const dbhealper = require('../utils/dbhealper');
const adminconfig = require('../utils/adminconfig');
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
        nickname: us.nickname,
        type: us.type,
        avatar: us.avatar
      }
    };
  } else {
    ctx.body = {code: 605, msg: '登录失败，错误的用户名或密码', body: null};
  }
});

router.get('/', async (ctx, next) => {
  const uid = ctx.state.user.id;
  const userInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select email, nickname, avatar, type from user where id=?',
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
  const domain = ctx.request.origin;
  const avatar = qbody.avatar || domain + '/user/avatar.png';
  const query = 'select * from user where email=?;';
  const users = await dbhealper.makePromise(ctx.state.sqlconn, query, [email]);
  if (users.length > 0) {
    ctx.body = {code: 602, msg: '该邮箱地址已被他人注册', body: null};
  } else {
    const type = 'user';
    const insert =
      'insert into user (email, password, nickname, type, avatar) values (?, ?, ?, ?, ?)';
    const insertResult = await dbhealper.makePromise(ctx.state.sqlconn, insert, [
      email,
      password,
      nickname,
      type,
      avatar
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
        nickname: nickname,
        type: type,
        avatar: avatar
      }
    };
  }
});

router.post('/delete', async (ctx, next) => {
  const qbody = ctx.request.body;
  if (ctx.state.user.type != 'admin') {
    ctx.body = {code: 601, msg: '您没有相应权限'};
    return;
  }
  const delId = `${qbody.id}`;
  const delResult = await dbhealper.makePromise(
    ctx.state.sqlconn,
    "delete from user where id=?",
    [delId]
  );
  ctx.body = {
    code: 200,
    msg: `${delResult.affectedRows}条数据被删除`
  };
});

router.get('/list', async (ctx, next) => {
  const user = ctx.state.user;
  if (user.type === 'admin') {
    const qbody = ctx.request.query;
    const page = parseInt(qbody.page || 1);
    const size = parseInt(qbody.size || 10);
    const start = (page - 1) * size;
    const users = await dbhealper.makePromise(
      ctx.state.sqlconn,
      "select id, create_time as createTime, email, nickname, type, avatar from user where type!='admin' limit ?,?;",
      [start, size]
    );
    const ucount = await dbhealper.makePromise(
      ctx.state.sqlconn,
      "select count(*) from user where type!='admin'"
    );
    ctx.body = {
      code: 200,
      msg: 'ok',
      body: users,
      isPageEnd: users.length < size,
      count: ucount[0]['count(*)']
    };
  } else {
    ctx.body = {code: 601, msg: '您没有相应权限', body: null};
  }
});

/**
 * 文件形式存储config
 * 因为是一个公共访问资源
 */
router.post('/config', async (ctx, next) => {
  const user = ctx.state.user;
  if (user.type != 'admin') {
    ctx.body = {
      code: 601,
      msg: '你没有权限'
    };
    return;
  }
  const qbody = ctx.request.body;
  adminconfig.setConfig(qbody);
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: qbody
  };
});

router.get('/config', async (ctx, next) => {
  const config = adminconfig.getConfig();
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: config
  };
});

module.exports = router;
