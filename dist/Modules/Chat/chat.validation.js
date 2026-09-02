"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageSchema = exports.conversationSchema = exports.markAsReadSchema = exports.typingSchema = exports.emptySchema = exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    to: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid id format" }),
    content: zod_1.z
        .string({ error: "Message content is required" })
        .trim()
        .min(1)
        .max(50000),
});
exports.emptySchema = zod_1.z.unknown();
exports.typingSchema = zod_1.z.object({
    to: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid id format" }),
});
exports.markAsReadSchema = zod_1.z.object({
    from: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid id format" }),
});
exports.conversationSchema = {
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
    }),
};
exports.getMessageSchema = {
    params: zod_1.z.strictObject({
        userId: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid id format" }),
    }),
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
    }),
};
