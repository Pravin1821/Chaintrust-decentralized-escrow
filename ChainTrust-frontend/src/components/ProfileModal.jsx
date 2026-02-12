import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "./Loader";
import StatusBadge from "./StatusBadge";
import LoadingSkeleton from "./LoadingSkeleton";

export default function ProfileModal({ userId, onClose, onInvite }) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFreelancer = profile?.role?.toLowerCase() === "freelancer";
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const reputationScore =
    profile?.reputation?.score ?? profile?.reputationScore ?? 0;
  const reputationLevel =
    profile?.reputation?.level ?? profile?.reputationLevel ?? "New";

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      const { data: userData } = await api.get(`/auth/user/${userId}`);
      setProfile(userData);

      // Fetch user's contract stats (only for freelancers)
      if (userData.role?.toLowerCase() === "freelancer") {
        try {
          const { data: contractData } = await api.get(
            `/contracts/user/${userId}/stats`,
          );
          setContracts(contractData.recentContracts || []);
        } catch (err) {
          // Stats endpoint might not exist, continue without it
          console.warn("Could not fetch contract stats:", err);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = profile
    ? {
        completed:
          contracts.filter((c) => c.status === "Paid").length ||
          profile.completedContracts ||
          0,
        totalEarnings:
          contracts
            .filter((c) => c.status === "Paid")
            .reduce((sum, c) => sum + (Number(c.amount) || 0), 0) ||
          profile.totalEarnings ||
          0,
        disputes:
          contracts.filter((c) => c.status === "Disputed").length ||
          profile.disputes ||
          0,
      }
    : { completed: 0, totalEarnings: 0, disputes: 0 };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {loading ? (
            <LoadingSkeleton type="profile" />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchProfile}
                className="mt-4 px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                  {profile.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">
                    {profile.username}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        isFreelancer
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {isFreelancer ? "🎯" : "👤"} {profile.role?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-400">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-200 border border-amber-400/30">
                      ⭐ <span className="font-semibold text-white">{reputationScore}</span>
                    </span>
                    <span className="px-2 py-1 bg-gray-800/60 border border-gray-700/50 rounded-full text-xs text-cyan-200">
                      {reputationLevel}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="truncate font-medium text-white">{profile.email || "—"}</p>
                    </div>
                    {profile.phoneNumber && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="truncate font-medium text-white">{profile.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reputation Summary */}
              {isFreelancer && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400">
                      {stats.completed}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ✅ Completed
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl p-4 border border-cyan-500/30">
                    <div className="text-2xl font-bold text-cyan-400">
                      ${stats.totalEarnings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      💰 Earnings
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-xl p-4 border border-red-500/30">
                    <div className="text-2xl font-bold text-red-400">
                      {stats.disputes}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ⚠️ Disputes
                    </div>
                  </div>
                </div>
              )}

              {/* Contract History */}
              {isFreelancer && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    📜 Recent Contracts
                  </h4>
                  {contracts.length > 0 ? (
                    <div className="space-y-3">
                      {contracts.slice(0, 5).map((contract) => (
                        <div
                          key={contract._id}
                          className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h5 className="font-semibold text-white">
                                {contract.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                                <span>
                                  💰 ${contract.amount.toLocaleString()}
                                </span>
                                <span>•</span>
                                <span>
                                  📅{" "}
                                  {new Date(
                                    contract.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <StatusBadge status={contract.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 text-sm text-gray-400">
                      No contracts yet. Invite this freelancer to kick off their
                      first project.
                    </div>
                  )}
                </div>
              )}

              {/* Skills */}
              {isFreelancer && (
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🧠</span>
                    <h4 className="text-lg font-semibold text-white">Skills</h4>
                  </div>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-cyan-600/20 text-cyan-200 rounded-full border border-cyan-500/30 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No skills added yet.
                    </p>
                  )}
                </div>
              )}

              {/* Account Details */}
              <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700/50">
                  <p className="text-xs text-gray-500">Member since</p>
                  <p className="text-white font-medium">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {profile.walletAddress && (
                  <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700/50">
                    <p className="text-xs text-gray-500">Wallet</p>
                    <p className="text-white font-mono text-xs truncate">
                      {profile.walletAddress}
                    </p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700/50">
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-white font-medium">{profile.role}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer with CTA */}
        {!loading && !error && profile && (
          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 px-6 py-4">
            {currentUser?.role === "Client" &&
            profile.role === "Freelancer" &&
            onInvite ? (
              <button
                onClick={() => onInvite(profile)}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
              >
                📧 Invite to Contract
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
