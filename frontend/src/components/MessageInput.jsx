import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Smile, X, Plus, Paperclip } from "lucide-react";
import toast from "react-hot-toast";

const QUICK_EMOJIS = ["😀", "😂", "❤️", "🔥", "👍", "🎉", "🙏", "✨", "🚀", "💯"];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, selectedUser, emitTyping, emitStopTyping } = useChatStore();
  const { getActiveWallpaper } = useThemeStore();

  const wallpaper = getActiveWallpaper(selectedUser?._id);

  useEffect(() => {
    setText("");
    setImagePreview(null);
    setShowEmojiBar(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedUser?._id]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    emitTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 1500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    emitTyping();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      emitStopTyping();

      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      setShowEmojiBar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="px-4 sm:px-6 pb-4 pt-2 w-full z-20">
      {/* Image Attachment Preview */}
      {imagePreview && (
        <div className="mb-2.5 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-2xl border-2 border-sky-400/50 shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 size-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Emoji Picker Bar */}
      {showEmojiBar && (
        <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto py-1.5 px-3 bg-slate-900/95 border border-white/10 rounded-full w-fit shadow-xl">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="hover:scale-125 transition-transform text-lg px-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Floating Pill Input Bar (Inspired by Reference Screens) */}
      <form
        onSubmit={handleSendMessage}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 border shadow-xl transition-all ${
          wallpaper.isDarkCanvas
            ? "bg-slate-900/95 border-white/15 text-white"
            : "bg-base-100 border-base-300 text-base-content"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* Circular '+' Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`size-9 rounded-full flex items-center justify-center transition-colors shrink-0 ${
            imagePreview
              ? "bg-emerald-500 text-white"
              : wallpaper.isDarkCanvas
              ? "bg-white/10 hover:bg-white/20 text-slate-200"
              : "bg-base-200 hover:bg-base-300 text-base-content"
          }`}
          title="Upload image attachment"
        >
          <Plus className="size-4" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 placeholder:text-slate-400"
          placeholder={`Message ${selectedUser?.fullName?.split(" ")[0] || ""}...`}
          value={text}
          onChange={handleTextChange}
        />

        {/* Emoji Toggle */}
        <button
          type="button"
          onClick={() => setShowEmojiBar((prev) => !prev)}
          className={`p-2 rounded-full transition-colors ${
            showEmojiBar
              ? "text-sky-400 bg-sky-500/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Insert emoji"
        >
          <Smile className="size-4" />
        </button>

        {/* Secondary Paperclip Image Trigger */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full text-slate-400 hover:text-slate-200 hidden sm:flex"
          title="Attach picture"
        >
          <Paperclip className="size-4" />
        </button>

        {/* Circular Send Button */}
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="size-9 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-40 text-white flex items-center justify-center shadow-md shrink-0 transition-transform active:scale-95"
          title="Send message"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;