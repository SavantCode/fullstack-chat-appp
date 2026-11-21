import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB, ensureDBConnected } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables reliably from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PORT = process.env.PORT || 5001;
const rootDir = path.resolve();

// Increase payload size limit so base64 image uploads don't fail with 413 Payload Too Large
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Ensure DB is connected before running auth or message queries
app.use("/api/auth", ensureDBConnected, authRoutes);
app.use("/api/messages", ensureDBConnected, messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(rootDir, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(rootDir, "../frontend", "dist", "index.html"));
  });
}

const startServer = async () => {
  const conn = await connectDB();
  if (!conn) {
    console.warn(
      "⚠️ Server starting without active MongoDB connection. Will retry automatically on incoming API requests."
    );
  }

  server.listen(PORT, () => {
    console.log("🚀 Server is running on PORT:" + PORT);
  });
};

startServer();