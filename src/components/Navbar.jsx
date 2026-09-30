import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, X, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Auth pages use their own full-screen layout — hide the navbar there
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  if (isAuthPage) return null;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const links = isAuthenticated
    ? [
        { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      ]
    : [
        { to: "/login", label: "Sign in", icon: <LogIn className="w-4 h-4" /> },
        { to: "/register", label: "Register", icon: <UserPlus className="w-4 h-4" /> },
      ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-navy-950/80 border-b border-white/[0.06]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 flex items-center justify-center font-extrabold text-white text-base shadow-md shadow-brand-600/25 group-hover:scale-105 transition-transform duration-300">
            A
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Auth<span className="gradient-text">Flow</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                location.pathname === l.to
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-slate-200 max-w-[140px] truncate">
                  {user?.name || "User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-white/[0.04] border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 active:scale-95 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Sign in
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden animate-slideDown border-t border-white/[0.06] bg-navy-950/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? "bg-white/[0.07] text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.icon}
                {l.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
