import { Router } from "express";
import {
  authentication,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./notification.validation";
import notificationService from "./notification.service";

const router = Router();
router.use(authentication({ tokenType: TokenTypeEnum.access }));

router.post(
  "/device-token",
  validation(validators.deviceTokenSchema),
  notificationService.addDeviceToken,
);

router.delete(
  "/remove-token",
  validation(validators.deviceTokenSchema),
  notificationService.removeDeviceToken,
);

/** ______________________________________________________ */

router.get(
  "/",
  validation(validators.listNotificationSchema),
  notificationService.listNotification,
);

router.get("/unread", notificationService.unreadCount);

router.patch(
  "/mark-as-read/:id",
  validation(validators.notificationIdSchema),
  notificationService.markAsRead,
);

router.patch("/mark-all-as-read", notificationService.markAllAsRead);

router.delete(
  "/:id",
  validation(validators.notificationIdSchema),
  notificationService.deleteNotification,
);

// Delete all notifications
router.delete("/", notificationService.clearAll);

export default router;
