"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typingSchema = exports.emptySchema = exports.sendMessageSchema = void 0;
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
