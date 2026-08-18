import { z } from "zod";

export const deviceTokenSchema = {
  body: z.strictObject({
    token: z
      .string({ error: "FCM device token is required" })
      .min(50)
      .max(4096),
  }),
};

export const listNotificationSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    unreadOnly: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true")
      .optional(),
  }),
};

export const notificationIdSchema = {
  params: z.strictObject({
    id: z.string().regex(/^\w{24}$/, { error: "Invalid id format" }),
  }),
};
