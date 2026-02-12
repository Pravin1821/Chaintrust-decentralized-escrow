import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import ProfileModal from "../../components/ProfileModal.jsx";
import PaymentModal from "../../components/PaymentModal.jsx";
import EscrowVaultCard from "../../components/EscrowVaultCard.jsx";
import api from "../../api/axios";
import { clientContractService } from "../../services/api.js";

export default function ContractDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showApplications, setShowApplications] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "INR",
    deadline: "",
  });

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
      setEditForm({
        title: found.title || "",
        description: found.description || "",
        amount: found.amount || "",
        currency: found.currency || "INR",
        deadline: found.deadline ? found.deadline.slice(0, 10) : "",
      });
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
    if (actionLoading) return;
    const ok = window.confirm(
      "Fund escrow now? This will lock funds until work is approved.",
    );
    if (!ok) return;
    setShowPayModal(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      setActionLoading(true);
      // Backend expects /contracts/fundContract/:id
      await clientContractService.fundContract(id, {});
      await fetchContract();
      alert("Escrow funded successfully");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fund escrow";
      alert(msg);
    } finally {
      setActionLoading(false);
      setShowPayModal(false);
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

  const handleUpdateContract = async () => {
    const payload = {
      title: editForm.title,
      description: editForm.description,
      amount: Number(editForm.amount) || 0,
      currency: editForm.currency,
      deadline: editForm.deadline,
    };
    try {
      setActionLoading(true);
      await clientContractService.updateContract(id, payload);
      await fetchContract();
      alert("Contract updated");
      setShowEdit(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update contract");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteContract = async () => {
    if (!confirm("Delete this contract? This cannot be undone.")) return;
    try {
      setActionLoading(true);
      await clientContractService.deleteContract(id);
      alert("Contract deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete contract");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader label="Loading contract..." />;

  // State-based action buttons rendering
  const renderActionButtons = () => {
    const status = item.status;
    const escrowStatus = item.escrowStatus;
    const canEdit = ["Created", "Invited", "Assigned"].includes(status);
    const isFunded = escrowStatus === "Funded";
    const canDelete = ["Created", "Invited"].includes(status);

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
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => setShowEdit(true)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDeleteContract}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "🗑️ Delete"}
              </button>
            </div>
          </div>
        );

      case "Assigned":
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
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => setShowEdit(true)}
                disabled={!canEdit}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDeleteContract}
                disabled={!canDelete || actionLoading}
                className="flex-1 px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "🗑️ Delete"}
              </button>
            </div>
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
        return (
          <div className="space-y-2">
            {canEdit && !isFunded && (
              <button
                onClick={() => setShowEdit(true)}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                ✏️ Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDeleteContract}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "🗑️ Delete"}
              </button>
            )}
          </div>
        );
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
          onClick={() =>
            item.freelancer &&
            typeof item.freelancer === "object" &&
            setSelectedProfile(item.freelancer._id || item.freelancer.id)
          }
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

      {/* Escrow Vault */}
      {item.status === "Funded" && (
        <section className="p-3 md:p-4 bg-gray-900/40 border border-gray-800/50 rounded-xl">
          <EscrowVaultCard contract={item} />
        </section>
      )}

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

      {showEdit && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="bg-gray-900/90 border border-gray-800 rounded-xl w-full max-w-lg p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Edit Contract
              </h3>
              <button
                onClick={() => setShowEdit(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <Field
                label="Title"
                value={editForm.title}
                onChange={(v) => setEditForm({ ...editForm, title: v })}
              />
              <Field
                label="Description"
                value={editForm.description}
                onChange={(v) => setEditForm({ ...editForm, description: v })}
                multiline
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Amount"
                  value={editForm.amount}
                  onChange={(v) => setEditForm({ ...editForm, amount: v })}
                />
                <Field
                  label="Currency"
                  value={editForm.currency}
                  onChange={(v) => setEditForm({ ...editForm, currency: v })}
                />
              </div>
              <Field
                label="Deadline"
                type="date"
                value={editForm.deadline}
                onChange={(v) => setEditForm({ ...editForm, deadline: v })}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleUpdateContract}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Editing is only allowed before funding. Deletion is limited to
              Created/Invited contracts.
            </p>
          </div>
        </div>
      )}

      {showPayModal && item && (
        <PaymentModal contract={item} onSuccess={handlePaymentSuccess} />
      )}
    </div>
  );
}

function InfoCard({ title, value, icon, onClick }) {
  const clickable = typeof onClick === "function";
  return (
    <div
      className={`p-3 md:p-4 rounded-xl bg-gray-900/60 border border-gray-800/60 ${clickable ? "cursor-pointer hover:border-cyan-500/50" : ""}`}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="flex items-center justify-between gap-2">
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

function Field({ label, value, onChange, type = "text", multiline }) {
  return (
    <label className="block text-sm text-gray-300 space-y-1">
      <span className="text-xs text-gray-400">{label}</span>
      {multiline ? (
        <textarea
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      ) : (
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
