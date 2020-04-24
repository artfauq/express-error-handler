import { ErrorRequestHandler } from 'express';

declare namespace ExpressErrorHandler {
  /**
   * Error parser for Node.js http server 'error' event.
   *
   * @example
   * app
      .listen(process.env.PORT)
      .on('error', err => {
        throw parseServerError(err);
      })
   */
  function parseServerError(err: Error): Error;

  /**
   * Error parser for `Sequelize` connection error.
   *
   * @example
   * sequelize
      .authenticate()
      .catch(err => {
        throw parseSequelizeConnectionError(err);
      })
   */
  function parseSequelizeConnectionError(err: any): Error;

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
