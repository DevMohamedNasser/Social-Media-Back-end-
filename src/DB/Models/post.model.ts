import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export enum reactEnum {
  like = "like",
  love = "love",
  fun = "fun",
  sad = "sad",
  anger = "anger",
}

interface IPostReaction {
  userId: Types.ObjectId;
  react: reactEnum;
}

export interface IPost {
  _id: Types.ObjectId;
  content?: string;
  attachments?: string[];
  tags?: Types.ObjectId[];
  createdBy: Types.ObjectId;
  // likes?: Types.ObjectId[];
  reacts?: IPostReaction[];
  freezedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

const reactionSchema = new Schema<IPostReaction>({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  react: {
    type: String,
    enum: Object.values(reactEnum),
    default: reactEnum.like,
  },
});

export const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 50000,
      required: function (this: IPost) {
        return !this.attachments?.length;
      },
    },
    attachments: [{ type: String }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    // likes: [{ type: Types.ObjectId, ref: "User" }],
    reacts: [reactionSchema],
    freezedAt: Date,
    tags: [{ type: Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  },
);

postSchema.index({ "reacts.userId": 1 });

// Compound Index
postSchema.index({ createdBy: 1, createdAt: -1 }); // -1: Descending (latest date)

export const postModel: Model<IPost> =
  mongoose.models.Post || mongoose.model("Post", postSchema);

export type HPostDocument = HydratedDocument<IPost>;
