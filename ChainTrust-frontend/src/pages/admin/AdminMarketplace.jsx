import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import {
  LuShoppingCart,
  LuSearch,
  LuFlag,
  LuEyeOff,
  LuCircleCheck,
  LuTriangleAlert,
  LuRefreshCw,
} from "react-icons/lu";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Flagged", value: "flagged" },
  { label: "Hidden", value: "hidden" },
];

export default function AdminMarketplace() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null); // flag | hide | restore
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/contracts?admin=true");
      // Only moderation-eligible listings (created / visible)
      setContracts(res.data || []);
    } catch (e) {
      console.error("Failed to load marketplace listings", e);
      setToast({ type: "error", message: "Failed to load listings" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return (contracts || [])
      .filter((c) => {
        if (statusFilter === "flagged") return c.isFlagged;
        if (statusFilter === "hidden") return c.isHidden;
        if (statusFilter === "active") return !c.isFlagged && !c.isHidden;
        return true;
      })
      .filter((c) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const clientName = c.clientId?.username || c.clientId?.name || "";
        return (
          c.title?.toLowerCase().includes(q) ||
          clientName.toLowerCase().includes(q)
        );
      })
      .filter((c) => {
        const min = budgetMin ? Number(budgetMin) : null;
        const max = budgetMax ? Number(budgetMax) : null;
        const amt = Number(c.escrowAmount || c.amount || 0);
        if (min !== null && amt < min) return false;
        if (max !== null && amt > max) return false;
        return true;
      });
  }, [contracts, statusFilter, search, budgetMin, budgetMax]);

  const stats = useMemo(() => {
    const total = contracts.length;
    const flagged = contracts.filter((c) => c.isFlagged).length;
    const hidden = contracts.filter((c) => c.isHidden).length;
    const active = contracts.filter((c) => !c.isFlagged && !c.isHidden).length;
    return { total, flagged, hidden, active };
  }, [contracts]);

  const resetActionState = () => {
    setAction(null);
    setReason("");
  };

  const openAction = (contract, type) => {
    setSelected(contract);
    setAction(type);
    setReason("");
  };

  const handleModerate = async () => {
    if (!selected || !action) return;
    if (!reason || reason.trim().length < 5) {
      setToast({
        type: "error",
        message: "Please provide a reason (min 5 characters)",
      });
      return;
    }
    try {
      setActionLoading(true);
      await axios.patch(`/contracts/${selected._id}/moderate`, {
        action,
        reason,
      });
      setToast({ type: "success", message: "Action completed" });
      resetActionState();
      setSelected(null);
      await fetchContracts();
    } catch (e) {
      console.error("Moderation failed", e);
      setToast({ type: "error", message: "Moderation failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusPill = (contract) => {
    if (contract.isHidden) {
      return (
        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
          Hidden
        </span>
      );
    }
    if (contract.isFlagged) {
      return (
        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
          Flagged
        </span>
      );
    }
    return (
      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        Active
      </span>
    );
  };

  const loadingSkeletons = Array.from({ length: 6 });

  if (user?.role?.toLowerCase?.() !== "admin") {
    return (
      <div className="flex min-h-screen">
        <main className="flex-1 p-6 text-white">Unauthorized</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen gap-6 p-0">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <LuShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Marketplace Moderation
              </h1>
              <p className="text-sm text-gray-400">
                Real-time listing oversight and control
              </p>
            </div>
          </div>
          <button
            onClick={fetchContracts}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-800/70 border border-gray-700 text-gray-200 hover:bg-gray-700 transition"
          >
            <LuRefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Listings"
            value={stats.total}
            color="from-slate-600 to-slate-800"
          />
          <StatCard
            title="Active Listings"
            value={stats.active}
            color="from-emerald-600 to-green-700"
          />
          <StatCard
            title="Flagged Listings"
            value={stats.flagged}
            color="from-orange-600 to-amber-600"
          />
          <StatCard
            title="Hidden Listings"
            value={stats.hidden}
            color="from-red-600 to-pink-600"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1 relative">
          <LuSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or client"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="md:w-40">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white focus:outline-none focus:border-purple-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 md:w-64">
          <input
            type="number"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            placeholder="Min budget"
            className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <input
            type="number"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            placeholder="Max budget"
            className="w-full px-3 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loadingSkeletons.map((_, idx) => (
            <div
              key={idx}
              className="h-48 rounded-xl bg-gray-800/50 border border-gray-700/60 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-700 bg-gray-900/50 p-10 text-center text-gray-400">
          <LuShoppingCart size={40} className="mb-3 text-gray-600" />
          <p className="text-lg">No listings match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block overflow-x-auto border border-gray-700/60 rounded-xl bg-gray-900/50">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800/70 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Budget</th>
                  <th className="text-left px-4 py-3">Applications</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-200">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-semibold">{c.title}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-xs font-bold flex items-center justify-center">
                        {c.clientId?.username?.[0]?.toUpperCase() || "?"}
                      </span>
                      <span className="truncate">
                        {c.clientId?.username || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-300 font-semibold">
                      ${c.escrowAmount?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3">
                      {c.applicationsCount ?? c.applications?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      {renderStatusPill(c)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        contract={c}
                        onAction={openAction}
                        disabled={actionLoading}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:hidden gap-3">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="rounded-xl border border-gray-700 bg-gray-900/60 p-4 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {c.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {renderStatusPill(c)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-xs font-bold flex items-center justify-center">
                    {c.clientId?.username?.[0]?.toUpperCase() || "?"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">
                      {c.clientId?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${c.escrowAmount?.toLocaleString() || 0} •{" "}
                      {c.applicationsCount ?? c.applications?.length ?? 0}{" "}
                      applications
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <StatusBadge status={c.status} />
                </div>
                <ActionButtons
                  contract={c}
                  onAction={openAction}
                  disabled={actionLoading}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {selected && action && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 w-full max-w-lg rounded-xl border border-gray-700 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-lg bg-red-500/20 flex items-center justify-center text-red-300">
                <LuTriangleAlert size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white">
                  Confirm {action}
                </h3>
                <p className="text-sm text-gray-400">
                  Provide a reason to {action} this listing. This action affects
                  visibility for all users.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-700/60">
              <p className="text-sm text-gray-300 font-semibold">
                {selected.title}
              </p>
              <p className="text-xs text-gray-500">
                Client: {selected.clientId?.username || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                Budget: ${selected.escrowAmount?.toLocaleString() || 0}
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-xs text-gray-400">Reason</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-gray-900/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                placeholder="Explain why you are taking this action"
              />
            </label>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleModerate}
                disabled={actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white bg-red-600 hover:bg-red-500 disabled:opacity-60"
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
              <button
                onClick={() => {
                  resetActionState();
                  setSelected(null);
                }}
                disabled={actionLoading}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg border text-sm ${
              toast.type === "error"
                ? "bg-red-900/70 border-red-500/40 text-red-100"
                : "bg-emerald-900/70 border-emerald-500/40 text-emerald-100"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      className={`rounded-xl border border-gray-700/60 bg-gradient-to-br ${color} p-4 text-white shadow-inner`}
    >
      <p className="text-sm text-gray-200/80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ActionButtons({ contract, onAction, disabled }) {
  const isActive = !contract.isFlagged && !contract.isHidden;
  return (
    <div className="flex flex-wrap gap-2">
      {isActive && (
        <>
          <button
            onClick={() => onAction(contract, "flag")}
            disabled={disabled}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-orange-500/20 text-orange-200 border border-orange-500/30 hover:bg-orange-500/30 disabled:opacity-60"
          >
            Flag
          </button>
          <button
            onClick={() => onAction(contract, "hide")}
            disabled={disabled}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-60"
          >
            Hide
          </button>
        </>
      )}
      {contract.isFlagged && !contract.isHidden && (
        <>
          <button
            onClick={() => onAction(contract, "hide")}
            disabled={disabled}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-60"
          >
            Hide
          </button>
          <button
            onClick={() => onAction(contract, "restore")}
            disabled={disabled}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-60"
          >
            Restore
          </button>
        </>
      )}
      {contract.isHidden && (
        <button
          onClick={() => onAction(contract, "restore")}
          disabled={disabled}
          className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-60"
        >
          Restore
        </button>
      )}
    </div>
  );
}
