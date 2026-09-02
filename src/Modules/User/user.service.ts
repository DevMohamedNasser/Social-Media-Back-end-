import { Request, Response } from "express";
import { IRequestIdParamsDTO, IUserIdDTO } from "./user.dto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { userModel } from "../../DB/Models/user.model";
import { friendRequestModel } from "../../DB/Models/friendRequest.model";
import { notificationEvent } from "../../Utils/events/notification.event";

class UserService {
  constructor() {}

  sendFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { userId }: IUserIdDTO = req.params as { userId: string };
    const senderId = req.user!.id;

    if (senderId.toString() === userId)
      throw new BadRequestException("Can't send request to urself");

    const targetUser = await userModel.findById(userId);
    if (!targetUser) throw new NotFoundException("User not found");

    if (
      targetUser.blockedUsers.some((id) => id.equals(senderId)) ||
      req.user!.blockedUsers.some((id) => id.equals(targetUser._id))
    )
      throw new ForbiddenException("Can't send request to this user");

    if (targetUser.friends.some((id) => id.equals(senderId)))
      throw new ConflictException("U are already friend");

    const existing = await friendRequestModel.findOne({
      $or: [
        { sendBy: senderId, sendTo: targetUser._id },
        { sendBy: targetUser._id, sendTo: senderId },
      ],
    });
    if (existing) throw new ConflictException("Request already exists");

    const friendRequest = await friendRequestModel.create({
      sendBy: senderId,
      sendTo: targetUser._id,
    });

    notificationEvent.emit("friendRequest", {
      to: targetUser._id,
      sender: req.user!,
      requestId: friendRequest._id,
    });

    return res
      .status(201)
      .json({ message: "Request sended successfully", friendRequest });
  };

  listFriendRequests = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const list = await friendRequestModel
      .find({ sendTo: req.user!.id })
      .populate("sendBy", "firstName lastName email -_id")
      .lean();

    return res.status(200).json({ message: "Fetched successfully", list });
  };

  acceptFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { requestId }: IRequestIdParamsDTO = req.params as {
      requestId: string;
    };

    const friendRequest = await friendRequestModel.findOne({
      _id: requestId,
      sendTo: req.user!.id,
    });
    if (!friendRequest) throw new NotFoundException("Friend request not found");

    await Promise.all([
      userModel.findByIdAndUpdate(friendRequest.sendTo, {
        $addToSet: { friends: friendRequest.sendBy },
      }),
      userModel.findByIdAndUpdate(friendRequest.sendBy, {
        $addToSet: { friends: friendRequest.sendTo },
      }),
    ]);

    notificationEvent.emit("friendAccepted", {
      to: friendRequest.sendBy,
      sender: req.user!,
    });

    await friendRequestModel.deleteOne({ _id: requestId });

    return res.status(200).json({ message: "Friend request accepted" });
  };

  rejectFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { requestId }: IRequestIdParamsDTO = req.params as {
      requestId: string;
    };

    const request = await friendRequestModel.findOneAndDelete({
      _id: requestId,
      $or: [{ sendTo: req.user!.id }, { sendBy: req.user!.id }],
    });
    if (!request) throw new NotFoundException("Request not found!!!");

    return res.status(200).json({ message: "Friend request removed" });
  };

  removeFriend = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdDTO = req.params as { userId: string };
    const myId = req.user!.id;

    await Promise.all([
      userModel.updateOne({ _id: myId }, { $pull: { friends: userId } }),
      userModel.updateOne({ _id: userId }, { $pull: { friends: myId } }),
    ]);

    return res.status(200).json({ message: "Friend removed successfully" });
  };

  blockUser = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdDTO = req.params as { userId: string };
    const myId = req.user!.id;

    if (userId === myId.toString())
      throw new BadRequestException("Can't block urself");

    const target = await userModel.findById(userId);
    if (!target) throw new NotFoundException("User not found");

    if (req.user!.blockedUsers.some((id) => id.equals(target._id)))
      throw new BadRequestException("Already blocked");

    await Promise.all([
      userModel.findByIdAndUpdate(myId, {
        $pull: { friends: userId },
        $addToSet: { blockedUsers: userId },
      }),
      userModel.findByIdAndUpdate(userId, {
        $pull: { friends: myId },
      }),
      friendRequestModel.deleteMany({
        $or: [
          { sendBy: myId, sendTo: userId },
          { sendBy: userId, sendTo: myId },
        ],
      }),
    ]);

    return res.status(200).json({ message: "User blocked successfully" });
  };

  unblockUser = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: IUserIdDTO = req.params as { userId: string };
    const myId = req.user!.id;

    if (!req.user!.blockedUsers.some((id) => id.equals(userId)))
      throw new BadRequestException("User already unblocked");

    await userModel.updateOne(
      { _id: myId },
      {
        $pull: { blockedUsers: userId },
      },
    );

    return res.status(200).json({ message: "User unblocked successfully" });
  };

  profile = async (req: Request, res: Response): Promise<Response> => {
    const user = await req.user?.populate(
      "friends",
      "firstName lastName profilePic",
    );

    return res.status(200).json({ message: "Success", data: { user } });
  };
}

export default new UserService();
