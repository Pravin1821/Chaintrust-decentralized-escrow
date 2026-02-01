import { useEffect, useState } from "react";
import Loader from "../../components/Loader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { clientContractService } from "../../services/api.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await clientContractService.getContracts();
        const list = Array.isArray(data) ? data : data?.contracts || [];
        const total = list.length;
        const funded = list.filter((c) => c.status === "Funded").length;
        const completed = list.filter((c) => c.status === "Paid").length;
        const active = list.filter((c) =>
          ["Assigned", "Funded", "Submitted", "Approved", "Disputed"].includes(
            c.status,
          ),
        ).length;
        const escrowLocked = list
          .filter((c) => c.escrowStatus === "Funded")
          .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
        const recent = list
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map((c) => ({
            id: c._id,
            title: c.title,
            amount: c.amount,
            currency: c.currency || "INR",
            paymentType: c.paymentType,
            status: c.status,
            deadline: c.deadline
              ? new Date(c.deadline).toLocaleDateString()
              : "",
          }));
        setStats({ total, active, funded, completed, escrowLocked, recent });
      } catch (e) {
        setError("Failed to load dashboard from server");
        setStats({
          total: 0,
          active: 0,
          funded: 0,
          completed: 0,
          escrowLocked: 0,
          recent: [],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-yellow-600/20 text-yellow-200 border border-yellow-600/30 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card
          title="Total Contracts"
          value={stats.total}
          icon="📊"
          color="from-cyan-600 to-blue-600"
        />
        <Card
          title="Active"
          value={stats.active}
          icon="⚡"
          color="from-purple-600 to-pink-600"
        />
        <Card
          title="Funded"
          value={stats.funded}
          icon="💰"
          color="from-emerald-600 to-teal-600"
        />
        <Card
          title="Completed"
          value={stats.completed}
          icon="✅"
          color="from-indigo-600 to-blue-600"
        />
        <Card
          title="Escrow Locked"
          value={`${stats.escrowLocked} ETH`}
          icon="🔒"
          color="from-yellow-600 to-orange-600"
        />
      </div>

      <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Contracts</h2>
          <span className="text-xs text-gray-400">Last 3</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((r) => (
                <tr key={r.id} className="border-t border-gray-800/50">
                  <td className="py-2 pr-4 text-gray-200">{r.title}</td>
                  <td className="py-2 pr-4 text-gray-300">
                    {formatAmount(r.amount, r.paymentType, r.currency)}
                  </td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-2 pr-4 text-gray-400">{r.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon, color }) {
  return (
    <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/60">
      <div
        className={`w-full h-1 rounded-full bg-gradient-to-r ${color} mb-3 opacity-70`}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{title}</p>
          <p className="text-xl font-bold">{value}</p>
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
