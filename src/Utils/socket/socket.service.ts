// setup connection & authorization headers middleware

import { Server, Socket } from "socket.io";
import { Server as httpServer } from "node:http";
import { HUserDocument } from "../../DB/Models/user.model";
import {
  decodedToken,
  TokenTypeEnum,
} from "../../Middlewares/authentication.middleware";
import chalk from "chalk";
import { registerPresenceEvents } from "./precence.socket";
import { registerChatEvents } from "./chat.socket";

export interface authedSocket extends Socket {
  user?: HUserDocument;
}

let io: Server | null = null;

export const getIo = (): Server | null => io;

export const initializeSocket = (httpServer: httpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  /** Socket Middleware */
  io.use(async (socket: authedSocket, next) => {
    try {
      const authorization = socket.handshake.headers.authorization;

      const { user } = await decodedToken({
        authorization,
        tokenType: TokenTypeEnum.access,
      });

      socket.user = user;

      next();
    } catch (error) {
      next(
        new Error((error as Error).message) ||
          "Unauthorized socket (Check headers authorization)",
      );
    }
  });

  io.on("connection", (socket: authedSocket) => {
    const user = socket.user;
    const userId = user?._id.toString() as string;

    console.log(`[Socket] connected: ${user?.username}, ${socket.id}`);

    // add user in empty room as if client is online from many devices. If user received message It will delivered to all devices
    socket.join(userId);
    registerPresenceEvents(io, socket);
    registerChatEvents(io, socket);
  });

  console.log(chalk.green(`[socket] Server is ready`));
  return io;
};
