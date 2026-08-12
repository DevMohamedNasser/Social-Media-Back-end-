"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentIdParamsSchema = exports.updateCommentSchema = exports.createCommentSchema = exports.updatePostSchema = exports.postIdParamsSchema = exports.toggleReactPostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
const post_model_1 = require("../../DB/Models/post.model");
exports.createPostSchema = {
    body: zod_1.z.strictObject({
        content: zod_1.z.string().min(2).max(50000).optional(),
    }),
};
exports.toggleReactPostSchema = {
    params: zod_1.z.strictObject({
        postId: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
    }),
    body: zod_1.z
        .strictObject({
        react: zod_1.z.enum(post_model_1.reactEnum).optional(),
    })
        .default({}),
};
exports.postIdParamsSchema = {
    params: zod_1.z.strictObject({
        postId: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
    }),
};
exports.updatePostSchema = {
    params: zod_1.z.strictObject({
        postId: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
    }),
    body: zod_1.z.strictObject({
        content: zod_1.z.string().min(2).max(50000),
    }),
};
/* __________________________ Comments __________________________ */
exports.createCommentSchema = {
    params: zod_1.z.strictObject({
        postId: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
    }),
    body: zod_1.z.strictObject({
        content: zod_1.z.string().min(2).max(50000),
        parentId: zod_1.z
            .string()
            .regex(/^\w{24}$/, { error: "Invalid Id format" })
            .optional(),
    }),
};
exports.updateCommentSchema = {
    params: zod_1.z.strictObject({
        commentId: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
    }),
    body: zod_1.z.strictObject({
        content: zod_1.z.string().min(2).max(50000),
    })
};
exports.commentIdParamsSchema = {
    params: zod_1.z.strictObject({
        commentId: zod_1.z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
    }),
};
