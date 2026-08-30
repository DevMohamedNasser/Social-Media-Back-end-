"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEvent = void 0;
const error_response_1 = require("../response/error.response");
const handleEvent = (socket, eventName, schema, handler) => {
    return async (raw) => {
        try {
            const results = schema.safeParse(raw);
            if (!results.success) {
                const message = results.error.issues[0]?.message ?? "Invalid data";
                socket.emit("socketError", { event: eventName, error: message });
                return;
            }
            await handler(results.data);
        }
        catch (error) {
            const isOurError = error instanceof error_response_1.ApplicationExceptions;
            console.log(`Socket ${eventName} error:`, error);
            socket.emit("socketError", {
                event: eventName,
                error: isOurError ? error.message : "Something went wrong",
            });
        }
    };
};
exports.handleEvent = handleEvent;
