const { InternalServerError } = require('http-errors');

function parseServerError(err) {
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

  return Object.assign(new InternalServerError(), err, { message });
}

module.exports = parseServerError;
