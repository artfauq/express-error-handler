const { InternalServerError } = require('http-errors');

function parseSequelizeConnectionError(err) {
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

  return Object.assign(new InternalServerError(), err, { message });
}

module.exports = parseSequelizeConnectionError;
