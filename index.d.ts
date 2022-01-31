import { ErrorRequestHandler } from 'express';

declare namespace ExpressErrorHandler {
  /**
   * Error parser for Node.js http server 'error' event.
   *
   * @example
   * app
      .listen(process.env.PORT)
      .on('error', err => {
        console.log(parseServerError(err));
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
        console.log(parseSequelizeConnectionError(err));
      })
   */
  function parseSequelizeConnectionError(err: any): Error;

  /**
   * Middleware used to parse `Sequelize` errors.
   */
  function sequelizeErrorParser(): ErrorRequestHandler;

  /**
   * Middleware used to parse `celebrate` errors.
   */
  function celebrateErrorParser(): ErrorRequestHandler;

  /**
   * Middleware used to parse `express-jwt` errors.
   */
  function jwtErrorParser(): ErrorRequestHandler;

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
