'use strict';
const router = require('koa-router')();
const dbhealper = require('../utils/dbhealper');
const multer = require('@koa/multer');
const path = require('path');
const UUID = require('node-uuid');
const fs = require('fs');
const mysql = require('mysql');
const AppInfoParser = require('app-info-parser');
const plist = require('plist');

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

/**
 * 获取指定app信息
 */
router.get('/', async (ctx, next) => {
  const qbody = ctx.request.query;
  const appId = qbody.appId;
  const appInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select id, create_time as createTime, name, icon, short, adesc, platform, bundle_id as bundleId, user_id as userId from app where id=? and user_id=?',
    [appId, ctx.state.user.id]
  );
  const body = appInDb.length > 0 ? appInDb[0] : null;
  if (body) {
    body.shortUrl = appendHostToShort(ctx, body.short);
  }
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: body
  };
});

/**
 * 获取app列表
 * 管理员获取全部app
 */
router.get('/list', async (ctx, next) => {
  const user = ctx.state.user;
  let query;
  if (user.type === 'admin') {
    query =
      'select id, create_time as createTime, name, icon, short, adesc, platform, bundle_id as bundleId, user_id as userId from app;';
  } else {
    query =
      'select id, create_time as createTime, name, icon, short, adesc, platform, bundle_id as bundleId, user_id as userId from app where user_id=?';
  }
  const apps = await dbhealper.makePromise(ctx.state.sqlconn, query, [user.id]);
  apps.forEach((item) => {
    item.shortUrl = appendHostToShort(ctx, item.short);
  });
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: apps
  };
});

/**
 * apk/ipa文件上传
 * 1、上传ipa/apk
 * 2、upload表保存上传的app文件及其附属文件
 * 3、让前端用户填写基本信息提交
 * 4、收到用户提交的基本信息并结合之前upload保存的app二进制解析
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
      code: 604,
      msg: '请上传ipa或者apk安装包'
    };
    return;
  }
  const domain = ctx.request.protocol + '://' + ctx.state.config.api_host;
  const webDomain = ctx.request.protocol + '://' + ctx.state.config.web_host;
  const appPath = ctx.file.path;
  const parser = new AppInfoParser(appPath);
  const appinfo = await parser.parse();
  const iconPath = saveIcon(appinfo.icon);
  const iconUrl = domain + iconPath;
  const appUrl = domain + '/upload/' + ctx.file.filename;
  const size = ctx.file.size;
  //插入上传的app到upload表
  const insertApp = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'insert into upload (url, path, user_id, size) values (?, ?, ?, ?)',
    [appUrl, appPath, ctx.state.user.id, size]
  );
  await dbhealper.makePromise(
    ctx.state.sqlconn,
    'insert into upload (url, path, user_id) values (?, ?, ?)',
    [iconUrl, iconPath, ctx.state.user.id]
  );
  let appBody;
  const bundleId = platform === 'android' ? appinfo.package : appinfo.CFBundleIdentifier;
  const version = platform === 'android' ? appinfo.versionName : appinfo.CFBundleShortVersionString;
  const appName = platform === 'android' ? appinfo.application.label : appinfo.CFBundleName;
  //如果是ios，生成相应的manifest
  let manifest = null;
  if (platform == 'ios') {
    const originPath = path.join(__dirname, '../utils/manifest.plist');
    const manifestPlist = plist.parse(fs.readFileSync(originPath, 'utf8'));
    manifestPlist.items[0].assets[0].url = appUrl;
    manifestPlist.items[0].assets[1].url = iconUrl;
    manifestPlist.items[0].assets[2].url = iconUrl;
    manifestPlist.items[0].metadata['bundle-identifier'] = bundleId;
    manifestPlist.items[0].metadata['bundle-version'] = version;
    manifestPlist.items[0].metadata['title'] = appName;
    const muuid = UUID.v1().replace(/-/g, '');
    const descPath = path.join(__dirname, `../public/upload/${muuid}.plist`);
    const manifestString = plist.build(manifestPlist);
    fs.writeFileSync(descPath, manifestString);
    manifest = domain + `/upload/${muuid}.plist`;
  }
  const appInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select id, short from app where bundle_id=? and platform=?',
    [bundleId, platform]
  );
  if (platform === 'android') {
    appBody = {
      isNew: appInDb.length === 0 ? true : false,
      appId: appInDb.length === 0 ? null : appInDb[0].id,
      icon: iconUrl,
      manifest: null,
      name: appName,
      bundleId: bundleId,
      version: version,
      build: appinfo.versionCode,
      uploadId: insertApp.insertId,
      branch: 'alpha',
      short: appInDb.length === 0 ? null : appInDb[0].short,
      shortDomain: webDomain
    };
  } else {
    appBody = {
      isNew: appInDb.length === 0 ? true : false,
      appId: appInDb.length === 0 ? null : appInDb[0].id,
      icon: iconUrl,
      manifest: manifest,
      name: appName,
      bundleId: bundleId,
      version: version,
      build: appinfo.CFBundleVersion,
      uploadId: insertApp.insertId,
      branch: 'alpha',
      short: appInDb.length === 0 ? null : appInDb[0].short,
      shortDomain: webDomain
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
 * vdesc
 * short
 * name
 * icon
 * uploadId
 * manifest
 */
