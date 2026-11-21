import { CHAT_WALLPAPERS, THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Check, Palette, Send, Sparkles } from "lucide-react";

const PREVIEW_MESSAGES = [
  {
    id: 1,
    content: "Hey! Have you seen the new Twilight Lake & Cyber Midnight chat themes?",
    isSent: false,
  },
  {
    id: 2,
    content:
      "Yes! Plus we can tag colleagues with #Dev, #Marketing, and #Testing labels right from the sidebar 🚀",
    isSent: true,
  },
];

const SettingsPage = () => {
  const { theme, setTheme, chatWallpaper, setChatWallpaper, getActiveWallpaperConfig } =
    useThemeStore();

  const activeWallpaper = getActiveWallpaperConfig();

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20 pb-12 max-w-5xl">
      <div className="space-y-8">
        {/* Section 1: Instagram / WhatsApp Style Chat Wallpapers */}
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Chat Wallpaper & Bubble Theme
            </h2>
            <p className="text-sm text-base-content/70">
              Choose an Instagram or WhatsApp-inspired background and bubble gradient for your
              conversations
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {CHAT_WALLPAPERS.map((wp) => {
              const isSelected = chatWallpaper === wp.id;
              return (
                <button
                  key={wp.id}
                  onClick={() => setChatWallpaper(wp.id)}
                  className={`relative h-24 rounded-2xl overflow-hidden border text-left p-3 flex flex-col justify-end transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/40 scale-[1.02]"
                      : "border-base-300 hover:border-primary/50"
                  }`}
                  style={{
                    backgroundImage: wp.preview,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{wp.name}</span>
                      {isSelected && <Check className="size-4 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-white/70 truncate">{wp.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Global UI Theme (DaisyUI 32 Themes) */}
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              Application Color Palette
            </h2>
            <p className="text-sm text-base-content/70">
              Choose the overall color scheme for sidebars, menus, and cards
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`
                  group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors border
                  ${
                    theme === t
                      ? "bg-base-200 border-primary"
                      : "border-transparent hover:bg-base-200/50"
                  }
                `}
                onClick={() => setTheme(t)}
              >
                <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Live Chat Preview ({activeWallpaper.name})</h3>
          <div className="rounded-2xl border border-base-300 overflow-hidden bg-base-100 shadow-xl">
            <div className="p-4 sm:p-6 bg-base-200">
              <div className="max-w-xl mx-auto">
                <div
                  className="rounded-2xl shadow-lg overflow-hidden border border-base-300"
                  style={activeWallpaper.bgStyle}
                >
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-base-300/70 bg-base-100/90 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold">
                          E
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm">Emma Thompson</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/30">
                              #Design
                            </span>
                          </div>
                          <p className="text-xs text-emerald-500">Active now • Lead Designer</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div
                    className={`p-4 space-y-4 min-h-[210px] max-h-[210px] overflow-y-auto ${activeWallpaper.overlayClass}`}
                  >
                    {PREVIEW_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            message.isSent
                              ? activeWallpaper.sentBubbleClass
                              : activeWallpaper.receivedBubbleClass
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-[10px] mt-1 opacity-75 text-right">12:00 PM</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-base-300/60 bg-base-100/85 backdrop-blur-md">
                    <div className="flex gap-2 items-center bg-base-200 rounded-full px-3 py-1.5">
                      <input
                        type="text"
                        className="bg-transparent flex-1 text-sm focus:outline-none"
                        placeholder="Write your message..."
                        value="Looks super clean and modern!"
                        readOnly
                      />
                      <button className="btn btn-primary btn-sm btn-circle">
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;