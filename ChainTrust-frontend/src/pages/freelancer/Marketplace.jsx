import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { freelancerService, profileService } from "../../services/api";
import Loader from "../../components/Loader";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import FreelancerCard from "../../components/FreelancerCard";
import ProfileModal from "../../components/ProfileModal";

export default function Marketplace() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAmount, setFilterAmount] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const navigate = useNavigate();

  const isFreelancer = user?.role === "Freelancer";
  const isClient = user?.role === "Client";

  useEffect(() => {
    fetchMarketplaceData();
  }, [user?.role]);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isFreelancer) {
        // Freelancers see contract listings
        const { data } = await freelancerService.getMarketplace();
        setContracts(data);
      } else if (isClient) {
        // Clients see freelancer listings
        try {
          const { data } = await profileService.getFreelancerList();
          setFreelancers(data);
        } catch (err) {
          // If endpoint doesn't exist yet, show empty state
          console.warn("Freelancer list endpoint not available:", err);
          setFreelancers([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load marketplace");
      console.error("Marketplace fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (contractId) => {
    try {
      setApplying(contractId);
      await freelancerService.apply(contractId, {});

      setContracts((prev) =>
        prev.map((c) =>
          c._id === contractId
            ? {
                ...c,
                hasApplied: true,
                applicationsCount: (c.applicationsCount || 0) + 1,
              }
            : c,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply to contract");
      console.error("Apply error:", err);
    } finally {
      setApplying(null);
    }
  };

  const handleViewProfile = (userProfile) => {
    setSelectedProfile(userProfile._id);
  };

  const handleInvite = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowInviteModal(true);
  };

  const handleInviteToContract = () => {
    // Navigate to create contract with pre-filled freelancer
    navigate("/client/create", {
      state: { preselectedFreelancer: selectedFreelancer },
    });
  };

  // Filter contracts (for freelancers)
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAmount =
      filterAmount === "all" ||
      (filterAmount === "low" && contract.amount < 500) ||
      (filterAmount === "medium" &&
        contract.amount >= 500 &&
        contract.amount < 2000) ||
      (filterAmount === "high" && contract.amount >= 2000);

    return matchesSearch && matchesAmount;
  });

  // Separate applied and available contracts
  const appliedContracts = filteredContracts.filter((c) => c.hasApplied);
  const availableContracts = filteredContracts.filter((c) => !c.hasApplied);

  // Filter freelancers (for clients)
  const filteredFreelancers = freelancers.filter((freelancer) => {
    return (
      freelancer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-800/40 rounded-xl animate-pulse"></div>
        <div className="h-32 bg-gray-800/40 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LoadingSkeleton count={4} type="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            {isFreelancer ? "🛒 Marketplace" : "🎯 Find Freelancers"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {isFreelancer
              ? "Browse and apply to available contracts"
              : "Discover talented freelancers for your projects"}
          </p>
        </div>
        <button
          onClick={fetchMarketplaceData}
          className="px-3 sm:px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg transition-colors text-sm sm:text-base border border-cyan-500/30"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/40 rounded-xl p-3 sm:p-4 border border-gray-700/50">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={
                isFreelancer
                  ? "🔍 Search contracts..."
                  : "🔍 Search freelancers..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
            />
          </div>

          {/* Amount Filter (only for freelancers viewing contracts) */}
          {isFreelancer && (
            <select
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
              className="px-3 sm:px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
            >
              <option value="all">💰 All Budgets</option>
              <option value="low">💵 &lt; $500</option>
              <option value="medium">💸 $500 - $2000</option>
              <option value="high">💎 &gt; $2000</option>
            </select>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 sm:p-4">
          <p className="text-red-400 text-sm sm:text-base">⚠️ {error}</p>
        </div>
      )}

      {/* Stats */}
      {isFreelancer && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-lg p-2.5 sm:p-3 border border-cyan-500/30">
            <div className="text-lg sm:text-2xl font-bold text-cyan-400">
              {availableContracts.length}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">
              Available
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg p-2.5 sm:p-3 border border-yellow-500/30">
            <div className="text-lg sm:text-2xl font-bold text-yellow-400">
              {appliedContracts.length}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">Applied</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-2.5 sm:p-3 border border-green-500/30">
            <div className="text-lg sm:text-2xl font-bold text-green-400">
              $
              {filteredContracts
                .reduce((sum, c) => sum + (c.amount || 0), 0)
                .toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">
              Total Value
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-2.5 sm:p-3 border border-purple-500/30">
            <div className="text-lg sm:text-2xl font-bold text-purple-400">
              {
                filteredContracts.filter((c) => (c.applicationsCount || 0) > 0)
                  .length
              }
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">
              With Applications
            </div>
          </div>
        </div>
      )}

      {isClient && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-2.5 sm:p-3 border border-purple-500/30">
            <div className="text-lg sm:text-2xl font-bold text-purple-400">
              {filteredFreelancers.length}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">
              Freelancers
            </div>
          </div>
          <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-lg p-2.5 sm:p-3 border border-cyan-500/30">
            <div className="text-lg sm:text-2xl font-bold text-cyan-400">
              {filteredFreelancers.filter((f) => f.isWalletVerified).length}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">Verified</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-2.5 sm:p-3 border border-green-500/30 col-span-2 sm:col-span-1">
            <div className="text-lg sm:text-2xl font-bold text-green-400">
              {
                filteredFreelancers.filter((f) => (f.reputation || 0) >= 4)
                  .length
              }
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">
              Top Rated
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      {isFreelancer ? (
        <>
          {/* My Applications Section */}
          {appliedContracts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-yellow-400">
                  📋 My Applications
                </h2>
                <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                  {appliedContracts.length}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {appliedContracts.map((contract) => (
                  <ContractCard
                    key={contract._id}
                    contract={contract}
                    onApply={handleApply}
                    applying={applying === contract._id}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Available Contracts Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-cyan-400">
                🛒 Available Contracts
              </h2>
              <span className="px-2 py-0.5 bg-cyan-600/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                {availableContracts.length}
              </span>
            </div>
            {availableContracts.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No available contracts"
                description={
                  searchTerm || filterAmount !== "all"
                    ? "Try adjusting your filters"
                    : appliedContracts.length > 0
                      ? "You've applied to all matching contracts!"
                      : "Check back later for new opportunities"
                }
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {availableContracts.map((contract) => (
                  <ContractCard
                    key={contract._id}
                    contract={contract}
                    onApply={handleApply}
                    applying={applying === contract._id}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : isClient ? (
        // Client view: Freelancer cards
        filteredFreelancers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No freelancers found"
            description={
              searchTerm
                ? "Try a different search term"
                : "No freelancers available at the moment"
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredFreelancers.map((freelancer) => (
              <FreelancerCard
                key={freelancer._id}
                freelancer={freelancer}
                onViewProfile={handleViewProfile}
                onInvite={handleInvite}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon="⚠️"
          title="Access Restricted"
          description="You need to be logged in as a client or freelancer to view the marketplace."
        />
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          userId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onInvite={isClient ? handleInvite : null}
        />
      )}

      {/* Invite Confirmation Modal */}
      {showInviteModal && selectedFreelancer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Invite Freelancer
            </h3>
            <p className="text-gray-300 mb-6">
              Would you like to create a new contract and invite{" "}
              <span className="text-cyan-400 font-semibold">
                {selectedFreelancer.username}
              </span>{" "}
              to work on it?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteToContract}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all"
              >
                Create Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContractCard({ contract, onApply, applying, onViewProfile }) {
  const [expanded, setExpanded] = useState(false);

  const daysUntilDeadline = Math.ceil(
    (new Date(contract.deadline) - new Date()) / (1000 * 60 * 60 * 24),
  );

  const getUrgencyColor = (days) => {
    if (days <= 3) return "text-red-400";
    if (days <= 7) return "text-yellow-400";
    return "text-green-400";
  };

  // State-based button rendering for freelancers
  const renderStateBasedButton = (contract, onApply, applying) => {
    const status = contract.status;
    const hasApplied = contract.hasApplied;

    switch (status) {
      case "Created":
        // Freelancers can apply if they haven't already
        if (hasApplied) {
          return (
            <button
              disabled
              className="w-full px-3 sm:px-4 py-2 bg-green-600/20 text-green-400 rounded-lg border border-green-500/30 text-sm sm:text-base cursor-not-allowed"
            >
              ✅ Applied - Awaiting client response
            </button>
          );
        }
        return (
          <button
            onClick={() => onApply(contract._id)}
            disabled={applying}
            className="w-full px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg hover:shadow-cyan-500/50"
          >
            {applying ? "Applying..." : "🚀 Apply Now"}
          </button>
        );

      case "Applied":
        return (
          <button
            disabled
            className="w-full px-3 sm:px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg border border-yellow-500/30 text-sm sm:text-base cursor-not-allowed"
          >
            ⏳ Applications under review
          </button>
        );

      case "Assigned":
        return (
          <button
            disabled
            className="w-full px-3 sm:px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30 text-sm sm:text-base cursor-not-allowed"
          >
            👤 Freelancer assigned - Awaiting funding
          </button>
        );

      case "Funded":
        return (
          <button
            disabled
            className="w-full px-3 sm:px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 text-sm sm:text-base cursor-not-allowed"
          >
            💰 Work in progress
          </button>
        );

      case "Submitted":
        return (
          <button
            disabled
            className="w-full px-3 sm:px-4 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg border border-cyan-500/30 text-sm sm:text-base cursor-not-allowed"
          >
            📋 Work submitted - Awaiting approval
          </button>
        );

      case "Approved":
      case "Paid":
        return (
          <button
            disabled
            className="w-full px-3 sm:px-4 py-2 bg-green-600/20 text-green-400 rounded-lg border border-green-500/30 text-sm sm:text-base cursor-not-allowed"
          >
            ✅ Contract completed
          </button>
        );

      case "Disputed":
        return (
          <button
            disabled
            className="w-full px-3 sm:px-4 py-2 bg-red-600/20 text-red-400 rounded-lg border border-red-500/30 text-sm sm:text-base cursor-not-allowed"
          >
            ⚠️ Under dispute resolution
          </button>
        );

      case "Resolved":
        return (
          <button
            disabled
            className="w-full px-3 sm:px-4 py-2 bg-gray-600/20 text-gray-400 rounded-lg border border-gray-500/30 text-sm sm:text-base cursor-not-allowed"
          >
            🔒 Dispute resolved
          </button>
        );

      default:
        return (
          <button
            disabled
            className="w-full px-3 sm:px-4 py-2 bg-gray-600/20 text-gray-400 rounded-lg border border-gray-500/30 text-sm sm:text-base cursor-not-allowed"
          >
            Status: {status}
          </button>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 hover:border-cyan-500/40 transition-all duration-300 overflow-hidden">
      {/* Card Header */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Title and Amount */}
        <div className="flex flex-col min-[500px]:flex-row min-[500px]:items-start min-[500px]:justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-white flex-1 line-clamp-2">
            {contract.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-2 sm:px-3 py-1 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
              <span className="text-sm sm:text-lg font-bold text-cyan-400">
                ${contract.amount?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
          <span>👤</span>
          <button
            onClick={() =>
              contract.client &&
              onViewProfile({ _id: contract.client._id || contract.client })
            }
            className="text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
          >
            {contract.client?.username || contract.client?.name || "Anonymous"}
          </button>
        </div>

        {/* Description */}
        <p
          className={`text-xs sm:text-sm text-gray-300 ${expanded ? "" : "line-clamp-2"}`}
        >
          {contract.description}
        </p>

        {contract.description?.length > 100 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300"
          >
            {expanded ? "Show less ▲" : "Show more ▼"}
          </button>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs">
            <span>📅</span>
            <span className={getUrgencyColor(daysUntilDeadline)}>
              {daysUntilDeadline > 0
                ? `${daysUntilDeadline} days left`
                : "Expired"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
            <span>👥</span>
            <span>{contract.applicationsCount || 0} applicants</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
            <span>⏰</span>
            <span>
              Posted {new Date(contract.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer - State-Based Actions */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        {renderStateBasedButton(contract, onApply, applying)}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="bg-gray-800/40 rounded-xl p-6 sm:p-12 text-center border border-gray-700/50">
      <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{icon}</div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-500">{description}</p>
    </div>
  );
}
