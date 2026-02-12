import { useEffect, useState } from "react";
import Loader from "../../components/Loader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import EscrowBadge from "../../components/EscrowBadge.jsx";
import ActivityTimeline from "../../components/ActivityTimeline.jsx";
import { freelancerService } from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import { LuEye } from "react-icons/lu";

function formatAmount(amount, paymentType, currency) {
  const n = Number(amount) || 0;
  if (paymentType === "ETH") return `${n.toFixed(4).replace(/\.0+$/, "")} ETH`;
  const cur = currency || "INR";
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(n);
  return `${formatted} ${cur}`;
}

export default function MyContracts() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewActivityContract, setViewActivityContract] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await freelancerService.myContracts();
        setItems(Array.isArray(data) ? data : data?.contracts || []);
      } catch (e) {
        setError("Failed to fetch freelancer contracts");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canSubmit = (c) => c.status === "Funded";
  const canResubmit = (c) => c.status === "Rejected";
  const canViewSubmission = (c) =>
    ["Submitted", "Approved", "Paid", "Disputed", "Resolved"].includes(
      c.status,
    );

  const onSubmitWork = (c) => {
    navigate(`/freelancer/contracts/${c._id || c.id}`);
  };

  if (loading) return <Loader label="Loading contracts..." />;

  return (
    <div className="space-y-3 md:space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-yellow-600/20 text-yellow-200 border border-yellow-600/30 text-sm">
          ⚠️ {error}
        </div>
      )}
      <h1 className="text-xl md:text-2xl font-bold">My Contracts</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {items.map((c) => (
          <div
            key={c._id || c.id}
            className="p-3 sm:p-4 bg-gray-900 sm:bg-gray-900/60 border border-gray-800/60 rounded-xl sm:backdrop-blur-sm"
          >
            <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                  {c.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-1 truncate">
                  Client: {c.client?.username || c.client?.name || "—"}
                  {c.client?.email ? ` (${c.client.email})` : ""}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={c.status} />
                  <EscrowBadge status={c.escrowStatus} />
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-300 sm:text-right">
                <p className="truncate">
                  Amount: {formatAmount(c.amount, c.paymentType, c.currency)}
                </p>
                <p className="text-gray-400 truncate">
                  Deadline:{" "}
                  {c.deadline ? new Date(c.deadline).toLocaleDateString() : ""}
                </p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
              <button
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg bg-gray-700/80 hover:bg-gray-600 flex items-center justify-center gap-2"
                onClick={() => setViewActivityContract(c)}
              >
                <LuEye size={14} />
                View Activity
              </button>
              {canSubmit(c) && (
                <button
                  className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg bg-emerald-600/80 hover:bg-emerald-500"
                  onClick={() => onSubmitWork(c)}
                >
                  Submit Work
                </button>
              )}
              {canResubmit(c) && (
                <button
                  className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg bg-amber-600/80 hover:bg-amber-500"
                  onClick={() => onSubmitWork(c)}
                >
                  Resubmit Work
                </button>
              )}
              {canViewSubmission(c) && (
                <button
                  className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg bg-cyan-600/80 hover:bg-cyan-500"
                  onClick={() => onSubmitWork(c)}
                >
                  View Submission
                </button>
              )}
              {!canSubmit(c) && !canResubmit(c) && !canViewSubmission(c) && (
                <span className="text-center sm:text-left w-full sm:w-auto text-xs text-gray-500">
                  {c.status === "Assigned"
                    ? "Awaiting funding"
                    : "No actions available"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Timeline Modal */}
      {viewActivityContract && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewActivityContract(null)}
        >
          <div
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {viewActivityContract.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Contract Activity & Status
                </p>
              </div>
              <button
                onClick={() => setViewActivityContract(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Amount</p>
                    <p className="text-white font-medium">
                      {formatAmount(
                        viewActivityContract.amount,
                        viewActivityContract.paymentType,
                        viewActivityContract.currency,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Deadline</p>
                    <p className="text-white font-medium">
                      {new Date(
                        viewActivityContract.deadline,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Client</p>
                    <p className="text-white font-medium">
                      {viewActivityContract.client?.username ||
                        viewActivityContract.client?.name ||
                        "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className="text-white font-medium">
                      {viewActivityContract.status}
                    </p>
                  </div>
                </div>
              </div>
              <ActivityTimeline contract={viewActivityContract} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
