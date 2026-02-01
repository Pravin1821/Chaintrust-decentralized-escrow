import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { clientContractService } from "../../services/api.js";

export default function ContractDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await clientContractService.getContracts();
        const list = Array.isArray(data) ? data : data?.contracts || [];
        const found = list.find((c) => (c._id || c.id) === id);
        if (!found) throw new Error("Not found");
        setItem(found);
      } catch (e) {
        setError("Failed to fetch contract from server");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loader label="Loading contract..." />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-yellow-600/20 text-yellow-200 border border-yellow-600/30 text-sm">
          ⚠️ {error}
        </div>
      )}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <p className="text-sm text-gray-400">{item.description}</p>
        </div>
        <StatusBadge status={item.status} />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <section className="p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
        <h2 className="text-lg font-semibold mb-2">Timeline</h2>
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

      <section className="p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Blockchain (placeholders)
          </h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              Escrow Address:{" "}
              <span className="text-cyan-300">{item.escrowAddress}</span>
            </p>
            <p>
              Tx Hash: <span className="text-cyan-300">{item.txHash}</span>
            </p>
            <p>
              Network: <span className="text-cyan-300">{item.network}</span>
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Submission</h2>
          <p className="text-sm text-gray-300">
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
          <div className="mt-3 flex gap-2">
            {item.status === "Assigned" && item.escrowStatus !== "Funded" && (
              <button className="px-3 py-1.5 text-xs rounded-lg bg-cyan-600/80 hover:bg-cyan-500">
                Fund Escrow
              </button>
            )}
            {item.status === "Submitted" && (
              <button className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600/80 hover:bg-emerald-500">
                Approve
              </button>
            )}
            {item.status === "Submitted" && (
              <button className="px-3 py-1.5 text-xs rounded-lg bg-red-600/80 hover:bg-red-500">
                Reject
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Actions are UI-only for now.
          </p>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, value, icon }) {
  return (
    <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{title}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
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
