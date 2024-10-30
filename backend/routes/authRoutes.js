import express from "express";
import {
  checkAuth,
  forgotPasswrod,
  login,
  logout,
  register,
  resetPassword,
  verifyAuthUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.delete("/logout", logout);
router.post("/email-verify", verifyAuthUser);
router.post("/forgot-password", forgotPasswrod);
router.post("/reset-password/:token", resetPassword);
router.get("/check-auth", verifyToken, checkAuth);

export default router;
