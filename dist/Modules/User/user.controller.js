"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const validators = __importStar(require("./user.validation"));
const router = (0, express_1.Router)();
router.use((0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }));
router.post("/friend-request/:userId", (0, validation_middleware_1.validation)(validators.userIdParamsSchema), user_service_1.default.sendFriendRequest);
router.patch("/friend-request/:requestId/accept", (0, validation_middleware_1.validation)(validators.RequestIdParamsSchema), user_service_1.default.acceptFriendRequest);
router.delete("/friend-request/:requestId/reject", (0, validation_middleware_1.validation)(validators.RequestIdParamsSchema), user_service_1.default.rejectFriendRequest);
router.delete("/friend/:userId", (0, validation_middleware_1.validation)(validators.userIdParamsSchema), user_service_1.default.removeFriend);
router.get("/friend-requests", user_service_1.default.listFriendRequests);
router.patch("/block/:userId", (0, validation_middleware_1.validation)(validators.userIdParamsSchema), user_service_1.default.blockUser);
router.patch("/unblock/:userId", (0, validation_middleware_1.validation)(validators.userIdParamsSchema), user_service_1.default.unblockUser);
exports.default = router;
