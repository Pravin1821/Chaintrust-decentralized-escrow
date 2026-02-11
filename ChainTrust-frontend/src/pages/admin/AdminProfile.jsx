import { useEffect, useState } from "react";
import { authService, updateProfile } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";

export default function AdminProfile() {
  const { user: authUser, setUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    walletAddress: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const normalizeRole = (role) => {
    const r = String(role || "").toLowerCase();
    if (r === "admin") return "Admin";
    if (r === "freelancer") return "Freelancer";
    return "Client";
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await authService.me();
        const u = data?.user || data;
        setProfile(u);
        setForm({
          username: u?.username || "",
          email: u?.email || "",
          walletAddress: u?.walletAddress || "",
        });
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          setMessage("❌ Passwords do not match");
          setSaving(false);
          return;
        }
        if (password.length < 6) {
          setMessage("❌ Password must be at least 6 characters");
          setSaving(false);
          return;
        }
      }
      const payload = { ...form };
      if (password) payload.password = password;
      const updated = await updateProfile(payload);
      setProfile(updated);
      setMessage("✅ Profile updated");
      const normalized = {
        _id: updated._id,
        username: updated.username,
        email: updated.email,
        role: normalizeRole(updated.role),
        walletAddress: updated.walletAddress,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
      };
      if (setUser) {
        setUser(normalized);
        localStorage.setItem("user", JSON.stringify(normalized));
      }
      if (password) {
        setPassword("");
        setConfirmPassword("");
      }
    } catch (e) {
      setMessage(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Admin Profile
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Manage your account details and security.
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm rounded-lg bg-red-600/80 hover:bg-red-500 text-white"
        >
          Logout
        </button>
      </div>

      {loading && <Loader />}
      {error && (
        <div className="bg-red-900/30 border border-red-500/40 text-red-100 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {profile && (
        <div className="space-y-4">
          <section className="p-4 bg-gray-900/70 border border-gray-800/60 rounded-xl flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-600 border border-red-400/40 flex items-center justify-center text-lg font-bold text-white">
              {(profile.username || profile.email || "A")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-white font-semibold truncate">
                <span className="truncate">{profile.username || "—"}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 whitespace-nowrap">
                  {normalizeRole(profile.role)}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full border whitespace-nowrap ${profile.isActive === false ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}
                >
                  {profile.isActive === false ? "Suspended" : "Active"}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate">
                Email:{" "}
                <span className="text-gray-200">{profile.email || "—"}</span>
              </p>
              <p className="text-xs text-gray-400 truncate">
                Wallet:{" "}
                <span className="text-gray-200">
                  {profile.walletAddress || "Not set"}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Joined:{" "}
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </section>

          <section className="p-4 bg-gray-900/70 border border-gray-800/60 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-3">
              Update Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field
                label="Name"
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
                placeholder="Admin name"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="admin@example.com"
              />
              <Field
                label="Wallet Address"
                value={form.walletAddress}
                onChange={(v) => setForm({ ...form, walletAddress: v })}
                placeholder="0x..."
              />

              <div className="pt-2 border-t border-gray-800/60" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  placeholder="Optional"
                />
                <Field
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  placeholder="Optional"
                />
              </div>

              {message && (
                <div className="text-sm text-gray-200 bg-gray-800/80 border border-gray-700/60 px-3 py-2 rounded-lg">
                  {message}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <span className="text-xs text-gray-500">
                  Password change is optional.
                </span>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  autoComplete,
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-gray-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-3 py-2 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
      />
    </label>
  );
}
