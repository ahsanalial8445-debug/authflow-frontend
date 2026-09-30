import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const AuthInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  icon,
  error,
  disabled,
  autoComplete,
  required = true,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {label && (
          <label
            htmlFor={name}
            className={`block text-sm font-medium ml-1 transition-colors ${
              focused ? "text-brand-300" : "text-slate-300"
            }`}
          >
            {label}
            {required && <span className="text-brand-400 ml-0.5">*</span>}
          </label>
        )}
      </div>

      <div className="relative">
        {icon && (
          <div
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              error ? "text-red-400" : focused ? "text-brand-400" : "text-slate-500"
            }`}
          >
            {icon}
          </div>
        )}

        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`w-full py-3 ${icon ? "pl-12" : "pl-4"} ${
            isPassword ? "pr-12" : "pr-4"
          } rounded-xl bg-white/[0.04] text-white placeholder-slate-500 border
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-red-500/60 bg-red-500/[0.04]"
                : focused
                  ? "border-brand-500 bg-white/[0.07] shadow-[0_0_0_4px_rgba(99,102,241,0.15)]"
                  : "border-white/10 hover:border-white/20"
            }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${name}-error`} className="mt-1.5 ml-1 text-xs text-red-400 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
