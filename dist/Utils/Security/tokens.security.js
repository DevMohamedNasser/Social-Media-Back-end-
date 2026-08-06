"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewLoginCredentials = exports.getSignature = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_enum_1 = require("../enums/user.enum");
const config_service_1 = require("../../Config/config.service");
const error_response_1 = require("../response/error.response");
const generateToken = ({ payload, secret, options, }) => {
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = ({ token, secret, }) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
const getSignature = ({ signatureLevel, }) => {
    let signature = {
        accessToken: undefined,
        refreshToken: undefined,
    };
    switch (signatureLevel) {
        case user_enum_1.RoleEnum.ADMIN:
            signature.accessToken = config_service_1.env.ACCESS_TOKEN_ADMIN_SIGNATURE;
            signature.refreshToken = config_service_1.env.REFRESH_TOKEN_ADMIN_SIGNATURE;
            signature.accessExpiresIn = config_service_1.env.ACCESS_TOKEN_ADMIN_EXPIRES_IN;
            signature.refreshExpiresIn = config_service_1.env.REFRESH_TOKEN_ADMIN_EXPIRES_IN;
            break;
        case user_enum_1.RoleEnum.USER:
            signature.accessToken = config_service_1.env.ACCESS_TOKEN_USER_SIGNATURE;
            signature.refreshToken = config_service_1.env.REFRESH_TOKEN_USER_SIGNATURE;
            signature.accessExpiresIn = config_service_1.env.ACCESS_TOKEN_USER_EXPIRES_IN;
            signature.refreshExpiresIn = config_service_1.env.REFRESH_TOKEN_USER_EXPIRES_IN;
            break;
        default:
            throw new error_response_1.InternalServerException("Invalid signature check env");
    }
    return signature;
};
exports.getSignature = getSignature;
const getNewLoginCredentials = (user) => {
    const signature = (0, exports.getSignature)({ signatureLevel: user.role });
    if (!signature.accessToken || !signature.refreshToken || !signature.accessExpiresIn || !signature.refreshExpiresIn)
        throw new error_response_1.InternalServerException("Invalid signature check env");
    const accessToken = (0, exports.generateToken)({
        payload: {
            id: user._id,
        },
        secret: signature.accessToken,
        options: { expiresIn: signature.accessExpiresIn },
    });
    const refreshToken = (0, exports.generateToken)({
        payload: {
            id: user._id,
        },
        secret: signature.refreshToken,
        options: { expiresIn: signature.refreshExpiresIn },
    });
    return { accessToken, refreshToken };
};
exports.getNewLoginCredentials = getNewLoginCredentials;
