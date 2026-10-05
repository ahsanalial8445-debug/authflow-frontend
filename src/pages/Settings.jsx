import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ACCENT_THEMES } from "../context/theme";
import { useTheme } from "../context/useTheme";

const Settings = () => {
  const { logout } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const navigate = useNavigate();
  const activeTheme = ACCENT_THEMES.find(({ id }) => id === theme) || ACCENT_THEMES[0];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="app-page min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8">
          <p className="text-sm font-semibold text-brand-700">Preferences</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Settings</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your profile and appearance.</p>
        </header>

        <div className="space-y-5">
          <section className="glass rounded-2xl p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-slate-950">Profile</h2>
            <p className="mt-1 text-sm text-slate-500">Update your account information.</p>
            <button onClick={() => navigate("/profile")} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              <UserRound className="h-4 w-4" /> Open profile
            </button>
          </section>

          <section className="glass rounded-2xl p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-slate-950">Appearance</h2>
            <p className="mt-1 text-sm text-slate-500">Choose how TaskFlow looks.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {ACCENT_THEMES.map(({ id, label }) => {
                const Icon = id === "dark" ? Moon : Sun;
                const selected = theme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      if (!selected) cycleTheme();
                    }}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                      selected
                        ? "border-brand-300 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500">Current mode: {activeTheme.label}</p>
          </section>

          <section className="glass rounded-2xl p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-slate-950">Account</h2>
            <p className="mt-1 text-sm text-slate-500">Sign out of your TaskFlow account.</p>
            <button onClick={handleLogout} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 px-3.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Settings;
