const { isDevelopment } = require('./config');
const { logError, parseError } = require('./error-utils');

/**
 * @param {any} [logger=console]
 */
module.exports = (logger = console) => {
  if (!Object.prototype.hasOwnProperty.call(logger, 'error')) {
    throw new Error("'logger' object must have an 'error' property");
  }

  /**
   * HTTP error handling Express middleware.
   *
   * @param {any} err
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @returns {void}
   */
  return (err, req, res, next) => {
    // Parse error
    const error = parseError(err);

    // Log error with a custom error message
    const msg = `${error.status} - ${error.name}: ${error.message} [${req.method} ${req.originalUrl} - ${req.ip}]`;
    logError(logger, error, msg);

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
};
