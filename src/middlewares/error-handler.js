const createHttpError = require('http-errors');

const isProduction = process.env.NODE_ENV === 'production';

function errorHandler() {
  return (err, req, res, next) => {
    // Retrieve error status
    const status = parseInt(err.status, 10) || 500;

    // Determine if error message should be hidden from client
    const message = status >= 500 && isProduction ? 'Internal server error' : err.message;

    // Format HTTP error
    const error = createHttpError(status, err, { message });

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
}

module.exports = errorHandler;
