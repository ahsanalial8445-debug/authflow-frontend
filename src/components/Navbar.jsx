import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ListTodo, LogOut, Menu, X, LogIn, UserPlus, Palette } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ACCENT_THEMES } from "../context/theme";
import { useTheme } from "../context/useTheme";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, cycleTheme } = useTheme();
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
        { to: "/tasks", label: "Tasks", icon: <ListTodo className="w-4 h-4" /> },
      ]
    : [
        { to: "/login", label: "Sign in", icon: <LogIn className="w-4 h-4" /> },
        { to: "/register", label: "Register", icon: <UserPlus className="w-4 h-4" /> },
      ];
  const currentTheme = ACCENT_THEMES.find(({ id }) => id === theme) || ACCENT_THEMES[0];
  const nextTheme = ACCENT_THEMES[
    (ACCENT_THEMES.findIndex(({ id }) => id === theme) + 1) % ACCENT_THEMES.length
  ];

  const themeControl = (mobile = false) => (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Accent theme: ${currentTheme.label}. Switch to ${nextTheme.label}.`}
      aria-label={`Accent theme ${currentTheme.label}. Switch to ${nextTheme.label}.`}
      className={`theme-switcher inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        mobile ? "w-full justify-start px-4 py-3" : ""
      }`}
    >
      <Palette className="h-4 w-4" />
      <span>{mobile ? `Color theme · ${currentTheme.label}` : currentTheme.label}</span>
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-xl">
      <nav className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
        >
          <div className="brand-soft-shadow flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white transition-colors duration-200 group-hover:bg-brand-700">
            A
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Auth<span className="gradient-text">Flow</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 rounded-xl bg-slate-50 p-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={location.pathname === l.to ? "page" : undefined}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                location.pathname === l.to
                  ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/70"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden md:block">{themeControl()}</div>
              <div className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[140px] truncate">
                  {user?.name || "User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="hidden min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:inline-flex"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
            >
              Sign in
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden animate-slideDown border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                aria-current={location.pathname === l.to ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {l.icon}
                {l.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="py-2">{themeControl(true)}</div>
                <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
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
