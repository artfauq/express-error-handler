const chalk = require('chalk').default;
const createHttpError = require('http-errors');
const { isCelebrate } = require('celebrate');

const { isDevelopment } = require('./config');
const { errorLogger, parseError } = require('./error-utils');

const { red } = chalk.bold;

/**
 * @param {any} [logger=console]
 */
module.exports = (logger = console) => {
  if (!('error' in logger)) {
    throw new Error("'logger' object must have an 'error' property");
  }

  const logError = errorLogger(logger);

  return {
    /**
     * Error handler for server 'error' event.
     *
     * @param {any} err
     */
    handleServerError: err => {
      let message = '';

      const { port, address } = err;

      switch (err.code) {
        case 'EADDRINUSE':
          message = `${red('X')} Error: port ${port} of ${address} already in use\n`;
          break;

        case 'EACCES':
          message = `${red('X')} Error: port ${port} requires elevated privileges`;
          break;

        default:
          message = err.message || `${err}`;
      }

      logError(err, message);
    },

    /**
     * Error handler for sequelize connection error.
     *
     * @param {any} err
     */
    handleSequelizeConnectionError: err => {
      let message = '';

      const { name } = err;
      const { code, address, port } = err.original;

      switch (code) {
        case 'ECONNREFUSED':
          message = `${red('X')} ${name}: Failed to connect to database at ${address}:${port}`;
          break;

        default:
          message = err.message || `${err}`;
      }

      logError(err, message);
    },

    /**
     * Joi errors parsing Express middleware.
     *
     * @param {import('http-errors').HttpError} err
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    joiErrorParser: (err, req, res, next) => {
      const error = isCelebrate(err)
        ? Object.assign(err, {
          status: createHttpError.BadRequest,
          message: err.details ? err.details[0].message : err.message,
        })
        : err;

      next(error);
    },

    /**
     * JWT errors parsing Express middleware.
     *
     * @param {import('http-errors').HttpError} err
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    jwtErrorParser: (err, req, res, next) => {
      const error =
        err.name === 'UnauthorizedError'
          ? Object.assign(err, {
            status: createHttpError.Unauthorized,
            message: 'Invalid token',
          })
          : err;

      next(error);
    },

    /**
     * HTTP error handling Express middleware.
     *
     * @param {any} err
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * @returns {void}
     */
    httpErrorHandler: (err, req, res, next) => {
      // Parse error
      const error = parseError(err);

      // Log error with a custom error message
      const msg = `${error.status} - ${error.name}: ${error.message} [${req.method} ${req.originalUrl} - ${req.ip}]`;
      logError(error, msg);

      // Set response status
      res.status(err.status);

      // Determine if error details should be hidden from client (the `expose` field will be false if err.status >= 500)
      const errorDetails =
        isDevelopment || err.expose
          ? err
          : {
            name: 'Server Error',
            message: 'Internal server error',
          };

      // Set response content according to acceptable format
      res.format({
        text: () => {
          res.send(`Error ${err.status} - ${errorDetails.name}: ${errorDetails.message}`);
        },

        json: () => {
          res.json({
            status: err.status,
            name: errorDetails.name,
            message: errorDetails.message,
          });
        },
      });

      // End response
      res.end();
    },
  };
};
