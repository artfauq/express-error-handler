const { BadRequest } = require('http-errors');
const { isCelebrate } = require('celebrate');

function celebrateErrorHandler() {
  return (err, req, res, next) => {
    if (isCelebrate(err) || err.isJoi || err.joi) {
      let { message } = err;

      if (err.joi) {
        const { details } = err.joi;

        message = details ? details[0].message : err.joi.message;
      }

      next(Object.assign(new BadRequest(), err, { message }));
    } else {
      next(err);
    }
  };
}

module.exports = celebrateErrorHandler;
