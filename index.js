const chalk = require('chalk').default;
const createHttpError = require('http-errors');

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Module that exposes various error handling functions.
 *
 * @param {any} [logger=console]
 */
module.exports = (logger = console) => {
  if (!Object.prototype.hasOwnProperty.call(logger, 'error')) {
    throw new Error("'logger' object must have an 'error' property");
  }

  /**
   * Method used to log an error messawge.
   *
   * Accepts an optional message parameter that will override any existing error message.
   *
   * @param {any} err
   * @param {string} [message='']
   */
  const logError = (err, message = '') => {
    let error = message || err.message || err;

    // Append error stack if app is in development mode
    if (isDevelopment) {
      error += `\n\n${err.stack}\n`;
    }

    logger.error(error);
  };

  /**
   *
   * HTTP error parser.
   *
   * @param {any} err
   * @returns {import('http-errors').HttpError}
   */
  const parseError = err => {
    return createHttpError(err.status || err.response.status || 500, err);
  };

  /**
   * Event listener for server 'error' event.
   *
   * @param {any} err
   */
  const handleServerError = err => {
    let message = '';

    const { port, address } = err;

    switch (err.code) {
      case 'EADDRINUSE':
        message = `${chalk.red('X')} Error: port ${port} of ${address} already in use\n`;
        break;

      case 'EACCES':
        message = `${chalk.red('X')} Error: port ${port} requires elevated privileges`;
        break;

      default:
        message = err.message || `${err}`;
    }

    logError(err, message);
  };

  /**
   * HTTP error handling Express middleware.
   *
   * @param {any} err
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @returns {void}
   */
  const httpErrorHandler = (err, req, res, next) => {
    // Parse error
    const error = parseError(err);

    // Log error with a custom error message
    const msg = `${error.status} - ${error.name}: ${error.message} [${req.method} ${req.originalUrl} - ${req.ip}]`;
    logError(error, msg);

    // Log error
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
  };

  return { handleServerError, httpErrorHandler, logError };
};
