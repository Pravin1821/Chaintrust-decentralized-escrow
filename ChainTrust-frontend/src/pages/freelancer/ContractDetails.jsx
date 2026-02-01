import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import EscrowBadge from "../../components/EscrowBadge.jsx";
import { freelancerService } from "../../services/api.js";

function formatAmount(amount, paymentType, currency) {
  const n = Number(amount) || 0;
  if (paymentType === "ETH") return `${n.toFixed(4).replace(/\.0+$/, "")} ETH`;
  const cur = currency || "INR";
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(n);
  return `${formatted} ${cur}`;
}

export default function ContractDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [hash, setHash] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Backend has /freelancer/contract/:id, but if unavailable, load list and find
        let found = null;
        try {
          const { data } = await freelancerService.myContracts();
          const list = Array.isArray(data) ? data : data?.contracts || [];
          found = list.find((c) => (c._id || c.id) === id);
        } catch {}
        if (!found) throw new Error("Not found");
        setItem(found);
      } catch (e) {
        setError("Failed to fetch contract");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const canSubmit = item && item.status === "Funded";
  const submitted = item && !!item.ipfsHash;

  const submitWork = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!hash) {
      setMessage("Please provide IPFS hash or file URL");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await freelancerService.submitWork(item._id || item.id, {
        contractId: item._id || item.id,
        ipfsHash: hash,
        notes,
      });
      setMessage("✅ Submitted");
    } catch (e) {
      setMessage(e?.response?.data?.message || "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

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
          title="Client"
          value={`${item.client?.username || item.client?.name || "—"}${item.client?.email ? ` (${item.client.email})` : ""}`}
          icon="👤"
        />
      </section>

      <section className="p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Escrow</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              Funded: <EscrowBadge status={item.escrowStatus} />
            </p>
            <p>
              Amount:{" "}
              {formatAmount(item.amount, item.paymentType, item.currency)}
            </p>
            <p>
              Network: <span className="text-cyan-300">Placeholder</span>
            </p>
            <p>
              Tx Hash: <span className="text-cyan-300">Placeholder</span>
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Submission</h2>
          {!submitted ? (
            <form onSubmit={submitWork} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Submission Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm focus:border-cyan-400 outline-none"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  IPFS Hash / File URL
                </label>
                <input
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm focus:border-cyan-400 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={!canSubmit || saving}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit Work"}
                </button>
              </div>
              {!canSubmit && (
                <p className="text-xs text-gray-400">
                  Submission allowed only when escrow is funded.
                </p>
              )}
            </form>
          ) : (
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                IPFS: <span className="text-cyan-300">{item.ipfsHash}</span>
              </p>
              <p>
                Submitted:{" "}
                {item.submittedAt
                  ? new Date(item.submittedAt).toLocaleString()
                  : "—"}
              </p>
              <StatusBadge status={item.status} />
            </div>
          )}
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
