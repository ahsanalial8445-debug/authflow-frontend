import { ShieldCheck, Lock, Zap } from "lucide-react";

const Brand = ({ size = "md" }) => {
  const dims = size === "lg" ? "w-12 h-12 text-xl" : "w-10 h-10 text-lg";
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${dims} rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 flex items-center justify-center font-extrabold text-white shadow-lg shadow-brand-600/30`}
      >
        A
      </div>
      <span className="text-xl font-bold tracking-tight text-white">
        Auth<span className="gradient-text">Flow</span>
      </span>
    </div>
  );
};

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen grid lg:grid-cols-2 bg-navy-900">
    {/* ---- Left: brand panel (desktop only) ---- */}
    <aside className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-brand-900/40 p-10 xl:p-14">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-brand-600/25 blur-3xl animate-float pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 w-[420px] h-[420px] rounded-full bg-indigo-500/15 blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 animate-slideUp">
        <Brand size="lg" />
      </div>

      <div className="relative z-10 max-w-md animate-slideUp" style={{ animationDelay: "0.15s" }}>
        <h2 className="text-3xl xl:text-4xl font-bold leading-tight text-white">
          Authentication that feels{" "}
          <span className="gradient-text">effortless</span>.
        </h2>
        <p className="mt-4 text-slate-400 leading-relaxed">
          Secure JWT-based sessions, instant account access, and a clean
          experience built for real products.
        </p>

        <ul className="mt-10 space-y-5">
          {[
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              title: "Secure by default",
              text: "Hashed passwords & signed tokens",
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: "Instant access",
              text: "One click to sign in and go",
            },
            {
              icon: <Lock className="w-5 h-5" />,
              title: "Protected routes",
              text: "Your dashboard stays private",
            },
          ].map((f) => (
            <li key={f.title} className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-white">{f.title}</p>
                <p className="text-sm text-slate-400">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 text-xs text-slate-500 animate-slideUp" style={{ animationDelay: "0.3s" }}>
        © {new Date().getFullYear()} AuthFlow. All rights reserved.
      </div>
    </aside>

    {/* ---- Right: auth card ---- */}
    <main className="relative flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12 overflow-hidden">
      {/* Mobile-only subtle background */}
      <div className="lg:hidden absolute inset-0 bg-grid pointer-events-none" />
      <div className="lg:hidden absolute inset-0 bg-radial-glow pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Mobile brand header */}
        <div className="lg:hidden flex justify-center mb-8 animate-slideUp">
          <Brand />
        </div>

        <div className="glass glow-border rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/40 animate-slideUp" style={{ animationDelay: "0.1s" }}>
          {title && (
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h1>
              {subtitle && <p className="text-slate-400 text-sm sm:text-base">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 hidden lg:block animate-fadeIn" style={{ animationDelay: "0.3s" }}>
          Protected by JWT authentication
        </p>
      </div>
    </main>
  </div>
);

export { Brand };
export default AuthLayout;
