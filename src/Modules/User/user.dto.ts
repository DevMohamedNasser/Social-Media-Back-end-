import * as z from "zod";
import { RequestIdParamsSchema, userIdParamsSchema } from "./user.validation";

export type IUserIdDTO = z.infer<typeof userIdParamsSchema.params>;
export type IRequestIdParamsDTO = z.infer<typeof RequestIdParamsSchema.params>;
