import express, { Express, Request, Response } from "express";
// import type { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import chalk from "chalk";
import { env } from "./Config/config.service";
import { corsOptions } from "./Utils/cors/cors";
// import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { customRateLimiter } from "./Middlewares/rateLimit.middleware";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import {
  authRouter,
  notificationRouter,
  postRouter,
  userRouter,
} from "./Modules";
import connectDB from "./DB/connection";
import path from "node:path";
import { initializeFirebase } from "./Utils/firebase/firebase.config";
import { initializeSocket } from "./Utils/socket/socket.service";

// const limiter: RateLimitRequestHandler = rateLimit({
//   windowMs: env.WINDOW_MS,
//   limit: env.RATE_LIMIT,
//   message: {
//     status: 429,
//     message: "Too Many Requests, Plz try again later"
//   },
//   standardHeaders: "draft-8",
//   legacyHeaders: false
// })

const bootstrap = async (): Promise<void> => {
  const app: Express = express();

  // app.use(helmet(), cors(corsOptions), limiter);
  app.use(helmet(), cors(corsOptions), customRateLimiter());
  app.use(express.json());
  await connectDB();
  initializeFirebase();

  app.get("/", (req: Request, res: Response) => {
    return res.status(200).json({ message: `Welcome To ${env.APP_NAME} App` });
  });

  app.use("/uploads", express.static(path.resolve("./uploads")));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/post", postRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/notification", notificationRouter);

  app.use("/:dummy", (req: Request, res: Response) => {
    throw new NotFoundException("Not Found Handler (Route)");
  });

  app.use(globalErrorHandler);

  const httpServer = app.listen(env.PORT, () => {
    console.log(
      chalk.bgGreen(`Server is running on http://127.0.0.1:${env.PORT}`),
    );
  });

  initializeSocket(httpServer);
};

export default bootstrap;
