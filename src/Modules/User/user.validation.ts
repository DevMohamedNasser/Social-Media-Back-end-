import * as z from "zod";

export const userIdParamsSchema = {
  params: z.strictObject({
    userId: z.string().regex(/^\w{24}$/, { error: "Invalid id format" }),
  }),
};

export const RequestIdParamsSchema = {
  params: z.strictObject({
    requestId: z.string().regex(/^\w{24}$/, { error: "Invalid id format" }),
  }),
};