router.post('/create', async (ctx, next) => {
  // const testurl = ctx.session.iconUrl.replace(/\//g, '/');
  const qbody = ctx.request.body;
  const uploadId = qbody.uploadId;
  const uploadInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select * from upload where id=? and user_id=?',
    [uploadId, ctx.state.user.id]
  );
  if (uploadInDb.length == 0) {
    ctx.body = {
      code: 602,
      msg: '您还没有上传ipa/apk文件'
    };
    return;
  }
  let platform = 'unknown';
  const appPath = uploadInDb[0].path;
  const appUrl = uploadInDb[0].url;
  const size = uploadInDb[0].size;
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
      code: 602,
      msg: '该App已经存在，无法再次创建'
    };
    return;
  }
  let appSubmit = {
    appDesc: qbody.appDesc,
    vdesc: qbody.vdesc,
    short: qbody.short,
    shortUrl: appendHostToShort(ctx, qbody.short),
    name: qbody.name,
    appPath: appPath,
    iconUrl: qbody.icon,
    binUrl: appUrl,
    bundleId: bundleId,
    platform: platform,
    version:
      platform === 'android' ? parseResult.versionName : parseResult.CFBundleShortVersionString,
    build: platform === 'android' ? parseResult.versionCode : parseResult.CFBundleVersion,
    manifest: qbody.manifest
  };
  await createApp(ctx.state.sqlconn, ctx.state.user, appSubmit);
  ctx.body = {
    code: 200,
    msg: 'ok'
  };
});

/**
 * 修改app信息
 * name
 * adesc
 * short
 * appId
 */
router.post('/update', async (ctx, next) => {
  const qbody = ctx.request.body;
  let appInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select id from app where id=? and user_id=?',
    [qbody.appId, ctx.state.user.id]
  );
  if (appInDb.length === 0) {
    ctx.body = {
      code: 601,
      msg: '该App不存在或者不属于你'
    };
    return;
  }
  await dbhealper.makePromise(
    ctx.state.sqlconn,
    'update app set name=?, adesc=?, short=? where id=? and user_id=?',
    [qbody.name, qbody.adesc, qbody.short, qbody.appId, ctx.state.user.id]
  );
  appInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select id, create_time as createTime, name, icon, short, adesc, platform, bundle_id as bundleId from app where id=? and user_id=?;',
    [qbody.appId, ctx.state.user.id]
  );
  const body = appInDb[0];
  body.shortUrl = appendHostToShort(ctx, body.short);
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: body
  };
});

/**
 * 删除app
 * appId
 */
router.post('/delete', async (ctx, next) => {
  const qbody = ctx.request.body;
  const appId = qbody.appId;
  const deleteResult =
    ctx.state.user.type === 'admin'
      ? await dbhealper.makePromise(ctx.state.sqlconn, 'delete from app where id=?', [appId])
      : await dbhealper.makePromise(ctx.state.sqlconn, 'delete from app where id=? and user_id=?', [
          appId,
          ctx.state.user.id
        ]);
  // 删除版本信息
  ctx.state.user.type === 'admin'
    ? await dbhealper.makePromise(ctx.state.sqlconn, 'delete from app_version where app_id=?', [
        appId
      ])
    : await dbhealper.makePromise(
        ctx.state.sqlconn,
        'delete from app_version where app_id=? and user_id=?',
        [appId, ctx.state.user.id]
      );
  ctx.body = {
    code: 200,
    msg: `${deleteResult.affectedRows}条数据被删除`
  };
});

/**
 * 新增版本
 * 如果是新上传的app：app/upload->app/create
 * 如果上传的app已经存在：app/upload->app/version/create
 * name
 * vdesc
 * branch
 * short
 * appId
 * icon
 * uploadId
 * manifest
 */
