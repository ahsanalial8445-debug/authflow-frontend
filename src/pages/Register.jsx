import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import Button from "../components/Button";
import Alert from "../components/Alert";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError("")} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <AuthInput
            label="Full name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Alex Morgan"
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
            placeholder="name@company.com"
            autoComplete="email"
            disabled={loading}
            icon={<Mail className="w-5 h-5" />}
          />

          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a secure password"
            autoComplete="new-password"
            disabled={loading}
            icon={<Lock className="w-5 h-5" />}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((visible) => !visible)}
          />
        </div>

        <Button type="submit" loading={loading} loadingText="Creating account...">
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;