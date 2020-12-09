const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('koa2-cors');
const koajwt = require('koa-jwt');

const index = require('./routes/index');
const users = require('./routes/users');
const appRoute = require('./routes/app');

const dbconn = require('./middle/dbconn');

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// error handler
onerror(app);
app.use(cors());

//全局接口生成一个sqlconn
//并在接口最后关闭sqlconn
app.use(
  dbconn().unless({
    path: []
  })
);

//middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  })
);
app.use(json());
app.use(logger());
const publicPath = __dirname + '/public';
app.use(require('koa-static')(publicPath));

app.use(
  views(__dirname + '/views', {
    extension: 'pug'
  })
);

/*生产环境放开
app.use((ctx, next) => {
  return next().catch((err) => {
    console.log(JSON.stringify(err));
    ctx.body = {
      code: err.status,
      msg: err.message,
      body: err
    };
  });
});
*/
// token处理
// koajwt会自动解析token并放入ctx.state.user
const tokenKey = 'easyota0';
app.use(
  koajwt({
    secret: tokenKey
  }).unless({
    path: ['/users/login', '/users/register']
  })
);

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(appRoute.routes(), appRoute.allowedMethods());

// error-handling
/*
app.on('error', (err, ctx) => {
  ctx.body = {
    code: err.status,
    msg: err.message,
    body: err
  };
});
*/

module.exports = app;
