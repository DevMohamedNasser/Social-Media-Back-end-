"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customRateLimiter = void 0;
const config_service_1 = require("../Config/config.service");
const error_response_1 = require("../Utils/response/error.response");
// const ipRequest: Record<string, IIpRequest> = {};
const ipRequest = {};
const blockedIps = new Set();
const unblockedTimers = new Map();
const RATE_LIMIT = config_service_1.env.RATE_LIMIT;
const WINDOW_MS = config_service_1.env.WINDOW_MS;
const customRateLimiter = () => {
    return (req, res, next) => {
        const ip = req.ip; /* ! => Non-null | Non-undefined */
        const currentTime = Date.now();
        if (blockedIps.has(ip))
            throw new error_response_1.TooManyRequestsException("Too many requests, plz try again later");
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
                throw new error_response_1.TooManyRequestsException("Too many requests, plz try again later");
            }
        }
        else {
            ipRequest[ip] = {
                count: 1,
                startTime: currentTime,
            };
        }
        return next();
    };
};
exports.customRateLimiter = customRateLimiter;
