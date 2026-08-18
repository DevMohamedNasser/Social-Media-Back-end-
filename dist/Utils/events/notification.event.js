"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationEvent = void 0;
const node_events_1 = require("node:events");
const push_service_1 = require("../firebase/push.service");
const notification_model_1 = require("../../DB/Models/notification.model");
exports.notificationEvent = new node_events_1.EventEmitter();
const fullName = (user) => `${user.firstName} ${user.lastName}`;
exports.notificationEvent.on("friendRequest", async (data) => {
    await (0, push_service_1.sendNotification)({
        userId: data.to,
        senderId: data.sender._id,
        type: notification_model_1.NotificationTypeEnum.friendRequest,
        title: "New Friend Request",
        body: `${fullName(data.sender)} send u a friend request`,
        requestId: data.requestId,
    });
});
exports.notificationEvent.on("friendAccepted", async (data) => {
    await (0, push_service_1.sendNotification)({
        userId: data.to,
        senderId: data.sender._id,
        type: notification_model_1.NotificationTypeEnum.friendAccepted,
        title: "New Friend Accepted",
        body: `${fullName(data.sender)} accept ur friend request`,
    });
});
exports.notificationEvent.on("postLiked", async (data) => {
    await (0, push_service_1.sendNotification)({
        userId: data.to,
        senderId: data.sender._id,
        type: notification_model_1.NotificationTypeEnum.postReacted,
        title: "New Like",
        body: `${fullName(data.sender)} has reacted ur post`,
        postId: data.postId,
    });
});
exports.notificationEvent.on("postComment", async (data) => {
    await (0, push_service_1.sendNotification)({
        userId: data.to,
        senderId: data.sender._id,
        type: notification_model_1.NotificationTypeEnum.postComment,
        title: "New Comment",
        body: `${fullName(data.sender)} commented: ${data.content}`,
        postId: data.postId,
        commentId: data.commentId,
    });
});
exports.notificationEvent.on("commentReply", async (data) => {
    await (0, push_service_1.sendNotification)({
        userId: data.to,
        senderId: data.sender._id,
        type: notification_model_1.NotificationTypeEnum.commentReply,
        title: "New Reply",
        body: `${fullName(data.sender)} replied: ${data.content}`,
        postId: data.postId,
        commentId: data.commentId,
    });
});
