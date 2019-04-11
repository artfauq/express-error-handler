# Express error handler

> [Express](https://github.com/expressjs/express/) error handling and logging utilities

## Installation

`npm install @kazaar/express-error-handler`

## Example

```javascript
const app = require('express')();
const logger = require('winston');
const { httpErrorHandler, handleServerError } = require('@kazaar/express-error-handler')(logger);

app.use(httpErrorHandler);

app.listen(8080, () => logger.info('Application running on port 8080')).on('error', handleServerError);
```

## Usage

### Initialization

- **With a logging library**

If you use a logging such as **Winston**, import the logger and initialize the error handler with it.

```javascript
const logger = require('winston');
// OR
const logger = require('./config/winston');

const errorHandler = require('@kazaar/express-error-handler')(logger);
```

The logger object must have an `error` method (e.g `logger.error()`).

Compatible logging libraries: [Winston](https://github.com/winstonjs/winston), [Bunyan](https://github.com/trentm/node-bunyan), [Pino](https://github.com/pinojs/pino), [log4js](https://github.com/log4js-node/log4js-node).

- **Without a logging library**

If you don't use a logging library, the handler will use the `console` as logger.

```javascript
const errorHandler = require('@kazaar/express-error-handler')();
```

### Environment

This package makes use ot the `NODE_ENV` environement variable.

If `NODE_ENV` is set to `development`:

- Error stack will be appended to the logs
- Error details will be sent back to the client

### API

Exposed functions:

- `httpErrorHandler(err: any, req: express.Request, res: express.Response, next: express.NextFunction)`

Express middleware used to:

- Parse an error to get a normalized HTTP error
- Log the error with a customized error message
- Send the response back to the client

```javascript
const app = require('express')();
const logger = require('winston');
const { httpErrorHandler } = require('@kazaar/express-error-handler')(logger);

app.use(httpErrorHandler);
```

- `logError(err: any, message?: string)`

Express middleware used to:

- Parse an error to get a normalized HTTP error
- Log the error with a customized error message
- Send the response back to the client

```javascript
const app = require('express')();
const logger = require('winston');
const { logError } = require('@kazaar/express-error-handler')(logger);

logError(err, 'Custom error message goes here');
```

- `handleServerError(err: any)`

Error handler for server errors that will print out a custom error message depending on the error code.

```javascript
const app = require('express')();
const logger = require('winston');
const { handleServerError } = require('@kazaar/express-error-handler')(logger);

app.listen(8080, () => logger.info('Application running on port 8080')).on('error', handleServerError);
```
