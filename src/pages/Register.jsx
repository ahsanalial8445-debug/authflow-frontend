import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import Button from "../components/Button";
import Alert from "../components/Alert";

// UI only: password strength nikalne ke liye (logic par koi asar nahi)
const getStrength = (pwd) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_BARS = [
  "",
  "bg-red-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-emerald-500",
];
const STRENGTH_TEXT = [
  "",
  "text-red-600",
  "text-amber-600",
  "text-lime-600",
  "text-emerald-600",
];

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // UI only
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = getStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us and get started in seconds"
    >
      {error && (
        <div className="mb-6 rounded-2xl shadow-[0_8px_24px_-12px_rgba(220,38,38,0.35)]">
          <Alert type="error" message={error} onClose={() => setError("")} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <AuthInput
            label="Full name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            autoComplete="name"
            disabled={loading}
            icon={<User className="w-5 h-5" />}
          />

          <AuthInput
            label="Email address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
            icon={<Mail className="w-5 h-5" />}
          />

          <div>
            <AuthInput
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              autoComplete="new-password"
              disabled={loading}
              icon={<Lock className="w-5 h-5" />}
            />

            {/* Strength meter */}
            <div className="mt-3" aria-live="polite">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength ? STRENGTH_BARS[strength] : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck
                    className={`h-3.5 w-3.5 ${
                      form.password.length >= 6
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  />
                  {form.password
                    ? (
                      <>
                        Strength:{" "}
                        <span className={`font-semibold ${STRENGTH_TEXT[strength]}`}>
                          {STRENGTH_LABELS[strength]}
                        </span>
                      </>
                    )
                    : "Use at least 6 characters"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  aria-pressed={showPassword}
                  className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {showPassword ? "Hide password" : "Show password"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button type="submit" loading={loading} loadingText="Creating account...">
            Create account
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3 w-3" />
            Your data is encrypted and never shared
          </p>
        </div>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
        <span className="text-xs font-medium text-slate-400">Already a member?</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-slate-50/80 px-5 py-4 ring-1 ring-inset ring-slate-200/80 transition-colors hover:bg-slate-50">
        <p className="text-sm text-slate-600">Already have an account?</p>
        <Link
          to="/login"
          className="auth-link rounded-lg text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;