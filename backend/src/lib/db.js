import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded whether the server is started from root or backend/
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

let isConnecting = false;

export const connectDB = async () => {
  // 1 = connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return null;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "❌ MONGODB_URI is not defined! Please check your backend/.env file."
    );
    return null;
  }

  isConnecting = true;
  try {
    const conn = await mongoose.connect(uri, {
      family: 4, // Force IPv4 to prevent Windows OpenSSL / MongoDB Atlas SSL alert 80 & SRV hangs
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false, // Fail fast with a clear error instead of hanging 10s on buffering timeout
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    if (
      error.message?.includes("SSL alert number 80") ||
      error.message?.includes("Server selection timed out") ||
      error.message?.includes("whitelist") ||
      error.message?.includes("Could not connect to any servers")
    ) {
      console.error(
        "👉 Action Required: In MongoDB Atlas -> Network Access, click '+ ADD IP ADDRESS' and select 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0), or verify your local MongoDB service is running."
      );
    }
    return null;
  } finally {
    isConnecting = false;
  }
};

/**
 * Express middleware that ensures MongoDB is connected before executing controller queries.
 * Prevents "Operation `users.findOne()` buffering timed out after 10000ms".
 */
export const ensureDBConnected = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  const conn = await connectDB();
  if (!conn || mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message:
        "Database connection unavailable. Please check your MongoDB URI / Atlas IP Whitelist (0.0.0.0/0).",
    });
  }

  next();
};