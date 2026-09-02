import { Types } from "mongoose";
import {
  notificationModel,
  NotificationTypeEnum,
} from "../../DB/Models/notification.model";
import { userModel } from "../../DB/Models/user.model";
import { getFirebaseMessaging } from "./firebase.config";
import chalk from "chalk";

export interface INotificationPayload {
  userId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: NotificationTypeEnum;
  title: string;
  body: string;

  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  requestId?: Types.ObjectId;
}

// الpayload للfirebase لازم الداتا كلها سترنج حتي لو id
const buildData = (payload: INotificationPayload): Record<string, string> => {
  const data: Record<string, string> = {
    type: payload.type,
    senderId: payload.senderId.toString(),
  };

  if (payload.postId) data.postId = payload.postId.toString();
  if (payload.commentId) data.commentId = payload.commentId.toString();
  if (payload.requestId) data.requestId = payload.requestId.toString();

  return data;
};

export const sendNotification = async (
  payload: INotificationPayload, storeDB: boolean = true
): Promise<void> => {
  try {
    if (payload.userId.equals(payload.senderId)) return;

    const recipient = await userModel
      .findById(payload.userId)
      .select("deviceTokens notificationEnabled blockedUsers");
    if (!recipient) return;
    if (recipient.blockedUsers.some((id) => id.equals(payload.senderId)))
      return;

    // Store Notification in DB
    (storeDB && await notificationModel.create({
      userId: payload.userId,
      senderId: payload.senderId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      ...(payload.postId && { postId: payload.postId }),
      ...(payload.commentId && { commentId: payload.commentId }),
      ...(payload.requestId && { requestId: payload.requestId }),
    }));

    if (!recipient.notificationEnabled) {
      console.log("[push] skipped - User has notification disabled");
      return;
    }

    const tokens = recipient.deviceTokens ?? [];
    if (!tokens.length) {
      console.log("[push] skipped - User has no register devices");
      return;
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.log("[push] skipped - Firebase isn't initialized");
      return;
    }

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title: payload.title, body: payload.body },
      data: buildData(payload),
    });

    console.log(
      `[push] success: ${response.successCount}, failure: ${response.failureCount}`,
    );
  } catch (error) {
    console.log(
      chalk.red(
        "[push] failed to send notification: ",
        (error as Error).message,
      ),
    );
  }
};

export const sendNotificationToMany = async (
  userIds: Types.ObjectId[],
  payload: Omit<INotificationPayload, "userId">,
): Promise<void> => {
  await Promise.all(
    userIds.map((userId) => sendNotification({ ...payload, userId })),
  );
};
