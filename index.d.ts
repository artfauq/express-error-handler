import { ErrorRequestHandler } from 'express';

declare namespace ExpressErrorHandler {
  /**
   * Error handler for handling Node.js http server 'error' event.
   *
   * @example
   * app
      .listen(process.env.PORT)
      .on('error', errorHandler.handleServerError)
   */
  function handleServerError(err: Error): void;

  /**
   * Error handler for handling `Sequelize`'s connection error.
   *
   * @example
   * sequelize
      .authenticate()
      .catch(errorHandler.handleSequelizeConnectionError)
   */
  function handleSequelizeConnectionError(err: any): void;

  /**
   * Returns a middleware used for `Sequelize` errors parsing.
   */
  function sequelizeErrorParser(): ErrorRequestHandler;

  /**
   * Returns a middleware used for `celebrate` errors parsing.
   */
  function celebrateErrorParser(): ErrorRequestHandler;

  /**
   * Returns a middleware used to handle HTTP error responses.
   *
   * This middleware logs error with the defined `logger` with the error stack is appended if
   * `NODE_ENV` is not `production`. It should be declared after all other middlewares as it will
   * end the response process.
   */
  function httpErrorHandler(logger?: Logger): ErrorRequestHandler;
}

interface Logger {
  error: (message: string) => any;
}

export = ExpressErrorHandler;
