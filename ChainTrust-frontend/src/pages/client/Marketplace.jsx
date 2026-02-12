import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "../../services/api";
import Loader from "../../components/Loader";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import FreelancerCard from "../../components/FreelancerCard";
import ProfileModal from "../../components/ProfileModal";
import { LuUsers, LuRefreshCw, LuSearch } from "react-icons/lu";

export default function ClientMarketplace() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await profileService.getFreelancerList();
      setFreelancers(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load freelancers");
      console.error("Freelancer fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (freelancer) => {
    setSelectedProfile(freelancer._id);
  };

  const handleInvite = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowInviteModal(true);
  };

  const handleInviteToContract = () => {
    // Store the freelancer info in sessionStorage for better UX
    sessionStorage.setItem(
      "invitingFreelancer",
      JSON.stringify({
        id: selectedFreelancer._id || selectedFreelancer.id,
        name: selectedFreelancer.username || selectedFreelancer.name,
      }),
    );
    navigate("/client/create", {
      state: { preselectedFreelancer: selectedFreelancer },
    });
  };

  // Filter freelancers
  const filteredFreelancers = freelancers.filter((freelancer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      freelancer.username?.toLowerCase().includes(searchLower) ||
      freelancer.email?.toLowerCase().includes(searchLower) ||
      freelancer.bio?.toLowerCase().includes(searchLower) ||
      freelancer.skills?.some((skill) =>
        skill.toLowerCase().includes(searchLower),
      )
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-800/40 rounded-xl animate-pulse"></div>
        <div className="h-32 bg-gray-800/40 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <LoadingSkeleton count={6} type="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <LuUsers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Find Freelancers
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Discover talented freelancers for your projects
            </p>
          </div>
        </div>
        <button
          onClick={fetchFreelancers}
          className="px-3 sm:px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 text-sm sm:text-base border border-cyan-500/30 flex items-center gap-2"
        >
          <LuRefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-800/40 rounded-xl p-3 sm:p-4 border border-gray-700/50">
        <div className="relative">
          <LuSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, skills, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 sm:p-4">
          <p className="text-red-400 text-sm sm:text-base">⚠️ {error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-lg p-2.5 sm:p-3 border border-cyan-500/30">
          <div className="text-lg sm:text-2xl font-bold text-cyan-400">
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
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-2.5 sm:p-3 border border-green-500/30">
          <div className="text-lg sm:text-2xl font-bold text-green-400">
            {filteredFreelancers.filter((f) => (f.reputation || 0) >= 4).length}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-400">
            Top Rated (4+)
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg p-2.5 sm:p-3 border border-yellow-500/30">
          <div className="text-lg sm:text-2xl font-bold text-yellow-400">
            {filteredFreelancers.reduce(
              (sum, f) => sum + (f.completedContracts || 0),
              0,
            )}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-400">
            Total Completed
          </div>
        </div>
      </div>

      {/* Freelancers Grid */}
      {filteredFreelancers.length === 0 ? (
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
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          userId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onInvite={handleInvite}
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
