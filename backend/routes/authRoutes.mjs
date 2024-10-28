import express from "express";
import {
  login,
  logout,
  register,
  verifyAuth,
} from "../controllers/authController.mjs";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.post("/email-verify", verifyAuth);

export default router;
