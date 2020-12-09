const router = require('koa-router')();
const dbhealper = require('../utils/dbhealper');
const multer = require('@koa/multer');
const path = require('path');
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/upload'));
    },
    //修改文件名称
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  })
});

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

router.post('/upload', upload.single('file'), async (ctx, next) => {
  console.log('ctx.file', ctx.file);
  ctx.body = {
    code: 200,
    msg: 'ok'
  };
});

module.exports = router;
