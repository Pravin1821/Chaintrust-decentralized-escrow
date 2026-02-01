import { useEffect, useState } from "react";
import Loader from "../../components/Loader.jsx";
import { freelancerService } from "../../services/api.js";

function formatINR(n) {
  const v = Number(n) || 0;
  return `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(v)} INR`;
}

export default function Earnings() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await freelancerService.myContracts();
        const list = Array.isArray(data) ? data : data?.contracts || [];
        setItems(list);
      } catch (e) {
        setError("Failed to load earnings");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Loading earnings..." />;

  const paid = (items || []).filter((c) => c.status === "Paid");
  const pending = (items || []).filter((c) =>
    ["Approved", "Submitted"].includes(c.status),
  );
  const totalFiat = paid
    .filter((c) => c.paymentType !== "ETH")
    .reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const totalEth = paid
    .filter((c) => c.paymentType === "ETH")
    .reduce((s, c) => s + (Number(c.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-yellow-600/20 text-yellow-200 border border-yellow-600/30 text-sm">
          ⚠️ {error}
        </div>
      )}
      <h1 className="text-2xl font-bold">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          title="Total Earnings (Fiat)"
          value={formatINR(totalFiat)}
          icon="💰"
        />
        <Card
          title="Total Earnings (ETH)"
          value={`${totalEth.toFixed(4)} ETH`}
          icon="⛓️"
        />
        <Card title="Withdrawn (UI)" value={formatINR(0)} icon="🏦" />
        <Card title="Pending" value={`${pending.length} contracts`} icon="⌛" />
      </div>

      <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Earnings Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="py-2 pr-4">Contract</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id || c.id} className="border-t border-gray-800/50">
                  <td className="py-2 pr-4 text-gray-200">{c.title}</td>
                  <td className="py-2 pr-4 text-gray-300">
                    {c.paymentType === "ETH"
                      ? `${Number(c.amount).toFixed(4)} ETH`
                      : formatINR(c.amount)}
                  </td>
                  <td className="py-2 pr-4 text-gray-300">
                    {c.status === "Paid" ? "Paid" : "Pending"}
                  </td>
                  <td className="py-2 pr-4 text-gray-400">
                    {c.paidAt
                      ? new Date(c.paidAt).toLocaleDateString()
                      : c.updatedAt
                        ? new Date(c.updatedAt).toLocaleDateString()
                        : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
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
