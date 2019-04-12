# Express error handler

> HTTP errors handling middleware for [Express](https://github.com/expressjs/express/)

## Description

Express middleware used to:

- Parse an error to get a normalized HTTP error
- Log the error with a customized error message
- Send the response back to the client

## Installation

```powershell
npm install @kazaar/express-error-handler
```

## Usage

- **With a logging library**

If you use a logging library such as **Winston**, import the logger and initialize the error handler with it.

```javascript
// index.js

const express = require('express');
const errorHandler = require('@kazaar/express-error-handler');
const logger = require('winston');
// OR
const logger = require('./config/winston');

const app = express();

app.use(errorHandler(logger));
```

The logger object must have an `error` method (e.g `logger.error()`).

Compatible logging libraries: [Winston](https://github.com/winstonjs/winston), [Bunyan](https://github.com/trentm/node-bunyan), [Pino](https://github.com/pinojs/pino), [log4js](https://github.com/log4js-node/log4js-node).

- **Without a logging library**

If you don't use a logging library, the handler will use the `console` as logger.

```javascript
// index.js

const express = require('express');
const errorHandler = require('@kazaar/express-error-handler');

const app = express();

app.use(errorHandler());
```

### Environment

This package makes use ot the `NODE_ENV` environement variable.

If `NODE_ENV` is set to `development`:

- Error stack will be appended to the logs
- Error details will be sent back to the client

## License

MIT © [Arthur Fauquenot](https://github.com/arthurfauq)
