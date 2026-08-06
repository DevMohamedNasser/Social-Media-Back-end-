import { NextFunction, Request, Response } from "express";
import { env } from "../../Config/config.service";

interface IError extends Error {
  statusCode: number;
  message: string;
  options: ErrorOptions;
}

export class ApplicationExceptions extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends ApplicationExceptions {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 400, options);
  }
}

export class UnauthorizedException extends ApplicationExceptions {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 401, options);
  }
}

export class ForbiddenException extends ApplicationExceptions {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 403, options);
  }
}

export class NotFoundException extends ApplicationExceptions {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 404, options);
  }
}

export class ConflictException extends ApplicationExceptions {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 409, options);
  }
}

export class TooManyRequestsException extends ApplicationExceptions {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 429, options);
  }
}

export class InternalServerException extends ApplicationExceptions {
  constructor(message: string = "Internal Server Error", options?: ErrorOptions) {
    super(message, 500, options);
  }
}

export const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const statusCode = err.statusCode || 500;
  const isDev = env.MODE === "DEVELOPMENT";

  if (statusCode >= 500) console.error(err);

  res.status(statusCode).json({
    message: err.message || "Something went wrong",
    ...(isDev && { stack: err.stack }),
    cause: err.cause,
  });
};
