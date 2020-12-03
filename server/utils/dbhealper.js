module.exports.makePromise = (connection, sql, arg) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, arg, function(error, results) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};


module.exports.config = {
  host     : 'localhost',
  user     : 'easyota',
  password : 'Ligun@5815',
  database : 'easyota'
};