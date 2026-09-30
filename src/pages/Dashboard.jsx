import {
  ShieldCheck,
  CalendarDays,
  KeyRound,
  Mail,
  LogOut,
  LayoutDashboard,
  BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const stats = [
    {
      label: "Account status",
      value: "Active",
      icon: <BadgeCheck className="w-5 h-5" />,
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Member since",
      value: memberSince,
      icon: <CalendarDays className="w-5 h-5" />,
      accent: "text-brand-400 bg-brand-500/10 border-brand-500/20",
    },
    {
      label: "Session security",
      value: "JWT Enabled",
      icon: <KeyRound className="w-5 h-5" />,
      accent: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-navy-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-600/15 blur-3xl animate-float pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-indigo-500/10 blur-3xl animate-float-slow pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ---- Header ---- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 animate-slideUp">
          <div className="flex items-center gap-3 text-slate-500">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-white/[0.04] border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 active:scale-[0.98] transition-all duration-200 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>

        {/* ---- Welcome ---- */}
        <div className="mb-10 animate-slideUp" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
            Welcome back,{" "}
            <span className="gradient-text">{user?.name || "User"}</span>
          </h1>
          <p className="text-slate-400">
            You're signed in and your session is secured.
          </p>
        </div>

        {/* ---- Stat cards ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8 stagger">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass glow-border rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300"
            >
              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${s.accent}`}
              >
                {s.icon}
              </div>
              <p className="text-sm text-slate-500 mb-1">{s.label}</p>
              <p className="text-lg font-bold text-white truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ---- Profile card ---- */}
        <div
          className="glass glow-border rounded-3xl p-6 sm:p-8 animate-slideUp"
          style={{ animationDelay: "0.35s" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-white/[0.06]">
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-brand-600/30">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                {user?.name || "User"}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-slate-400 min-w-0">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate text-sm sm:text-base">
                  {user?.email || "—"}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified
            </span>
          </div>

          <div className="pt-6 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-400 leading-relaxed">
              Your session is protected with JWT authentication. The token is
              stored securely and attached to every API request automatically.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600 animate-fadeIn" style={{ animationDelay: "0.5s" }}>
          AuthFlow — secure authentication for modern apps
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
