import { useEffect, useState } from "react";
import axios from "../../api/axios";
import {
  LuShoppingCart,
  LuSearch,
  LuEye,
  LuEyeOff,
  LuFlag,
  LuCircleCheck,
  LuTriangleAlert,
  LuDollarSign,
  LuUser,
} from "react-icons/lu";
import Loader from "../../components/Loader";
import StatusBadge from "../../components/StatusBadge";

export default function AdminMarketplace() {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [moderationFilter, setModerationFilter] = useState("All");
  const [selectedContract, setSelectedContract] = useState(null);
  const [moderating, setModerating] = useState(false);

  useEffect(() => {
    fetchMarketplaceContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [contracts, searchTerm, moderationFilter]);

  const fetchMarketplaceContracts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/contracts?status=Created");
      setContracts(response.data);
    } catch (error) {
      console.error("Failed to fetch marketplace contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterContracts = () => {
    let filtered = contracts;

    // Moderation filter
    if (moderationFilter === "Flagged") {
      filtered = filtered.filter((c) => c.isFlagged);
    } else if (moderationFilter === "Hidden") {
      filtered = filtered.filter((c) => c.isHidden);
    } else if (moderationFilter === "Active") {
      filtered = filtered.filter((c) => !c.isFlagged && !c.isHidden);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.clientId?.username
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredContracts(filtered);
  };

  const handleModerateContract = async (contractId, action) => {
    try {
      setModerating(true);
      await axios.patch(`/contracts/${contractId}/moderate`, {
        action,
      });

      // Update local state
      setContracts((prev) =>
        prev.map((c) => {
          if (c._id === contractId) {
            if (action === "flag") {
              return { ...c, isFlagged: true };
            } else if (action === "hide") {
              return { ...c, isHidden: true };
            } else if (action === "restore") {
              return { ...c, isFlagged: false, isHidden: false };
            }
          }
          return c;
        }),
      );

      setSelectedContract(null);
    } catch (error) {
      console.error("Failed to moderate contract:", error);
      alert("Failed to moderate contract. Please try again.");
    } finally {
      setModerating(false);
    }
  };

  const flaggedContracts = contracts.filter((c) => c.isFlagged);
  const hiddenContracts = contracts.filter((c) => c.isHidden);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <LuShoppingCart size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Marketplace Moderation
            </h1>
            <p className="text-gray-400">
              {contracts.length} marketplace listings, {flaggedContracts.length}{" "}
              flagged, {hiddenContracts.length} hidden
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <LuCircleCheck size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Listings</p>
              <p className="text-2xl font-bold text-white">
                {contracts.filter((c) => !c.isFlagged && !c.isHidden).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <LuFlag size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Flagged</p>
              <p className="text-2xl font-bold text-orange-400">
                {flaggedContracts.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <LuEyeOff size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Hidden</p>
              <p className="text-2xl font-bold text-red-400">
                {hiddenContracts.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <LuSearch
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search marketplace listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Moderation Filter */}
        <div className="relative">
          <LuFlag
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <select
            value={moderationFilter}
            onChange={(e) => setModerationFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
          >
            <option value="All">All Listings</option>
            <option value="Active">Active Only</option>
            <option value="Flagged">Flagged Only</option>
            <option value="Hidden">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-12 text-center">
            <LuShoppingCart size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No marketplace listings found
            </p>
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <div
              key={contract._id}
              className={`bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border ${
                contract.isHidden
                  ? "border-red-500/50"
                  : contract.isFlagged
                    ? "border-orange-500/50"
                    : "border-gray-700/50"
              } p-4 space-y-3 hover:border-purple-500/40 transition-all`}
            >
              {/* Contract Header */}
              <div className="flex items-start justify-between">
                <h3 className="text-white font-bold line-clamp-2 flex-1">
                  {contract.title}
                </h3>
                {contract.isHidden && (
                  <LuEyeOff size={16} className="text-red-400 shrink-0 ml-2" />
                )}
                {contract.isFlagged && !contract.isHidden && (
                  <LuFlag size={16} className="text-orange-400 shrink-0 ml-2" />
                )}
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm line-clamp-2">
                {contract.description || "No description"}
              </p>

              {/* Client Info */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {contract.clientId?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">
                    {contract.clientId?.username || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Escrow Amount */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-xs text-gray-500">Escrow Amount</span>
                <span className="text-green-400 font-bold">
                  ${contract.escrowAmount?.toLocaleString() || 0}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <StatusBadge status={contract.status} />
                {contract.isHidden && (
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                    HIDDEN
                  </span>
                )}
                {contract.isFlagged && !contract.isHidden && (
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    FLAGGED
                  </span>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={() => setSelectedContract(contract)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm font-medium transition-colors"
              >
                <LuEye size={14} />
                Moderate
              </button>
            </div>
          ))
        )}
      </div>

      {/* Moderation Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {selectedContract.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  Contract ID: {selectedContract._id}
                </p>
              </div>
              {selectedContract.isHidden && (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                  HIDDEN
                </span>
              )}
              {selectedContract.isFlagged && !selectedContract.isHidden && (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  FLAGGED
                </span>
              )}
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase mb-2">
                Description
              </p>
              <p className="text-gray-300">
                {selectedContract.description || "No description"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase mb-2">Client</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {selectedContract.clientId?.username?.[0]?.toUpperCase() ||
                      "?"}
                  </div>
                  <span className="text-white font-medium">
                    {selectedContract.clientId?.username || "Unknown"}
                  </span>
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase mb-2">
                  Escrow Amount
                </p>
                <p className="text-2xl font-bold text-green-400">
                  ${selectedContract.escrowAmount?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <LuTriangleAlert
                  size={20}
                  className="text-orange-400 shrink-0"
                />
                <div>
                  <p className="text-orange-200 text-sm font-medium">
                    Moderation Note
                  </p>
                  <p className="text-orange-300/80 text-xs mt-1">
                    Admin cannot edit contract content. You can only flag
                    suspicious listings or hide spam/fraud.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-700">
              {selectedContract.isHidden || selectedContract.isFlagged ? (
                <button
                  onClick={() =>
                    handleModerateContract(selectedContract._id, "restore")
                  }
                  disabled={moderating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  <LuCircleCheck size={18} />
                  {moderating ? "Restoring..." : "Restore Listing"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleModerateContract(selectedContract._id, "flag")
                    }
                    disabled={moderating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    <LuFlag size={18} />
                    {moderating ? "Flagging..." : "Flag as Suspicious"}
                  </button>
                  <button
                    onClick={() =>
                      handleModerateContract(selectedContract._id, "hide")
                    }
                    disabled={moderating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    <LuEyeOff size={18} />
                    {moderating ? "Hiding..." : "Hide Listing"}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setSelectedContract(null)}
              disabled={moderating}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
