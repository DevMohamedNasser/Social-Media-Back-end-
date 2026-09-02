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
exports.registerChatEvents = void 0;
const conversation_model_1 = require("../../DB/Models/conversation.model");
const user_model_1 = require("../../DB/Models/user.model");
const error_response_1 = require("../response/error.response");
const socket_helper_1 = require("./socket.helper");
const validators = __importStar(require("../../Modules/Chat/chat.validation"));
const message_model_1 = require("../../DB/Models/message.model");
const connected_users_1 = require("./connected.users");
const notification_event_1 = require("../events/notification.event");
const getChatPartner = async (me, otherId) => {
    // if (me._id.toString() === otherId)
    //     throw new BadRequestException("U can't chat with urself")
    const other = await user_model_1.userModel.findById(otherId);
    if (!other)
        throw new error_response_1.NotFoundException("User not found");
    const iBlockedHim = me.blockedUsers.some((id) => id.equals(otherId));
    const heBlockedMe = other.blockedUsers.some((id) => id.equals(me._id));
    if (iBlockedHim || heBlockedMe)
        throw new error_response_1.BadRequestException("U can't message this user");
    if (!me.friends.some((id) => id.equals(otherId)))
        throw new error_response_1.ForbiddenException("U can only chat with ur friends");
    return other;
};
const findOrCreateConversation = async (userA, userB) => {
    const conversation = await conversation_model_1.conversationModel.findOne({
        participants: { $all: [userA, userB] },
    });
    if (conversation)
        return conversation;
    return conversation_model_1.conversationModel.create({ participants: [userA, userB] });
};
const registerChatEvents = (io, socket) => {
    const user = socket.user;
    const userId = user._id.toString();
    socket.on("sendMessage", (0, socket_helper_1.handleEvent)(socket, "sendMessage", validators.sendMessageSchema, async (data) => {
        const receiver = await getChatPartner(user, data.to);
        const conversation = await findOrCreateConversation(user._id, receiver._id);
        const message = await message_model_1.messageModel.create({
            conversationId: conversation._id,
            senderId: user._id,
            receiverId: receiver._id,
            content: data.content,
        });
        await conversation_model_1.conversationModel.updateOne({ _id: conversation._id }, {
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            lastMessageBy: user._id,
        });
        const payload = {
            _id: message._id,
            conversationId: conversation._id,
            content: message.content,
            createdAt: message.createdAt,
            receiverId: receiver._id,
            sender: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
        io.to(data.to).emit("newMessage", payload);
        // Acknowledgement
        io.to(userId).emit("messageSent", {
            ...payload,
            delivered: (0, connected_users_1.isUserOnline)(data.to),
        });
        // Firebase sending notification
        notification_event_1.notificationEvent.emit("sendMsg", {
            to: receiver._id,
            sender: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            content: data.content,
        });
    }));
    socket.on("typing", (0, socket_helper_1.handleEvent)(socket, "typing", validators.typingSchema, (data) => {
        io.to(data.to).emit("userTyping", {
            userId: user._id,
            firstName: user.firstName,
        });
    }));
    socket.on("stopTyping", (0, socket_helper_1.handleEvent)(socket, "stopTyping", validators.typingSchema, (data) => {
        io.to(data.to).emit("userStopTyping", {
            userId,
            firstName: user.firstName,
        });
    }));
    socket.on("markAsRead", (0, socket_helper_1.handleEvent)(socket, "markAsRead", validators.markAsReadSchema, async (data) => {
        const readAt = Date.now();
        const results = await message_model_1.messageModel.updateMany({
            senderId: data.from,
            receiverId: user._id,
            readAt: { $exists: false },
        }, { readAt });
        if (results.modifiedCount > 0) {
            io.to(data.from).emit("messageRead", {
                by: userId,
                readAt,
                count: results.modifiedCount,
            });
        }
    }));
};
exports.registerChatEvents = registerChatEvents;
