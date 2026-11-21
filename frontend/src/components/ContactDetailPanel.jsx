import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { CHAT_WALLPAPERS } from "../constants";
import { extractLinksFromText, formatMessageTime } from "../lib/utils";
import {
  X,
  Tag,
  Plus,
  Image as ImageIcon,
  Link2,
  ExternalLink,
  Palette,
  Star,
  ShieldCheck,
  Briefcase,
  Check,
} from "lucide-react";

const ContactDetailPanel = () => {
  const {
    selectedUser,
    messages,
    isRightPanelOpen,
    toggleRightPanel,
    customLabels,
    getUserLabels,
    toggleUserLabel,
    createCustomLabel,
    favoriteUsers,
    toggleFavoriteUser,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const {
    getActiveWallpaper,
    setChatWallpaper,
    setUserChatWallpaper,
    customWallpaperUrl,
    setCustomWallpaperUrl,
  } = useThemeStore();

  const [newLabelName, setNewLabelName] = useState("");
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [showAllMediaModal, setShowAllMediaModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!selectedUser || !isRightPanelOpen) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isFavorite = favoriteUsers.includes(selectedUser._id);
  const assignedLabels = getUserLabels(selectedUser);
  const activeWallpaper = getActiveWallpaper(selectedUser._id);

  // 1. Extract all shared media images in this conversation (newest first)
  const sharedMedia = messages
    .filter((m) => Boolean(m.image))
    .slice()
    .reverse();

  // 2. Auto-extract all shared URLs in this conversation (newest first)
  const sharedLinks = messages
    .flatMap((m) => {
      const urls = extractLinksFromText(m.text);
      return urls.map((url) => {
        let domain = url;
        try {
          domain = new URL(url).hostname.replace(/^www\./, "");
        } catch {
          // fallback
        }
        return {
          id: `${m._id}-${url}`,
          url,
          domain,
          createdAt: m.createdAt,
        };
      });
    })
    .reverse();

  const handleCreateLabel = (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    const created = createCustomLabel(newLabelName.trim());
    if (created) {
      toggleUserLabel(selectedUser._id, created.id);
    }
    setNewLabelName("");
    setShowAddLabel(false);
  };

  return (
    <>
      <aside className="w-80 xl:w-88 h-full border-l border-base-300 bg-base-100/95 flex flex-col overflow-y-auto shrink-0 select-none">
        {/* Top Header */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between sticky top-0 bg-base-100/90 backdrop-blur-md z-10">
          <h3 className="font-semibold text-sm tracking-wide">Contact Detail</h3>
          <button
            type="button"
            onClick={toggleRightPanel}
            className="btn btn-ghost btn-xs btn-circle"
            title="Close panel"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Colleague Profile Card (Privacy-first: Role & Department instead of personal phone) */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-base-200/60 border border-base-300/80 relative">
            <button
              type="button"
              onClick={() => toggleFavoriteUser(selectedUser._id)}
              className={`absolute top-3 right-3 btn btn-xs btn-circle ${
                isFavorite
                  ? "btn-warning text-warning-content"
                  : "btn-ghost text-base-content/40"
              }`}
              title={isFavorite ? "Starred colleague" : "Star colleague"}
            >
              <Star className={`size-3.5 ${isFavorite ? "fill-current" : ""}`} />
            </button>

            <div className="relative">
              <img
                src={selectedUser.profilePic || "/avatar.svg"}
                alt={selectedUser.fullName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/avatar.svg";
                }}
                className="size-20 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
              />
              <span
                className={`absolute bottom-1 right-1 size-3.5 rounded-full ring-2 ring-base-100 ${
                  isOnline ? "bg-emerald-500" : "bg-zinc-500"
                }`}
              />
            </div>

            <h4 className="font-bold text-base mt-3">{selectedUser.fullName}</h4>
            <p className="text-xs text-base-content/70 flex items-center gap-1 mt-0.5">
              <Briefcase className="size-3 text-primary" />
              {selectedUser.role || "Workspace Colleague"}
            </p>

            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-medium">
              <ShieldCheck className="size-3.5" />
              Workspace Verified • No Phone Shared
            </div>
          </div>

          {/* Custom Department / Project Labels Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                <Tag className="size-3.5 text-primary" />
                Department & Labels
              </span>
              <button
                type="button"
                onClick={() => setShowAddLabel((v) => !v)}
                className="text-xs text-primary hover:underline flex items-center gap-0.5 font-medium"
              >
                <Plus className="size-3.5" />
                New Label
              </button>
            </div>

            {showAddLabel && (
              <form onSubmit={handleCreateLabel} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. QA, DevOps, Urgent..."
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="input input-xs input-bordered flex-1 rounded-lg"
                  maxLength={22}
                />
                <button type="submit" className="btn btn-xs btn-primary rounded-lg">
                  Add
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-1.5">
              {customLabels.map((lbl) => {
                const isAssigned = assignedLabels.some((a) => a.id === lbl.id);
                return (
                  <button
                    key={lbl.id}
                    type="button"
                    onClick={() => toggleUserLabel(selectedUser._id, lbl.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all border ${
                      isAssigned
                        ? "shadow-xs scale-[1.02]"
                        : "opacity-55 hover:opacity-90 border-base-300 bg-base-200/50"
                    }`}
                    style={
                      isAssigned
                        ? {
                            backgroundColor: `${lbl.color}22`,
                            borderColor: lbl.color,
                            color: lbl.color,
                          }
                        : {}
                    }
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: lbl.color }}
                    />
                    {lbl.name}
                    {isAssigned && <Check className="size-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instagram / WhatsApp Style Chat Theme & Wallpaper Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                <Palette className="size-3.5 text-primary" />
                Chat Theme / Wallpaper
              </span>
              <span className="text-[11px] text-base-content/50">
                {activeWallpaper.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
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
                    className={`group relative h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 scale-[1.02]"
                        : "border-base-300 hover:border-base-content/40"
                    }`}
                    style={{ background: wp.previewColor }}
                    title={wp.name}
                  >
                    <span className="absolute inset-x-1 bottom-1 text-[9px] font-semibold text-white bg-black/50 backdrop-blur-xs rounded px-1 py-0.5 truncate">
                      {wp.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Image URL Wallpaper input */}
            <div className="pt-1">
              <input
                type="url"
                placeholder="Custom wallpaper image URL..."
                value={customWallpaperUrl}
                onChange={(e) => {
                  setCustomWallpaperUrl(e.target.value);
                  if (e.target.value.trim()) {
                    setChatWallpaper("custom-image");
                    setUserChatWallpaper(selectedUser._id, "custom-image");
                  }
                }}
                className="input input-xs input-bordered w-full rounded-lg text-[11px]"
              />
            </div>
          </div>

          {/* Shared Media Grid (Inspired by Image 3: 2x2 grid with +N overlay) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                  Media
                </span>
                <span className="text-[11px] text-base-content/50">
                  {sharedMedia.length} pictures
                </span>
              </div>
              {sharedMedia.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllMediaModal(true)}
                  className="text-xs text-sky-400 hover:underline font-medium"
                >
                  View all
                </button>
              )}
            </div>

            {sharedMedia.length === 0 ? (
              <div className="p-4 rounded-xl bg-base-200/40 border border-base-300/60 text-center text-xs text-base-content/50">
                No pictures shared in this chat yet
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {sharedMedia.slice(0, 4).map((item, idx) => {
                  const extraCount = sharedMedia.length - 4;
                  const showOverlay = idx === 3 && extraCount > 0;
                  return (
                    <div
                      key={item._id}
                      onClick={() =>
                        showOverlay
                          ? setShowAllMediaModal(true)
                          : setLightboxImage(item.image)
                      }
                      className="relative aspect-square rounded-xl overflow-hidden border border-base-300 cursor-pointer group bg-slate-900"
                    >
                      <img
                        src={item.image}
                        alt="Shared attachment"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/media/dashboard-preview.svg";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {showOverlay && (
                        <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                          <span className="text-white font-bold text-base">
                            +{extraCount}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shared Links & Files List (Auto-extracted from conversation messages) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Link2 className="size-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                  Shared Links
                </span>
                <span className="text-[11px] text-base-content/50">
                  {sharedLinks.length}
                </span>
              </div>
            </div>

            {sharedLinks.length === 0 ? (
              <div className="p-4 rounded-xl bg-base-200/40 border border-base-300/60 text-center text-xs text-base-content/50">
                Any links (https://...) shared in chat appear here automatically
              </div>
            ) : (
              <div className="space-y-2">
                {sharedLinks.slice(0, 6).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-base-200/60 hover:bg-base-200 border border-base-300/80 transition-colors group"
                  >
                    <div className="size-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <ExternalLink className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                        {item.domain}
                      </p>
                      <p className="text-[11px] text-base-content/60 truncate">
                        {item.url}
                      </p>
                    </div>
                    <span className="text-[10px] text-base-content/40 shrink-0">
                      {formatMessageTime(item.createdAt)}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Full Media Gallery Modal */}
      {showAllMediaModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowAllMediaModal(false)}
        >
          <div
            className="bg-base-100 border border-base-300 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-base-300 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Shared Media with {selectedUser.fullName} ({sharedMedia.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAllMediaModal(false)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sharedMedia.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setLightboxImage(item.image)}
                  className="aspect-square rounded-xl overflow-hidden border border-base-300 cursor-zoom-in group bg-slate-900"
                >
                  <img
                    src={item.image}
                    alt="Shared media"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/media/dashboard-preview.svg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Full preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
};

export default ContactDetailPanel;