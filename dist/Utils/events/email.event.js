"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const verifyEmail_template_1 = __importDefault(require("../email/verifyEmail.template"));
const send_email_1 = require("../email/send.email");
const chalk_1 = __importDefault(require("chalk"));
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("confirmEmail", async (data) => {
    try {
        data.subject = "Confirm Your Email";
        data.html = (0, verifyEmail_template_1.default)(data.otp, data.username, data.subject);
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Failed to send email`), error);
    }
});
exports.emailEvent.on("forgetPassword", async (data) => {
    try {
        data.subject = "Reset password OTP";
        data.html = (0, verifyEmail_template_1.default)(data.otp, data.username, data.subject);
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Failed to send email`), error);
    }
});
