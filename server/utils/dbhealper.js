'use strict';
module.exports.makePromise = (connection, sql, arg) => {
  return new Promise((resolve, reject) => {
    let query;
    query = connection.query(sql, arg, function (error, results) {
      if (error) {
        console.error(query.sql);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports.config = {
  host: 'localhost',
  user: 'easyota',
  password: 'Ligun5815',
  database: 'easyota'
};
