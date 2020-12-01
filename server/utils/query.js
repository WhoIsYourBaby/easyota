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
