import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import Button from "../components/Button";
import Alert from "../components/Alert";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // UI only
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your account"
    >
      {error && (
        <div className="mb-6 rounded-2xl shadow-[0_8px_24px_-12px_rgba(220,38,38,0.35)]">
          <Alert type="error" message={error} onClose={() => setError("")} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate={false}>
        <div className="space-y-5">
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
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              icon={<Lock className="w-5 h-5" />}
            />
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Minimum 6 characters
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

        <div className="space-y-3">
          <Button type="submit" loading={loading} loadingText="Signing in...">
            Sign in
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3 w-3" />
            Your connection is encrypted and secure
          </p>
        </div>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
        <span className="text-xs font-medium text-slate-400">New here?</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-slate-50/80 px-5 py-4 ring-1 ring-inset ring-slate-200/80 transition-colors hover:bg-slate-50">
        <p className="text-sm text-slate-600">Don't have an account?</p>
        <Link
          to="/register"
          className="auth-link rounded-lg text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          Create one free
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;