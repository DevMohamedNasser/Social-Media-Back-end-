import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

interface IFriendRequest {
  _id: Types.ObjectId;
  sendBy: Types.ObjectId;
  sendTo: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

export const friendRequestSchema = new Schema<IFriendRequest>(
  {
    sendBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    sendTo: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

friendRequestSchema.index({ sendBy: 1, sendTo: 1 });

export const friendRequestModel: Model<IFriendRequest> =
  mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", friendRequestSchema);

export type HFriendRequestDocument = HydratedDocument<IFriendRequest>;
