"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conversation_model_1 = require("../../DB/Models/conversation.model");
const connected_users_1 = require("../../Utils/socket/connected.users");
const message_model_1 = require("../../DB/Models/message.model");
class ChatService {
    constructor() { }
    listConversations = async (req, res) => {
        const { page, limit } = req.query;
        const skip = (page - 1) * limit;
        const filter = { participants: req.user._id };
        const [conversation, total] = await Promise.all([
            conversation_model_1.conversationModel
                .find(filter)
                .sort({ lastMessageAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("participants"),
            conversation_model_1.conversationModel.countDocuments(filter),
        ]);
        const data = conversation.map((conversation) => {
            const other = conversation.participants.find((participant) => {
                participant._id.toString() !== req.user._id.toString();
            });
            return {
                _id: conversation._id,
                user: other,
                lastMessage: conversation.lastMessage,
                lastMessageAt: conversation.lastMessageAt,
                isOnline: other ? (0, connected_users_1.isUserOnline)(other._id.toString()) : false,
            };
        });
        return res.status(200).json({
            message: "Success",
            data: {
                conversation: data,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            },
        });
    };
    getMessages = async (req, res) => {
        const { userId } = req.params;
        const { page, limit } = req.query;
        const skip = (page - 1) * limit;
        const conversation = await conversation_model_1.conversationModel.findOne({
            participants: { $all: [req.user._id, userId] },
        });
        if (!conversation)
            return res.status(200).json({
                message: "Success",
                data: {
                    messages: [],
                    pagination: { page, limit, total: 0, pages: 0 },
                },
            });
        const filter = { conversationId: conversation._id };
        const [messages, total] = await Promise.all([
            message_model_1.messageModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("senderId"),
            message_model_1.messageModel.countDocuments(filter),
        ]);
        return res.status(200).json({ message: "Success", data: {
                conversationId: conversation._id,
                messages,
                pagination: { page, limit, total, pages: Math.ceil(total / limit), }
            } });
    };
}
exports.default = new ChatService();
