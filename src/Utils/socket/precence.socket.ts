import { Server } from "socket.io";
import { HUserDocument, userModel } from "../../DB/Models/user.model";
import {
  addConnection,
  getOnlineUserIds,
  removeConnection,
} from "./connected.users";
import { authedSocket } from "./socket.service";
import { handleEvent } from "./socket.helper";
import { ZodType } from "zod";

const getOnlineFriendsIds = (user: HUserDocument): string[] => {
  const onlineIds = getOnlineUserIds();

  return (user.friends ?? [])
    .map((friendId) => friendId.toString())
    .filter((friendId) => onlineIds.includes(friendId));
};

const notifyFriends = (
  io: Server,
  user: HUserDocument,
  event: string,
  payload: Record<string, unknown>,
): void => {
  (user.friends ?? []).forEach((friendId) => {
    io.to(friendId.toString()).emit(event, payload);
  });
};

export const registerPresenceEvents = (
  io: Server,
  socket: authedSocket,
): void => {
  const user = socket.user!;
  const userId = user._id.toString();

  const isFirstDevice = addConnection(userId, socket.id);

  if (isFirstDevice) {
    notifyFriends(io, user, "userOnline", {
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  socket.emit("onlineFriends", { friends: getOnlineFriendsIds(user) }); // get online ids
  const emptySchema = {} as ZodType;
  socket.on(
    "getOnlineFriends",
    handleEvent(socket, "getOnlineFriends", emptySchema, () => {
      socket.emit("onlineFriends", { friend: getOnlineFriendsIds(user) });
    }),
  );

  socket.on("disconnect", async () => {
    console.log(`[Socket] disconnected id: ${user.firstName}, (${socket.id})`);

    const isLastDevice = removeConnection(userId, socket.id);
    if (!isLastDevice) return;

    const lastSeen = new Date();
    await userModel.updateOne({ _id: user._id }, { lastSeen });
    notifyFriends(io, user, "userOffline", { userId, lastSeen });
  });
};
