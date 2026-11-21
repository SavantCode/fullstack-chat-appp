import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      family: 4, // Force IPv4 to prevent Windows OpenSSL / MongoDB Atlas SSL alert 80 errors
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    if (error.message?.includes("SSL alert number 80")) {
      console.error(
        "👉 Tip: In MongoDB Atlas -> Network Access, click '+ ADD IP ADDRESS' and select 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0)."
      );
    }
    return null;
  }
};