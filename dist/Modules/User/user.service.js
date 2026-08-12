"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../Utils/response/error.response");
const user_model_1 = require("../../DB/Models/user.model");
const friendRequest_model_1 = require("../../DB/Models/friendRequest.model");
class UserService {
    constructor() { }
    sendFriendRequest = async (req, res) => {
        const { userId } = req.params;
        const senderId = req.user.id;
        if (senderId.toString() === userId)
            throw new error_response_1.BadRequestException("Can't send request to urself");
        const targetUser = await user_model_1.userModel.findById(userId);
        if (!targetUser)
            throw new error_response_1.NotFoundException("User not found");
        if (targetUser.blockedUsers.some((id) => id.equals(senderId)) ||
            req.user.blockedUsers.some((id) => id.equals(targetUser._id)))
            throw new error_response_1.ForbiddenException("Can't send request to this user");
        if (targetUser.friends.some((id) => id.equals(senderId)))
            throw new error_response_1.ConflictException("U are already friend");
        const existing = await friendRequest_model_1.friendRequestModel.findOne({
            $or: [
                { sendBy: senderId, sendTo: targetUser._id },
                { sendBy: targetUser._id, sendTo: senderId },
            ],
        });
        if (existing)
            throw new error_response_1.ConflictException("Request already exists");
        const friendRequest = await friendRequest_model_1.friendRequestModel.create({
            sendBy: senderId,
            sendTo: targetUser._id,
        });
        return res
            .status(201)
            .json({ message: "Request sended successfully", friendRequest });
    };
    listFriendRequests = async (req, res) => {
        const list = await friendRequest_model_1.friendRequestModel
            .find({ sendTo: req.user.id })
            .populate("sendBy", "firstName lastName email -_id")
            .lean();
        return res.status(200).json({ message: "Fetched successfully", list });
    };
    acceptFriendRequest = async (req, res) => {
        const { requestId } = req.params;
        const friendRequest = await friendRequest_model_1.friendRequestModel.findOne({
            _id: requestId,
            sendTo: req.user.id,
        });
        if (!friendRequest)
            throw new error_response_1.NotFoundException("Friend request not found");
        await Promise.all([
            user_model_1.userModel.findByIdAndUpdate(friendRequest.sendTo, {
                $addToSet: { friends: friendRequest.sendBy },
            }),
            user_model_1.userModel.findByIdAndUpdate(friendRequest.sendBy, {
                $addToSet: { friends: friendRequest.sendTo },
            }),
        ]);
        await friendRequest_model_1.friendRequestModel.deleteOne({ _id: requestId });
        return res.status(200).json({ message: "Friend request accepted" });
    };
    rejectFriendRequest = async (req, res) => {
        const { requestId } = req.params;
        const request = await friendRequest_model_1.friendRequestModel.findOneAndDelete({
            _id: requestId,
            $or: [{ sendTo: req.user.id }, { sendBy: req.user.id }],
        });
        if (!request)
            throw new error_response_1.NotFoundException("Request not found!!!");
        return res.status(200).json({ message: "Friend request removed" });
    };
    removeFriend = async (req, res) => {
        const { userId } = req.params;
        const myId = req.user.id;
        await Promise.all([
            user_model_1.userModel.updateOne({ _id: myId }, { $pull: { friends: userId } }),
            user_model_1.userModel.updateOne({ _id: userId }, { $pull: { friends: myId } }),
        ]);
        return res.status(200).json({ message: "Friend removed successfully" });
    };
    blockUser = async (req, res) => {
        const { userId } = req.params;
        const myId = req.user.id;
        if (userId === myId.toString())
            throw new error_response_1.BadRequestException("Can't block urself");
        const target = await user_model_1.userModel.findById(userId);
        if (!target)
            throw new error_response_1.NotFoundException("User not found");
        if (req.user.blockedUsers.some((id) => id.equals(target._id)))
            throw new error_response_1.BadRequestException("Already blocked");
        await Promise.all([
            user_model_1.userModel.findByIdAndUpdate(myId, {
                $pull: { friends: userId },
                $addToSet: { blockedUsers: userId },
            }),
            user_model_1.userModel.findByIdAndUpdate(userId, {
                $pull: { friends: myId },
            }),
            friendRequest_model_1.friendRequestModel.deleteMany({
                $or: [
                    { sendBy: myId, sendTo: userId },
                    { sendBy: userId, sendTo: myId },
                ],
            }),
        ]);
        return res.status(200).json({ message: "User blocked successfully" });
    };
    unblockUser = async (req, res) => {
        const { userId } = req.params;
        const myId = req.user.id;
        if (!req.user.blockedUsers.some((id) => id.equals(userId)))
            throw new error_response_1.BadRequestException("User already unblocked");
        await user_model_1.userModel.updateOne({ _id: myId }, {
            $pull: { blockedUsers: userId },
        });
        return res.status(200).json({ message: "User unblocked successfully" });
    };
}
exports.default = new UserService();
