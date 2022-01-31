const createHttpError = require('http-errors');
const { UnauthorizedError } = require('express-jwt');

function jwtErrorParser() {
  return (err, req, res, next) => {
    if (err instanceof UnauthorizedError) {
      const message = err.message || 'Invalid authentication';
      const error = createHttpError(401, err, { message });

      next(error);

      return;
    }

    next(err);
  };
}

module.exports = jwtErrorParser;
