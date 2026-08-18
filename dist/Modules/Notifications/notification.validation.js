"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationIdSchema = exports.listNotificationSchema = exports.deviceTokenSchema = void 0;
const zod_1 = require("zod");
exports.deviceTokenSchema = {
    body: zod_1.z.strictObject({
        token: zod_1.z
            .string({ error: "FCM device token is required" })
            .min(50)
            .max(4096),
    }),
};
exports.listNotificationSchema = {
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).default(1).optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(50).optional(),
        unreadOnly: zod_1.z
            .enum(["true", "false"])
            .default("false")
            .transform((value) => value === "true")
            .optional(),
    }),
};
exports.notificationIdSchema = {
    params: zod_1.z.strictObject({
        id: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid id format" }),
    }),
};
