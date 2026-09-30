import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import Button from "../components/Button";
import Alert from "../components/Alert";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError("")} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
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
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={loading}
            icon={<Lock className="w-5 h-5" />}
          />
          <div className="flex justify-end mt-2">
            <span className="text-xs text-slate-500">
              Minimum 6 characters
            </span>
          </div>
        </div>

        <Button type="submit" loading={loading} loadingText="Signing in...">
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-brand-400 hover:text-brand-300 transition-colors hover:underline underline-offset-4"
        >
          Create one free
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
