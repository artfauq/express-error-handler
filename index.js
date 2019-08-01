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
 * @param {any} [logger=console]
 * @returns {{ handleServerError(err: any): void, handleSequelizeConnectionError(err: any): void, axiosErrorParser(err: any, req: Request, res: Response, next: NextFunction): void, celebrateErrorParser(err: any, req: Request, res: Response, next: NextFunction): void, jwtErrorParser(err: any, req: Request, res: Response, next: NextFunction): void, httpErrorHandler(err: any, req: Request, res: Response, next: NextFunction): void;}}
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
     * @returns {void}
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
     * @returns {void}
     */
    axiosErrorParser(err, req, res, next) {
      if (err.response) {
        const { status } = err.response;
        const error = Object.assign(err, { status });

        return next(error);
      }

      return next(err);
    },

    /**
     * celebrate/joi errors parsing Express middleware.
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
     * JWT errors parsing Express middleware.
     *
     * @param {any} err
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {void}
     */
    jwtErrorParser(err, req, res, next) {
      if (err.name === 'UnauthorizedError') {
        const error = Object.assign(err, {
          status: 401,
          message: err.message || 'Invalid or missing token',
        });

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
