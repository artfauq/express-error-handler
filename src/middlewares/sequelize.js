const { InternalServerError } = require('http-errors');

function sequelizeErrorHandler() {
  return (err, req, res, next) => {
    if (err.name === 'SequelizeDatabaseError') {
      const message = `${err.message}. Query: ${err.sql}`;
      const error = Object.assign(new InternalServerError(), err, { message });

      return next(error);
    }

    return next(err);
  };
}

module.exports = sequelizeErrorHandler;
