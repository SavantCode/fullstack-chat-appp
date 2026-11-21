import { MessageSquare, Palette, ShieldCheck, Tag } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-base-100/60">
      <div className="max-w-lg text-center space-y-6">
        <div className="flex justify-center gap-4 mb-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center animate-bounce shadow-lg shadow-primary/10">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Welcome to Chatty Workspace</h2>
          <p className="text-sm text-base-content/60">
            Select a colleague from the sidebar to collaborate in real time—without exchanging
            personal phone numbers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          <div className="p-3.5 rounded-2xl bg-base-200/70 border border-base-300/70 space-y-1">
            <Tag className="size-4 text-primary" />
            <h4 className="text-xs font-bold">Custom Labels</h4>
            <p className="text-[11px] text-base-content/60">
              Group colleagues by #Dev, #Marketing, #Testing, or create your own tags.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-base-200/70 border border-base-300/70 space-y-1">
            <Palette className="size-4 text-secondary" />
            <h4 className="text-xs font-bold">Chat Wallpapers</h4>
            <p className="text-[11px] text-base-content/60">
              Personalize each chat with Twilight Lake, Cyber Midnight, or Aurora themes.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-base-200/70 border border-base-300/70 space-y-1">
            <ShieldCheck className="size-4 text-emerald-400" />
            <h4 className="text-xs font-bold">Shared Media & Links</h4>
            <p className="text-[11px] text-base-content/60">
              Browse shared screenshots and URLs in the right-hand detail panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;