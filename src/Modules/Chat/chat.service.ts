import { Request, Response } from "express-serve-static-core";
import { conversationModel } from "../../DB/Models/conversation.model";
import { isUserOnline } from "../../Utils/socket/connected.users";
import { messageModel } from "../../DB/Models/message.model";

class ChatService {
  constructor() {}

  listConversations = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { page, limit } = req.query as unknown as {
      page: number;
      limit: number;
    };

    const skip = (page - 1) * limit;

    const filter = { participants: req.user!._id };

    const [conversation, total] = await Promise.all([
      conversationModel
        .find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants"),
      conversationModel.countDocuments(filter),
    ]);

    const data = conversation.map((conversation) => {
      const other = (
        conversation.participants as unknown as Array<{
          _id: { toString(): string };
        }>
      ).find((participant) => {
        participant._id.toString() !== req.user!._id.toString();
      });

      return {
        _id: conversation._id,
        user: other,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        isOnline: other ? isUserOnline(other._id.toString()) : false,
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

  getMessages = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as { userId: string };
    const { page, limit } = req.query as unknown as {
      page: number;
      limit: number;
    };

    const skip = (page - 1) * limit;

    const conversation = await conversationModel.findOne({
      participants: { $all: [req.user!._id, userId] },
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
      messageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId"),
      messageModel.countDocuments(filter),
    ]);

    return res.status(200).json({ message: "Success", data: {
      conversationId: conversation._id,
      messages,
      pagination: {page, limit, total, pages: Math.ceil(total / limit), }
    } });
  };
}

export default new ChatService();
