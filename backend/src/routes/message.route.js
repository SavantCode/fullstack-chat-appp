import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  deleteMessage,
  getMessages,
  getUsersForSidebar,
  markMessagesAsRead,
  reactToMessage,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.put("/read/:id", protectRoute, markMessagesAsRead);
router.post("/react/:messageId", protectRoute, reactToMessage);
router.delete("/:messageId", protectRoute, deleteMessage);

export default router;