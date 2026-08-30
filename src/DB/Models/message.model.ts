import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export interface IMessage {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  readAt: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      minLength: 1,
      maxLength: 50000,
      required: true,
      trim: true,
    },
    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, createdAt: -1 });

messageSchema.pre("validate", async function () {
  if (this.content) this.content = this.content.trim();
});

export const messageModel: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export type HMessageDocument = HydratedDocument<IMessage>;
