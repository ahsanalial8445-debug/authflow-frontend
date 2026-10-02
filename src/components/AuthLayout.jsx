const Brand = ({ size = "md" }) => {
  const dims = size === "lg" ? "w-11 h-11 text-lg" : "w-10 h-10 text-lg";
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${dims} rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white shadow-sm`}
      >
        A
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900">
        Auth<span className="gradient-text">Flow</span>
      </span>
    </div>
  );
};

const AuthLayout = ({ children, title, subtitle }) => (
  <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
    <div className="w-full max-w-md animate-slideUp">
      <div className="flex justify-center mb-7">
        <Brand size="lg" />
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] sm:p-9">
        {title && (
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{title}</h1>
            {subtitle && <p className="text-slate-500 text-sm sm:text-base">{subtitle}</p>}
          </div>
        )}
        {children}
      </section>
      <p className="mt-5 text-center text-xs text-slate-500">
        Protected by JWT authentication
      </p>
    </div>
  </main>
);

export { Brand };
export default AuthLayout;
