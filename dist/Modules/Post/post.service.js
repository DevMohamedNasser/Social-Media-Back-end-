"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../Utils/response/error.response");
const post_model_1 = require("../../DB/Models/post.model");
const comment_model_1 = require("../../DB/Models/comment.model");
class PostService {
    constructor() { }
    createPost = async (req, res) => {
        const { content } = req.body;
        const files = req.files;
        if (!content && !files?.length)
            throw new error_response_1.BadRequestException("Request must have content or attachments");
        const post = await post_model_1.postModel.create({
            ...(content && { content }),
            ...(files && { attachments: files.map((file) => file.path) }),
            createdBy: req.user.id,
        });
        return res.status(201).json({ message: "Created successfully", post });
    };
    toggleReactPost = async (req, res) => {
        const { postId } = req.params;
        const userId = req.user?.id;
        const { react = post_model_1.reactEnum.like } = req.body || {};
        const post = await post_model_1.postModel.findOne({
            _id: postId,
            freezedAt: { $exists: false },
        });
        if (!post)
            throw new error_response_1.NotFoundException("Post not found!!!");
        const existingReact = post.reacts?.find((item) => item.userId.equals(userId));
        let updated = null;
        if (!existingReact) {
            updated = await post_model_1.postModel
                .findByIdAndUpdate(postId, {
                $push: { reacts: { userId, react } },
            }, { returnDocument: "after" })
                .populate("reacts.userId", "firstName lastName -_id")
                .lean();
        }
        else if (existingReact?.react == react) {
            // old react == recent react ? remove react
            updated = await post_model_1.postModel
                .findByIdAndUpdate(postId, {
                $pull: { reacts: { userId } },
            }, { returnDocument: "after" })
                .populate("reacts.userId", "firstName lastName -_id")
                .lean();
        }
        else {
            // latest case: different react
            updated = await post_model_1.postModel
                .findOneAndUpdate({ _id: postId, "reacts.userId": userId }, { $set: { "reacts.$.react": react } }, { returnDocument: "after" })
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
    updatePost = async (req, res) => {
        const { postId } = req.params;
        const { content } = req.body;
        const post = await post_model_1.postModel.findOneAndUpdate({
            _id: postId,
            freezedAt: { $exists: false },
            createdBy: req.user.id,
        }, { content, $inc: { __v: 1 } }, { returnDocument: "after" });
        if (!post)
            throw new error_response_1.ForbiddenException("Post not found or u aren't author");
        return res.status(200).json({ message: "Post Updated successfully", post });
    };
    updateAttachments = async (req, res) => {
        const { postId } = req.params;
        const userId = req.user.id;
        const files = req.files;
        if (!files?.length)
            throw new error_response_1.BadRequestException("Upload files");
        const updated = await post_model_1.postModel.findOneAndUpdate({ _id: postId, createdBy: userId, freezedAt: { $exists: false } }, {
            $set: { attachments: files.map((file) => file.path) },
            $inc: { __v: 1 },
        }, { returnDocument: "after" });
        if (!updated)
            throw new error_response_1.ForbiddenException("U aren't allowed or post not found");
        return res
            .status(200)
            .json({ message: "Attachments updated successfully", updated });
    };
    deletePost = async (req, res) => {
        const userId = req.user.id;
        const { postId } = req.params;
        const post = await post_model_1.postModel.findOneAndDelete({
            _id: postId,
            createdBy: userId,
        });
        if (!post)
            throw new error_response_1.ForbiddenException("Post not found or u aren't author");
        // Delete Related comments
        return res.status(200).json({ message: "Deleted" });
    };
    getSpecificPost = async (req, res) => {
        const { postId } = req.params;
        const post = await post_model_1.postModel
            .findOne({
            _id: postId,
            freezedAt: { $exists: false },
        })
            .populate("createdBy", "firstName lastName email -_id")
            .lean();
        if (!post)
            throw new error_response_1.NotFoundException("Post not found!!!");
        // Get related comments
        return res.status(200).json({ message: "Fetched successfully", post });
    };
    createComment = async (req, res) => {
        const { postId } = req.params;
        const { content, parentId } = req.body;
        const post = await post_model_1.postModel.findOne({
            _id: postId,
            freezedAt: { $exists: false },
        });
        if (!post)
            throw new error_response_1.NotFoundException("Post not found");
        if (parentId) {
            const comment = await comment_model_1.commentModel.findOne({ _id: parentId, postId });
            if (!comment)
                throw new error_response_1.NotFoundException("Parent comment not exists!!!");
        }
        const comment = await comment_model_1.commentModel.create({
            content,
            postId,
            ...(parentId && { parentId }),
            createdBy: req.user.id,
        });
        return res
            .status(201)
            .json({ message: "Comment created successfully", comment });
    };
    updateComment = async (req, res) => {
        const { commentId } = req.params;
        const { content } = req.body;
        const comment = await comment_model_1.commentModel.findOneAndUpdate({ _id: commentId, createdBy: req.user._id }, { content }, { returnDocument: "after" });
        if (!comment)
            throw new error_response_1.ForbiddenException("Comment not found or u aren't author");
        return res.status(200).json({ message: "Updated successfully", comment });
    };
    deleteComment = async (req, res) => {
        const { commentId } = req.params;
        const userId = req.user.id;
        const comment = await comment_model_1.commentModel.findById(commentId);
        if (!comment)
            throw new error_response_1.NotFoundException("Comment not found");
        const post = await post_model_1.postModel.findById(comment.postId);
        const isCommentAuthor = comment.createdBy.equals(userId);
        const isPostOwner = post?.createdBy.equals(userId);
        if (!isCommentAuthor && !isPostOwner)
            throw new error_response_1.ForbiddenException("Not allowed");
        await Promise.all([
            comment_model_1.commentModel.deleteOne({ _id: commentId }),
            comment_model_1.commentModel.deleteMany({ parentId: commentId }),
        ]);
        return res.status(200).json({ message: "Deleted successfully" });
    };
    getComments = async (req, res) => {
        const { postId } = req.params;
        const comments = await comment_model_1.commentModel
            .find({ postId })
            .populate("createdBy", "firstName lastName -_id");
        return res.status(200).json({ message: "Done", comments });
    };
}
exports.default = new PostService();
