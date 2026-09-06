"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.UnprocessableEntityError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
class AppError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    statusCode = 400;
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    statusCode = 401;
    constructor(message = "Unauthorized access") {
        super(message);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    statusCode = 403;
    constructor(message = "Access forbidden") {
        super(message);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    statusCode = 404;
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    statusCode = 409;
}
exports.ConflictError = ConflictError;
class UnprocessableEntityError extends AppError {
    statusCode = 422;
}
exports.UnprocessableEntityError = UnprocessableEntityError;
class InternalServerError extends AppError {
    statusCode = 500;
    constructor(message = "An unexpected internal server error occurred") {
        super(message);
    }
}
exports.InternalServerError = InternalServerError;
