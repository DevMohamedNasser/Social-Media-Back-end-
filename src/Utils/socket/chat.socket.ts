import { Server } from "socket.io";
import { conversationModel } from "../../DB/Models/conversation.model";
import { HUserDocument, userModel } from "../../DB/Models/user.model";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../response/error.response";
import { authedSocket } from "./socket.service";
import { handleEvent } from "./socket.helper";
import * as validators from "../../Modules/Chat/chat.validation";
import { Types } from "mongoose";
import { messageModel } from "../../DB/Models/message.model";
import { isUserOnline } from "./connected.users";

const getChatPartner = async (
  me: HUserDocument,
  otherId: string,
): Promise<HUserDocument> => {
  // if (me._id.toString() === otherId)
  //     throw new BadRequestException("U can't chat with urself")

  const other = await userModel.findById(otherId);
  if (!other) throw new NotFoundException("User not found");

  const iBlockedHim = me.blockedUsers.some((id) => id.equals(otherId));
  const heBlockedMe = other.blockedUsers.some((id) => id.equals(me._id));

  if (iBlockedHim || heBlockedMe)
    throw new BadRequestException("U can't message this user");

  if (!me.friends.some((id) => id.equals(otherId)))
    throw new ForbiddenException("U can only chat with ur friends");

  return other;
};

const findOrCreateConversation = async (
  userA: Types.ObjectId,
  userB: Types.ObjectId,
) => {
  return conversationModel.findOneAndUpdate(
    { participants: { $all: [userA, userB] } },
    { $setOnInsert: { participants: [userA, userB] } },
    { upsert: true, returnDocument: "after" }, // upsert: if User exists update else create then update
  );
};

export const registerChatEvents = (io: Server, socket: authedSocket): void => {
  const user = socket.user!;
  const userId = user._id.toString();

  socket.on(
    "sendMessage",
    handleEvent(
      socket,
      "sendMessage",
      validators.sendMessageSchema,
      async (data) => {
        const receiver = await getChatPartner(user, data.to);
        const conversation = await findOrCreateConversation(
          user._id,
          receiver._id,
        );

        const message = await messageModel.create({
          conversationId: conversation._id,
          senderId: user._id,
          receiverId: receiver._id,
          content: data.content,
        });

        await conversationModel.updateOne(
          { _id: conversation._id },
          {
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            lastMessageBy: user._id,
          },
        );

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
          delivered: isUserOnline(data.to),
        });
      },
    ),
  );

  socket.on(
    "typing",
    handleEvent(socket, "typing", validators.typingSchema, (data) => {
      io.to(data.to).emit("userTyping", {
        userId: user._id,
        firstName: user.firstName,
      });
    }),
  );

  socket.on(
    "stopTyping",
    handleEvent(socket, "stopTyping", validators.typingSchema, (data) => {
      io.to(data.to).emit("userStopTyping", {
        userId,
        firstName: user.firstName,
      });
    }),
  );
};
