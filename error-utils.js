const createHttpError = require('http-errors');

const { isDevelopment } = require('./config');

function logError(logger, err, message = '') {
  let error = message || err.message || err;

  // Append error stack if app is in development mode
  if (isDevelopment) {
    error += `\n\n${err.stack}\n`;
  }

  logger.error(error);
}

function parseError(err) {
  return createHttpError(err.status || err.response.status || 500, err);
}

module.exports = { logError, parseError };
