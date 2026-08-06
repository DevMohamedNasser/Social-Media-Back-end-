"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const error_response_1 = require("../Utils/response/error.response");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            const keySchema = schema[key];
            if (!keySchema)
                continue;
            const validationResults = keySchema.safeParse(req[key]);
            // safeParse returns  => success | data | error
            if (!validationResults.success) {
                const zodError = validationResults.error;
                validationErrors.push({
                    key,
                    issues: zodError.issues.map((issue) => ({
                        message: issue.message,
                        path: issue.path,
                    })),
                });
            }
            continue;
        }
        if (validationErrors.length)
            throw new error_response_1.BadRequestException("Validation Error", {
                cause: validationErrors,
            });
        next();
    };
};
exports.validation = validation;
