import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { freelancerService } from "../../services/api";
import Loader from "../../components/Loader";

export default function Marketplace() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAmount, setFilterAmount] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketplaceContracts();
  }, []);

  const fetchMarketplaceContracts = async () => {
    try {
      setLoading(true);
      const { data } = await freelancerService.getMarketplace();
      setContracts(data);
      setError(null);
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

      // Update the contract in the list to show application success
      setContracts((prev) =>
        prev.map((c) =>
          c._id === contractId
            ? {
                ...c,
                hasApplied: true,
                applicationsCount: c.applicationsCount + 1,
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

  // Filter contracts based on search and amount
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAmount =
      filterAmount === "all" ||
      (filterAmount === "low" && contract.amount < 500) ||
      (filterAmount === "medium" &&
        contract.amount >= 500 &&
        contract.amount < 2000) ||
      (filterAmount === "high" && contract.amount >= 2000);

    return matchesSearch && matchesAmount;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            🛒 Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse and apply to available contracts
          </p>
        </div>
        <button
          onClick={fetchMarketplaceContracts}
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
              placeholder="🔍 Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base"
            />
          </div>

          {/* Amount Filter */}
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
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 sm:p-4">
          <p className="text-red-400 text-sm sm:text-base">⚠️ {error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-lg p-2.5 sm:p-3 border border-cyan-500/30">
          <div className="text-lg sm:text-2xl font-bold text-cyan-400">
            {filteredContracts.length}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-400">Available</div>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-2.5 sm:p-3 border border-green-500/30">
          <div className="text-lg sm:text-2xl font-bold text-green-400">
            $
            {filteredContracts
              .reduce((sum, c) => sum + c.amount, 0)
              .toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-400">
            Total Value
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-2.5 sm:p-3 border border-purple-500/30 col-span-2 sm:col-span-1">
          <div className="text-lg sm:text-2xl font-bold text-purple-400">
            {filteredContracts.filter((c) => c.applicationsCount > 0).length}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-400">
            With Applications
          </div>
        </div>
      </div>

      {/* Contracts Grid */}
      {filteredContracts.length === 0 ? (
        <div className="bg-gray-800/40 rounded-xl p-6 sm:p-12 text-center border border-gray-700/50">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📭</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">
            No contracts found
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            {searchTerm || filterAmount !== "all"
              ? "Try adjusting your filters"
              : "Check back later for new opportunities"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract._id}
              contract={contract}
              onApply={handleApply}
              applying={applying === contract._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContractCard({ contract, onApply, applying }) {
  const [expanded, setExpanded] = useState(false);

  const daysUntilDeadline = Math.ceil(
    (new Date(contract.deadline) - new Date()) / (1000 * 60 * 60 * 24),
  );

  const getUrgencyColor = (days) => {
    if (days <= 3) return "text-red-400";
    if (days <= 7) return "text-yellow-400";
    return "text-green-400";
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
                ${contract.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
          <span>👤</span>
          <span>
            {contract.client?.username || contract.client?.name || "Anonymous"}
          </span>
        </div>

        {/* Description */}
        <p
          className={`text-xs sm:text-sm text-gray-300 ${expanded ? "" : "line-clamp-2"}`}
        >
          {contract.description}
        </p>

        {contract.description.length > 100 && (
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
              {daysUntilDeadline} days left
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

      {/* Card Footer - Apply Button */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        {contract.hasApplied ? (
          <button
            disabled
            className="w-full px-3 sm:px-4 py-2 bg-green-600/20 text-green-400 rounded-lg border border-green-500/30 text-sm sm:text-base cursor-not-allowed"
          >
            ✅ Applied
          </button>
        ) : (
          <button
            onClick={() => onApply(contract._id)}
            disabled={applying}
            className="w-full px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg hover:shadow-cyan-500/50"
          >
            {applying ? "Applying..." : "🚀 Apply Now"}
          </button>
        )}
      </div>
    </div>
  );
}
