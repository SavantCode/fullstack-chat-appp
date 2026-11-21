import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

/**
 * Helper to determine allowed CORS origins for both Express and Socket.IO.
 * Supports local Vite dev server, custom FRONTEND_URL (comma-separated), and Vercel preview URLs.
 */
export function getAllowedOrigins() {
  const origins = ["http://localhost:5173", "http://127.0.0.1:5173"];
  if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(",")
      .map((url) => url.trim().replace(/\/+$/, ""))
      .filter(Boolean)
      .forEach((url) => {
        if (!origins.includes(url)) origins.push(url);
      });
  }
  return origins;
}

export function corsOriginValidator(origin, callback) {
  // Allow server-to-server, health checks, or same-origin requests with no Origin header
  if (!origin) return callback(null, true);

  const normalizedOrigin = origin.replace(/\/+$/, "");
  const allowedOrigins = getAllowedOrigins();

  if (
    allowedOrigins.includes(normalizedOrigin) ||
    normalizedOrigin.endsWith(".vercel.app")
  ) {
    return callback(null, true);
  }

  return callback(null, false);
}

const io = new Server(server, {
  cors: {
    origin: corsOriginValidator,
    credentials: true,
  },
});

// Track active socket IDs per userId: { [userId]: Set<socketId> }
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  const sockets = userSocketMap[userId];
  if (!sockets || sockets.size === 0) return null;
  return Array.from(sockets);
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Relay typing indicator events directly to the receiver's active sockets
  socket.on("typing", ({ receiverId }) => {
    if (!userId || !receiverId) return;
    const receiverSockets = getReceiverSocketId(receiverId);
    if (receiverSockets) {
      io.to(receiverSockets).emit("typing", { senderId: userId });
      io.to(receiverSockets).emit("userTyping", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    if (!userId || !receiverId) return;
    const receiverSockets = getReceiverSocketId(receiverId);
    if (receiverSockets) {
      io.to(receiverSockets).emit("stopTyping", { senderId: userId });
      io.to(receiverSockets).emit("userStopTyping", { senderId: userId });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };