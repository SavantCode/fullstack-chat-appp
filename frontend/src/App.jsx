import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { Component, useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("UI Render Error caught by boundary:", error, info);
  }

  handleReset = () => {
    try {
      localStorage.removeItem("chat-custom-labels");
      localStorage.removeItem("chat-user-labels-map");
      localStorage.removeItem("chat-per-user-wallpaper");
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#11131a] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#181b24] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Refreshing Workspace UI</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || "An unexpected UI state occurred."}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-[#00a3ff] hover:bg-[#0284c7] text-white text-xs font-semibold transition-colors"
            >
              Reset Cached State & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div
        data-theme={theme || "dark"}
        className="flex flex-col items-center justify-center h-screen bg-[#11131a] text-white gap-3"
      >
        <Loader className="size-10 animate-spin text-[#00a3ff]" />
        <p className="text-xs text-slate-400">Loading workspace...</p>
      </div>
    );
  }

  // Show top Navbar on Settings and Profile pages, keep full-screen workspace on "/"
  const showTopNavbar = authUser && location.pathname !== "/";

  return (
    <AppErrorBoundary>
      <div data-theme={theme || "dark"} className="min-h-screen bg-base-100 text-base-content">
        {showTopNavbar && <Navbar />}

        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} />} />
        </Routes>

        <Toaster position="top-right" />
      </div>
    </AppErrorBoundary>
  );
};

export default App;