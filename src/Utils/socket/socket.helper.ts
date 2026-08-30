import { Socket } from "socket.io";
import { ZodType } from "zod";
import { ApplicationExceptions } from "../response/error.response";

export const handleEvent = <TSchema extends ZodType>(
  socket: Socket,
  eventName: string,
  schema: TSchema,
  handler: (data: ReturnType<TSchema["parse"]>) => Promise<unknown> | unknown,
) => {
  return async (raw: unknown): Promise<void> => { /** raw is data from emit */
    try {
      const results = schema.safeParse(raw);

      if (!results.success) {
        const message = results.error.issues[0]?.message ?? "Invalid data";
        socket.emit("socketError", { event: eventName, error: message });
        return;
      }

      await handler(results.data as ReturnType<TSchema["parse"]>);
    } catch (error) {
      const isOurError = error instanceof ApplicationExceptions;
      console.log(`Socket ${eventName} error:`, error);

      socket.emit("socketError", {
        event: eventName,
        error: isOurError ? error.message : "Something went wrong",
      });
    }
  };
};
