"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationToMany = exports.sendNotification = void 0;
const notification_model_1 = require("../../DB/Models/notification.model");
const user_model_1 = require("../../DB/Models/user.model");
const firebase_config_1 = require("./firebase.config");
const chalk_1 = __importDefault(require("chalk"));
// الpayload للfirebase لازم الداتا كلها سترنج حتي لو id
const buildData = (payload) => {
    const data = {
        type: payload.type,
        senderId: payload.senderId.toString(),
    };
    if (payload.postId)
        data.postId = payload.postId.toString();
    if (payload.commentId)
        data.commentId = payload.commentId.toString();
    if (payload.requestId)
        data.requestId = payload.requestId.toString();
    return data;
};
const sendNotification = async (payload, storeDB = true) => {
    try {
        if (payload.userId.equals(payload.senderId))
            return;
        const recipient = await user_model_1.userModel
            .findById(payload.userId)
            .select("deviceTokens notificationEnabled blockedUsers");
        if (!recipient)
            return;
        if (recipient.blockedUsers.some((id) => id.equals(payload.senderId)))
            return;
        // Store Notification in DB
        (storeDB && await notification_model_1.notificationModel.create({
            userId: payload.userId,
            senderId: payload.senderId,
            type: payload.type,
            title: payload.title,
            body: payload.body,
            ...(payload.postId && { postId: payload.postId }),
            ...(payload.commentId && { commentId: payload.commentId }),
            ...(payload.requestId && { requestId: payload.requestId }),
        }));
        if (!recipient.notificationEnabled) {
            console.log("[push] skipped - User has notification disabled");
            return;
        }
        const tokens = recipient.deviceTokens ?? [];
        if (!tokens.length) {
            console.log("[push] skipped - User has no register devices");
            return;
        }
        const messaging = (0, firebase_config_1.getFirebaseMessaging)();
        if (!messaging) {
            console.log("[push] skipped - Firebase isn't initialized");
            return;
        }
        const response = await messaging.sendEachForMulticast({
            tokens,
            notification: { title: payload.title, body: payload.body },
            data: buildData(payload),
        });
        console.log(`[push] success: ${response.successCount}, failure: ${response.failureCount}`);
    }
    catch (error) {
        console.log(chalk_1.default.red("[push] failed to send notification: ", error.message));
    }
};
exports.sendNotification = sendNotification;
const sendNotificationToMany = async (userIds, payload) => {
    await Promise.all(userIds.map((userId) => (0, exports.sendNotification)({ ...payload, userId })));
};
exports.sendNotificationToMany = sendNotificationToMany;
