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
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const validators = __importStar(require("./post.validation"));
const post_service_1 = __importDefault(require("./post.service"));
const router = (0, express_1.Router)();
router.use((0, authentication_middleware_1.authentication)({ tokenType: authentication_middleware_1.TokenTypeEnum.access }));
// create post
router.post("/", (0, cloud_multer_1.localFileUpload)({ validation: cloud_multer_1.fileValidation.image, folder: "posts" }).array("attachments", 20), (0, validation_middleware_1.validation)(validators.createPostSchema), post_service_1.default.createPost);
router.patch("/:postId", (0, validation_middleware_1.validation)(validators.toggleReactPostSchema), post_service_1.default.toggleReactPost);
router.patch("/:postId/update", (0, validation_middleware_1.validation)(validators.updatePostSchema), post_service_1.default.updatePost);
router.patch("/:postId/updateAttachments", (0, cloud_multer_1.localFileUpload)({ validation: cloud_multer_1.fileValidation.image, folder: "posts" }).array("attachments", 20), (0, validation_middleware_1.validation)(validators.postIdParamsSchema), post_service_1.default.updateAttachments);
router.delete("/:postId", (0, validation_middleware_1.validation)(validators.postIdParamsSchema), post_service_1.default.deletePost);
router.get("/:postId", (0, validation_middleware_1.validation)(validators.postIdParamsSchema), post_service_1.default.getSpecificPost);
router.post("/:postId/comment", (0, validation_middleware_1.validation)(validators.createCommentSchema), post_service_1.default.createComment);
router.patch("/:commentId/comment", (0, validation_middleware_1.validation)(validators.updateCommentSchema), post_service_1.default.updateComment);
router.get("/:postId/comments", (0, validation_middleware_1.validation)(validators.postIdParamsSchema), post_service_1.default.getComments);
router.delete("/:commentId/comment", (0, validation_middleware_1.validation)(validators.commentIdParamsSchema), post_service_1.default.deleteComment);
exports.default = router;
