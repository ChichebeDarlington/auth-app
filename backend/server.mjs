import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.mjs";
import { connectDatabase } from "./database/storage.mjs";

dotenv.config();

const server = express();

server.use(express.json());
server.use(cookieParser());

// routes modules
server.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 7000;
server.listen(PORT, () => {
  connectDatabase(process.env.MONGO_URI);
  console.log(`Server running at port ${PORT}`);
});
