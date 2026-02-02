import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import ProfileModal from "../../components/ProfileModal.jsx";
import { clientContractService } from "../../services/api.js";

export default function ContractDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showApplications, setShowApplications] = useState(false);

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const { data } = await clientContractService.getContracts();
      const list = Array.isArray(data) ? data : data?.contracts || [];
      const found = list.find((c) => (c._id || c.id) === id);
      if (!found) throw new Error("Not found");
      setItem(found);
      setError(null);
    } catch (e) {
      setError("Failed to fetch contract from server");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFreelancer = async (freelancerId) => {
    try {
      setActionLoading(true);
      await clientContractService.assignFreelancer(id, { freelancerId });
      await fetchContract();
      alert("Freelancer assigned successfully!");
    } catch (err) {
      console.error("Assign error:", err);
      alert(err.response?.data?.message || "Failed to assign freelancer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFundEscrow = async () => {
    try {
      setActionLoading(true);
      await clientContractService.fundContract(id);
      await fetchContract();
      alert("Escrow funded successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fund escrow");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveWork = async () => {
    try {
      setActionLoading(true);
      await clientContractService.approveWork(id);
      await fetchContract();
      alert("Work approved successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve work");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader label="Loading contract..." />;

  // State-based action buttons rendering
  const renderActionButtons = () => {
    const status = item.status;
    const escrowStatus = item.escrowStatus;

    switch (status) {
      case "Created":
        return (
          <div className="space-y-2">
            <button
              onClick={() => setShowApplications(!showApplications)}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all"
            >
              👥 View Applications ({item.applications?.length || 0})
            </button>
            <p className="text-xs text-gray-400 text-center">
              Review and assign a freelancer from applications
            </p>
          </div>
        );

      case "Assigned":
        if (escrowStatus !== "Funded") {
          return (
            <div className="space-y-2">
              <button
                onClick={handleFundEscrow}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "💰 Fund Escrow"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Fund the contract to allow work to begin
              </p>
            </div>
          );
        }
        return (
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-center">
            <p className="text-blue-400 text-sm">
              ⏳ Escrow funded - Freelancer is working
            </p>
          </div>
        );

      case "Funded":
        return (
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-center">
            <p className="text-blue-400 text-sm">
              💼 Work in progress - Waiting for submission
            </p>
          </div>
        );

      case "Submitted":
        return (
          <div className="space-y-2">
            <button
              onClick={handleApproveWork}
              disabled={actionLoading}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "✅ Approve Work"}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Review and approve the submitted work
            </p>
          </div>
        );

      case "Approved":
      case "Paid":
        return (
          <div className="p-3 bg-green-600/20 border border-green-500/30 rounded-lg text-center">
            <p className="text-green-400 text-sm">
              ✅ Contract completed successfully
            </p>
          </div>
        );

      case "Disputed":
        return (
          <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400 text-sm">⚠️ Under dispute resolution</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-yellow-600/20 text-yellow-200 border border-yellow-600/30 text-sm">
          ⚠️ {error}
        </div>
      )}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold truncate">
            {item.title}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 line-clamp-2">
            {item.description}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <InfoCard
          title="Amount"
          value={formatAmount(item.amount, item.paymentType, item.currency)}
          icon="💰"
        />
        <InfoCard title="Deadline" value={item.deadline} icon="📅" />
        <InfoCard
          title="Freelancer"
          value={getFreelancerDisplay(item.freelancer)}
          icon="👤"
        />
      </section>

      <section className="p-3 md:p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
        <h2 className="text-base md:text-lg font-semibold mb-2">Timeline</h2>
        <div className="flex flex-wrap items-center gap-2">
          {item.timeline?.map((t, idx) => (
            <div key={idx} className="flex items-center">
              <StatusBadge status={t} />
              {idx < item.timeline.length - 1 && (
                <span className="mx-2 text-gray-500">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="p-3 md:p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-2">
            Blockchain (placeholders)
          </h2>
          <div className="space-y-2 text-xs md:text-sm text-gray-300">
            <p className="truncate">
              Escrow Address:{" "}
              <span className="text-cyan-300">{item.escrowAddress}</span>
            </p>
            <p className="truncate">
              Tx Hash: <span className="text-cyan-300">{item.txHash}</span>
            </p>
            <p>
              Network: <span className="text-cyan-300">{item.network}</span>
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-2">
            Submission
          </h2>
          <p className="text-xs md:text-sm text-gray-300 truncate">
            IPFS:{" "}
            <a
              className="text-blue-300 hover:underline"
              href={item.ipfsHash}
              target="_blank"
              rel="noreferrer"
            >
              {item.ipfsHash}
            </a>
          </p>
        </div>
      </section>

      {/* Actions Section */}
      <section className="p-3 md:p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
        <h2 className="text-base md:text-lg font-semibold mb-3">Actions</h2>
        {renderActionButtons()}
      </section>

      {/* Applications Section */}
      {showApplications &&
        item.applications &&
        item.applications.length > 0 && (
          <section className="p-3 md:p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
            <h2 className="text-base md:text-lg font-semibold mb-3">
              Applications ({item.applications.length})
            </h2>
            <div className="space-y-2">
              {item.applications.map((app, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex-1">
                    <button
                      onClick={() =>
                        setSelectedProfile(app.freelancer._id || app.freelancer)
                      }
                      className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                    >
                      {app.freelancer?.username || "Freelancer"}
                    </button>
                    <p className="text-xs text-gray-400">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {item.status === "Created" && (
                    <button
                      onClick={() =>
                        handleAssignFreelancer(
                          app.freelancer._id || app.freelancer,
                        )
                      }
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                      {actionLoading ? "Assigning..." : "✅ Assign"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      {showApplications &&
        (!item.applications || item.applications.length === 0) && (
          <section className="p-3 md:p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-400 text-sm text-center">
              No applications yet. Share this contract with freelancers!
            </p>
          </section>
        )}

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          userId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}

function InfoCard({ title, value, icon }) {
  return (
    <div className="p-3 md:p-4 rounded-xl bg-gray-900/60 border border-gray-800/60">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400">{title}</p>
          <p className="text-base md:text-lg font-semibold truncate">{value}</p>
        </div>
        <span className="text-xl md:text-2xl ml-2 flex-shrink-0">{icon}</span>
      </div>
    </div>
  );
}

function formatAmount(amount, paymentType, currency) {
  const amtNum = Number(amount) || 0;
  if (paymentType === "ETH") {
    const eth = amtNum.toFixed(4).replace(/\.0+$/, "");
    return `${eth} ETH`;
  }
  const cur = currency || "INR";
  try {
    const formatted = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(amtNum);
    return `${formatted} ${cur}`;
  } catch {
    return `${amtNum} ${cur}`;
  }
}

function getFreelancerDisplay(freelancer) {
  if (freelancer && typeof freelancer === "object") {
    const name = freelancer.name || freelancer.username || "Unnamed";
    const email = freelancer.email ? ` (${freelancer.email})` : "";
    return `${name}${email}`;
  }
  return "Not Assigned";
}
