import {
  X,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  Star,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { CHAT_WALLPAPERS } from "../constants";

const ChatHeader = () => {
  const {
    selectedUser,
    setSelectedUser,
    typingUsers,
    isRightPanelOpen,
    toggleRightPanel,
    favoriteUsers,
    toggleFavoriteUser,
    getUserLabels,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const {
    getActiveWallpaper,
    setChatWallpaper,
    setUserChatWallpaper,
    customWallpaperUrl,
    setCustomWallpaperUrl,
  } = useThemeStore();

  const [showThemePopover, setShowThemePopover] = useState(false);

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = Boolean(typingUsers[selectedUser._id]);
  const isFavorite = favoriteUsers.includes(selectedUser._id);
  const userLabels = getUserLabels(selectedUser);
  const activeWallpaper = getActiveWallpaper(selectedUser._id);

  return (
    <div
      className={`px-5 py-3.5 border-b flex items-center justify-between relative z-20 transition-colors ${
        activeWallpaper.isDarkCanvas
          ? "bg-slate-900/95 border-white/10 text-white"
          : "bg-base-100 border-base-300 text-base-content"
      }`}
    >
      {/* Left: Selected Colleague Avatar + Name + Role + Labels */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="relative cursor-pointer shrink-0"
          onClick={toggleRightPanel}
          title="View colleague profile & shared media"
        >
          <img
            src={selectedUser.profilePic || "/avatar.svg"}
            alt={selectedUser.fullName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/avatar.svg";
            }}
            className="size-11 rounded-full object-cover ring-2 ring-white/15"
          />
          <span
            className={`absolute top-0 right-0 size-2.5 rounded-full ring-2 ring-slate-900 ${
              isOnline ? "bg-emerald-400" : "bg-slate-500"
            }`}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={toggleRightPanel}
              className="font-semibold text-[15px] truncate cursor-pointer hover:underline"
            >
              {selectedUser.fullName}
            </h3>

            {/* Custom Department / Colleague Labels */}
            {userLabels.slice(0, 3).map((lbl) => (
              <span
                key={lbl.id}
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide"
                style={{
                  backgroundColor: `${lbl.color}22`,
                  color: lbl.color,
                  border: `1px solid ${lbl.color}40`,
                }}
              >
                {lbl.name}
              </span>
            ))}
          </div>

          <p className="text-xs truncate mt-0.5">
            {isTyping ? (
              <span className="text-sky-400 font-medium animate-pulse">
                Typing....
              </span>
            ) : (
              <span
                className={
                  activeWallpaper.isDarkCanvas
                    ? "text-slate-300"
                    : "text-base-content/60"
                }
              >
                {selectedUser.role || "Workspace Colleague"} •{" "}
                <span className={isOnline ? "text-emerald-400 font-medium" : ""}>
                  {isOnline ? "Active now" : "Offline"}
                </span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Right: Quick Action Circular Buttons (Matching Reference Header) */}
      <div className="flex items-center gap-2">
        {/* Favorite Star Toggle */}
        <button
          type="button"
          onClick={() => toggleFavoriteUser(selectedUser._id)}
          className={`size-9 rounded-full flex items-center justify-center transition-colors border ${
            isFavorite
              ? "text-amber-400 bg-amber-500/15 border-amber-500/30"
              : activeWallpaper.isDarkCanvas
              ? "text-slate-300 border-white/10 bg-white/5 hover:bg-white/10"
              : "text-base-content/70 border-base-300 bg-base-200/60 hover:bg-base-200"
          }`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Star className={`size-4 ${isFavorite ? "fill-amber-400" : ""}`} />
        </button>

        {/* Instant Chat Wallpaper / Theme Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowThemePopover(!showThemePopover)}
            className={`size-9 rounded-full flex items-center justify-center transition-colors border ${
              showThemePopover
                ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                : activeWallpaper.isDarkCanvas
                ? "text-slate-300 border-white/10 bg-white/5 hover:bg-white/10"
                : "text-base-content/70 border-base-300 bg-base-200/60 hover:bg-base-200"
            }`}
            title="Change Chat Wallpaper / Theme"
          >
            <Sparkles className="size-4" />
          </button>

          {showThemePopover && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 text-slate-100 border border-white/15 shadow-2xl p-3.5 z-50">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Chat Theme & Wallpaper
                </span>
                <button
                  type="button"
                  onClick={() => setShowThemePopover(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CHAT_WALLPAPERS.map((wp) => {
                  const isSelected = activeWallpaper.id === wp.id;
                  return (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => {
                        setChatWallpaper(wp.id);
                        setUserChatWallpaper(selectedUser._id, wp.id);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-sky-400 bg-sky-500/10"
                          : "border-white/10 hover:border-white/25 bg-white/5"
                      }`}
                    >
                      <span
                        className="size-6 rounded-lg shrink-0 border border-white/20"
                        style={{ background: wp.previewColor }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{wp.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {wp.category}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10">
                <label className="text-[10px] text-slate-400 block mb-1">
                  Or paste Custom Wallpaper Image URL:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={customWallpaperUrl}
                    onChange={(e) => setCustomWallpaperUrl(e.target.value)}
                    className="input input-xs bg-slate-800 border-white/10 text-white flex-1 rounded-lg"
                  />
                  {customWallpaperUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setChatWallpaper("custom-image");
                        setUserChatWallpaper(selectedUser._id, "custom-image");
                      }}
                      className="btn btn-xs btn-info rounded-lg"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Right Contact & Media Panel */}
        <button
          type="button"
          onClick={toggleRightPanel}
          className={`size-9 rounded-full flex items-center justify-center transition-colors border ${
            isRightPanelOpen
              ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
              : activeWallpaper.isDarkCanvas
              ? "text-slate-300 border-white/10 bg-white/5 hover:bg-white/10"
              : "text-base-content/70 border-base-300 bg-base-200/60 hover:bg-base-200"
          }`}
          title="Toggle Contact Info, Media & Shared Links"
        >
          {isRightPanelOpen ? (
            <PanelRightClose className="size-4" />
          ) : (
            <PanelRightOpen className="size-4" />
          )}
        </button>

        {/* More Options Button (opens right panel) */}
        <button
          type="button"
          onClick={toggleRightPanel}
          className={`size-9 rounded-full hidden sm:flex items-center justify-center transition-colors border ${
            activeWallpaper.isDarkCanvas
              ? "text-slate-300 border-white/10 bg-white/5 hover:bg-white/10"
              : "text-base-content/70 border-base-300 bg-base-200/60 hover:bg-base-200"
          }`}
          title="Contact Details & Media"
        >
          <MoreHorizontal className="size-4" />
        </button>

        {/* Close Chat (mobile / quick exit) */}
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          className={`size-9 rounded-full flex lg:hidden items-center justify-center transition-colors border ${
            activeWallpaper.isDarkCanvas
              ? "text-slate-300 border-white/10 bg-white/5 hover:bg-white/10"
              : "text-base-content/70 border-base-300 bg-base-200/60 hover:bg-base-200"
          }`}
          title="Close chat"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;