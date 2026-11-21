import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  Search,
  X,
  Star,
  Plus,
  MessageSquare,
  Users,
  Bookmark,
  Settings,
  LogOut,
  MoreVertical,
  ChevronRight,
  Hash,
  User as UserIcon,
} from "lucide-react";
import { LABEL_COLOR_PALETTE } from "../constants";
import { formatSidebarTime } from "../lib/utils";

const Sidebar = () => {
  const {
    getUsers,
    users = [],
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    unreadCounts = {},
    typingUsers = {},
    activeFilter = "all",
    setActiveFilter,
    customLabels = [],
    createCustomLabel,
    getUserLabels,
    isUserFavorite,
  } = useChatStore();

  const { onlineUsers = [], authUser, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showAllOnlineModal, setShowAllOnlineModal] = useState(false);
  const [showNewLabelModal, setShowNewLabelModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLOR_PALETTE?.[0] || "#38bdf8");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const safeUsers = Array.isArray(users) ? users : [];
  const safeOnlineUsers = Array.isArray(onlineUsers) ? onlineUsers : [];
  const safeCustomLabels = Array.isArray(customLabels) ? customLabels : [];

  const totalUnread = Object.values(unreadCounts || {}).reduce(
    (acc, count) => acc + (Number(count) || 0),
    0
  );

  const onlineColleagues = safeUsers.filter((u) => safeOnlineUsers.includes(u._id));
  const displayedOnlineColleagues = showAllOnlineModal
    ? onlineColleagues
    : onlineColleagues.slice(0, 5);

  const filteredUsers = safeUsers.filter((user) => {
    if (!user) return false;
    const matchesOnline = showOnlineOnly ? safeOnlineUsers.includes(user._id) : true;
    const userLabels = typeof getUserLabels === "function" ? getUserLabels(user) : [];

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      user.fullName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.role?.toLowerCase().includes(q) ||
      userLabels.some((l) => l?.name?.toLowerCase().includes(q));

    if (!matchesOnline || !matchesSearch) return false;

    if (activeFilter === "unread") {
      return (unreadCounts[user._id] || 0) > 0;
    }
    if (activeFilter === "favorites") {
      return typeof isUserFavorite === "function" ? isUserFavorite(user._id) : false;
    }
    if (typeof activeFilter === "string" && activeFilter.startsWith("label:")) {
      const targetLabel = activeFilter.replace("label:", "").toLowerCase();
      return userLabels.some((l) => l?.name?.toLowerCase() === targetLabel);
    }

    return true;
  });

  const handleCreateLabel = (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    const created = createCustomLabel(newLabelName, newLabelColor);
    if (created) {
      setNewLabelName("");
      setShowNewLabelModal(false);
      setActiveFilter(`label:${created.name}`);
    }
  };

  return (
    <div
      className={`h-full flex shrink-0 select-none bg-[#161922] text-slate-200 border-r border-white/[0.06] ${
        selectedUser ? "hidden md:flex" : "flex w-full md:w-auto"
      }`}
    >
      {/* 1. FAR-LEFT NAVIGATION & GROUP RAIL */}
      <nav className="w-[68px] h-full bg-[#11131a] border-r border-white/[0.06] flex flex-col items-center py-5 justify-between shrink-0 z-20">
        {/* Top Brand Icon */}
        <div className="flex flex-col items-center gap-6 w-full">
          <button
            onClick={() => setActiveFilter("all")}
            className="size-11 rounded-2xl bg-gradient-to-tr from-[#00a3ff] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-[#00a3ff]/25 hover:scale-105 transition-transform"
            title="Chatty Workspace"
          >
            <MessageSquare className="size-5 text-white fill-white/10" />
          </button>

          {/* Primary Navigation Icons */}
          <div className="flex flex-col items-center gap-2 w-full px-2">
            {/* All Messages */}
            <button
              onClick={() => {
                setActiveFilter("all");
                setShowOnlineOnly(false);
              }}
              className={`relative group w-full h-11 rounded-xl flex items-center justify-center transition-all ${
                activeFilter === "all" && !showOnlineOnly
                  ? "text-[#00a3ff] bg-[#00a3ff]/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
              title="All Chats"
            >
              {activeFilter === "all" && !showOnlineOnly && (
                <span className="absolute right-0 top-2.5 bottom-2.5 w-1 bg-[#00a3ff] rounded-l-full" />
              )}
              <MessageSquare className="size-5" />
              {totalUnread > 0 && (
                <span className="absolute top-1.5 right-2.5 size-2 rounded-full bg-[#00a3ff] ring-2 ring-[#11131a]" />
              )}
            </button>

            {/* Online Colleagues Filter */}
            <button
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              className={`relative group w-full h-11 rounded-xl flex items-center justify-center transition-all ${
                showOnlineOnly
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
              title="Online Colleagues"
            >
              {showOnlineOnly && (
                <span className="absolute right-0 top-2.5 bottom-2.5 w-1 bg-emerald-400 rounded-l-full" />
              )}
              <Users className="size-5" />
              {onlineColleagues.length > 0 && (
                <span className="absolute top-2 right-2.5 size-2 rounded-full bg-emerald-400 ring-2 ring-[#11131a]" />
              )}
            </button>

            {/* Saved / Starred Favorites */}
            <button
              onClick={() =>
                setActiveFilter(activeFilter === "favorites" ? "all" : "favorites")
              }
              className={`relative group w-full h-11 rounded-xl flex items-center justify-center transition-all ${
                activeFilter === "favorites"
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
              title="Starred Colleagues"
            >
              {activeFilter === "favorites" && (
                <span className="absolute right-0 top-2.5 bottom-2.5 w-1 bg-amber-400 rounded-l-full" />
              )}
              <Bookmark className="size-5" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-7 h-[1px] bg-white/[0.07]" />

          {/* Department / Custom Label Group Icons on Left Rail */}
          <div className="flex flex-col items-center gap-2 w-full px-2 overflow-y-auto no-scrollbar max-h-[220px]">
            {safeCustomLabels.map((lbl) => {
              if (!lbl?.name) return null;
              const isSelected = activeFilter === `label:${lbl.name}`;
              return (
                <button
                  key={lbl.id || lbl.name}
                  onClick={() =>
                    setActiveFilter(isSelected ? "all" : `label:${lbl.name}`)
                  }
                  className={`relative group w-full h-10 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                  title={`Group: #${lbl.name}`}
                >
                  {isSelected && (
                    <span
                      className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full"
                      style={{ backgroundColor: lbl.color || "#38bdf8" }}
                    />
                  )}
                  <div
                    className="size-7 rounded-lg flex items-center justify-center text-[11px] font-bold tracking-tight transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${lbl.color || "#38bdf8"}20`,
                      color: lbl.color || "#38bdf8",
                      border: isSelected
                        ? `1.5px solid ${lbl.color || "#38bdf8"}`
                        : "1px solid transparent",
                    }}
                  >
                    {lbl.name.slice(0, 2).toUpperCase()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions on Left Rail */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <Link
            to="/profile"
            className="w-full h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
            title="My Profile"
          >
            <UserIcon className="size-5" />
          </Link>

          <Link
            to="/settings"
            className="w-full h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
            title="Themes & Settings"
          >
            <Settings className="size-5" />
          </Link>

          {/* Circular '+' Button to Create New Department/Group Label */}
          <button
            onClick={() => setShowNewLabelModal(true)}
            className="size-10 rounded-full bg-white text-[#11131a] hover:bg-[#00a3ff] hover:text-white flex items-center justify-center shadow-md transition-all hover:scale-105"
            title="Create New Label / Department Group"
          >
            <Plus className="size-5 stroke-[2.5]" />
          </button>
        </div>
      </nav>

      {/* 2. MAIN CONVERSATION LIST COLUMN */}
      <aside className="w-full md:w-[340px] lg:w-[360px] h-full bg-[#181b24] flex flex-col shrink-0">
        {/* Top User Account Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between relative">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/profile" className="relative shrink-0 group">
              <img
                src={authUser?.profilePic || "/avatar.svg"}
                alt={authUser?.fullName || "User"}
                onError={(e) => {
                  e.currentTarget.src = "/avatar.svg";
                }}
                className="size-11 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[#00a3ff] transition-all"
              />
              <span className="absolute top-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#181b24]" />
            </Link>
            <div className="min-w-0">
              <h2 className="font-bold text-[15px] text-white truncate leading-tight">
                {authUser?.fullName || "Workspace Member"}
              </h2>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {authUser?.role || "My Account"}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="size-9 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Account options"
            >
              <MoreVertical className="size-4" />
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#11131a] border border-white/10 shadow-2xl py-1.5 z-50">
                <Link
                  to="/profile"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-white/[0.06]"
                >
                  <UserIcon className="size-3.5 text-[#00a3ff]" />
                  Edit Profile & Role
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-white/[0.06]"
                >
                  <Settings className="size-3.5 text-slate-400" />
                  Appearance & Themes
                </Link>
                <div className="my-1 border-t border-white/[0.06]" />
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="px-5 pb-4">
          <div className="relative flex items-center">
            <Search className="size-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start new chat...."
              className="w-full h-10 pl-10 pr-8 rounded-xl bg-[#11131a] text-xs text-slate-200 placeholder:text-slate-500 border border-white/[0.05] focus:border-[#00a3ff]/50 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* "Online now" Horizontal Section */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white tracking-tight">
              Online now
            </span>
            {onlineColleagues.length > 5 ? (
              <button
                onClick={() => setShowAllOnlineModal(!showAllOnlineModal)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
              >
                {showAllOnlineModal ? "Show less" : "More"}
                <ChevronRight className="size-3.5" />
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                {onlineColleagues.length} active
              </span>
            )}
          </div>

          {onlineColleagues.length > 0 ? (
            <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pb-1">
              {displayedOnlineColleagues.map((user) => (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                  <div className="relative">
                    <img
                      src={user.profilePic || "/avatar.svg"}
                      alt={user.fullName}
                      onError={(e) => {
                        e.currentTarget.src = "/avatar.svg";
                      }}
                      className={`size-12 rounded-full object-cover transition-transform group-hover:scale-105 ${
                        selectedUser?._id === user._id
                          ? "ring-2 ring-[#00a3ff]"
                          : "ring-1 ring-white/10"
                      }`}
                    />
                    <span className="absolute top-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#181b24]" />
                  </div>
                  <span className="text-[11px] text-slate-400 group-hover:text-white truncate max-w-[54px]">
                    {user.fullName?.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-2 px-3 rounded-xl bg-[#11131a]/60 border border-white/[0.04] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                No other colleagues online right now
              </span>
              <span className="size-2 rounded-full bg-slate-600" />
            </div>
          )}
        </div>

        {/* Compact Group Filter Strip */}
        <div className="px-5 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-all ${
              activeFilter === "all"
                ? "bg-[#00a3ff] text-white shadow-sm"
                : "bg-[#11131a] text-slate-400 hover:text-slate-200"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setActiveFilter("unread")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 flex items-center gap-1 transition-all ${
              activeFilter === "unread"
                ? "bg-[#00a3ff] text-white shadow-sm"
                : "bg-[#11131a] text-slate-400 hover:text-slate-200"
            }`}
          >
            Unread
            {totalUnread > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                {totalUnread}
              </span>
            )}
          </button>

          {safeCustomLabels.map((lbl) => {
            if (!lbl?.name) return null;
            const active = activeFilter === `label:${lbl.name}`;
            return (
              <button
                key={lbl.id || lbl.name}
                onClick={() =>
                  setActiveFilter(active ? "all" : `label:${lbl.name}`)
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                  active
                    ? "text-white shadow-sm"
                    : "bg-[#11131a] text-slate-400 hover:text-slate-200"
                }`}
                style={active ? { backgroundColor: lbl.color || "#38bdf8" } : {}}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: active ? "#fff" : lbl.color || "#38bdf8" }}
                />
                {lbl.name}
              </button>
            );
          })}
        </div>

        {/* "Messages" Section Title */}
        <div className="px-5 pt-1 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-white tracking-tight">
              Messages
            </h3>
            <span className="px-1.5 py-0.5 rounded-md bg-[#11131a] text-[10px] font-semibold text-slate-400">
              {filteredUsers.length}
            </span>
          </div>

          {activeFilter !== "all" && (
            <button
              onClick={() => setActiveFilter("all")}
              className="text-[11px] text-[#00a3ff] hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* New Custom Label Modal */}
        {showNewLabelModal && (
          <form
            onSubmit={handleCreateLabel}
            className="mx-5 mb-3 p-3.5 rounded-xl bg-[#11131a] border border-white/10 space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Hash className="size-3.5 text-[#00a3ff]" />
                Create Department / Group Label
              </span>
              <button
                type="button"
                onClick={() => setShowNewLabelModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. Dev, Marketing, QA, Leadership..."
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              className="w-full h-8 px-3 rounded-lg bg-[#181b24] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00a3ff]"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {(LABEL_COLOR_PALETTE || []).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewLabelColor(c)}
                    className={`size-4 rounded-full transition-transform ${
                      newLabelColor === c ? "scale-125 ring-2 ring-white" : "opacity-70"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-[#00a3ff] hover:bg-[#0284c7] text-white text-xs font-medium transition-colors"
              >
                Add Label
              </button>
            </div>
          </form>
        )}

        {/* Messages Scrollable List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {isUsersLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
                <div className="size-12 rounded-full bg-white/[0.05] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 bg-white/[0.05] rounded animate-pulse" />
                  <div className="h-3 w-40 bg-white/[0.04] rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-xs text-slate-400">No conversations match this filter</p>
              <button
                onClick={() => {
                  setActiveFilter("all");
                  setSearchQuery("");
                  setShowOnlineOnly(false);
                }}
                className="mt-2 text-xs text-[#00a3ff] hover:underline"
              >
                Show all colleagues
              </button>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const unread = unreadCounts[user._id] || 0;
              const isTyping = typingUsers[user._id];
              const isOnline = safeOnlineUsers.includes(user._id);
              const isSelected = selectedUser?._id === user._id;
              const isFav = typeof isUserFavorite === "function" ? isUserFavorite(user._id) : false;
              const userLabels = typeof getUserLabels === "function" ? getUserLabels(user) : [];
              const primaryLabel = userLabels[0];

              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full px-3 py-3 rounded-xl flex items-center gap-3.5 transition-all text-left group ${
                    isSelected
                      ? "bg-[#11131a] shadow-sm border border-white/[0.06]"
                      : "hover:bg-[#11131a]/50 border border-transparent"
                  }`}
                >
                  {/* Avatar with Top-Right Online Dot */}
                  <div className="relative shrink-0">
                    <img
                      src={user.profilePic || "/avatar.svg"}
                      alt={user.fullName}
                      onError={(e) => {
                        e.currentTarget.src = "/avatar.svg";
                      }}
                      className="size-12 rounded-full object-cover bg-[#11131a]"
                    />
                    {isOnline && (
                      <span className="absolute top-0 right-0 size-2.5 bg-emerald-400 rounded-full ring-2 ring-[#181b24]" />
                    )}
                  </div>

                  {/* Two-Line Clean Content */}
                  <div className="flex-1 min-w-0">
                    {/* Row 1: Name + Read Dots + Timestamp */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-[14px] truncate ${
                            unread > 0 || isSelected
                              ? "font-bold text-white"
                              : "font-semibold text-slate-200"
                          }`}
                        >
                          {user.fullName}
                        </span>
                        {isFav && (
                          <Star className="size-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {user.lastMessage &&
                          String(user.lastMessage.senderId) === String(authUser?._id) && (
                            <span
                              className={`flex items-center gap-0.5 ${
                                user.lastMessage.isRead
                                  ? "text-[#00a3ff]"
                                  : "text-slate-500"
                              }`}
                              title={user.lastMessage.isRead ? "Seen" : "Sent"}
                            >
                              <span className="size-1 rounded-full bg-current" />
                              <span className="size-1 rounded-full bg-current" />
                            </span>
                          )}
                        {user.lastMessage?.createdAt && (
                          <span className="text-[11px] text-slate-500">
                            {formatSidebarTime(user.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Typing / Last Message Preview + Unread Pill or Group Tag */}
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="text-xs truncate flex-1">
                        {isTyping ? (
                          <span className="text-[#00a3ff] font-medium">
                            Typing....
                          </span>
                        ) : user.lastMessage ? (
                          <span
                            className={
                              unread > 0
                                ? "text-slate-200 font-medium"
                                : "text-slate-400"
                            }
                          >
                            {String(user.lastMessage.senderId) === String(authUser?._id)
                              ? "You: "
                              : ""}
                            {user.lastMessage.text || "📷 Shared an image"}
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {user.role || "Start a conversation"}
                          </span>
                        )}
                      </div>

                      {/* Right side badge: Unread count OR subtle Department tag */}
                      {unread > 0 ? (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#00a3ff] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {unread}
                        </span>
                      ) : primaryLabel ? (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0"
                          style={{
                            backgroundColor: `${primaryLabel.color || "#38bdf8"}15`,
                            color: primaryLabel.color || "#38bdf8",
                          }}
                        >
                          {primaryLabel.name}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;