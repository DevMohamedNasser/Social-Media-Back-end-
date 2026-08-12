import * as z from "zod";
import {
  commentIdParamsSchema,
  createCommentSchema,
  createPostSchema,
  postIdParamsSchema,
  toggleReactPostSchema,
  updatePostSchema,
} from "./post.validation";

export type ICreatePostDTO = z.infer<typeof createPostSchema.body>;
export type IReactPostDTO = z.infer<typeof toggleReactPostSchema.body>;
export type IPostIdParamsDTO = z.infer<typeof postIdParamsSchema.params>;
export type IUpdatePostDTO = z.infer<typeof updatePostSchema.body>;

export type IIdPostDTO = z.infer<typeof toggleReactPostSchema.params>;
/* __________________________ Comments __________________________ */
export type ICreateCommentDTO = z.infer<typeof createCommentSchema.body>;
export type IUpdateCommentDTO = z.infer<typeof createCommentSchema.body>;
export type ICommentIDParamsDTO = z.infer<typeof commentIdParamsSchema.params>;
