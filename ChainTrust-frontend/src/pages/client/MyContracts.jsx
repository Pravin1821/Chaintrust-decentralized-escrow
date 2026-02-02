import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContractCard from "../../components/ContractCard.jsx";
import Loader from "../../components/Loader.jsx";
import { clientContractService } from "../../services/api.js";

export default function MyContracts() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await clientContractService.getContracts();
        setItems(Array.isArray(data) ? data : data?.contracts || data || []);
      } catch (e) {
        setError("Failed to fetch contracts from server");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onAssign = async (item) => {
    const freelancerId = prompt("Enter freelancer ID/address to assign:");
    if (!freelancerId) return;
    try {
      await clientContractService.assignFreelancer(item._id || item.id, {
        freelancerId,
      });
      alert("✅ Assigned successfully");
    } catch (e) {
      alert(e.response?.data?.message || "Failed to assign");
    }
  };

  const onFund = async (item) => {
    const amount = prompt("Enter amount to fund (number):", item.amount);
    if (!amount) return;
    try {
      await clientContractService.fundContract(item._id || item.id, {
        amount: Number(amount),
      });
      alert("✅ Funded successfully (UI simulation)");
    } catch (e) {
      alert(e.response?.data?.message || "Failed to fund");
    }
  };

  const onApprove = async (item) => {
    if (!confirm("Approve submitted work?")) return;
    try {
      await clientContractService.approveWork(item._id || item.id);
      alert("✅ Approved successfully");
    } catch (e) {
      alert(e.response?.data?.message || "Failed to approve");
    }
  };

  const onDispute = async (item) => {
    const reason = prompt("Enter dispute reason:");
    if (!reason) return;
    try {
      // Dispute raising is handled on /disputes; navigate to details for now or integrate disputeService.raise
      // await disputeService.raise({ contractID: item._id || item.id, reason });
      alert("⚠️ Dispute raised");
    } catch (e) {
      alert(e.response?.data?.message || "Failed to raise dispute");
    }
  };

  const onView = (item) => {
    const id = item.id || item._id;
    navigate(`/client/contracts/${id}`);
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
  );
}
