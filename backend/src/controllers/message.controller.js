import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password")
      .lean();

    // Fetch all messages involving the logged-in user to compute lastMessage & unreadCount
    const userMessages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    })
      .sort({ createdAt: -1 })
      .select("senderId receiverId text image isRead createdAt")
      .lean();

    const statsByUserId = {};
    for (const msg of userMessages) {
      const otherUserId =
        String(msg.senderId) === String(loggedInUserId)
          ? String(msg.receiverId)
          : String(msg.senderId);

      if (!statsByUserId[otherUserId]) {
        statsByUserId[otherUserId] = {
          lastMessage: {
            _id: msg._id,
            text: msg.text || (msg.image ? "📷 Photo" : ""),
            image: Boolean(msg.image),
            createdAt: msg.createdAt,
            senderId: msg.senderId,
          },
          unreadCount: 0,
        };
      }

      if (
        String(msg.receiverId) === String(loggedInUserId) &&
        msg.isRead === false
      ) {
        statsByUserId[otherUserId].unreadCount += 1;
      }
    }

    const enrichedUsers = users.map((u) => {
      const stats = statsByUserId[String(u._id)];
      return {
        ...u,
        lastMessage: stats?.lastMessage || null,
        unreadCount: stats?.unreadCount || 0,
      };
    });

    // Sort users with most recent message activity first, then alphabetically
    enrichedUsers.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      if (timeB !== timeA) return timeB - timeA;
      return a.fullName.localeCompare(b.fullName);
    });

    res.status(200).json(enrichedUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Mark any unread messages sent by userToChatId to myId as read
    const unreadUpdate = await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    if (unreadUpdate.modifiedCount > 0) {
      const senderSockets = getReceiverSocketId(userToChatId);
      if (senderSockets) {
        io.to(senderSockets).emit("messagesRead", {
          readerId: String(myId),
        });
      }
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    const result = await Message.updateMany(
      { senderId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    if (result.modifiedCount > 0) {
      const senderSockets = getReceiverSocketId(senderId);
      if (senderSockets) {
        io.to(senderSockets).emit("messagesRead", {
          readerId: String(myId),
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markMessagesAsRead controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text?.trim() && !image) {
      return res.status(400).json({ message: "Message text or image is required" });
    }

    let imageUrl;
    if (image) {
      const hasCloudinaryConfig =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME !== "your_cloudinary_cloud_name" &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_KEY !== "your_cloudinary_api_key" &&
        process.env.CLOUDINARY_API_SECRET &&
        process.env.CLOUDINARY_API_SECRET !== "your_cloudinary_api_secret";

      if (hasCloudinaryConfig) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(image);
          imageUrl = uploadResponse.secure_url;
        } catch (uploadError) {
          console.warn(
            "Cloudinary upload failed, falling back to base64 image:",
            uploadError.message
          );
          imageUrl = image;
        }
      } else {
        imageUrl = image;
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text?.trim() || "",
      image: imageUrl,
      isRead: false,
      reactions: [],
    });

    await newMessage.save();

    const receiverSockets = getReceiverSocketId(receiverId);
    if (receiverSockets) {
      io.to(receiverSockets).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const existingIndex = message.reactions.findIndex(
      (r) => String(r.userId) === String(userId)
    );

    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        // Toggle off if same emoji clicked again
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Notify the other participant in the conversation
    const otherUserId =
      String(message.senderId) === String(userId)
        ? String(message.receiverId)
        : String(message.senderId);

    const otherUserSockets = getReceiverSocketId(otherUserId);
    if (otherUserSockets) {
      io.to(otherUserSockets).emit("messageReaction", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in reactToMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    const receiverId = String(message.receiverId);
    await Message.findByIdAndDelete(messageId);

    const receiverSockets = getReceiverSocketId(receiverId);
    if (receiverSockets) {
      io.to(receiverSockets).emit("messageDeleted", {
        messageId: String(messageId),
        senderId: String(userId),
      });
    }

    res.status(200).json({ messageId: String(messageId) });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};