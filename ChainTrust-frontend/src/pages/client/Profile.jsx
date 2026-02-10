import { useEffect, useMemo, useState } from "react";
// Layout is provided by routes; do not wrap here
import Loader from "../../components/Loader.jsx";
import {
  authService,
  updateProfile,
  clientContractService,
} from "../../services/api.js";
import {
  connectWallet,
  shortenAddress,
  getNetworkName,
  getBalance,
} from "../../services/web3";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user: authUser, logout } = useAuth();
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
  const [stats, setStats] = useState(null);
  const [walletInfo, setWalletInfo] = useState({
    address: null,
    network: "Unknown",
    balance: null,
  });
  const [skills, setSkills] = useState("");
  const [skillsMessage, setSkillsMessage] = useState(null);
  const isFreelancer = authUser?.role === "Freelancer";

  useEffect(() => {
    (async () => {
      try {
        const { data } = await authService.me();
        const u = data?.user || data;
        setUser(u);
        setForm({
          username: u.username || "",
          email: u.email || "",
          walletAddress: u.walletAddress || "",
        });

        // UI-only skills stored in localStorage for freelancers
        try {
          const storedSkills = localStorage.getItem(`skills_${u._id}`);
          if (storedSkills) {
            setSkills(storedSkills);
          } else if (u.role === "Freelancer") {
            setSkills("React, Node.js, MongoDB, Web3");
          }
        } catch {}

        // Load activity stats based on role
        if (u.role === "Client") {
          const { data: contractsData } =
            await clientContractService.getContracts();
          const list = Array.isArray(contractsData)
            ? contractsData
            : contractsData?.contracts || [];
          const total = list.length;
          const active = list.filter((c) =>
            [
              "Assigned",
              "Funded",
              "Submitted",
              "Approved",
              "Disputed",
            ].includes(c.status),
          ).length;
          const completed = list.filter((c) => c.status === "Paid").length;
          const totalSpent = list
            .filter((c) => c.status === "Paid")
            .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
          setStats({ total, active, completed, totalSpent });
        } else if (u.role === "Freelancer") {
          const { data } = await freelancerService.myContracts();
          const list = Array.isArray(data) ? data : data?.contracts || [];
          const total = list.length;
          const active = list.filter((c) =>
            [
              "Assigned",
              "Funded",
              "Submitted",
              "Approved",
              "Disputed",
            ].includes(c.status),
          ).length;
          const completed = list.filter((c) => c.status === "Paid").length;
          const totalEarned = list
            .filter((c) => c.status === "Paid")
            .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
          const disputes = list.filter((c) => c.status === "Disputed").length;
          setStats({ total, active, completed, totalEarned, disputes });
        }

        // Wallet info (silent)
        const info = await connectWallet({ silent: true });
        if (info?.address) {
          const bal = await getBalance(info.address);
          setWalletInfo({
            address: info.address,
            network: getNetworkName(info.network),
            balance: bal,
          });
        }
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
      const payload = {
        username: form.username,
        email: form.email,
        walletAddress: form.walletAddress,
      };
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

  const connectOrChangeWallet = async () => {
    const info = await connectWallet();
    if (info?.address) {
      const bal = await getBalance(info.address);
      setWalletInfo({
        address: info.address,
        network: getNetworkName(info.network),
        balance: bal,
      });
    }
  };

  const saveSkills = () => {
    try {
      if (!user?._id) return;
      localStorage.setItem(`skills_${user._id}`, skills);
      setSkillsMessage("✅ Skills saved (local only)");
      setTimeout(() => setSkillsMessage(null), 2000);
    } catch {
      setSkillsMessage("Failed to save skills locally");
    }
  };

  const skillTags = useMemo(() => {
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [skills]);

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Profile</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
          {/* Overview */}
          <section className="p-3 md:p-4 bg-gray-900/70 border border-gray-800/60 rounded-xl lg:col-span-2">
            <h2 className="text-base md:text-lg font-semibold mb-3">
              Profile Overview
            </h2>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-800 border border-gray-700/60 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                {(user.username || user.email || "U").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm md:text-base text-white font-semibold truncate">
                    {user.username || "—"}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                    {user.role === "Freelancer" ? "Freelancer" : user.role}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full border whitespace-nowrap ${user.isActive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}
                  >
                    {user.isActive ? "Active" : "Suspended"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Joined:{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  Email:{" "}
                  <span className="text-gray-300">{user.email || "—"}</span>
                </p>
                <p className="text-xs text-gray-400 truncate">
                  Wallet:{" "}
                  <span className="text-gray-300">
                    {user.walletAddress
                      ? shortenAddress(user.walletAddress)
                      : "Not connected"}
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Wallet & Blockchain */}
          <section className="p-3 md:p-4 bg-gray-900/70 border border-gray-800/60 rounded-xl">
            <h2 className="text-base md:text-lg font-semibold mb-3">
              Wallet & Blockchain
            </h2>
            <div className="space-y-2 text-xs md:text-sm">
              <p className="flex items-center gap-2">
                <span className="text-gray-400">Status:</span>
                {walletInfo.address ? (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700/60 text-gray-300 border border-gray-600/60 whitespace-nowrap">
                    Not Connected
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400 truncate">
                Address:{" "}
                <span className="text-gray-300">
                  {walletInfo.address
                    ? shortenAddress(walletInfo.address)
                    : "—"}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Network:{" "}
                <span className="text-gray-300">{walletInfo.network}</span>
              </p>
              {walletInfo.balance && (
                <p className="text-xs text-gray-400">
                  Balance: {walletInfo.balance} ETH
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={connectOrChangeWallet}
                  className="px-3 py-1.5 text-xs rounded-lg bg-cyan-600/80 hover:bg-cyan-500 whitespace-nowrap"
                >
                  Connect Wallet
                </button>
                <span className="text-[11px] text-gray-400">
                  Blockchain actions coming soon
                </span>
              </div>
            </div>
          </section>

          {/* Reputation & Trust Metrics */}
          <section className="p-4 bg-gray-900/70 border border-gray-800/60 rounded-xl lg:col-span-3">
            <h2 className="text-lg font-semibold mb-3">
              {isFreelancer ? "Reputation & Trust" : "Activity Stats"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <StatCard
                title={
                  isFreelancer
                    ? "Completed Contracts"
                    : "Total Contracts Created"
                }
                value={stats?.completed ?? stats?.total ?? 0}
                icon={isFreelancer ? "✅" : "📦"}
              />
              <StatCard
                title="Active Contracts"
                value={stats?.active ?? 0}
                icon="⚡"
              />
              {isFreelancer ? (
                <StatCard
                  title="Total Earnings"
                  value={formatINR(stats?.totalEarned ?? 0)}
                  icon="💸"
                />
              ) : (
                <StatCard
                  title="Total Amount Spent"
                  value={formatINR(stats?.totalSpent ?? 0)}
                  icon="💸"
                />
              )}
              {isFreelancer && (
                <StatCard
                  title="Disputes Raised"
                  value={stats?.disputes ?? 0}
                  icon="⚠️"
                />
              )}
              {isFreelancer && (
                <StatCard
                  title="Success Rate"
                  value={`${Math.round(((stats?.completed ?? 0) / Math.max(1, stats?.total ?? 1)) * 100)}%`}
                  icon="🎯"
                />
              )}
            </div>
          </section>

          {/* Account & Security */}
          <section className="p-4 bg-gray-900/70 border border-gray-800/60 rounded-xl lg:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Account & Security</h2>
            <form onSubmit={submit} className="space-y-3">
              <Field
                label="Name"
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
              <p className="text-xs text-gray-400">
                Account created:{" "}
                <span className="text-gray-300">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </p>
              <div className="pt-2 border-t border-gray-800/60" />
              <h3 className="text-sm font-semibold text-gray-300">
                Change Password
              </h3>
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
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500"
                >
                  Logout
                </button>
              </div>
              {message && (
                <p className="mt-2 text-sm text-gray-200">{message}</p>
              )}
            </form>
          </section>

          {user.role === "Freelancer" && (
            <section className="p-4 bg-gray-900/70 border border-gray-800/60 rounded-xl lg:col-span-1">
              <h2 className="text-lg font-semibold mb-3">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {skillTags.length === 0 && (
                  <span className="text-xs text-gray-400">No skills added</span>
                )}
                {skillTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs rounded-full bg-gray-800/60 border border-gray-700/50 text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mb-2">
                Edit skills below (frontend only)
              </p>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm focus:border-cyan-400 outline-none"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={saveSkills}
                  className="px-3 py-1.5 text-xs rounded-lg bg-gray-700/80 hover:bg-gray-600"
                >
                  Save Skills
                </button>
              </div>
              {skillsMessage && (
                <p className="mt-2 text-xs text-gray-300">{skillsMessage}</p>
              )}
            </section>
          )}
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

function Item({ label, value, muted = false }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={muted ? "text-sm text-gray-300" : "text-sm text-gray-200"}>
        {value}
      </p>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/60">
      <div className="w-full h-1 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 mb-3 opacity-70" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function formatINR(amount) {
  const n = Number(amount) || 0;
  try {
    const formatted = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(n);
    return `${formatted} INR`;
  } catch {
    return `${n} INR`;
  }
}
