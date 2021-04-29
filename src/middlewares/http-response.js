const isProduction = process.env.NODE_ENV === 'production';

function httpErrorHandler() {
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
}

module.exports = httpErrorHandler;
