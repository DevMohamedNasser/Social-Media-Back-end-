import { Router } from "express";
import {
  authentication,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import * as validators from "./chat.validation";
import chatService from "./chat.service";
import { validation } from "../../Middlewares/validation.middleware";

const router = Router();
router.use(authentication({ tokenType: TokenTypeEnum.access }));

router.get(
  "/",
  validation(validators.conversationSchema),
  chatService.listConversations,
);

router.get(
  "/:userId",
  validation(validators.getMessageSchema),
  chatService.getMessages,
);

export default router;
