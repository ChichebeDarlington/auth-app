import crypto from "crypto";
import { sendEmail } from "../emails/mailtrapConfiguration.mjs";
import { Auth } from "../models/authModel.mjs";
import { comparePassword, hashPassword } from "../utils/bcrypt.mjs";
import { tokenGenerationAndCookieSet } from "../utils/tokenAndCookie.mjs";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "../emails/emailTemplates.mjs";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name) {
    return res.status(400).json({ msg: "Name is required" });
  }
  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ msg: "Password is required" });
  }
  try {
    const userExist = await Auth.findOne({ email });
    if (userExist) {
      return res.status(409).json({ msg: "User already a member" });
    }
    // hash password
    const passwordHash = await hashPassword(password);

    // generate token verification code
    const tokenVerification = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // token verification expires at:
    const tokenVerificationExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hours
    const user = new Auth({
      email,
      password: passwordHash,
      name,
      tokenVerification,
      tokenVerificationExpiresAt,
    });

    await user.save();

    // set cookies
    tokenGenerationAndCookieSet(res, user._id);

    // send email
    const from = "chichebewebdev@gmail.com";
    const subject = "Email verification";
    const text = "Please verify your email";
    const html = VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      tokenVerification
    );

    sendEmail(from, user.email, subject, text, html);

    return res.status(201).json({
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      msg: "Error in Register controller trying to register user",
      error: error,
    });
  }
};

export const verifyAuthUser = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await Auth.findOne({
      tokenVerification: code,
      tokenVerificationExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "Expired or invalid verification token!" });
    }
    user.isVerified = true;
    user.tokenVerification = undefined;
    user.tokenVerificationExpiresAt = undefined;
    await user.save();

    // send email
    const from = "chichebewebdev@gmail.com";
    const subject = "Email verification";
    const text = "Please verify your email";
    const html = WELCOME_EMAIL_TEMPLATE;
    sendEmail(from, user.email, subject, text, html);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verify Email ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please input email and password" });
  }
  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "Not a member, please create an account" });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    // generate token
    tokenGenerationAndCookieSet(res, user._id);

    user.LoggedInLast = new Date();
    // save to database
    await user.save();

    return res.status(201).json({
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    console.log("error in verify Email ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

export const forgotPasswrod = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ msg: "Please input your email address" });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email address" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // Expires at 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpiresAt = resetTokenExpiresAt;

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    // send email
    const from = "chichebewebdev@gmail.com";
    const subject = "Email verification";
    const text = "Please verify your email";
    const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
      "{resetURL}",
      resetURL
    );

    await user.save();

    sendEmail(from, user.email, subject, text, html);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("error in forgot password ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await Auth.findOne({
      passwordResetToken: token,
      passwordResetExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid or expired reset token" });
    }

    // update password
    const passwordHash = await hashPassword(password);

    user.password = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    // send email
    const from = "chichebewebdev@gmail.com";
    const subject = "Password reset successful";
    const text = "You just reset your password";
    const html = PASSWORD_RESET_SUCCESS_TEMPLATE;

    sendEmail(from, user.email, subject, text, html);

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await Auth.findById(userId).select("-password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "There is no user found!" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
