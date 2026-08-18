import { Request, Response } from "express";
import {
  IDeviceTokenDTO,
  IListNotificationDTO,
  INotificationIdDTO,
} from "./notification.dto";
import { userModel } from "../../DB/Models/user.model";
import { notificationModel } from "../../DB/Models/notification.model";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/response/error.response";

class NotificationService {
  constructor() {}

  addDeviceToken = async (req: Request, res: Response): Promise<Response> => {
    const { token }: IDeviceTokenDTO = req.body;

    await userModel.updateOne(
      { _id: req.user!.id },
      {
        $addToSet: { deviceTokens: token },
      },
    );

    return res.status(200).json({ message: "Device Registered Successfully" });
  };

  removeDeviceToken = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { token }: IDeviceTokenDTO = req.body;

    await userModel.updateOne(
      { _id: req.user!.id },
      {
        $pull: { deviceTokens: token },
      },
    );

    return res.status(200).json({ message: "Device Removed Successfully" });
  };

  listNotification = async (req: Request, res: Response): Promise<Response> => {
    const {
      limit = 5,
      page = 1,
      unreadOnly,
    }: IListNotificationDTO = req.query as unknown as {
      limit: number;
      page: number;
      unreadOnly: boolean;
    };

    const skip = (page - 1) * limit;

    const filter = {
      userId: req.user!.id,
      ...(unreadOnly && { readAt: { $exists: false } }),
    };

    const [notifications, total, unread] = await Promise.all([
      notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      notificationModel.countDocuments(filter),
      notificationModel.countDocuments({
        userId: req.user!.id,
        readAt: { $exists: false },
      }),
    ]);

    return res.status(200).json({
      message: "done",
      data: {
        notifications,
        unread,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  };

  unreadCount = async (req: Request, res: Response): Promise<Response> => {
    const unread = await notificationModel.countDocuments({
      userId: req.user!.id,
      readAt: { $exists: false },
    });

    return res.status(200).json({ message: "done", data: { unread } });
  };

  markAsRead = async (req: Request, res: Response): Promise<Response> => {
    const { id }: INotificationIdDTO = req.params as { id: string };

    const notification = await notificationModel.findOneAndUpdate(
      {
        _id: id,
        userId: req.user!.id,
      },
      {
        readAt: new Date(),
        $inc: { __v: 1 },
      },
      {
        returnDocument: "after",
      },
    );
    if (!notification) throw new BadRequestException("Notification not found");

    return res.status(200).json({ message: "done", data: { notification } });
  };

  markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    const results = await notificationModel.updateMany(
      {
        userId: req.user!.id,
        readAt: { $exists: false },
      },
      {
        readAt: new Date(),
        $inc: { __v: 1 },
      },
    );

    return res.status(200).json({
      message: "All Notification Marked as Read",
      data: { EditedCount: results.modifiedCount },
    });
  };

  deleteNotification = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { id }: INotificationIdDTO = req.params as { id: string };

    const notification = await notificationModel.deleteOne({
      _id: id,
      userId: req.user!.id,
    });
    if (!notification.deletedCount)
      throw new NotFoundException("Notification not found");

    return res.status(200).json({ message: "done" });
  };

  clearAll = async (req: Request, res: Response): Promise<Response> => {
    const notifications = await notificationModel.deleteMany({
      userId: req.user!.id,
    });

    return res.status(200).json({
      message: "done",
      data: {
        deletedCount: notifications.deletedCount,
      },
    });
  };
}

export default new NotificationService();
