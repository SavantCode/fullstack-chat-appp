import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

import { connectDB, ensureDBConnected } from "./lib/db.js";
import { startKeepAliveCron } from "./lib/cron.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server, corsOriginValidator } from "./lib/socket.js";

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
    origin: corsOriginValidator,
    credentials: true,
  })
);

// Lightweight health check endpoint for Render health checks & Keep-Alive cron jobs
app.get("/api/health", (req, res) => {
  const readyStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  res.status(200).json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    dbState: readyStateMap[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// Ensure DB is connected before running auth or message queries
app.use("/api/auth", ensureDBConnected, authRoutes);
app.use("/api/messages", ensureDBConnected, messageRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
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
    startKeepAliveCron();
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}