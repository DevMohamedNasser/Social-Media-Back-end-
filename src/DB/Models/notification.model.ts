import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export enum NotificationTypeEnum {
  friendRequest = "Friend Request",
  friendAccepted = "Friend Accepted",
  postReacted = "Post Reacted",
  postComment = "Post Comment",
  commentReply = "Comment Reply",
  receiveMsg = "Receive Msg",
}

export interface INotification {
  _id: Types.ObjectId;

  userId: Types.ObjectId; // receiver
  senderId: Types.ObjectId;

  type: NotificationTypeEnum;
  title: string;
  body: string;

  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  requestId?: Types.ObjectId;

  readAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    postId: {
      type: Types.ObjectId,
      ref: "Post",
    },
    commentId: {
      type: Types.ObjectId,
      ref: "Comment",
    },
    requestId: {
      type: Types.ObjectId,
      ref: "FriendRequest",
    },
    type: {
      type: String,
      enum: Object.values(NotificationTypeEnum),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Compound Index
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });

// TTL (Time To Live)
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 } /** a month */,
);

export const notificationModel: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export type HNotificationDocument = HydratedDocument<INotification>;
