const { isHttpError } = require('http-errors');

function errorLogger(logger = console) {
  return (err, req, res, next) => {
    if (isHttpError(err) && err.status < 500) {
      logger.warn('%o', err);
    } else {
      logger.error('%o', err);
    }

    next(err);
  };
}

module.exports = errorLogger;
