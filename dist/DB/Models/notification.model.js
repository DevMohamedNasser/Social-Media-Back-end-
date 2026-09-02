"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationModel = exports.notificationSchema = exports.NotificationTypeEnum = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var NotificationTypeEnum;
(function (NotificationTypeEnum) {
    NotificationTypeEnum["friendRequest"] = "Friend Request";
    NotificationTypeEnum["friendAccepted"] = "Friend Accepted";
    NotificationTypeEnum["postReacted"] = "Post Reacted";
    NotificationTypeEnum["postComment"] = "Post Comment";
    NotificationTypeEnum["commentReply"] = "Comment Reply";
    NotificationTypeEnum["receiveMsg"] = "Receive Msg";
})(NotificationTypeEnum || (exports.NotificationTypeEnum = NotificationTypeEnum = {}));
exports.notificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    senderId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Post",
    },
    commentId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Comment",
    },
    requestId: {
        type: mongoose_1.Types.ObjectId,
        ref: "FriendRequest",
    },
    type: {
        type: String,
        enum: Object.values(NotificationTypeEnum),
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    readAt: {
        type: Date,
    },
}, { timestamps: true });
// Compound Index
exports.notificationSchema.index({ userId: 1, createdAt: -1 });
exports.notificationSchema.index({ userId: 1, readAt: 1 });
// TTL (Time To Live)
exports.notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 } /** a month */);
exports.notificationModel = mongoose_1.default.models.Notification ||
    mongoose_1.default.model("Notification", exports.notificationSchema);
