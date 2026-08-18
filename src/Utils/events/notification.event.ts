import { Types } from "mongoose";
import { EventEmitter } from "node:events";
import { sendNotification } from "../firebase/push.service";
import { NotificationTypeEnum } from "../../DB/Models/notification.model";

export const notificationEvent = new EventEmitter();

interface IActor {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

const fullName = (user: IActor): string => `${user.firstName} ${user.lastName}`;

notificationEvent.on(
  "friendRequest",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    requestId: Types.ObjectId;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.friendRequest,
      title: "New Friend Request",
      body: `${fullName(data.sender)} send u a friend request`,
      requestId: data.requestId,
    });
  },
);

notificationEvent.on(
  "friendAccepted",
  async (data: { to: Types.ObjectId; sender: IActor }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.friendAccepted,
      title: "New Friend Accepted",
      body: `${fullName(data.sender)} accept ur friend request`,
    });
  },
);

notificationEvent.on(
  "postLiked",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    postId: Types.ObjectId;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.postReacted,
      title: "New Like",
      body: `${fullName(data.sender)} has reacted ur post`,
      postId: data.postId,
    });
  },
);

notificationEvent.on(
  "postComment",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    postId: Types.ObjectId;
    commentId: Types.ObjectId;
    content: string;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.postComment,
      title: "New Comment",
      body: `${fullName(data.sender)} commented: ${data.content}`,
      postId: data.postId,
      commentId: data.commentId,
    });
  },
);

notificationEvent.on(
  "commentReply",
  async (data: {
    to: Types.ObjectId;
    sender: IActor;
    postId: Types.ObjectId;
    commentId: Types.ObjectId;
    content: string;
  }) => {
    await sendNotification({
      userId: data.to,
      senderId: data.sender._id,
      type: NotificationTypeEnum.commentReply,
      title: "New Reply",
      body: `${fullName(data.sender)} replied: ${data.content}`,
      postId: data.postId,
      commentId: data.commentId,
    });
  },
);
