"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const config_service_1 = require("../../Config/config.service");
const whiteList = config_service_1.env.WHITE_LIST.split(",");
exports.corsOptions = {
    origin(requestOrigin, callback) {
        if (!requestOrigin)
            // curl || postman
            return callback(null, true);
        if (whiteList.includes(requestOrigin))
            return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
};
