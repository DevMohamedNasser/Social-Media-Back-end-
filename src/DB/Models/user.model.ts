import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/enums/user.enum";
import { Encrypt } from "../../Utils/Security/encryption.security";
import { generateHash } from "../../Utils/Security/hash.security";
import { emailEvent } from "../../Utils/events/email.event";
import generateOTP from "../../Utils/email/generateOTP";

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username?: string;

  email: string;
  confirmEmailOTP?: string;
  confirmEmailOTPExp: Date;
  confirmedAt: Date;
  password: string;
  resetPasswordOTP?: string;
  forgetPasswordOTP?: string;
  forgetPasswordOTPExp: Date;

  phone?: string;
  address?: string;
  profilePic: string;
  provider: ProviderEnum;

  gender: GenderEnum;
  role: RoleEnum;

  friends: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];

  createdAt: Date;
  updatedAt?: Date;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      minLength: [2, "Must be at least 2 chars long"],
      maxLength: [25, "Must be at most 25 chars long"],
      required: [true, "firstName is required"],
    },
    lastName: {
      type: String,
      minLength: [2, "Must be at least 2 chars long"],
      maxLength: [25, "Must be at most 25 chars long"],
      required: [true, "lastName is required"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    provider: {
      type: Number,
      enum: [ProviderEnum.System, ProviderEnum.Google],
      default: ProviderEnum.System,
    },
    confirmEmailOTP: String,
    confirmEmailOTPExp: Date,
    confirmedAt: Date,
    password: {
      type: String,
      required: function (this) {
        return this.provider == ProviderEnum.System;
      },
    },
    resetPasswordOTP: String,
    forgetPasswordOTP: String,
    forgetPasswordOTPExp: Date,
    address: String,
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    phone: {
      type: String,
      required: function (this) {
        return this.provider == ProviderEnum.System;
      },
    },
    profilePic: String,

    friends: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    blockedUsers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.confirmEmailOTP;
        delete ret.resetPasswordOTP;
        return ret;
      },
    },
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.set({ firstName, lastName: rest.join(" ") });
  })
  .get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`;
  });

/** Mongoose Middleware/Hooks */
/** pre middleware latest version doesn't require next() but required in post middleware */

// userSchema.pre("save", function () {
//   console.log("Pre save", this);
// });

// userSchema.pre("save", function () {
//   console.log("Pre save #2", this);
// });

// userSchema.post("save", function (doc, next) {
//   console.log("Post Save Middleware", doc);
//   next();
// });

/** Document Middleware => validate. works on save() option validateBeforeSave:true by default it's true */
// userSchema.pre("validate", function () {
//   console.log(this);
//   this.email = this.email.toLowerCase().trim();
// });

userSchema.pre(
  "save",
  async function (this: HUserDocument & { wasNew: boolean }) {
    // console.log(this.isModified("phone"), this.modifiedPaths(), this.isNew);
    if (this.phone) this.phone = Encrypt(this.phone);
    if (this.provider == ProviderEnum.System)
      this.password = await generateHash(this.password);

    // console.log(this.isNew);
    this.wasNew = this.isNew;
  },
);

// userSchema.post("save", async function () {
//   // if (this.phone) {
//   //   const phone = Decrypt(this.phone);
//   //   console.log("phone: ", phone);
//   // }

//   // console.log(this.isNew); // always false

//   const that = this as HUserDocument & { wasNew: boolean };
//   // console.log(that.wasNew);
//   if (that.wasNew) {
//     emailEvent.emit("confirmEmail", {
//       to: this.email,
//       username: this.username,
//       otp: generateOTP(),
//     });
//   }
// });

userSchema.pre("insertMany", async function(docs) {
  console.log(this, docs);
})
userSchema.post("insertMany", async function(docs, next) {
  console.log(this, docs);
  next();
})

export const userModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export type HUserDocument = HydratedDocument<IUser>;
