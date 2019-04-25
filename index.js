/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

const chalk = require('chalk').default;
const { isCelebrate } = require('celebrate');

const { red } = chalk.bold;
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Express error handling and logging utilities.
 *
 * @param {*} [logger=console]
 * @returns {any}
 */
function errorHandler(logger = console) {
  if (!('error' in logger)) {
    throw new Error("'logger' object must have an 'error' property");
  }

  /**
   * Logs an error.
   *
   * @param {any} err
   * @param {string} [message='']
   */
  function logError(err, message = '') {
    let error = message || err.message || err;

    // Append error stack if app is in development mode
    if (isDevelopment) {
      error += `\n\n${err.stack}\n`;
    }

    logger.error(error);
  }

  return {
    /**
     * Error handler for server 'error' event.
     *
     * @param {any} err
     */
    handleServerError(err) {
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
    handleSequelizeConnectionError(err) {
      let message = '';

      if (err.original) {
        const { name } = err;
        const { code, address, port } = err.original;

        switch (code) {
          case 'ECONNREFUSED':
            message = `${red('X')} ${name}: Failed to connect to database at ${address}:${port}`;
            break;

          default:
            message = err.message || `${err}`;
        }
      }

      logError(err, message);
    },

    /**
     * Axios errors parsing Express middleware.
     *
     * @param {any} err
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    axiosErrorParser(err, req, res, next) {
      const error = err.response
        ? Object.assign(err, {
            status: err.response.status,
          })
        : err;

      next(error);
    },

    /**
     * celebrate/joi errors parsing Express middleware.
     *
     * @param {any} err
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    celebrateErrorParser(err, req, res, next) {
      const error = isCelebrate(err)
        ? Object.assign(err, {
            status: 400,
            message: err.details ? err.details[0].message : err.message,
          })
        : err;

      next(error);
    },

    /**
     * JWT errors parsing Express middleware.
     *
     * @param {any} err
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    jwtErrorParser: (err, req, res, next) => {
      const error =
        err.name === 'UnauthorizedError'
          ? Object.assign(err, {
              status: 401,
              message: 'Invalid token',
            })
          : err;

      next(error);
    },

    /**
     * HTTP error handling Express middleware.
     *
     * @param {any} err
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    httpErrorHandler(err, req, res, next) {
      // Retrieve error status
      const status = parseInt(err.status, 10) || 500;

      // Set error details
      const error = {
        status,
        name: err.name,
        message: err.message,
        stack: err.stack,
      };

      // Log error with a custom error message
      const msg = `${error.status} - ${error.name}: ${error.message} [${req.method} ${req.originalUrl} - ${req.ip}]`;
      logError(error, msg);

      // Determine if error details should be hidden from client
      if (!isDevelopment || error.status >= 500) {
        error.name = 'Server Error';
        error.message = 'Internal server error';
      }

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

      // Set response status and send response
      res.status(error.status).end();
    },
  };
}

module.exports = errorHandler;
