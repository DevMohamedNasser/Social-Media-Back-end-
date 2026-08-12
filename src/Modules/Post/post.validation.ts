import { z } from "zod";
import { reactEnum } from "../../DB/Models/post.model";

export const createPostSchema = {
  body: z.strictObject({
    content: z.string().min(2).max(50000).optional(),
  }),
};

export const toggleReactPostSchema = {
  params: z.strictObject({
    postId: z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
  }),
  body: z
    .strictObject({
      react: z.enum(reactEnum).optional(),
    })
    .default({}),
};

export const postIdParamsSchema = {
  params: z.strictObject({
    postId: z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
  }),
};

export const updatePostSchema = {
  params: z.strictObject({
    postId: z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
  }),
  body: z.strictObject({
    content: z.string().min(2).max(50000),
  }),
};

/* __________________________ Comments __________________________ */
export const createCommentSchema = {
  params: z.strictObject({
    postId: z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
  }),
  body: z.strictObject({
    content: z.string().min(2).max(50000),
    parentId: z
      .string()
      .regex(/^\w{24}$/, { error: "Invalid Id format" })
      .optional(),
  }),
};

export const updateCommentSchema = {
  params: z.strictObject({
    commentId: z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
  }),
  body: z.strictObject({
    content: z.string().min(2).max(50000),
  })
};

export const commentIdParamsSchema = {
  params: z.strictObject({
    commentId: z.string().regex(/^\w{24}$/, { error: "Invalid ID format" }),
  }),
};
