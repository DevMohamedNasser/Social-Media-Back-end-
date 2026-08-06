import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import template from "../email/verifyEmail.template";
import { sendEmail } from "../email/send.email";
import chalk from "chalk";

export const emailEvent = new EventEmitter();

interface IEmail extends Mail.Options {
  otp: string;
  username: string;
}

emailEvent.on("confirmEmail", async (data: IEmail) => {
  try {
    data.subject = "Confirm Your Email";
    data.html = template(data.otp, data.username, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.error(chalk.red(`Failed to send email`), error);
  }
});

emailEvent.on("forgetPassword", async (data: IEmail) => {
  try {
    data.subject = "Reset password OTP";
    data.html = template(data.otp, data.username, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.error(chalk.red(`Failed to send email`), error);
  }
});
