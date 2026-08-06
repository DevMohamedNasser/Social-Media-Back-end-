import { NextFunction, Request, Response } from "express";
import { env } from "../Config/config.service";
import { TooManyRequestsException } from "../Utils/response/error.response";

interface IIpRequest {
  count: number;
  startTime: number;
}

// const ipRequest: Record<string, IIpRequest> = {};
const ipRequest: { [key: string]: IIpRequest } = {};

const blockedIps: Set<string> = new Set();

const unblockedTimers: Map<string, NodeJS.Timeout> = new Map();

const RATE_LIMIT: number = env.RATE_LIMIT;
const WINDOW_MS: number = env.WINDOW_MS;

export const customRateLimiter = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip!; /* ! => Non-null | Non-undefined */
    const currentTime = Date.now();

    if (blockedIps.has(ip)) 
        throw new TooManyRequestsException("Too many requests, plz try again later");

    // اول مره تستخدم الابلكيشن
    if (!ipRequest[ip]) {
      ipRequest[ip] = {
        count: 1,
        startTime: currentTime,
      };
      return next();
    }

    const diff = currentTime - ipRequest[ip].startTime;
    if (diff < WINDOW_MS) {
      ipRequest[ip].count++;

      if (ipRequest[ip].count > RATE_LIMIT) {
        blockedIps.add(ip);

        if (!unblockedTimers.has(ip)) {
          const timer = setTimeout(() => {
            blockedIps.delete(ip);
            unblockedTimers.delete(ip);
          }, WINDOW_MS);
          unblockedTimers.set(ip, timer);
        }
        throw new TooManyRequestsException("Too many requests, plz try again later");
      }
    } else {
      ipRequest[ip] = {
        count: 1,
        startTime: currentTime,
      };
    }
    return next();
  };
};
