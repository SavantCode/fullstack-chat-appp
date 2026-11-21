import { create } from "zustand";
import { CHAT_WALLPAPERS } from "../constants";

const safeParseJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const FALLBACK_WALLPAPER = {
  id: "twilight-lake",
  name: "Twilight Lake",
  category: "Scenic Wallpaper",
  previewColor: "linear-gradient(135deg, #311042 0%, #be185d 50%, #f97316 100%)",
  backgroundStyle: {
    backgroundImage: "url('/media/twilight-wallpaper.svg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  sentBubbleClass:
    "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md border border-white/15",
  receivedBubbleClass:
    "bg-slate-900/90 text-white border border-white/15 shadow-md",
  isDarkCanvas: true,
};

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("chat-theme") || "dark",
  chatWallpaper: localStorage.getItem("chat-wallpaper") || "twilight-lake",
  customWallpaperUrl: localStorage.getItem("chat-custom-wallpaper-url") || "",
  perUserWallpaper: safeParseJSON("chat-per-user-wallpaper", {}),

  setTheme: (theme) => {
    try {
      localStorage.setItem("chat-theme", theme);
    } catch {
      // ignore storage errors
    }
    set({ theme });
  },

  setChatWallpaper: (wallpaperId, userId = null) => {
    if (userId) {
      const updated = { ...get().perUserWallpaper, [userId]: wallpaperId };
      try {
        localStorage.setItem("chat-per-user-wallpaper", JSON.stringify(updated));
      } catch {
        // ignore
      }
      set({ perUserWallpaper: updated });
    } else {
      try {
        localStorage.setItem("chat-wallpaper", wallpaperId);
      } catch {
        // ignore
      }
      set({ chatWallpaper: wallpaperId });
    }
  },

  // Explicit helper for per-colleague wallpaper selection used by ChatHeader & ContactDetailPanel
  setUserChatWallpaper: (userId, wallpaperId) => {
    if (!userId) {
      get().setChatWallpaper(wallpaperId);
      return;
    }
    const updated = { ...get().perUserWallpaper, [userId]: wallpaperId };
    try {
      localStorage.setItem("chat-per-user-wallpaper", JSON.stringify(updated));
    } catch {
      // ignore
    }
    set({ perUserWallpaper: updated });
  },

  resetUserWallpaper: (userId) => {
    if (!userId) return;
    const updated = { ...get().perUserWallpaper };
    delete updated[userId];
    try {
      localStorage.setItem("chat-per-user-wallpaper", JSON.stringify(updated));
    } catch {
      // ignore
    }
    set({ perUserWallpaper: updated });
  },

  setCustomWallpaperUrl: (url, userId = null) => {
    try {
      localStorage.setItem("chat-custom-wallpaper-url", url || "");
    } catch {
      // ignore
    }
    set({ customWallpaperUrl: url || "" });
    if (url && userId) {
      get().setUserChatWallpaper(userId, "custom-image");
    }
  },

  getActiveWallpaper: (userId = null) => {
    const { chatWallpaper, perUserWallpaper, customWallpaperUrl } = get();
    const targetId = (userId && perUserWallpaper?.[userId]) || chatWallpaper;

    if ((targetId === "custom-image" || targetId === "custom-url") && customWallpaperUrl) {
      return {
        id: "custom-image",
        name: "Custom Wallpaper",
        category: "Custom Image",
        previewColor: `url('${customWallpaperUrl}')`,
        backgroundStyle: {
          backgroundImage: `url('${customWallpaperUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
        sentBubbleClass:
          "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md border border-white/15",
        receivedBubbleClass:
          "bg-slate-900/90 text-white border border-white/15 shadow-md",
        isDarkCanvas: true,
      };
    }

    const list = Array.isArray(CHAT_WALLPAPERS) ? CHAT_WALLPAPERS : [];
    return list.find((w) => w.id === targetId) || list[0] || FALLBACK_WALLPAPER;
  },

  // Alias so SettingsPage and any component calling getActiveWallpaperConfig() works seamlessly
  getActiveWallpaperConfig: (userId = null) => {
    return get().getActiveWallpaper(userId);
  },
}));