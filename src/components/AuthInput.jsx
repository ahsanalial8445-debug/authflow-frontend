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
  showPassword: controlledShowPassword,
  onTogglePassword,
}) => {
  const [focused, setFocused] = useState(false);
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  const isPassword = type === "password";
  const showPassword = controlledShowPassword ?? internalShowPassword;
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {label && (
          <label
            htmlFor={name}
            className={`block text-sm font-medium ml-1 transition-colors ${
              focused ? "text-brand-700" : "text-slate-700"
            }`}
          >
            {label}
            {required && <span className="text-brand-600 ml-0.5">*</span>}
          </label>
        )}
      </div>

      <div className="relative">
        {icon && (
          <div
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              error ? "text-red-600" : focused ? "text-brand-600" : "text-slate-400"
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
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`auth-field w-full min-h-12 py-3 ${icon ? "pl-12" : "pl-4"} ${
            isPassword ? "pr-12" : "pr-4"
          } rounded-xl bg-white text-sm text-slate-900 placeholder-slate-400 border border-slate-200
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-red-400 bg-red-50/70"
                : focused
                  ? "border-brand-500 bg-white ring-4 ring-brand-100/80"
                  : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"
            }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() =>
              onTogglePassword
                ? onTogglePassword()
                : setInternalShowPassword((visible) => !visible)
            }
            disabled={disabled}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            <span key={showPassword ? "visible" : "hidden"} className="password-icon">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </span>
          </button>
        )}
      </div>

      {error && (
        <p id={`${name}-error`} className="mt-1.5 ml-1 text-xs text-red-600 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
