"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/Models/user.model");
const notification_model_1 = require("../../DB/Models/notification.model");
const error_response_1 = require("../../Utils/response/error.response");
class NotificationService {
    constructor() { }
    addDeviceToken = async (req, res) => {
        const { token } = req.body;
        await user_model_1.userModel.updateOne({ _id: req.user.id }, {
            $addToSet: { deviceTokens: token },
        });
        return res.status(200).json({ message: "Device Registered Successfully" });
    };
    removeDeviceToken = async (req, res) => {
        const { token } = req.body;
        await user_model_1.userModel.updateOne({ _id: req.user.id }, {
            $pull: { deviceTokens: token },
        });
        return res.status(200).json({ message: "Device Removed Successfully" });
    };
    listNotification = async (req, res) => {
        const { limit = 5, page = 1, unreadOnly, } = req.query;
        const skip = (page - 1) * limit;
        const filter = {
            userId: req.user.id,
            ...(unreadOnly && { readAt: { $exists: false } }),
        };
        const [notifications, total, unread] = await Promise.all([
            notification_model_1.notificationModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            notification_model_1.notificationModel.countDocuments(filter),
            notification_model_1.notificationModel.countDocuments({
                userId: req.user.id,
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
    unreadCount = async (req, res) => {
        const unread = await notification_model_1.notificationModel.countDocuments({
            userId: req.user.id,
            readAt: { $exists: false },
        });
        return res.status(200).json({ message: "done", data: { unread } });
    };
    markAsRead = async (req, res) => {
        const { id } = req.params;
        const notification = await notification_model_1.notificationModel.findOneAndUpdate({
            _id: id,
            userId: req.user.id,
        }, {
            readAt: new Date(),
            $inc: { __v: 1 },
        }, {
            returnDocument: "after",
        });
        if (!notification)
            throw new error_response_1.BadRequestException("Notification not found");
        return res.status(200).json({ message: "done", data: { notification } });
    };
    markAllAsRead = async (req, res) => {
        const results = await notification_model_1.notificationModel.updateMany({
            userId: req.user.id,
            readAt: { $exists: false },
        }, {
            readAt: new Date(),
            $inc: { __v: 1 },
        });
        return res.status(200).json({
            message: "All Notification Marked as Read",
            data: { EditedCount: results.modifiedCount },
        });
    };
    deleteNotification = async (req, res) => {
        const { id } = req.params;
        const notification = await notification_model_1.notificationModel.deleteOne({
            _id: id,
            userId: req.user.id,
        });
        if (!notification.deletedCount)
            throw new error_response_1.NotFoundException("Notification not found");
        return res.status(200).json({ message: "done" });
    };
    clearAll = async (req, res) => {
        const notifications = await notification_model_1.notificationModel.deleteMany({
            userId: req.user.id,
        });
        return res.status(200).json({
            message: "done",
            data: {
                deletedCount: notifications.deletedCount,
            },
        });
    };
}
exports.default = new NotificationService();
