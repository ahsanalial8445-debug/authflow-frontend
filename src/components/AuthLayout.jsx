import { CheckSquare } from "lucide-react";

const Brand = ({ size = "md" }) => {
  const dims = size === "lg" ? "h-11 w-11 text-lg" : "h-10 w-10 text-lg";
  return (
    <div className="auth-logo flex items-center gap-3">
      <div className={`brand-soft-shadow ${dims} flex items-center justify-center rounded-xl bg-brand-600 font-bold text-white`}>
        <CheckSquare className="h-6 w-6 text-white" />
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-950">
        Task<span className="gradient-text">Flow</span>
      </span>
    </div>
  );
};

const AuthLayout = ({ children, title, subtitle }) => (
  <main className="auth-page relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6">
    <div className="auth-page-content relative z-10 w-full max-w-[440px]">
      <div className="mb-7 flex justify-center sm:mb-8">
        <Brand size="lg" />
      </div>
      <section className="auth-card rounded-[1.5rem] border border-white/80 bg-white/85 p-6 shadow-[0_24px_80px_rgba(30,41,59,0.10)] backdrop-blur-2xl sm:p-9">
        {title && (
          <div className="mb-7 text-center">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.75rem]">{title}</h1>
            {subtitle && <p className="text-sm leading-6 text-slate-500 sm:text-[0.9375rem]">{subtitle}</p>}
          </div>
        )}
        {children}
      </section>
    </div>
  </main>
);

export { Brand };
export default AuthLayout;