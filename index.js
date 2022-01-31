const parseServerError = require('./src/parsers/server');
const parseSequelizeConnectionError = require('./src/parsers/sequelize');

module.exports = {
  parseServerError,
  parseSequelizeConnectionError,

  get celebrateErrorParser() {
    return require('./src/middlewares/celebrate-parser');
  },

  get jwtErrorParser() {
    return require('./src/middlewares/jwt-parser');
  },

  get errorHandler() {
    return require('./src/middlewares/error-handler');
  },

  get sequelizeErrorParser() {
    return require('./src/middlewares/sequelize-parser');
  },

  get errorLogger() {
    return require('./src/middlewares/error-logger');
  },
};
