import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export interface IConversation {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

export const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
    lastMessageBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const conversationModel: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", conversationSchema);

export type HConversationDocument = HydratedDocument<IConversation>;
