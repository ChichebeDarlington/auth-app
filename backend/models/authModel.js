import mongoose from "mongoose";

const { Schema, model } = mongoose;

const authSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    LoggedInLast: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: String,
    passwordResetExpiresAt: Date,
    tokenVerification: String,
    tokenVerificationExpiresAt: Date,
  },
  { timestamps: true }
);

export const Auth = model("Auth", authSchema);
