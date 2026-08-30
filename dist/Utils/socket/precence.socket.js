"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPresenceEvents = void 0;
const user_model_1 = require("../../DB/Models/user.model");
const connected_users_1 = require("./connected.users");
const socket_helper_1 = require("./socket.helper");
const getOnlineFriendsIds = (user) => {
    const onlineIds = (0, connected_users_1.getOnlineUserIds)();
    return (user.friends ?? [])
        .map((friendId) => friendId.toString())
        .filter((friendId) => onlineIds.includes(friendId));
};
const notifyFriends = (io, user, event, payload) => {
    (user.friends ?? []).forEach((friendId) => {
        io.to(friendId.toString()).emit(event, payload);
    });
};
const registerPresenceEvents = (io, socket) => {
    const user = socket.user;
    const userId = user?._id.toString();
    const isFirstDevice = (0, connected_users_1.addConnection)(userId, socket.id);
    if (isFirstDevice) {
        notifyFriends(io, user, "userOnline", {
            userId,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    }
    socket.emit("onlineFriends", { friends: getOnlineFriendsIds(user) }); // get online ids
    const emptySchema = {};
    socket.on("getOnlineFriends", (0, socket_helper_1.handleEvent)(socket, "getOnlineFriends", emptySchema, () => {
        socket.emit("onlineFriends", { friend: getOnlineFriendsIds(user) });
    }));
    socket.on("disconnect", async () => {
        console.log(`[Socket] disconnected id: ${user.firstName}, (${socket.id})`);
        const isLastDevice = (0, connected_users_1.removeConnection)(userId, socket.id);
        if (!isLastDevice)
            return;
        const lastSeen = new Date();
        await user_model_1.userModel.updateOne({ _id: user._id }, { lastSeen });
        notifyFriends(io, user, "userOffline", { userId, lastSeen });
    });
};
exports.registerPresenceEvents = registerPresenceEvents;
