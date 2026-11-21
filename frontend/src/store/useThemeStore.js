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
  category: "Scenic",
  preview: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)",
  bgStyle: {
    backgroundImage: `url('/media/twilight-wallpaper.svg')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  isDark: true,
  sentBubble: "bg-[#00a3ff] text-white shadow-md border border-[#38bdf8]/30",
  receivedBubble: "bg-[#1e2330]/95 text-slate-100 border border-white/10 shadow-md",
  accentColor: "#00a3ff",
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
    if (url) {
      get().setChatWallpaper("custom-url", userId);
    }
  },

  getActiveWallpaper: (userId = null) => {
    const { chatWallpaper, perUserWallpaper, customWallpaperUrl } = get();
    const targetId = (userId && perUserWallpaper?.[userId]) || chatWallpaper;

    if (targetId === "custom-url" && customWallpaperUrl) {
      return {
        id: "custom-url",
        name: "Custom Wallpaper",
        category: "Custom",
        preview: `url('${customWallpaperUrl}')`,
        bgStyle: {
          backgroundImage: `url('${customWallpaperUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
        isDark: true,
        sentBubble: "bg-[#00a3ff] text-white shadow-md border border-white/15",
        receivedBubble: "bg-[#1e2330]/95 text-white border border-white/10 shadow-md",
        accentColor: "#00a3ff",
      };
    }

    const list = Array.isArray(CHAT_WALLPAPERS) ? CHAT_WALLPAPERS : [];
    return list.find((w) => w.id === targetId) || list[0] || FALLBACK_WALLPAPER;
  },
}));