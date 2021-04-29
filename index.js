const parseServerError = require('./src/parsers/server');
const parseSequelizeConnectionError = require('./src/parsers/sequelize');

module.exports = {
  parseServerError,
  parseSequelizeConnectionError,

  get celebrateErrorHandler() {
    return require('./src/middlewares/celebrate');
  },

  get jwtErrorHandler() {
    return require('./src/middlewares/express-jwt');
  },

  get httpErrorHandler() {
    return require('./src/middlewares/http-response');
  },

  get sequelizeErrorHandler() {
    return require('./src/middlewares/sequelize');
  },

  get errorLogger() {
    return require('./src/middlewares/error-logger');
  },
};
