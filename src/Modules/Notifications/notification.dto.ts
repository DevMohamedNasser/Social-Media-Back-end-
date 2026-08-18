import * as z from "zod";
import {
  deviceTokenSchema,
  listNotificationSchema,
  notificationIdSchema,
} from "./notification.validation";

export type IDeviceTokenDTO = z.infer<typeof deviceTokenSchema.body>;
export type IListNotificationDTO = z.infer<typeof listNotificationSchema.query>;
export type INotificationIdDTO = z.infer<typeof notificationIdSchema.params>;
