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
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const validators = __importStar(require("./notification.validation"));
const notification_service_1 = __importDefault(require("./notification.service"));
const router = (0, express_1.Router)();
router.use((0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }));
router.post("/device-token", (0, validation_middleware_1.validation)(validators.deviceTokenSchema), notification_service_1.default.addDeviceToken);
router.delete("/remove-token", (0, validation_middleware_1.validation)(validators.deviceTokenSchema), notification_service_1.default.removeDeviceToken);
/** ______________________________________________________ */
router.get("/", (0, validation_middleware_1.validation)(validators.listNotificationSchema), notification_service_1.default.listNotification);
router.get("/unread", notification_service_1.default.unreadCount);
router.patch("/mark-as-read/:id", (0, validation_middleware_1.validation)(validators.notificationIdSchema), notification_service_1.default.markAsRead);
router.patch("/mark-all-as-read", notification_service_1.default.markAllAsRead);
router.delete("/:id", (0, validation_middleware_1.validation)(validators.notificationIdSchema), notification_service_1.default.deleteNotification);
// Delete all notifications
router.delete("/", notification_service_1.default.clearAll);
exports.default = router;
