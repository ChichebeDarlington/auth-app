import { sendEmail } from "../emails/mailtrapConfiguration.mjs";
import { Auth } from "../models/authModel.mjs";
import { hashPassword } from "../utils/bcrypt.mjs";
import { tokenGenerationAndCookieSet } from "../utils/tokenAndCookie.mjs";
import {
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

export const verifyAuth = async (req, res) => {
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
  console.log("register");
};

export const logout = async (req, res) => {
  console.log("register");
};
