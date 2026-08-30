// online | offline

const connectedUsers = new Map<string, Set<string>>();
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

export const addConnection = (userId: string, socketId: string): boolean => {
  const sockets = connectedUsers.get(userId);

  if (!sockets) {
    // create new set & put first socketId inside it
    connectedUsers.set(userId, new Set([socketId]));
    return true; // (become online)
  }

  sockets.add(socketId);
  return false; // (already online)
};

export const removeConnection = (userId: string, socketId: string): boolean => {
  const sockets = connectedUsers.get(userId);

  if (!sockets) {
    return false; // no transition
  }

  sockets.delete(socketId);

  if (sockets.size > 0) return false; // still online (from other devices)

  connectedUsers.delete(userId);
  return true; // become offline
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

export const getOnlineUserIds = (): string[] => {
  return [...connectedUsers.keys()];
};

export const getUserSocketCount = (userId: string): number => {
  return connectedUsers.get(userId)?.size ?? 0;
};
