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
Object.defineProperty(exports, "__esModule", { value: true });
exports.postModel = exports.postSchema = exports.reactEnum = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var reactEnum;
(function (reactEnum) {
    reactEnum["like"] = "like";
    reactEnum["love"] = "love";
    reactEnum["fun"] = "fun";
    reactEnum["sad"] = "sad";
    reactEnum["anger"] = "anger";
})(reactEnum || (exports.reactEnum = reactEnum = {}));
const reactionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    react: {
        type: String,
        enum: Object.values(reactEnum),
        default: reactEnum.like,
    },
});
exports.postSchema = new mongoose_1.Schema({
    content: {
        type: String,
        minLength: 2,
        maxLength: 50000,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: [{ type: String }],
    createdBy: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    // likes: [{ type: Types.ObjectId, ref: "User" }],
    reacts: [reactionSchema],
    freezedAt: Date,
    tags: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
}, {
    timestamps: true,
});
exports.postSchema.index({ "reacts.userId": 1 });
// Compound Index
exports.postSchema.index({ createdBy: 1, createdAt: -1 }); // -1: Descending (latest date)
exports.postModel = mongoose_1.default.models.Post || mongoose_1.default.model("Post", exports.postSchema);
