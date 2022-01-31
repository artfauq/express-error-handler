const createHttpError = require('http-errors');
const { DatabaseError } = require('sequelize');

function sequelizeErrorParser() {
  return (err, req, res, next) => {
    if (err instanceof DatabaseError) {
      const message = `${err.message}. Query: ${err.sql}`;
      const error = createHttpError(500, err, { message });

      next(error);

      return;
    }

    next(err);
  };
}

module.exports = sequelizeErrorParser;
