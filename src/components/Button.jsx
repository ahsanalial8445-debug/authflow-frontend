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
    "relative w-full min-h-11 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  const variants = {
    primary:
      "auth-submit bg-brand-600 text-white shadow-lg hover:bg-brand-700 hover:shadow-xl btn-shine",
    ghost:
      "bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300",
    danger:
      "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300",
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
