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

/**
 * 上传app处理流程
 * 1、上传ipa/apk
 * 2、session保存上次上传的app，暂不存入数据库
 * 3、让前端用户填写基本信息提交
 * 4、收到用户提交的基本信息并结合之前session保存的app二进制解析
 * 5、完成app+版本的入库
 */
router.post('/upload', upload.single('file'), async (ctx, next) => {
  console.log('ctx.file', ctx.file);
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
  const appPath = ctx.file.path;
  const parser = new AppInfoParser(appPath);
  const appinfo = await parser.parse();
  const iconPath = saveIcon(appinfo.icon);
  ctx.session.appPath = appPath;
  ctx.session.iconPath = iconPath;
  let appBody;
  if (platform === 0) {
    appBody = {
      icon: iconPath,
      name: appinfo.application.label,
      bundle_id: appinfo.package,
      version: appinfo.versionName,
      build: appinfo.versionCode
    };
  } else {
    appBody = {
      icon: iconPath,
      name: appinfo.CFBundleName,
      bundle_id: appinfo.CFBundleIdentifier,
      version: appinfo.CFBundleShortVersionString,
      build: appinfo.CFBundleVersion
    };
  }
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: appBody
  };
});

async function handleIos(conn, user, appinfo) {
  //0 判断app是否已经存在
  const bundleId = appinfo.CFBundleIdentifier;
  const version = appinfo.CFBundleShortVersionString;
  const build = appinfo.CFBundleVersion;
  const name = appinfo.CFBundleName;
  //处理图片
  const iconData = appinfo.icon;
  const iconPath = saveIcon(iconData);
  const ifAppExist =
    'select id, name, icon, platform, bundle_id, user_id, desc, short_link from app where bundle_id=?';
  const apps = await dbhealper.makePromise(conn, ifAppExist, [bundleId]);
  let app = {};
  if (apps.length === 0) {
    const appInsert = await dbhealper.makePromise(
      conn,
      'insert into app (name, icon, platform, bundle_id, user_id) values (?, ?, ?, ?, ?)',
      [name, iconPath, 'ios', bundleId, user.id]
    );
    app.id = appInsert.insertId;
    app.bundle_id = bundleId;
    app.platform = 'ios';
    app.user_id = user.id;
    app.icon = iconPath;
    app.name = name;
  } else {
    app = apps[0];
  }
  //1 在app上
  //2 如果不存在则新生成app+版本
  // const insert = '';
  // const apps = await dbhealper.makePromise(conn, query, [user.id]);
  return {};
}

async function handleAndroid(conn, user, appinfo) {
  return {};
}


//返回file的相对域名的路径
function saveIcon(iconData) {
  var base64Data = iconData.replace(/^data:image\/\w+;base64,/, '');
  var dataBuffer = new Buffer(base64Data, 'base64');
  let filename = '/upload/' + UUID.v1().replace(/-/g, '') + '.png';
  let fpath = path.join(__dirname, '../public');
  fpath = path.join(fpath, filename);
  fs.writeFile(fpath, dataBuffer, function (err) {
    if (err) {
      console.log(err);
    }
  });
  return filename;
}

module.exports = router;
