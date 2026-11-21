import jwt from "jsonwebtoken";

export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true, // prevent XSS attacks
    // Use "none" in production so Vercel frontend can send/receive JWT cookies from Render backend
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  };
};

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    ...getCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in MS
  });

  return token;
};