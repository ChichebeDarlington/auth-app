import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.mjs";
import { connectDatabase } from "./database/storage.mjs";
import path from "path";

dotenv.config();

const server = express();

server.use(express.json());
server.use(cookieParser());
server.use(cors({ origin: "http://localhost:5173", credentials: true }));

// routes modules
server.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 7000;

const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "frontend/dist")));

  server.get("*", (req, res) => {
    return res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
  });
}
server.listen(PORT, () => {
  connectDatabase(process.env.MONGO_URI);
  console.log(`Server running at port ${PORT}`);
});
