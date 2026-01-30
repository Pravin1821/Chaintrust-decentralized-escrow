import { useEffect, useState } from "react";
// Layout is provided by routes; do not wrap here
import Loader from "../../components/Loader.jsx";
import { authService, updateProfile } from "../../services/api.js";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    walletAddress: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await authService.me();
        // data may be user directly or wrapped in { user }
        const u = data?.user || data;
        setUser(u);
        setForm({
          username: u.username || "",
          email: u.email || "",
          walletAddress: u.walletAddress || "",
        });
      } catch (e) {
        const status = e?.response?.status;
        const msg =
          e?.response?.data?.message || e?.message || "Failed to load profile";
        setErrorStatus(status || null);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // Construct payload with updated profile fields
      const payload = { ...form };
      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          setMessage("❌ Passwords do not match");
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          setMessage("❌ Password must be at least 6 characters");
          setSaving(false);
          return;
        }
        payload.password = newPassword;
      }
      const updated = await updateProfile(payload);
      setUser(updated);
      setMessage("✅ Profile updated");
      if (payload.password) {
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (e) {
      setMessage(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {loading && <Loader label="Loading profile..." />}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-3 rounded-lg">
          <div className="font-semibold">{error}</div>
          {errorStatus === 401 && (
            <p className="mt-1 text-sm text-red-200/90">
              You are not logged in. Please sign in to view your profile.
            </p>
          )}
        </div>
      )}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900/70 border border-cyan-400/10 rounded-xl">
            <h2 className="text-lg font-semibold mb-3">Info</h2>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-gray-400">Role:</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {user.role}
                </span>
              </p>
              <p>
                <span className="text-gray-400">Created:</span>{" "}
                <span className="text-gray-200">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "—"}
                </span>
              </p>
              <p>
                <span className="text-gray-400">Wallet:</span>{" "}
                <span className="text-cyan-300">
                  {user.walletAddress || "—"}
                </span>
              </p>
              {typeof user.reputation !== "undefined" && (
                <p>
                  <span className="text-gray-400">Reputation:</span>{" "}
                  <span className="text-gray-200">{user.reputation}</span>
                </p>
              )}
              {typeof user.isActive !== "undefined" && (
                <p>
                  <span className="text-gray-400">Status:</span>{" "}
                  <span
                    className={
                      user.isActive ? "text-emerald-300" : "text-red-300"
                    }
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
              )}
            </div>
          </div>

          <form
            onSubmit={submit}
            className="p-4 bg-gray-900/70 border border-cyan-400/10 rounded-xl"
          >
            <h2 className="text-lg font-semibold mb-3">Edit</h2>
            <div className="space-y-3">
              <Field
                label="Username"
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
              />
              <Field
                label="Email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <Field
                label="Wallet Address"
                value={form.walletAddress}
                onChange={(v) => setForm({ ...form, walletAddress: v })}
              />
              <div className="pt-2 border-t border-gray-800/60" />
              <h3 className="text-sm font-semibold text-gray-300">Change Password</h3>
              <Field
                label="New Password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
              <Field
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
            {message && <p className="mt-3 text-sm text-gray-200">{message}</p>}
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        value={value}
        type={type}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm focus:border-cyan-400 outline-none"
      />
    </div>
  );
}
