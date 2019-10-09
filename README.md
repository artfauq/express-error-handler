# Express error handler

![](https://img.shields.io/badge/license-MIT-blue.svg)

> HTTP error handling middlewares for [Express](https://github.com/expressjs/express/)

## Description

This module exposes various middlewares and methods to handle errors inside an Express application:

- **HTTP** error handling _middleware_
- **celebrate/joi** error parsing _middleware_
- **Sequelize** error parsing _middleware_
- Generic **server** error _handler_
- **Sequelize** connection error _handler_

## Installation

```bash
npm install @kazaar/express-error-handler
```

## Example

Example using all the exposed methods / middlewares:

```javascript
// index.js

const express = require('express');
const expressErrorHandler = require('express-error-handler');
const logger = require('./src/config/winston');

const errorHandler = expressErrorHandler(logger);
const app = express();

// Configure application middlewares
app.use(errorHandler.celebrateErrorParser);
app.use(errorHandler.sequelizeErrorParser);
app.use(errorHandler.httpErrorHandler);

// Try database authentication and start server
sequelize
  .authenticate(() => {
    app
      .listen(8080, () => logger.info('Application running on port 8080'));
      .on('error', errorHandler.handleServerError)
  })
  .catch(errorHandler.handleDatabaseConnectionError);
```

## Usage

### Initialization

- **With a logging library**

If you use a logging library such as **Winston**, import the logger and initialize the error handler with it.

```javascript
// index.js

const express = require('express');
const expressErrorHandler = require('express-error-handler');
const logger = require('winston'); // or import custom Winston config

const app = express();
const errorHandler = expressErrorHandler(logger);
```

The logger object must have an `error` method (e.g `logger.error()`).

Compatible logging libraries: [Winston](https://github.com/winstonjs/winston), [Bunyan](https://github.com/trentm/node-bunyan), [Pino](https://github.com/pinojs/pino), [log4js](https://github.com/log4js-node/log4js-node).

- **Without a logging library**

If you don't use a logging library, the handler will use the `console` as logger.

```javascript
// index.js

const express = require('express');
const expressErrorHandler = require('express-error-handler');

const app = express();
const errorHandler = expressErrorHandler();
```

### API

When initializing the error handler, the returned object exposes some Express middlewares as well as some error handlers.

#### Express middlewares

- **celebrateErrorParser(err, req, res, next)**

> **celebrate/joi** error parsing Express middleware

```javascript
const { celebrateErrorParser } = expressErrorHandler(logger);

app.use(celebrateErrorParser);
```

Middleware that checks if `err` was originated by [celebrate](https://www.npmjs.com/package/celebrate) (validation error) and if so, sets error `status` to `400` and sets error `message` to default Joi message or custom message if `Joi.error()` was used.

- **sequelizeErrorParser(err, req, res, next)**

> **sequelize** error parsing Express middleware

```javascript
const { sequelizeErrorParser } = expressErrorHandler(logger);

app.use(sequelizeErrorParser);
```

Middleware that checks if `err` was originated by [sequelize](https://github.com/sequelize/sequelize) and if so, sets error `status` to `500` and sets error `message` to default custom message parsed from error details.

- **httpErrorHandler(err, req, res, next)**

> HTTP error handling Express middleware

```javascript
const { httpErrorHandler } = expressErrorHandler(logger);

app.use(httpErrorHandler);
```

Middleware used to:

- Parse an error to get a normalized HTTP error
- Log the error with a customized error message
- Send the response back to the client

**Important:** this middleware should be configured at the end of the middlewares stack as it ends the response.

#### Error handlers

- **handleServerError(err)**

> Error handler for server 'error' event

Handler that will switch between error `code` property to output a custom error message.

```javascript
const { handleServerError } = expressErrorHandler(logger);

const port = 8080;

app
  .listen(port, () => logger.info(`Application running on port ${port}`));
  .on('error', handleServerError)
```

- **handleSequelizeConnectionError(err)**

> Error handler for sequelize connection error

Handler that will switch between error `code` property to output a custom error message.

```javascript
const { handleDatabaseConnectionError } = expressErrorHandler(logger);

sequelize.authenticate().catch(handleDatabaseConnectionError);
```

### Environment

This package makes use ot the `NODE_ENV` environement variable.

If `NODE_ENV` is set to `development`:

- Error stack will be appended to the logs
- Error details will be sent back to the client

## License

MIT © [Arthur Fauquenot](https://github.com/arthurfauq)
