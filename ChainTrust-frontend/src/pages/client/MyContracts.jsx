import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContractCard from "../../components/ContractCard.jsx";
import Loader from "../../components/Loader.jsx";
import { clientContractService } from "../../services/api.js";

export default function MyContracts() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data } = await clientContractService.getContracts();
      setItems(Array.isArray(data) ? data : data?.contracts || data || []);
      setError(null);
    } catch (e) {
      setError("Failed to fetch contracts from server");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return; // avoid double fetch in React StrictMode
    hasFetchedRef.current = true;
    fetchContracts();
  }, []);

  const onAssign = async (item) => {
    setSelectedContract(item);
  };

  const handleAssignFreelancer = async (freelancerId) => {
    if (!freelancerId || !selectedContract) return;
    try {
      setActionLoading(true);
      await clientContractService.assignFreelancer(
        selectedContract._id || selectedContract.id,
        {
          freelancerId,
          allowWithoutApplication: true,
        },
      );
      alert("✅ Assigned successfully");
      setSelectedContract(null);
      await fetchContracts(); // Refresh
    } catch (e) {
      alert(e.response?.data?.message || "Failed to assign");
    } finally {
      setActionLoading(false);
    }
  };

  const onFund = async (item) => {
    const amount = prompt("Enter amount to fund (number):", item.amount);
    if (!amount) return;
    try {
      setActionLoading(true);
      await clientContractService.fundContract(item._id || item.id, {
        amount: Number(amount),
      });
      alert("✅ Funded successfully");
      await fetchContracts(); // Refresh
    } catch (e) {
      alert(e.response?.data?.message || "Failed to fund");
    } finally {
      setActionLoading(false);
    }
  };

  const onApprove = async (item) => {
    if (!confirm("Approve submitted work?")) return;
    try {
      setActionLoading(true);
      await clientContractService.approveWork(item._id || item.id);
      alert("✅ Approved successfully");
      await fetchContracts(); // Refresh
    } catch (e) {
      alert(e.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const onDispute = async (item) => {
    const reason = prompt("Enter dispute reason:");
    if (!reason) return;
    try {
      setActionLoading(true);
      // Navigate to disputes page to raise
      navigate("/client/disputes");
    } catch (e) {
      alert(e.response?.data?.message || "Failed to raise dispute");
    } finally {
      setActionLoading(false);
    }
  };

  const onView = (item) => {
    const targetId = item._id || item.id;
    if (targetId) navigate(`/client/contracts/${targetId}`);
  };

  if (loading) return <Loader label="Loading contracts..." />;

  return (
    <>
      <div className="space-y-3 md:space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-yellow-600/20 text-yellow-200 border border-yellow-600/30 text-sm">
            ⚠️ {error}
          </div>
        )}
        <h1 className="text-xl md:text-2xl font-bold">My Contracts</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {items.map((item) => (
            <ContractCard
              key={item.id || item._id}
              item={item}
              onAssign={onAssign}
              onFund={onFund}
              onApprove={onApprove}
              onDispute={onDispute}
              onView={onView}
            />
          ))}
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Assign Freelancer</h3>
            <p className="text-sm text-gray-400">
              Contract: {selectedContract.title}
            </p>

            {selectedContract.applications &&
            selectedContract.applications.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase">
                  {selectedContract.applications.length} Applicant(s)
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedContract.applications.map((app, idx) => {
                    const freelancer = app.freelancer;
                    const name =
                      freelancer?.username || freelancer?.name || "Unknown";
                    const email = freelancer?.email || "";
                    const id = freelancer?._id || freelancer?.id;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAssignFreelancer(id)}
                        disabled={actionLoading}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-900/60 border border-gray-700 hover:border-purple-500/50 transition-colors text-left disabled:opacity-50"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                          {name[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {email}
                          </p>
                        </div>
                        <span className="text-purple-400 text-sm">→</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30 text-yellow-200 text-sm">
                ⚠️ No freelancers have applied yet. Share this contract or wait
                for applications.
              </div>
            )}

            <button
              onClick={() => setSelectedContract(null)}
              disabled={actionLoading}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