router.post('/version/create', async (ctx, next) => {
  const qbody = ctx.request.body;
  const uploadId = qbody.uploadId;
  const uploadInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select * from upload where id=? and user_id=?',
    [uploadId, ctx.state.user.id]
  );
  if (uploadInDb.length == 0) {
    ctx.body = {
      code: 602,
      msg: '您还没有上传ipa/apk文件'
    };
    return;
  }
  let platform = 'unknown';
  const appPath = uploadInDb[0].path;
  const appUrl = uploadInDb[0].url;
  const size = uploadInDb[0].size;
  if (appPath.match('(.apk$)')) {
    platform = 'android';
  }
  if (appPath.match('(.ipa$)')) {
    platform = 'ios';
  }
  const parser = new AppInfoParser(appPath);
  const parseResult = await parser.parse();
  const version =
    platform === 'android' ? parseResult.versionName : parseResult.CFBundleShortVersionString;
  const build = platform === 'android' ? parseResult.versionCode : parseResult.CFBundleVersion;
  const verUuid = UUID.v1().replace(/-/g, '');
  const iconUrl = qbody.icon;
  const insertResult = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'insert into app_version (uuid, app_id, version, build, vdesc, branch, bin_url, manifest, icon, user_id, size) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      verUuid,
      qbody.appId,
      version,
      build,
      qbody.vdesc,
      qbody.branch,
      appUrl,
      qbody.manifest,
      iconUrl,
      ctx.state.user.id,
      size
    ]
  );
  ctx.body = {
    code: 200,
    msg: `${insertResult.affectedRows}条数据被创建`,
    body: {
      id: insertResult.insertId,
      uuid: verUuid,
      appId: qbody.appId,
      version: version,
      build: build,
      vdesc: qbody.vdesc,
      branch: qbody.branch,
      binUrl: appUrl,
      icon: iconUrl,
      manifest: qbody.manifest,
      size: size
    }
  };
});

/**
 * 版本修改
 * vdesc
 * branch: alpha/beta/rc
 * verId
 */
router.post('/version/update', async (ctx, next) => {
  const qbody = ctx.request.body;
  const updateResult = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'update app_version set vdesc=?, branch=? where id=? and user_id=?',
    [qbody.vdesc, qbody.branch, qbody.verId, ctx.state.user.id]
  );
  const verInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select id, uuid, create_time as createTime, app_id as appId, version, build, vdesc, branch, bin_url as binUrl, manifest, icon, is_default as isDefault, size from app_version where id=? and user_id=?',
    [qbody.verId, ctx.state.user.id]
  );
  ctx.body = {
    code: 200,
    msg: `${updateResult.affectedRows}条数据更新`,
    body: verInDb.length > 0 ? verInDb[0] : null
  };
});

/**
 * 版本删除
 * verId
 */
router.post('/version/delete', async (ctx, next) => {
  const qbody = ctx.request.body;
  const updateResult = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'delete from app_version where id=? and user_id=?',
    [qbody.verId, ctx.state.user.id]
  );
  ctx.body = {
    code: 200,
    msg: `${updateResult.affectedRows}条数据被删除`
  };
});

/**
 * 设置默认版本
 * verId
 * appId
 */
router.post('/version/default', async (ctx, next) => {
  const qbody = ctx.request.body;
  await dbhealper.makePromise(
    ctx.state.sqlconn,
    'update app_version set is_default=0 where app_id=? and user_id=?',
    [qbody.appId, ctx.state.user.id]
  );
  const updateResult = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'update app_version set is_default=1 where id=? and user_id=?',
    [qbody.verId, ctx.state.user.id]
  );
  ctx.body = {
    code: 200,
    msg: `${updateResult.affectedRows}条数据更新`
  };
});

/**
 * 获取指定app的version列表
 * appId
 * page
 * size
 */
router.get('/version/list', async (ctx, next) => {
  const qbody = ctx.request.query;
  const appId = qbody.appId;
  const page = parseInt(qbody.page || 1);
  const size = parseInt(qbody.size || 10);
  const start = (page - 1) * size;
  const versionsInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select a.id, a.uuid, a.create_time as createTime, a.app_id as appId, a.version, a.build, a.vdesc, a.branch, a.bin_url as binUrl, a.manifest, a.icon, a.is_default as isDefault, a.size, b.short from app_version a, app b where a.app_id=? and a.user_id=? and a.app_id=b.id order by id desc limit ?,?;',
    [appId, ctx.state.user.id, start, size]
  );
  versionsInDb.forEach((item) => {
    item.shortUrl = appendHostToShort(ctx, item.short);
  });
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: versionsInDb,
    isPageEnd: versionsInDb.length < size
  };
});

/**
 * 获取指定version信息
 * verId
 */
