import { useState } from "react";
import { CalendarDays, Mail, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not available";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFeedback("");
    setSaving(true);
    try {
      await updateProfile({ name });
      setFeedback("Profile updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="app-page min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8">
          <p className="text-sm font-semibold text-brand-700">Account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Profile</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your personal information.</p>
        </header>

        <section className="glass rounded-2xl p-5 shadow-sm sm:p-7">
          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || <UserRound className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-950">{user?.name}</h2>
              <p className="truncate text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          {feedback && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={50}
                required
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-slate-500"><Mail className="h-4 w-4" /> Email</p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-800">{user?.email}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-slate-500"><CalendarDays className="h-4 w-4" /> Member since</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{formatDate(user?.createdAt)}</p>
              </div>
            </div>
            <Button type="submit" loading={saving} loadingText="Saving changes..." className="sm:w-auto sm:px-6">Save changes</Button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Profile;
