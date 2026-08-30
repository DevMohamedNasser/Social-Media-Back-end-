import { z } from "zod";

export const sendMessageSchema = z.object({
  to: z.string().regex(/^\w{24}$/, { error: "Invalid id format" }),
  content: z
    .string({ error: "Message content is required" })
    .trim()
    .min(1)
    .max(50000),
});

export const emptySchema = z.unknown();

export const typingSchema = z.object({
  to: z.string().regex(/^\w{24}$/, { error: "Invalid id format" }),
});