router.get('/version', async (ctx, next) => {
  const qbody = ctx.request.query;
  const versionsInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select a.id, a.uuid, a.create_time as createTime, a.app_id as appId, a.version, a.build, a.vdesc, a.branch, a.bin_url as binUrl, a.manifest, a.icon, a.size, b.short from app_version a, app b where id=? and user_id=? and a.app_id=b.id',
    [qbody.verId, ctx.state.user.id]
  );
  const body = versionsInDb.length > 0 ? versionsInDb[0] : null;
  if (body) {
    body.shortUrl = appendHostToShort(ctx, body.short);
  }
  ctx.body = {
    code: 200,
    msg: 'ok',
    body: versionsInDb.length > 0 ? versionsInDb[0] : null
  };
});

/**
 * 无需登录
 * 发布下载页面的调用接口
 * 获取app和指定版本信息
 * verUuid 和 branch二选一，或者都不传
 * 如果仅传short参数会获取default版本或者最新版本
 * @param {*} short
 * @param {*} verUuid option，获取指定版本
 * @param {*} branch option，获取指定分支的最新版本
 */
router.get('/release', async (ctx, next) => {
  const qbody = ctx.request.query;
  const short = qbody.short;
  const verUuid = qbody.verUuid;
  const branch = qbody.branch;
  const appInDb = await dbhealper.makePromise(
    ctx.state.sqlconn,
    'select id, create_time as createTime, name, icon, short, adesc, platform, bundle_id as bundleId, user_id as userId, tmobile, tdesktop from app where short=?;',
    [short]
  );
  const app = appInDb.length > 0 ? appInDb[0] : null;
  if (!app) {
    ctx.body = {
      code: 601,
      msg: '该App不存在或者不属于你'
    };
    return;
  }
  app.shortUrl = appendHostToShort(ctx, app.short);
  let version = undefined;
  if (verUuid) {
    //如果有指定版本，直接返回该版本
    const verInDb = await dbhealper.makePromise(
      ctx.state.sqlconn,
      'select id, uuid, create_time as createTime, version, build, vdesc, branch, bin_url as binUrl, manifest, icon, is_default as isDefault, size from app_version where app_id=? and uuid=?',
      [app.id, verUuid]
    );
    version = verInDb.length > 0 ? verInDb[0] : null;
  } else {
    //0 如果有指定branch，则优先获取branch的最新版本
    if (branch) {
      let verInDb = await dbhealper.makePromise(
        ctx.state.sqlconn,
        'select id, uuid, create_time as createTime, version, build, vdesc, branch, bin_url as binUrl, manifest, icon, is_default as isDefault, size from app_version where app_id=? and branch=? order by id DESC limit 1',
        [app.id, branch]
      );
      version = verInDb.length > 0 ? verInDb[0] : null;
    } else {
      //1 没有指定版本，优返回default版本
      let verInDb = await dbhealper.makePromise(
        ctx.state.sqlconn,
        'select id, uuid, create_time as createTime, version, build, vdesc, branch, bin_url as binUrl, manifest, icon, is_default as isDefault, size from app_version where app_id=? and is_default=1',
        [app.id]
      );
      if (verInDb.length > 0) {
        version = verInDb[0];
      } else {
        //2 没有default版本则返回最新的版本
        //3 如果还是没查到相应版本则返回null
        verInDb = await dbhealper.makePromise(
          ctx.state.sqlconn,
          'select id, uuid, create_time as createTime, version, build, vdesc, branch, bin_url as binUrl, manifest, icon, is_default as isDefault, size from app_version where app_id=? order by id DESC limit 1',
          [app.id]
        );
        version = verInDb.length > 0 ? verInDb[0] : null;
      }
    }
  }
  app.version = version;

  ctx.body = {
    code: 200,
    msg: 'ok',
    body: app
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
    'insert into app (name, icon, short, adesc, platform, bundle_id, user_id) values (?, ?, ?, ?, ?, ?, ?)',
    [
      appInfo.name,
      appInfo.iconUrl,
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
    'insert into app_version (uuid, app_id, version, build, vdesc, branch, bin_url, manifest, icon, user_id, size, manifest) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      verUuid,
      appId,
      appInfo.version,
      appInfo.build,
      appInfo.vdesc,
      'alpha',
      appInfo.binUrl,
      appInfo.manifest,
      appInfo.iconUrl,
      user.id,
      size.size,
      appInfo.manifest
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

function appendHostToShort(ctx, short) {
  const domain = ctx.request.protocol + '://' + ctx.state.config.web_host;
  const url = domain + '/' + short;
  return url;
}

module.exports = router;
