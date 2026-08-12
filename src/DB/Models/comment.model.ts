import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  content: string;
  postId: Types.ObjectId;
  createdBy: Types.ObjectId;
  parentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 50000,
      required: true,
    },
    postId: {
      type: Types.ObjectId,
      required: true,
      ref: "Post",
    },
    parentId: {
      type: Types.ObjectId,
      ref: "Comment",
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Compound Index
commentSchema.index({ postId: 1, createdAt: -1 });

export const commentModel: Model<IComment> =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export type HCommentDocument = HydratedDocument<IComment>;
