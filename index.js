/**
 * @typedef {import('express').ErrorRequestHandler} ErrorRequestHandler
 *
 */

const { isCelebrate } = require('celebrate');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  parseServerError(err) {
    const { port, address } = err;

    let message = '';

    switch (err.code) {
      case 'EADDRINUSE':
        message = `Error: port ${port} of ${address} already in use`;
        break;

      case 'EACCES':
        message = `Error: port ${port} requires elevated privileges`;
        break;

      default:
        message = err.message || `${err}`;
    }

    return Object.assign({}, err, { message });
  },

  parseSequelizeConnectionError(err) {
    const { name } = err;

    let message = `${name} - Failed to connect to database: `;

    switch (name) {
      case 'SequelizeConnectionRefusedError':
        message += 'connection refused.';
        break;

      case 'SequelizeAccessDeniedError':
        message += 'insufficient privileges.';
        break;

      case 'SequelizeConnectionAcquireTimeoutError':
        message += 'connection not acquired due to timeout.';
        break;

      case 'SequelizeConnectionTimedOutError':
        message += 'connection timed out.';
        break;

      case 'SequelizeHostNotFoundError':
        message += 'hostname not found.';
        break;

      case 'SequelizeHostNotReachableError':
        message += 'hostname not reachable.';
        break;

      case 'SequelizeInvalidConnectionError':
        message += 'invalid connection parameters.';
        break;

      default:
        message += err.message || `${err}`;
    }

    return Object.assign({}, err, { message });
  },

  sequelizeErrorParser() {
    return (err, req, res, next) => {
      if (err.name === 'SequelizeDatabaseError') {
        const message = `${err.message}. Query: ${err.sql}`;
        const error = Object.assign(err, { status: 500, message });

        return next(error);
      }

      return next(err);
    };
  },

  celebrateErrorParser() {
    return (err, req, res, next) => {
      if (isCelebrate(err) || err.isJoi || err.joi) {
        const error = Object.assign(err.joi || err, { status: 400 });

        if (error.details) {
          const [details] = error.details;
          const { message } = details;

          error.message = message;
        }

        return next(error);
      }

      return next(err);
    };
  },

  errorLogger(logger = console) {
    if (!('error' in logger) || typeof logger.error !== 'function') {
      throw new Error("'logger' object must have an 'error' function");
    }

    return (err, req, res, next) => {
      const { message, name, stack } = err;

      logger.error(`${name}: ${message}${!isProduction ? `\n\n${stack}\n` : ''}`);

      next(err);
    };
  },

  httpErrorHandler() {
    return (err, req, res, next) => {
      const { message, name, stack } = err;

      // Retrieve error status
      const status = parseInt(err.status, 10) || 500;

      // Set error details
      const error = { name, message, stack, status };

      // Determine if error details should be hidden from client
      if (error.status >= 500 && isProduction) {
        error.name = 'InternalServerError';
        error.message = 'Internal server error';
      }

      // Set response status
      res.status(error.status);

      // Set response content according to acceptable format
      res.format({
        text: () => {
          res.send(`Error ${error.status} - ${error.name}: ${error.message}`);
        },

        json: () => {
          res.json({
            status: error.status,
            name: error.name,
            message: error.message,
          });
        },
      });
    };
  },
};
