const router = require('koa-router')();
const dbhealper = require('../utils/dbhealper');
const multer = require('@koa/multer');
const path = require('path');
const UUID = require('node-uuid');
const fs = require('fs');
const mysql = require('mysql');
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
    query =
      'select id, create_time as createTime, name, icon, short_link as shortLink, desc, platform, bundle_id as bundleId, user_id as userId from app;';
  } else {
    query =
      'select id, create_time as createTime, name, icon, short_link as shortLink, desc, platform, bundle_id as bundleId, user_id as userId from app where user_id=?';
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
  let platform = 'unknown';
  if (ctx.file.filename.match('(.apk$)')) {
    platform = 'android'; //android
  }
  if (ctx.file.filename.match('(.ipa$)')) {
    platform = 'ios';
  }
  if (platform === 'unknown') {
    ctx.body = {
      code: 500,
      msg: '请上传ipa或者apk安装包'
    };
    return;
  }
  const host = ctx.req.headers.host;
  const protocol = !!ctx.req.connection.encrypted ? 'https:\/\/' : 'http:\/\/';
  const domain = protocol + host;
  const appPath = ctx.file.path;
  const parser = new AppInfoParser(appPath);
  const appinfo = await parser.parse();
  const iconPath = saveIcon(appinfo.icon);
  const iconUrl = domain + iconPath;
  ctx.session.appPath = appPath;
  ctx.session.appUrl = domain + '/upload/' + ctx.file.filename;
  ctx.session.iconUrl = iconUrl;
  let appBody;
  const bundleId = platform === 'android' ? appinfo.package : appinfo.CFBundleIdentifier;
  const appInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select id from app where bundle_id=? and platform=?',
    [bundleId, platform]
  );
  if (platform === 'android') {
    appBody = {
      isNew: appInDb.length === 0 ? true : false,
      icon: iconUrl,
      name: appinfo.application.label,
      bundle_id: appinfo.package,
      version: appinfo.versionName,
      build: appinfo.versionCode
    };
  } else {
    appBody = {
      isNew: appInDb.length === 0 ? true : false,
      icon: iconUrl,
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

/**
 * 创建app、新增版本是不同页面不同接口
 * 根据upload接口返回的信息再次补完app版本数据
 * appDesc
 * verDesc
 * short
 * name
 */
router.post('/create', async (ctx, next) => {
  const testurl = ctx.session.iconUrl.replace(/\//g, '\/');
  const qbody = ctx.request.body;
  let platform = 'unknown';
  const appPath = ctx.session.appPath;
  if (appPath.match('(.apk$)')) {
    platform = 'android';
  }
  if (appPath.match('(.ipa$)')) {
    platform = 'ios';
  }
  const parser = new AppInfoParser(appPath);
  const parseResult = await parser.parse();
  const bundleId = platform === 'android' ? parseResult.package : parseResult.CFBundleIdentifier;
  const appInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select id from app where bundle_id=? and platform=?',
    [bundleId, platform]
  );
  if (appInDb.length > 0 || platform === 'unknown') {
    ctx.body = {
      code: 500,
      msg: '该App已经存在，无法再次创建'
    };
    return;
  }
  let appSubmit = {
    appDesc: qbody.appDesc,
    verDesc: qbody.verDesc,
    short: qbody.short,
    name: qbody.name,
    appPath: ctx.session.appPath,
    iconUrl: ctx.session.iconUrl,
    binUrl: ctx.session.appUrl,
    bundleId: bundleId,
    platform: platform,
    version: platform === 'android' ? parseResult.versionName : parseResult.CFBundleShortVersionString,
    build: platform === 'android' ? parseResult.versionCode : parseResult.CFBundleVersion
  };
  await createApp(ctx.state.sqlconn, ctx.state.user, appSubmit);
  ctx.body = {
    code: 200,
    msg: 'ok'
  };
});

/**
 * 已经在外面判断app存在与否
 * @param {*} conn mysql链接
 * @param {*} user token解析的用户
 * @param {*} appInfo App必要信息
 */
async function createApp(conn, user, appInfo) {
  //1、先创建app
  const appInsert = await dbhealper.makePromise(
    conn,
    'insert into app (name, icon, short_link, adesc, platform, bundle_id, user_id) values (?, ?, ?, ?, ?, ?, ?)',
    [
      appInfo.name,
      appInfo.iconUrl.replace(/\//g, '\/'),
      appInfo.short,
      appInfo.appDesc,
      appInfo.platform,
      appInfo.bundleId,
      user.id
    ]
  );
  //2、再创建版本
  const appId = appInsert.insertId;
  const verUuid = UUID.v1().replace(/-/g, '');
  const verInsert = await dbhealper.makePromise(
    conn,
    'insert into app_version (uuid, app_id, version, build, vdesc, type, bin_url, mainfest, icon) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      verUuid,
      appId,
      appInfo.version,
      appInfo.build,
      appInfo.verDesc,
      'dev',
      appInfo.binUrl.replace(/\//g, '\/'),
      appInfo.mainfest,
      appInfo.iconUrl.replace(/\//g, '\/')
    ]
  );
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
