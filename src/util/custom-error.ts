export abstract class AppError extends Error {
  abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = 400;
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  constructor(message = "Unauthorized access") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  constructor(message = "Access forbidden") {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
}

export class UnprocessableEntityError extends AppError {
  readonly statusCode = 422;
}

export class InternalServerError extends AppError {
  readonly statusCode = 500;
  constructor(message = "An unexpected internal server error occurred") {
    super(message);
  }
}
