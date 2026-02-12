import { useEffect, useState } from "react";
import axios from "../../api/axios";
import {
  LuTriangleAlert,
  LuUser,
  LuDollarSign,
  LuCalendar,
  LuFileText,
  LuCheck,
  LuX,
  LuClock,
  LuShield,
} from "react-icons/lu";
import Loader from "../../components/Loader";

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resolutionAction, setResolutionAction] = useState(null);

  const formatUserName = (user) =>
    user?.username || user?.name || user?.email || "Unknown";
  const formatInitial = (user) =>
    (formatUserName(user)?.[0] || "?").toUpperCase();
  const getContract = (dispute) => dispute?.contractId || dispute?.contract;

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/disputes");
      setDisputes(response.data);
    } catch (error) {
      console.error("Failed to fetch disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId, favor) => {
    try {
      setResolving(true);
      await axios.post(`/disputes/${disputeId}/resolve`, {
        resolution: favor,
        resolvedBy: "Admin",
      });

      // Optimistically update UI
      setDisputes((prev) =>
        prev.map((d) =>
          d._id === disputeId
            ? { ...d, status: "Resolved", resolution: favor }
            : d,
        ),
      );

      setShowConfirmModal(false);
      setSelectedDispute(null);

      // Refetch to get latest state
      setTimeout(() => fetchDisputes(), 1000);
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      alert("Failed to resolve dispute. Please try again.");
    } finally {
      setResolving(false);
      setResolutionAction(null);
    }
  };

  const openConfirmModal = (dispute, action) => {
    setSelectedDispute(dispute);
    setResolutionAction(action);
    setShowConfirmModal(true);
  };

  const openDisputesList = disputes.filter((d) => d.status === "Disputed");
  const resolvedDisputes = disputes.filter((d) => d.status === "Resolved");

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
            <LuTriangleAlert size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Dispute Management
            </h1>
            <p className="text-gray-400">
              {openDisputesList.length} open{" "}
              {openDisputesList.length === 1 ? "dispute" : "disputes"}
            </p>
          </div>
        </div>
      </div>

      {/* Critical Alert */}
      {openDisputesList.length > 0 && (
        <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-xl border border-red-500/50 p-4">
          <div className="flex items-center gap-3">
            <LuShield size={20} className="text-red-400" />
            <p className="text-red-200">
              <strong>Critical:</strong> {openDisputesList.length}{" "}
              {openDisputesList.length === 1
                ? "dispute requires"
                : "disputes require"}{" "}
              immediate resolution. Actions are irreversible.
            </p>
          </div>
        </div>
      )}

      {/* Open Disputes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <LuClock size={20} />
          Open Disputes ({openDisputesList.length})
        </h2>

        {openDisputesList.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-12 text-center">
            <LuCheck size={48} className="text-green-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No open disputes. All clear!
            </p>
          </div>
        ) : (
          openDisputesList.map((dispute) => {
            const contract = getContract(dispute);
            const client = contract?.clientId || contract?.client;
            const freelancer = contract?.freelancerId || contract?.freelancer;
            const contractTitle = contract?.title || "Unknown Contract";

            return (
              <div
                key={dispute._id}
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-red-500/50 p-6 space-y-4"
              >
                {/* Dispute Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">
                        {contractTitle}
                      </h3>
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                        DISPUTED
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <LuCalendar size={14} />
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <LuDollarSign size={14} />₹
                        {contract?.escrowAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      Client
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {formatInitial(client)}
                      </div>
                      <span className="text-white font-medium">
                        {formatUserName(client)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      Freelancer
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {formatInitial(freelancer)}
                      </div>
                      <span className="text-white font-medium">
                        {formatUserName(freelancer)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispute Reason */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">
                    Dispute Reason
                  </p>
                  <p className="text-gray-300">
                    {dispute.reason || "No reason provided"}
                  </p>
                </div>

                {/* Contract Details */}
                {contract && (
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      Contract Details
                    </p>
                    <p className="text-gray-300 text-sm">
                      {contract.description || "No description"}
                    </p>
                    {contract.workSubmitted && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">
                          Submitted Work:
                        </p>
                        <p className="text-gray-400 text-sm">
                          {contract.workSubmitted}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Resolution Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => openConfirmModal(dispute, "freelancer")}
                    disabled={resolving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LuCheck size={18} />
                    Resolve in Favor of Freelancer
                  </button>
                  <button
                    onClick={() => openConfirmModal(dispute, "client")}
                    disabled={resolving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LuX size={18} />
                    Resolve in Favor of Client
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolved Disputes */}
      {resolvedDisputes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LuFileText size={20} />
            Recently Resolved ({resolvedDisputes.length})
          </h2>
          <div className="space-y-3">
            {resolvedDisputes.slice(0, 5).map((dispute) => (
              <div
                key={dispute._id}
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {getContract(dispute)?.title || "Unknown Contract"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Resolved in favor of{" "}
                    <span className="text-purple-400 font-medium capitalize">
                      {dispute.resolution}
                    </span>
                  </p>
                </div>
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                  RESOLVED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedDispute && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <LuTriangleAlert size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Confirm Resolution
                </h3>
                <p className="text-gray-400 text-sm">
                  This action is irreversible
                </p>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-200 text-sm">
                You are about to resolve the dispute in favor of the{" "}
                <strong className="capitalize">{resolutionAction}</strong>. The
                escrow funds ($
                {selectedDispute.contractId?.escrowAmount?.toLocaleString() ||
                  0}
                ) will be{" "}
                {resolutionAction === "freelancer" ? "released" : "refunded"}.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setResolutionAction(null);
                }}
                disabled={resolving}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleResolveDispute(selectedDispute._id, resolutionAction)
                }
                disabled={resolving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {resolving ? "Resolving..." : "Confirm Resolution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
