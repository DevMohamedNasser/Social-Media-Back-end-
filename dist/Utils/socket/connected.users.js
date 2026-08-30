"use strict";
// online | offline
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSocketCount = exports.getOnlineUserIds = exports.isUserOnline = exports.removeConnection = exports.addConnection = void 0;
const connectedUsers = new Map();
/* _id -------> [socketIds]

User ID                  Socket IDs
────────────────────────────────────────
user1                    [socketA, socketB]
user2                    [socketC]
user3                    [socketD, socketE, socketF]

                    Map
             ┌──────────────────┐
             │                  │
User A ──────┤  Set             │
             │  socket1         │
             │  socket2         │
             │                  │
User B ──────┤  Set             │
             │  socket3         │
             │                  │
User C ──────┤  Set             │
             │  socket4         │
             │  socket5         │
             └──────────────────┘

new Map ===> .set(), .get(), .has(), .delete(), .keys(), .values(), .size returns number of keys,
new Set ===> .add(), .delete(), .has(), .size,


*/
const addConnection = (userId, socketId) => {
    const sockets = connectedUsers.get(userId);
    if (!sockets) {
        // create new set & put first socketId inside it
        connectedUsers.set(userId, new Set([socketId]));
        return true; // (become online)
    }
    sockets.add(socketId);
    return false; // (already online)
};
exports.addConnection = addConnection;
const removeConnection = (userId, socketId) => {
    const sockets = connectedUsers.get(userId);
    if (!sockets) {
        return false; // no transition
    }
    sockets.delete(socketId);
    if (sockets.size > 0)
        return false; // still online (from other devices)
    connectedUsers.delete(userId);
    return true; // become offline
};
exports.removeConnection = removeConnection;
const isUserOnline = (userId) => {
    return connectedUsers.has(userId);
};
exports.isUserOnline = isUserOnline;
const getOnlineUserIds = () => {
    return [...connectedUsers.keys()];
};
exports.getOnlineUserIds = getOnlineUserIds;
const getUserSocketCount = (userId) => {
    return connectedUsers.get(userId)?.size ?? 0;
};
exports.getUserSocketCount = getUserSocketCount;
