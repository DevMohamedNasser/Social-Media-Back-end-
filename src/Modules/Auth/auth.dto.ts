// DTO (Data Transfer Object / like type alias)

import { z } from "zod";
import {
  changePasswordSchema,
  confirmEmailSchema,
  forgetPasswordSchema,
  googleOAuthSchema,
  loginSchema,
  resendOTPSchema,
  resetPasswordSchema,
  signupSchema,
} from "./auth.validation";

export type ISignupDTO = z.infer<typeof signupSchema.body>;
export type IConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;
export type ILoginDTO = z.infer<typeof loginSchema.body>;
export type IResendOTPDTO = z.infer<typeof resendOTPSchema.body>;
export type IForgetPasswordDTO = z.infer<typeof forgetPasswordSchema.body>;
export type IResetPasswordDTO = z.infer<typeof resetPasswordSchema.body>;
export type IChangePasswordDTO = z.infer<typeof changePasswordSchema.body>;
export type IGoogleOAuthDTO = z.infer<typeof googleOAuthSchema.body>;
