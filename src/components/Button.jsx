import LoadingSpinner from "./LoadingSpinner";

const Button = ({
  children,
  type = "button",
  onClick,
  loading = false,
  loadingText,
  disabled,
  variant = "primary",
  className = "",
}) => {
  const base =
    "relative w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900";

  const variants = {
    primary:
      "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/40 hover:brightness-110 btn-shine",
    ghost:
      "bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20",
    danger:
      "bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-500/50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <>
          <LoadingSpinner className="w-4 h-4 sm:w-5 sm:h-5" />
          {loadingText || "Please wait..."}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
