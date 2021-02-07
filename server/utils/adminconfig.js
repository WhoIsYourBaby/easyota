const fs = require('fs');
const path = require('path');

/**
 * @returns {Object} config
 */
module.exports.getConfig = () => {
  try {
    const descPath = path.join(__dirname, `./adminconfig.json`);
    const configString = fs.readFileSync(descPath);
    const config = JSON.parse(configString);
    return config;
  } catch (error) {
    return {
      allowRegister: false,
      store: 'local',
      oss: {
        key: null,
        secret: null,
        endpoint: null,
        bucket: null
      }
    };
  }
};

/**
 *
 * @param {Object} config
 */
module.exports.setConfig = (config) => {
  const descPath = path.join(__dirname, `./adminconfig.json`);
  const configStr = JSON.stringify(config);
  fs.writeFileSync(descPath, configStr);
};
