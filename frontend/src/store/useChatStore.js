import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { DEFAULT_WORKSPACE_LABELS, LABEL_COLOR_PALETTE } from "../constants";

let typingTimeout = null;

const loadStoredLabels = () => {
  try {
    const raw = localStorage.getItem("chat-custom-labels");
    if (!raw) return DEFAULT_WORKSPACE_LABELS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.name) {
      return parsed;
    }
    return DEFAULT_WORKSPACE_LABELS;
  } catch {
    return DEFAULT_WORKSPACE_LABELS;
  }
};

const loadStoredMap = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const loadStoredArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadCounts: {},
  typingUsers: {},

  // UI Navigation & Panels
  activeFilter: "all",
  isRightPanelOpen: true,

  // Colleague Custom Labels & Favorites
  customLabels: loadStoredLabels(),
  userLabelsMap: loadStoredMap("chat-user-labels-map"),
  favoriteUsers: loadStoredArray("chat-favorite-users"),

  setActiveFilter: (filter) => set({ activeFilter: filter || "all" }),
  setIsRightPanelOpen: (isOpen) => set({ isRightPanelOpen: Boolean(isOpen) }),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  createCustomLabel: (name, color) => {
    const cleanName = (name || "").trim();
    if (!cleanName) return null;

    const existing = get().customLabels || [];
    if (existing.some((l) => l?.name?.toLowerCase() === cleanName.toLowerCase())) {
      toast.error("Label already exists");
      return null;
    }

    const chosenColor =
      color || LABEL_COLOR_PALETTE[existing.length % LABEL_COLOR_PALETTE.length] || "#38bdf8";

    const newLabel = {
      id: cleanName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-3),
      name: cleanName,
      color: chosenColor,
    };

    const updated = [...existing, newLabel];
    try {
      localStorage.setItem("chat-custom-labels", JSON.stringify(updated));
    } catch {
      // ignore
    }
    set({ customLabels: updated });
    toast.success(`Created label #${cleanName}`);
    return newLabel;
  },

  deleteCustomLabel: (labelId) => {
    const existing = get().customLabels || [];
    const target = existing.find((l) => l.id === labelId);
    const updated = existing.filter((l) => l.id !== labelId);
    try {
      localStorage.setItem("chat-custom-labels", JSON.stringify(updated));
    } catch {
      // ignore
    }
    set({
      customLabels: updated,
      activeFilter:
        target && get().activeFilter === `label:${target.name}` ? "all" : get().activeFilter,
    });
  },

  toggleUserLabel: (userId, labelName) => {
    if (!userId || !labelName) return;
    const map = { ...(get().userLabelsMap || {}) };
    const userObj = (get().users || []).find((u) => u._id === userId);
    const seedDefaults =
      userObj?.labels?.length > 0
        ? userObj.labels
        : userObj?.department
        ? [userObj.department]
        : [];

    const currentList = Array.isArray(map[userId]) ? map[userId] : seedDefaults;
    const exists = currentList.some((l) => l.toLowerCase() === labelName.toLowerCase());

    const nextList = exists
      ? currentList.filter((l) => l.toLowerCase() !== labelName.toLowerCase())
      : [...currentList, labelName];

    map[userId] = nextList;
    try {
      localStorage.setItem("chat-user-labels-map", JSON.stringify(map));
    } catch {
      // ignore
    }
    set({ userLabelsMap: map });
  },

  getUserLabels: (user) => {
    if (!user) return [];
    const map = get().userLabelsMap || {};
    const allLabels = Array.isArray(get().customLabels)
      ? get().customLabels
      : DEFAULT_WORKSPACE_LABELS;

    const assignedNames = Array.isArray(map[user._id])
      ? map[user._id]
      : Array.isArray(user.labels) && user.labels.length > 0
      ? user.labels
      : user.department
      ? [user.department]
      : [];

    return assignedNames.map((name) => {
      const found = allLabels.find(
        (l) => l?.name && l.name.toLowerCase() === String(name).toLowerCase()
      );
      return (
        found || {
          id: String(name).toLowerCase(),
          name: String(name),
          color: "#38bdf8",
        }
      );
    });
  },

  toggleFavoriteUser: (userId) => {
    if (!userId) return;
    const current = Array.isArray(get().favoriteUsers) ? get().favoriteUsers : [];
    const exists = current.includes(userId);
    const updated = exists ? current.filter((id) => id !== userId) : [...current, userId];
    try {
      localStorage.setItem("chat-favorite-users", JSON.stringify(updated));
    } catch {
      // ignore
    }
    set({ favoriteUsers: updated });
  },

  isUserFavorite: (userId) => {
    const current = Array.isArray(get().favoriteUsers) ? get().favoriteUsers : [];
    return current.includes(userId);
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      const usersData = Array.isArray(res.data) ? res.data : [];
      const unreadMap = {};
      usersData.forEach((u) => {
        if (u.unreadCount > 0) unreadMap[u._id] = u.unreadCount;
      });
      set({ users: usersData, unreadCounts: unreadMap });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch colleagues");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set((state) => ({
        messages: Array.isArray(res.data) ? res.data : [],
        unreadCounts: { ...state.unreadCounts, [userId]: 0 },
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, users } = get();
    if (!selectedUser) return;
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const sentMsg = res.data;

      const updatedUsers = [
        ...users.map((u) =>
          u._id === selectedUser._id
            ? {
                ...u,
                lastMessage: {
                  _id: sentMsg._id,
                  text: sentMsg.text,
                  image: sentMsg.image,
                  senderId: sentMsg.senderId,
                  createdAt: sentMsg.createdAt,
                  isRead: sentMsg.isRead,
                },
              }
            : u
        ),
      ].sort((a, b) => {
        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      set({
        messages: [...messages, sentMsg],
        users: updatedUsers,
      });
      get().emitStopTyping();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  reactToMessage: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
      set((state) => ({
        messages: state.messages.map((m) => (m._id === messageId ? res.data : m)),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to react to message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  emitTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket?.connected) return;

    socket.emit("typing", { receiverId: selectedUser._id });

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      get().emitStopTyping();
    }, 1800);
  },

  emitStopTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket?.connected) return;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }
    socket.emit("stopTyping", { receiverId: selectedUser._id });
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("messagesRead");
    socket.off("messageReaction");
    socket.off("messageDeleted");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, users, unreadCounts } = get();
      const isFromSelectedUser = selectedUser && String(newMessage.senderId) === String(selectedUser._id);

      const updatedUsers = [
        ...users.map((u) =>
          String(u._id) === String(newMessage.senderId)
            ? {
                ...u,
                lastMessage: {
                  _id: newMessage._id,
                  text: newMessage.text,
                  image: newMessage.image,
                  senderId: newMessage.senderId,
                  createdAt: newMessage.createdAt,
                  isRead: isFromSelectedUser ? true : newMessage.isRead,
                },
              }
            : u
        ),
      ].sort((a, b) => {
        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      if (isFromSelectedUser) {
        set({
          messages: [...messages, { ...newMessage, isRead: true }],
          users: updatedUsers,
          typingUsers: { ...get().typingUsers, [newMessage.senderId]: false },
        });
        axiosInstance.put(`/messages/read/${selectedUser._id}`).catch(() => {});
      } else {
        const sender = users.find((u) => String(u._id) === String(newMessage.senderId));
        const nextCount = (unreadCounts[newMessage.senderId] || 0) + 1;
        set({
          users: updatedUsers,
          unreadCounts: { ...unreadCounts, [newMessage.senderId]: nextCount },
          typingUsers: { ...get().typingUsers, [newMessage.senderId]: false },
        });

        if (sender) {
          toast(`New message from ${sender.fullName}`, {
            icon: "💬",
            duration: 3000,
          });
        }
      }
    });

    socket.on("typing", ({ senderId }) => {
      if (!senderId) return;
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: true },
      }));
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (!senderId) return;
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: false },
      }));
    });

    socket.on("messagesRead", ({ readerId }) => {
      const { selectedUser, messages } = get();
      if (selectedUser && String(selectedUser._id) === String(readerId)) {
        set({
          messages: messages.map((m) =>
            String(m.receiverId) === String(readerId) ? { ...m, isRead: true } : m
          ),
        });
      }
    });

    socket.on("messageReaction", (updatedMessage) => {
      if (!updatedMessage?._id) return;
      set((state) => ({
        messages: state.messages.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      }));
    });

    socket.on("messageDeleted", ({ messageId }) => {
      if (!messageId) return;
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("messagesRead");
    socket.off("messageReaction");
    socket.off("messageDeleted");
  },

  setSelectedUser: (selectedUser) => {
    if (selectedUser) {
      set((state) => ({
        selectedUser,
        unreadCounts: { ...state.unreadCounts, [selectedUser._id]: 0 },
      }));
    } else {
      set({ selectedUser: null });
    }
  },
}));