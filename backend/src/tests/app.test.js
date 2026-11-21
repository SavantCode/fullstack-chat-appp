import test from "node:test";
import assert from "node:assert/strict";

import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { generateToken, getCookieOptions } from "../lib/utils.js";
import { getReceiverSocketId, getAllowedOrigins, corsOriginValidator } from "../lib/socket.js";
import { startKeepAliveCron, stopKeepAliveCron } from "../lib/cron.js";

test("User model schema has required workplace fields and defaults", () => {
  const user = new User({
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    password: "hashedpassword123",
  });

  assert.equal(user.fullName, "Alex Rivera");
  assert.equal(user.email, "alex.rivera@example.com");
  assert.equal(user.role, "Team Member");
  assert.equal(user.department, "General");
  assert.ok(Array.isArray(user.labels));
});

test("Message model schema defaults isRead to false and initializes reactions array", () => {
  const msg = new Message({
    senderId: "507f1f77bcf86cd799439011",
    receiverId: "507f1f77bcf86cd799439012",
    text: "Hello from CI test suite",
  });

  assert.equal(msg.text, "Hello from CI test suite");
  assert.equal(msg.isRead, false);
  assert.ok(Array.isArray(msg.reactions));
  assert.equal(msg.reactions.length, 0);
});

test("generateToken creates a valid JWT and sets secure HTTP-only cookie", () => {
  process.env.JWT_SECRET = "test-secret-for-ci";
  let cookieName = null;
  let cookieToken = null;
  let cookieOpts = null;

  const mockRes = {
    cookie(name, val, options) {
      cookieName = name;
      cookieToken = val;
      cookieOpts = options;
    },
  };

  const token = generateToken("507f1f77bcf86cd799439011", mockRes);
  assert.ok(typeof token === "string" && token.split(".").length === 3);
  assert.equal(cookieName, "jwt");
  assert.equal(cookieToken, token);
  assert.equal(cookieOpts.httpOnly, true);

  const opts = getCookieOptions();
  assert.equal(opts.httpOnly, true);
});

test("Socket CORS validator allows localhost and Vercel preview domains", () => {
  const allowed = getAllowedOrigins();
  assert.ok(allowed.includes("http://localhost:5173"));

  corsOriginValidator("https://my-chat-app-preview.vercel.app", (err, isAllowed) => {
    assert.equal(err, null);
    assert.equal(isAllowed, true);
  });

  corsOriginValidator("http://localhost:5173", (err, isAllowed) => {
    assert.equal(err, null);
    assert.equal(isAllowed, true);
  });

  assert.equal(getReceiverSocketId("non-existent-user"), null);
});

test("Keep-alive cron starts and stops cleanly when BACKEND_URL is set", () => {
  process.env.BACKEND_URL = "https://example-chatty-backend.onrender.com";
  const timer = startKeepAliveCron();
  assert.ok(timer !== null);
  stopKeepAliveCron();
  delete process.env.BACKEND_URL;
});