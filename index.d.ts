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
   * Middleware used to parse `Sequelize` errors.
   */
  function sequelizeErrorHandler(): ErrorRequestHandler;

  /**
   * Middleware used for parse `celebrate` errors.
   */
  function celebrateErrorHandler(): ErrorRequestHandler;

  /**
   * Middleware used for parse `express-jwt` errors.
   */
  function jwtErrorHandler(): ErrorRequestHandler;

  /**
   * Middleware used to log errors with the defined `logger`.
   */
  function errorLogger(logger?: Logger): ErrorRequestHandler;

  /**
   * Middleware used to handle HTTP error responses.
   *
   * This middleware should be declared after all other middlewares as it will end the response
   * process.
   */
  function httpErrorHandler(): ErrorRequestHandler;
}

interface Logger {
  error: (message: string) => any;
}

export = ExpressErrorHandler;
