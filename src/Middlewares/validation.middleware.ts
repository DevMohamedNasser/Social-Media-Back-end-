import { NextFunction, Request, Response } from "express";
import type { ZodError, ZodType } from "zod";
import { BadRequestException } from "../Utils/response/error.response";

// body | params | query | headers | file | files
type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: Array<{
      key: KeyReqType;
      issues: Array<{ message: string; path: (string | number | symbol)[] }>;
    }> = [];
    for (const key of Object.keys(schema) as KeyReqType[]) {
      const keySchema = schema[key];

      if (!keySchema) continue;

      const validationResults = keySchema.safeParse(req[key]);
      // safeParse returns  => success | data | error

      if (!validationResults.success) {
        const zodError = validationResults.error as ZodError;
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
      throw new BadRequestException("Validation Error", {
        cause: validationErrors,
      });
      
    next();
  };
};
