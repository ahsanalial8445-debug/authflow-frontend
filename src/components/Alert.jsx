import { AlertCircle, CheckCircle2, X } from "lucide-react";

const Alert = ({ type = "error", message, onClose }) => {
  if (!message) return null;

  const styles = {
    error: {
      container:
        "bg-red-50 border-red-200 text-red-800",
      icon: <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />,
    },
    success: {
      container:
        "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />,
    },
  };

  const style = styles[type] || styles.error;

  return (
    <div
      role="alert"
      className={`animate-fadeIn flex items-start gap-3 p-3.5 rounded-xl border text-sm ${style.container}`}
    >
      {style.icon}
      <p className="flex-1 leading-relaxed">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
