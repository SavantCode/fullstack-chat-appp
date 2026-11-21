export const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];

/**
 * Curated Instagram / WhatsApp style chat themes & wallpapers.
 * Image wallpapers render crisp and unblurred without dark gradient overlays.
 */
export const CHAT_WALLPAPERS = [
  {
    id: "cyber-midnight",
    name: "Cyber Midnight",
    category: "Dark & Modern",
    previewColor: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%)",
    backgroundStyle: {
      backgroundImage:
        "radial-gradient(at 15% 15%, rgba(56, 189, 248, 0.12) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(99, 102, 241, 0.12) 0px, transparent 50%), linear-gradient(180deg, #111827 0%, #0b0f19 100%)",
    },
    sentBubbleClass:
      "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-950/40 border border-sky-400/20",
    receivedBubbleClass:
      "bg-slate-800 text-slate-100 border border-slate-700/80 shadow-md",
    isDarkCanvas: true,
  },
  {
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
  },
  {
    id: "berry-aurora",
    name: "Berry Aurora",
    category: "Instagram Gradient",
    previewColor: "linear-gradient(135deg, #4c1d95 0%, #831843 50%, #1e1b4b 100%)",
    backgroundStyle: {
      backgroundImage:
        "radial-gradient(at 20% 20%, rgba(236, 72, 153, 0.25) 0px, transparent 55%), radial-gradient(at 80% 80%, rgba(139, 92, 246, 0.3) 0px, transparent 55%), linear-gradient(135deg, #1e1b4b 0%, #311042 55%, #0f172a 100%)",
    },
    sentBubbleClass:
      "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 text-white shadow-md border border-pink-400/20",
    receivedBubbleClass:
      "bg-slate-900 text-pink-50 border border-pink-500/20 shadow-md",
    isDarkCanvas: true,
  },
  {
    id: "emerald-forest",
    name: "Emerald Canopy",
    category: "WhatsApp Dark",
    previewColor: "linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #022c22 100%)",
    backgroundStyle: {
      backgroundImage:
        "radial-gradient(at 80% 20%, rgba(16, 185, 129, 0.2) 0px, transparent 50%), linear-gradient(160deg, #022c22 0%, #064e3b 50%, #0f172a 100%)",
    },
    sentBubbleClass:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-medium shadow-md",
    receivedBubbleClass:
      "bg-slate-900 text-emerald-50 border border-emerald-500/20 shadow-md",
    isDarkCanvas: true,
  },
  {
    id: "sunset-dunes",
    name: "Sunset Horizon",
    category: "Scenic Wallpaper",
    previewColor: "linear-gradient(135deg, #7c2d12 0%, #be185d 50%, #1e1b4b 100%)",
    backgroundStyle: {
      backgroundImage:
        "radial-gradient(at 50% 0%, rgba(251, 146, 60, 0.28) 0px, transparent 55%), radial-gradient(at 85% 90%, rgba(244, 63, 94, 0.22) 0px, transparent 50%), linear-gradient(180deg, #1f122b 0%, #2a1215 60%, #0f172a 100%)",
    },
    sentBubbleClass:
      "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md border border-orange-400/20",
    receivedBubbleClass:
      "bg-stone-900 text-stone-100 border border-white/10 shadow-md",
    isDarkCanvas: true,
  },
  {
    id: "default-clean",
    name: "Theme Adaptive",
    category: "Minimal",
    previewColor: "linear-gradient(135deg, #64748b 0%, #334155 100%)",
    backgroundStyle: {},
    sentBubbleClass: "bg-primary text-primary-content shadow-sm",
    receivedBubbleClass: "bg-base-200 text-base-content border border-base-300 shadow-sm",
    isDarkCanvas: false,
  },
];

/**
 * Default workplace colleague labels (customizable by user)
 */
export const DEFAULT_WORKSPACE_LABELS = [
  { id: "dev", name: "Dev", color: "#06b6d4" },
  { id: "marketing", name: "Marketing", color: "#ec4899" },
  { id: "testing", name: "Testing", color: "#f59e0b" },
  { id: "design", name: "Design", color: "#8b5cf6" },
  { id: "product", name: "Product", color: "#10b981" },
];

export const LABEL_COLOR_PALETTE = [
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#14b8a6", // Teal
];