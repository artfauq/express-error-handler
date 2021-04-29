const { Unauthorized } = require('http-errors');
const { UnauthorizedError } = require('express-jwt');

function jwtErrorHandler() {
  return (err, req, res, next) => {
    if (err instanceof UnauthorizedError) {
      const message = err.message || 'Invalid authentication';
      const error = Object.assign(new Unauthorized(), err, { message });

      return next(error);
    }

    return next(err);
  };
}

module.exports = jwtErrorHandler;
