/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

const { isCelebrate } = require('celebrate');

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Express error handling and logging utilities.
 *
 * @param {any} [logger=console]
 * @returns {{ handleServerError, handleSequelizeConnectionError, sequelizeErrorParser, celebrateErrorParser, httpErrorHandler }}
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
     * @returns {void}
     */
    handleServerError(err) {
      let message = '';

      const { port, address } = err;

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

      logError(err, message);
    },

    /**
     * Error handler for sequelize connection error.
     *
     * @param {any} err
     * @returns {void}
     */
    handleSequelizeConnectionError(err) {
      if (err.original) {
        const { name } = err;
        const { address, port } = err.original;

        let message = `${name} - Failed to connect to database at ${address} on port ${port}: `;

        switch (name) {
          case 'SequelizeConnectionRefusedError':
            message += 'connection refused.';
            break;

          case 'SequelizeAccessDeniedError':
            message = 'insufficient privileges.';
            break;

          case 'SequelizeConnectionAcquireTimeoutError':
            message = 'connection not acquired due to timeout.';
            break;

          case 'SequelizeConnectionTimedOutError':
            message = 'connection timed out.';
            break;

          case 'SequelizeHostNotFoundError':
            message = 'hostname not found.';
            break;

          case 'SequelizeHostNotReachableError':
            message = 'hostname not reachable.';
            break;

          case 'SequelizeInvalidConnectionError':
            message = 'invalid connection parameters.';
            break;

          default:
            message += err.message || `${err}`;
        }

        logError(err, message);
      } else {
        logError(err);
      }
    },

    /**
     * Sequelize error parsing Express middleware.
     *
     * @param {any} err
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {void}
     */
    sequelizeErrorParser(err, req, res, next) {
      if (err.name === 'SequelizeDatabaseError') {
        const message = `${err.message}. Query: ${err.sql}`;
        const error = Object.assign(err, { status: 500, message });

        return next(error);
      }

      return next(err);
    },

    /**
     * celebrate/joi error parsing Express middleware.
     *
     * @param {any} err
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {void}
     */
    celebrateErrorParser(err, req, res, next) {
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
    },

    /**
     * HTTP error handling Express middleware.
     *
     * @param {any} err
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {void}
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
      if (error.status >= 500 && !isDevelopment) {
        error.name = 'Server Error';
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
    },
  };
}

module.exports = errorHandler;
