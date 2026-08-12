import { Router } from "express";
import {
  authentication,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/cloud.multer";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./post.validation";
import postService from "./post.service";

const router = Router();

router.use(authentication({ tokenType: TokenTypeEnum.access }));

// create post
router.post(
  "/",
  localFileUpload({ validation: fileValidation.image, folder: "posts" }).array(
    "attachments",
    20,
  ),
  validation(validators.createPostSchema),
  postService.createPost,
);

router.patch(
  "/:postId",
  validation(validators.toggleReactPostSchema),
  postService.toggleReactPost,
);

router.patch(
  "/:postId/update",
  validation(validators.updatePostSchema),
  postService.updatePost,
);

router.patch(
  "/:postId/updateAttachments",
  localFileUpload({ validation: fileValidation.image, folder: "posts" }).array(
    "attachments",
    20,
  ),
  validation(validators.postIdParamsSchema),
  postService.updateAttachments,
);

router.delete(
  "/:postId",
  validation(validators.postIdParamsSchema),
  postService.deletePost,
);

router.get(
  "/:postId",
  validation(validators.postIdParamsSchema),
  postService.getSpecificPost,
);

router.post(
  "/:postId/comment",
  validation(validators.createCommentSchema),
  postService.createComment,
);

router.patch(
  "/:commentId/comment",
  validation(validators.updateCommentSchema),
  postService.updateComment,
);

router.get(
  "/:postId/comments",
  validation(validators.postIdParamsSchema),
  postService.getComments,
);

router.delete(
  "/:commentId/comment",
  validation(validators.commentIdParamsSchema),
  postService.deleteComment,
);

export default router;
