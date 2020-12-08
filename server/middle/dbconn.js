const mysql = require('mysql');
const dbhealper = require('../utils/dbhealper');

module.exports = function () {
  var mymid = async (ctx, next) => {
    const conn = mysql.createConnection(dbhealper.config);
    conn.connect();
    ctx.state.sqlconn = conn;
    await next();
    conn.end();
  };
  mymid.unless = require('koa-unless');
  return mymid;
};
