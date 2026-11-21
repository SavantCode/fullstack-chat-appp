import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowLeft, LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const isSubPage = location.pathname === "/profile" || location.pathname === "/settings";

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/90"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>

            {authUser && isSubPage && (
              <Link
                to="/"
                className="btn btn-sm btn-primary btn-outline gap-1.5 rounded-xl ml-2"
              >
                <ArrowLeft className="size-4" />
                <span>Back to Chat</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className={`btn btn-sm gap-2 transition-colors ${
                location.pathname === "/settings" ? "btn-primary" : "btn-ghost"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to={"/profile"}
                  className={`btn btn-sm gap-2 ${
                    location.pathname === "/profile" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  <User className="size-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="btn btn-sm btn-ghost text-rose-400 gap-2" onClick={logout}>
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;