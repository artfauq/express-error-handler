const createHttpError = require('http-errors');
const { isCelebrate } = require('celebrate');
/**
 * Generic validation schemas
 */
function celebrateErrorParser() {
  return (err, req, res, next) => {
    if (isCelebrate(err) || err.isJoi || err.joi) {
      let { message } = err;

      if (err.joi) {
        const { details } = err.joi;

        message = details ? details[0].message : err.joi.message;
      }

      const error = createHttpError(400, err, { message });

      next(error);

      return;
    }

    next(err);
  };
}

module.exports = celebrateErrorParser;
