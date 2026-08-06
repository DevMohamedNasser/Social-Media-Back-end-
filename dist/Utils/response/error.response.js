"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.InternalServerException = exports.TooManyRequestsException = exports.ConflictException = exports.NotFoundException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = exports.ApplicationExceptions = void 0;
const config_service_1 = require("../../Config/config.service");
class ApplicationExceptions extends Error {
    statusCode;
    constructor(message, statusCode = 400, options) {
        super(message, options);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}
exports.ApplicationExceptions = ApplicationExceptions;
class BadRequestException extends ApplicationExceptions {
    constructor(message, options) {
        super(message, 400, options);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends ApplicationExceptions {
    constructor(message, options) {
        super(message, 401, options);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends ApplicationExceptions {
    constructor(message, options) {
        super(message, 403, options);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundException extends ApplicationExceptions {
    constructor(message, options) {
        super(message, 404, options);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends ApplicationExceptions {
    constructor(message, options) {
        super(message, 409, options);
    }
}
exports.ConflictException = ConflictException;
class TooManyRequestsException extends ApplicationExceptions {
    constructor(message, options) {
        super(message, 429, options);
    }
}
exports.TooManyRequestsException = TooManyRequestsException;
class InternalServerException extends ApplicationExceptions {
    constructor(message = "Internal Server Error", options) {
        super(message, 500, options);
    }
}
exports.InternalServerException = InternalServerException;
const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isDev = config_service_1.env.MODE === "DEVELOPMENT";
    if (statusCode >= 500)
        console.error(err);
    res.status(statusCode).json({
        message: err.message || "Something went wrong",
        ...(isDev && { stack: err.stack }),
        cause: err.cause,
    });
};
exports.globalErrorHandler = globalErrorHandler;
