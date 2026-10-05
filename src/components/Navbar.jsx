import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  X,
  LogIn,
  UserPlus,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Settings,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ACCENT_THEMES } from "../context/theme";
import { useTheme } from "../context/useTheme";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Reference for Account dropdown
  const profileRef = useRef(null);

  // Auth pages use their own full-screen layout
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Close Account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isAuthPage) return null;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    navigate("/login");
  };

  const links = isAuthenticated
    ? [
        {
          to: "/dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
        },
        {
          to: "/tasks",
          label: "Tasks",
          icon: <ListTodo className="h-[18px] w-[18px]" />,
        },
      ]
    : [
        {
          to: "/login",
          label: "Sign in",
          icon: <LogIn className="h-[18px] w-[18px]" />,
        },
        {
          to: "/register",
          label: "Register",
          icon: <UserPlus className="h-[18px] w-[18px]" />,
        },
      ];

  const currentTheme =
    ACCENT_THEMES.find(({ id }) => id === theme) || ACCENT_THEMES[0];

  const nextTheme =
    ACCENT_THEMES[
      (ACCENT_THEMES.findIndex(({ id }) => id === theme) + 1) %
        ACCENT_THEMES.length
    ];
  const ThemeIcon = theme === "dark" ? Moon : Sun;

  const themeControl = (mobile = false) => (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Current mode: ${currentTheme.label}. Switch to ${nextTheme.label}.`}
      aria-label={`Current mode: ${currentTheme.label}. Switch to ${nextTheme.label}.`}
      data-theme-control
      aria-pressed={theme === "dark"}
      className={`theme-mode-toggle group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 text-xs font-semibold text-slate-700 shadow-2xs transition-all duration-200 hover:border-brand-300 hover:bg-white hover:text-brand-600 hover:shadow-xs active:scale-[0.98] ${
        mobile ? "w-full justify-between px-3.5 py-2.5" : "h-9 px-3"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="theme-mode-icon flex h-5 w-5 items-center justify-center rounded-md bg-white text-slate-500 border border-slate-200/60 transition-colors group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-600">
          <ThemeIcon className="h-3 w-3" />
        </span>
        <span className="tracking-tight">
          {currentTheme.label}
        </span>
      </div>
      <span className="theme-mode-indicator h-1.5 w-1.5 rounded-full bg-brand-500 ring-2 ring-brand-100" />
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* ================= BRAND ================= */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 rounded-xl transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-sm font-black text-white shadow-md shadow-brand-500/20 ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-brand-500/30">
            <span className="relative z-10">T</span>
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="hidden sm:block text-left">
            <div className="text-base font-bold tracking-tight text-slate-900 leading-none">
              Task<span className="gradient-text">Flow</span>
            </div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-slate-400 leading-none">
              Task Manager
            </div>
          </div>
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <div className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2">
          <div className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/60 p-1 shadow-2xs backdrop-blur-xs">
            {links.map((l) => {
              const active = location.pathname === l.to;

              return (
                <Link
                  key={l.to}
                  to={l.to}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <span
                    className={`transition-colors duration-200 ${
                      active
                        ? "text-brand-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  >
                    {l.icon}
                  </span>

                  <span>{l.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              {/* Theme Selector */}
              <div className="hidden lg:block">
                {themeControl()}
              </div>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500"
                title="Notifications are not available yet"
                aria-label="Notifications are not available yet"
              >
                <Bell className="h-4 w-4" />
              </span>

              {/* User Profile */}
              <div
                ref={profileRef}
                className="relative hidden sm:block"
              >
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className={`flex items-center gap-2 rounded-xl border p-1 pr-2.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    profileOpen
                      ? "border-brand-200 bg-brand-50/50 shadow-xs"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-2xs">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>

                  <div className="hidden lg:block text-left">
                    <p className="max-w-[100px] truncate text-xs font-semibold text-slate-800 leading-tight">
                      {user?.name || "User"}
                    </p>
                  </div>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                      profileOpen ? "rotate-180 text-brand-600" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl shadow-slate-900/10 transition-all"
                    role="menu"
                  >
                    <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100 mb-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-white shadow-2xs">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900">
                            {user?.name || "User"}
                          </p>

                          <p className="truncate text-[11px] font-medium text-slate-500">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      role="menuitem"
                    >
                      <UserRound className="h-4 w-4 text-slate-400" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      role="menuitem"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none"
                      role="menuitem"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100/60 text-red-600">
                        <LogOut className="h-3.5 w-3.5" />
                      </span>
                      Sign out
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Logout fallback */}
              <button
                type="button"
                onClick={handleLogout}
                className="hidden h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none md:hidden"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-slate-800 hover:shadow-xs active:scale-[0.98] md:inline-flex"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in
            </Link>
          )}

          {/* ================= MOBILE MENU BUTTON ================= */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      {menuOpen && (
        <div className="border-t border-slate-200/80 bg-white/95 backdrop-blur-lg shadow-xl md:hidden">
          <div className="space-y-3 px-4 py-4">
            {/* Mobile Navigation */}
            <div className="space-y-1">
              {links.map((l) => {
                const active = location.pathname === l.to;

                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={
                        active ? "text-brand-600" : "text-slate-400"
                      }
                    >
                      {l.icon}
                    </span>

                    {l.label}
                  </Link>
                );
              })}
            </div>

            {isAuthenticated && (
              <div className="pt-2 space-y-2 border-t border-slate-100">
                {/* Theme Control */}
                <div>{themeControl(true)}</div>

                {/* User Info Card */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-white shadow-2xs">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {user?.name || "User"}
                      </p>

                      <p className="truncate text-[11px] font-medium text-slate-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <UserRound className="h-4 w-4 text-slate-400" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Settings
                </Link>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;