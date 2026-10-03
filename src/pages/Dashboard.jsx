import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CalendarDays,
  KeyRound,
  Mail,
  LogOut,
  LayoutDashboard,
  BadgeCheck,
  ListTodo,
  CheckCircle2,
  Circle,
  Clock3,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [taskStats, setTaskStats] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    let isActive = true;

    api
      .get("/tasks")
      .then(({ data }) => {
        if (!isActive) return;
        const tasks = Array.isArray(data.tasks) ? data.tasks : [];
        setTaskStats({
          total: tasks.length,
          pending: tasks.filter((task) => task.status === "Pending").length,
          inProgress: tasks.filter((task) => task.status === "In Progress").length,
          completed: tasks.filter((task) => task.status === "Completed").length,
        });
      })
      .catch(() => {
        if (isActive) setTaskError("Task statistics are unavailable right now.");
      })
      .finally(() => {
        if (isActive) setTasksLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

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
      accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Member since",
      value: memberSince,
      icon: <CalendarDays className="w-5 h-5" />,
      accent: "text-brand-700 bg-brand-50 border-brand-100",
    },
    {
      label: "Session security",
      value: "JWT Enabled",
      icon: <KeyRound className="w-5 h-5" />,
      accent: "text-sky-700 bg-sky-50 border-sky-100",
    },
  ];

  const taskCards = [
    { label: "Total tasks", value: taskStats?.total, icon: <ClipboardList className="w-5 h-5" />, accent: "text-brand-700 bg-brand-50 border-brand-100" },
    { label: "Pending", value: taskStats?.pending, icon: <Circle className="w-5 h-5" />, accent: "text-amber-700 bg-amber-50 border-amber-100" },
    { label: "In progress", value: taskStats?.inProgress, icon: <Clock3 className="w-5 h-5" />, accent: "text-sky-700 bg-sky-50 border-sky-100" },
    { label: "Completed", value: taskStats?.completed, icon: <CheckCircle2 className="w-5 h-5" />, accent: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="app-page min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* ---- Header ---- */}
        <div className="mb-7 flex flex-col gap-4 animate-slideUp sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <LayoutDashboard className="h-4 w-4 text-brand-600" />
            <span>Dashboard</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex min-h-10 self-start items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>

        {/* ---- Welcome ---- */}
        <div className="relative mb-7 overflow-hidden rounded-2xl border border-brand-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] animate-slideUp sm:p-8" style={{ animationDelay: "0.1s" }}>
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-50 blur-2xl" />
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              YOUR PERSONAL WORKSPACE
            </div>
            <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, <span className="text-brand-700">{user?.name || "there"}</span>
            </h1>
            <p className="text-sm text-slate-600 sm:text-base">Here’s a snapshot of your progress. Let’s make today count.</p>
            {user?.email && <p className="mt-2 text-sm text-slate-500">{user.email}</p>}
          </div>
        </div>

        {/* ---- Task statistics ---- */}
        <section aria-label="Task statistics" className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger">
            {taskCards.map((stat) => (
              <div key={stat.label} className="glass glow-border rounded-2xl p-4 sm:p-5">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${stat.accent}`}>
                  {stat.icon}
                </div>
                <p className="mb-1 text-sm text-slate-600">{stat.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-slate-950" aria-live="polite">
                  {tasksLoading ? "…" : taskStats ? stat.value : "—"}
                </p>
              </div>
            ))}
          </div>
          {taskError && (
            <p role="status" className="mt-3 text-sm text-slate-500">{taskError}</p>
          )}
        </section>

        {/* ---- Task Manager entry point ---- */}
        <section className="glass glow-border mb-8 flex flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-700">
              <ListTodo className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">Task Manager</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Create, organize and track your tasks.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/tasks")}
            className="auth-submit inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            <ListTodo className="w-4 h-4" />
            Open Task Manager
          </button>
        </section>

        {/* ---- Account stat cards ---- */}
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-950">Account overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8 stagger">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass glow-border rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${s.accent}`}
              >
                {s.icon}
              </div>
              <p className="text-sm text-slate-600 mb-1">{s.label}</p>
              <p className="text-lg font-bold text-slate-900 truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ---- Profile card ---- */}
        <div
          className="glass glow-border rounded-2xl p-5 sm:p-7 animate-slideUp"
          style={{ animationDelay: "0.35s" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-200">
            <div className="w-16 h-16 shrink-0 rounded-xl bg-brand-600 flex items-center justify-center text-2xl font-bold text-white shadow-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {user?.name || "User"}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-slate-600 min-w-0">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate text-sm sm:text-base">
                  {user?.email || "—"}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified
            </span>
          </div>

          <div className="pt-6 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              Your session is protected with JWT authentication. The token is
              stored securely and attached to every API request automatically.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 animate-fadeIn" style={{ animationDelay: "0.5s" }}>
          AuthFlow — secure authentication for modern apps
        </p>
      </div>
    </main>
  );
};

export default Dashboard;
