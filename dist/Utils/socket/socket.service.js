"use strict";
// setup connection & authorization headers middleware
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = exports.getIo = void 0;
const socket_io_1 = require("socket.io");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const chalk_1 = __importDefault(require("chalk"));
const precence_socket_1 = require("./precence.socket");
const chat_socket_1 = require("./chat.socket");
let io = null;
const getIo = () => io;
exports.getIo = getIo;
const initializeSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
        },
    });
    /** Socket Middleware */
    io.use(async (socket, next) => {
        try {
            const authorization = socket.handshake.headers.authorization;
            const { user } = await (0, authentication_middleware_1.decodedToken)({
                authorization,
                tokenType: authentication_middleware_1.TokenTypeEnum.access,
            });
            socket.user = user;
            next();
        }
        catch (error) {
            next(new Error(error.message) ||
                "Unauthorized socket (Check headers authorization)");
        }
    });
    io.on("connection", (socket) => {
        const user = socket.user;
        const userId = user?._id.toString();
        console.log(`[Socket] connected: ${user?.username}, ${socket.id}`);
        // add user in empty room as if client is online from many devices. If user received message It will delivered to all devices
        socket.join(userId);
        (0, precence_socket_1.registerPresenceEvents)(io, socket);
        (0, chat_socket_1.registerChatEvents)(io, socket);
    });
    console.log(chalk_1.default.green(`[socket] Server is ready`));
    return io;
};
exports.initializeSocket = initializeSocket;
