const router = require('koa-router')();
const dbhealper = require('../utils/dbhealper');
const multer = require('@koa/multer');
const path = require('path');
const UUID = require('node-uuid');
const fs = require('fs');
const AppInfoParser = require('app-info-parser');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/upload'));
    },
    //修改文件名称
    filename: (req, file, cb) => {
      let filename = UUID.v1();
      filename = filename.replace(/-/g, '');
      if (file.originalname.indexOf('.') > 0) {
        let suffix = file.originalname.split('.').pop();
        filename = filename + '.' + suffix;
      }
      cb(null, filename);
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
  const match = ctx.file.filename.match('(.apk$)|(.ipa$)');
  let platform = -1;
  if (ctx.file.filename.match('(.apk$)')) {
    platform = 0; //android
  }
  if (ctx.file.filename.match('(.ipa$)')) {
    platform = 1;
  }
  if (platform === -1) {
    ctx.body = {
      code: 500,
      msg: '请上传ipa或者apk安装包'
    };
    return;
  }
  const path = ctx.file.path;
  const parser = new AppInfoParser(path);
  const appinfo = await parser.parse();
  let handleResult;
  if (platform === 0) {
    handleResult = await handleAndroid(ctx.state.sqlconn, ctx.state.user, appinfo);
  } else {
    handleResult = await handleIos(ctx.state.sqlconn, ctx.state.user, appinfo);
  }
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: handleResult
  };
});

async function handleIos(conn, user, appinfo) {
  //0 判断是否已经存在
  const bundleId = appinfo.CFBundleIdentifier;
  const version = appinfo.CFBundleShortVersionString;
  const build = appinfo.CFBundleVersion;
  //处理图片
  const iconData = appinfo.icon;
  const iconPath = saveIcon(iconData);
  //1 如果已经存在则升级
  //2 如果不存在则新生成app+版本
  // const insert = '';
  // const apps = await dbhealper.makePromise(conn, query, [user.id]);
  return {};
}

async function handleAndroid(conn, user, appinfo) {
  return {};
}

function saveIcon(iconData) {
  var base64Data = iconData.replace(/^data:image\/\w+;base64,/, '');
  var dataBuffer = new Buffer(base64Data, 'base64');
  let filename = UUID.v1().replace(/-/g, '') + '.png';
  let fpath = path.join(__dirname, '../public/upload');
  fpath = path.join(fpath, filename);
  fs.writeFile(fpath, dataBuffer, function (err) {
    if (err) {
      console.log(err);
    }
  });
  return fpath;
}

module.exports = router;
