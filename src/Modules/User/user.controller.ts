import { Router } from "express";
import userService from "./user.service";
import {
  authentication,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./user.validation";

const router = Router();

router.use(authentication({ tokenType: TokenTypeEnum.access }));

router.post(
  "/friend-request/:userId",
  validation(validators.userIdParamsSchema),
  userService.sendFriendRequest,
);

router.patch(
  "/friend-request/:requestId/accept",
  validation(validators.RequestIdParamsSchema),
  userService.acceptFriendRequest,
);

router.delete(
  "/friend-request/:requestId/reject",
  validation(validators.RequestIdParamsSchema),
  userService.rejectFriendRequest,
);

router.delete(
  "/friend/:userId",
  validation(validators.userIdParamsSchema),
  userService.removeFriend,
);

router.get("/friend-requests", userService.listFriendRequests);

router.patch(
  "/block/:userId",
  validation(validators.userIdParamsSchema),
  userService.blockUser,
);

router.patch(
  "/unblock/:userId",
  validation(validators.userIdParamsSchema),
  userService.unblockUser,
);

export default router;
