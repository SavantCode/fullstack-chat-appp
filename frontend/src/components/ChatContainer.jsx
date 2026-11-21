import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatMessageDateLabel } from "../lib/utils";
import { Smile, Trash2, X, ExternalLink } from "lucide-react";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const renderMessageTextWithLinks = (text, isOwn) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 underline underline-offset-2 font-medium break-all ${
            isOwn ? "text-white hover:opacity-90" : "text-sky-400 hover:text-sky-300"
          }`}
        >
          {part}
          <ExternalLink className="size-3 shrink-0 inline" />
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    typingUsers,
    reactToMessage,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { getActiveWallpaper, customWallpaperUrl } = useThemeStore();

  const messageEndRef = useRef(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState(null);

  const wallpaper = getActiveWallpaper(selectedUser?._id);

  // Render background image directly as-is without any blurring or dark gradient overlay
  const customBgStyle =
    wallpaper.id === "custom-image" && customWallpaperUrl
      ? {
          backgroundImage: `url("${customWallpaperUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : wallpaper.backgroundStyle;

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  const isSelectedUserTyping = selectedUser ? Boolean(typingUsers[selectedUser._id]) : false;

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isSelectedUserTyping]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-base-100">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Group messages by date label for clean "Today" / "Yesterday" dividers
  let lastDateLabel = "";

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative transition-all duration-300 bg-base-100"
      style={customBgStyle}
    >
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="px-6 py-5 rounded-2xl bg-slate-900/90 border border-white/10 max-w-sm shadow-xl">
              <p className="font-semibold text-white text-sm">
                Start a conversation with {selectedUser.fullName}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Messages, links, and media shared here appear automatically in the right-hand info panel.
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isOwnMessage =
            message.senderId === authUser._id ||
            message.senderId?._id === authUser._id;

          const dateLabel = formatMessageDateLabel(message.createdAt);
          const showDateDivider = dateLabel && dateLabel !== lastDateLabel;
          if (dateLabel) lastDateLabel = dateLabel;

          // Group reactions by emoji
          const reactionCounts = (message.reactions || []).reduce((acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
          }, {});

          return (
            <div key={message._id} className="space-y-3">
              {/* Date Divider Pill (Reference Image 1: "Today") */}
              {showDateDivider && (
                <div className="flex justify-center my-3">
                  <span
                    className={`px-4 py-1 rounded-full text-[11px] font-medium tracking-wide shadow-sm ${
                      wallpaper.isDarkCanvas
                        ? "bg-slate-900/90 text-slate-200 border border-white/10"
                        : "bg-base-300 text-base-content/75 border border-base-300"
                    }`}
                  >
                    {dateLabel}
                  </span>
                </div>
              )}

              <div
                className={`flex items-end gap-2.5 group ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                {/* Receiver Avatar on Left */}
                {!isOwnMessage && (
                  <img
                    src={selectedUser.profilePic || "/avatar.svg"}
                    alt={selectedUser.fullName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/avatar.svg";
                    }}
                    className="size-8 rounded-full object-cover border border-white/15 shrink-0 mb-5 shadow-sm"
                  />
                )}

                <div
                  className={`flex flex-col max-w-[82%] sm:max-w-[68%] ${
                    isOwnMessage ? "items-end" : "items-start"
                  }`}
                >
                  <div className="relative flex items-center gap-1.5">
                    {/* Hover Quick Action Bar (Left side for own messages) */}
                    {isOwnMessage && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/95 border border-white/10 rounded-full px-1.5 py-0.5 shadow-lg">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveReactionMessageId(
                              activeReactionMessageId === message._id ? null : message._id
                            )
                          }
                          className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white"
                          title="React"
                        >
                          <Smile className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMessage(message._id)}
                          className="p-1 hover:bg-rose-500/20 rounded-full text-rose-400"
                          title="Delete message"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Emoji Picker Popover */}
                    {activeReactionMessageId === message._id && (
                      <div
                        className={`absolute -top-11 ${
                          isOwnMessage ? "right-0" : "left-0"
                        } z-30 flex items-center gap-1 bg-slate-900 border border-white/15 rounded-full px-2.5 py-1 shadow-xl`}
                      >
                        {QUICK_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              reactToMessage(message._id, emoji);
                              setActiveReactionMessageId(null);
                            }}
                            className="hover:scale-125 transition-transform text-base px-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                        isOwnMessage
                          ? `${wallpaper.sentBubbleClass} rounded-br-xs`
                          : `${wallpaper.receivedBubbleClass} rounded-bl-xs`
                      }`}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Shared media"
                          onClick={() => setLightboxImage(message.image)}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/media/dashboard-preview.svg";
                          }}
                          className="max-w-[240px] sm:max-w-[300px] max-h-[260px] object-cover rounded-xl mb-2 cursor-zoom-in hover:opacity-95 transition-opacity border border-white/10 bg-slate-900"
                        />
                      )}
                      {message.text && (
                        <p className="whitespace-pre-wrap break-words">
                          {renderMessageTextWithLinks(message.text, isOwnMessage)}
                        </p>
                      )}
                    </div>

                    {/* Hover Quick Action Bar (Right side for received messages) */}
                    {!isOwnMessage && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/95 border border-white/10 rounded-full px-1.5 py-0.5 shadow-lg">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveReactionMessageId(
                              activeReactionMessageId === message._id ? null : message._id
                            )
                          }
                          className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white"
                          title="React"
                        >
                          <Smile className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Metadata Row below bubble: Reactions + Timestamp + Read Indicator */}
                  <div
                    className={`flex items-center gap-2 mt-1 px-1 ${
                      isOwnMessage ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1 text-[10px] ${
                        wallpaper.isDarkCanvas
                          ? "text-slate-300"
                          : "text-base-content/55"
                      }`}
                    >
                      <time>{formatMessageTime(message.createdAt)}</time>
                      {isOwnMessage && (
                        <span
                          className="inline-flex items-center gap-0.5 ml-0.5"
                          title={message.isRead ? "Read" : "Sent"}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              message.isRead ? "bg-sky-400" : "bg-slate-400/70"
                            }`}
                          />
                          <span
                            className={`size-1.5 rounded-full ${
                              message.isRead ? "bg-sky-400" : "bg-slate-400/40"
                            }`}
                          />
                        </span>
                      )}
                    </div>

                    {/* Reaction Badges */}
                    {Object.keys(reactionCounts).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => reactToMessage(message._id, emoji)}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-900/95 text-white border border-white/15 rounded-full px-2 py-0.5 shadow-md hover:scale-105 transition-transform"
                          >
                            <span>{emoji}</span>
                            {count > 1 && <span className="font-semibold">{count}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Own Avatar on Right */}
                {isOwnMessage && (
                  <img
                    src={authUser.profilePic || "/avatar.svg"}
                    alt={authUser.fullName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/avatar.svg";
                    }}
                    className="size-8 rounded-full object-cover border border-white/15 shrink-0 mb-5 shadow-sm"
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Live Typing Bubble */}
        {isSelectedUserTyping && (
          <div className="flex items-center gap-2.5">
            <img
              src={selectedUser.profilePic || "/avatar.svg"}
              alt={selectedUser.fullName}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/avatar.svg";
              }}
              className="size-8 rounded-full object-cover border border-white/15"
            />
            <div
              className={`px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 ${wallpaper.receivedBubbleClass}`}
            >
              <span className="text-sky-400 font-medium">
                {selectedUser.fullName.split(" ")[0]} is typing
              </span>
              <span className="flex gap-1">
                <span className="size-1.5 rounded-full bg-sky-400 animate-bounce" />
                <span className="size-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />

      {/* Full-Screen Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            className="fixed top-5 right-5 btn btn-circle btn-sm bg-white/10 border-white/10 text-white hover:bg-white/20"
            onClick={() => setLightboxImage(null)}
          >
            <X className="size-4" />
          </button>
          <img
            src={lightboxImage}
            alt="Full attachment preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
export default ChatContainer;