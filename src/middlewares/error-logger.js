function errorLogger(logger = console) {
  return (err, req, res, next) => {
    if (typeof err === 'object' && 'status' in err && err.status < 500) {
      logger.warn('%o', err);
    } else {
      logger.error('%o', err);
    }

    next(err);
  };
}

module.exports = errorLogger;
