import { Request, Response } from "express";
import {
  ICommentIDParamsDTO,
  ICreateCommentDTO,
  ICreatePostDTO,
  IIdPostDTO,
  IPostIdParamsDTO,
  IReactPostDTO,
  IUpdateCommentDTO,
  IUpdatePostDTO,
} from "./post.dto";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { postModel, reactEnum } from "../../DB/Models/post.model";
import { commentModel } from "../../DB/Models/comment.model";

class PostService {
  constructor() {}

  createPost = async (req: Request, res: Response): Promise<Response> => {
    const { content }: ICreatePostDTO = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!content && !files?.length)
      throw new BadRequestException("Request must have content or attachments");

    const post = await postModel.create({
      ...(content && { content }),
      ...(files && { attachments: files.map((file) => file.path) }),
      createdBy: req.user!.id,
    });

    return res.status(201).json({ message: "Created successfully", post });
  };

  toggleReactPost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IIdPostDTO = req.params as { postId: string };
    const userId = req.user?.id;
    const { react = reactEnum.like }: IReactPostDTO = req.body || {};

    const post = await postModel.findOne({
      _id: postId,
      freezedAt: { $exists: false },
    });
    if (!post) throw new NotFoundException("Post not found!!!");

    const existingReact = post.reacts?.find((item) =>
      item.userId.equals(userId),
    );

    let updated = null;

    if (!existingReact) {
      updated = await postModel
        .findByIdAndUpdate(
          postId,
          {
            $push: { reacts: { userId, react } },
          },
          { returnDocument: "after" },
        )
        .populate("reacts.userId", "firstName lastName -_id")
        .lean();
    } else if (existingReact?.react == react) {
      // old react == recent react ? remove react
      updated = await postModel
        .findByIdAndUpdate(
          postId,
          {
            $pull: { reacts: { userId } },
          },
          { returnDocument: "after" },
        )
        .populate("reacts.userId", "firstName lastName -_id")
        .lean();
    } else {
      // latest case: different react
      updated = await postModel
        .findOneAndUpdate(
          { _id: postId, "reacts.userId": userId } as any,
          { $set: { "reacts.$.react": react } },
          { returnDocument: "after" },
        )
        .populate("reacts.userId", "firstName lastName -_id")
        .lean();
    }

    return res.status(200).json({
      message: !existingReact
        ? "Reacted"
        : existingReact.react == react
          ? "UnReacted"
          : "Reacted",
      updated,
    });
  };

  updatePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIdParamsDTO = req.params as { postId: string };
    const { content }: IUpdatePostDTO = req.body;

    const post = await postModel.findOneAndUpdate(
      {
        _id: postId,
        freezedAt: { $exists: false },
        createdBy: req.user!.id,
      },
      { content, $inc: { __v: 1 } },
      { returnDocument: "after" },
    );
    if (!post)
      throw new ForbiddenException("Post not found or u aren't author");

    return res.status(200).json({ message: "Post Updated successfully", post });
  };

  updateAttachments = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { postId }: IIdPostDTO = req.params as { postId: string };
    const userId = req.user!.id;
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) throw new BadRequestException("Upload files");

    const updated = await postModel.findOneAndUpdate(
      { _id: postId, createdBy: userId, freezedAt: { $exists: false } },
      {
        $set: { attachments: files.map((file) => file.path) },
        $inc: { __v: 1 },
      },
      { returnDocument: "after" },
    );
    if (!updated)
      throw new ForbiddenException("U aren't allowed or post not found");

    return res
      .status(200)
      .json({ message: "Attachments updated successfully", updated });
  };

  deletePost = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const { postId }: IIdPostDTO = req.params as { postId: string };

    const post = await postModel.findOneAndDelete({
      _id: postId,
      createdBy: userId,
    });
    if (!post)
      throw new ForbiddenException("Post not found or u aren't author");

    // Delete Related comments

    return res.status(200).json({ message: "Deleted" });
  };

  getSpecificPost = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IIdPostDTO = req.params as { postId: string };

    const post = await postModel
      .findOne({
        _id: postId,
        freezedAt: { $exists: false },
      })
      .populate("createdBy", "firstName lastName email -_id")
      .lean();
    if (!post) throw new NotFoundException("Post not found!!!");

    // Get related comments

    return res.status(200).json({ message: "Fetched successfully", post });
  };

  createComment = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIdParamsDTO = req.params as { postId: string };
    const { content, parentId }: ICreateCommentDTO = req.body;

    const post = await postModel.findOne({
      _id: postId,
      freezedAt: { $exists: false },
    });
    if (!post) throw new NotFoundException("Post not found");

    if (parentId) {
      const comment = await commentModel.findOne({ _id: parentId, postId });
      if (!comment) throw new NotFoundException("Parent comment not exists!!!");
    }

    const comment = await commentModel.create({
      content,
      postId,
      ...(parentId && { parentId }),
      createdBy: req.user!.id,
    });

    return res
      .status(201)
      .json({ message: "Comment created successfully", comment });
  };

  updateComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId }: ICommentIDParamsDTO = req.params as {
      commentId: string;
    };
    const { content }: IUpdateCommentDTO = req.body;

    const comment = await commentModel.findOneAndUpdate(
      { _id: commentId, createdBy: req.user!._id },
      { content },
      { returnDocument: "after" },
    );

    if (!comment)
      throw new ForbiddenException("Comment not found or u aren't author");

    return res.status(200).json({ message: "Updated successfully", comment });
  };

  deleteComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId }: ICommentIDParamsDTO = req.params as {
      commentId: string;
    };
    const userId = req.user!.id;

    const comment = await commentModel.findById(commentId);
    if (!comment) throw new NotFoundException("Comment not found");

    const post = await postModel.findById(comment.postId);
    const isCommentAuthor = comment.createdBy.equals(userId);
    const isPostOwner = post?.createdBy.equals(userId);

    if (!isCommentAuthor && !isPostOwner)
      throw new ForbiddenException("Not allowed");

    await Promise.all([
      commentModel.deleteOne({ _id: commentId }),
      commentModel.deleteMany({ parentId: commentId }),
    ]);

    return res.status(200).json({ message: "Deleted successfully" });
  };

  getComments = async (req: Request, res: Response): Promise<Response> => {
    const { postId }: IPostIdParamsDTO = req.params as { postId: string };

    const comments = await commentModel
      .find({ postId })
      .populate("createdBy", "firstName lastName -_id");

    return res.status(200).json({ message: "Done", comments });
  };
}

export default new PostService();
