import { useEffect, useState } from "react";
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

export default function FreelancerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await freelancerService.myContracts();
        const list = Array.isArray(data) ? data : data?.contracts || [];
        const totalAssigned = list.filter(
          (c) => c.status === "Assigned",
        ).length;
        const active = list.filter((c) =>
          ["Assigned", "Funded", "Submitted", "Approved", "Disputed"].includes(
            c.status,
          ),
        ).length;
        const submitted = list.filter((c) => c.status === "Submitted").length;
        const completed = list.filter((c) => c.status === "Paid").length;
        const earningsFiat = list
          .filter((c) => c.status === "Paid" && c.paymentType !== "ETH")
          .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
        const earningsEth = list
          .filter((c) => c.status === "Paid" && c.paymentType === "ETH")
          .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
        const recent = list
          .slice()
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt),
          )
          .slice(0, 5);
        setStats({
          totalAssigned,
          active,
          submitted,
          completed,
          earningsFiat,
          earningsEth,
          recent,
        });
      } catch (e) {
        setError("Failed to load freelancer dashboard");
        setStats({
          totalAssigned: 0,
          active: 0,
          submitted: 0,
          completed: 0,
          earningsFiat: 0,
          earningsEth: 0,
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
          title="Assigned"
          value={stats.totalAssigned}
          icon="📌"
          color="from-cyan-600 to-blue-600"
        />
        <Card
          title="Active"
          value={stats.active}
          icon="⚡"
          color="from-purple-600 to-pink-600"
        />
        <Card
          title="Submitted"
          value={stats.submitted}
          icon="📝"
          color="from-amber-600 to-orange-600"
        />
        <Card
          title="Completed"
          value={stats.completed}
          icon="✅"
          color="from-emerald-600 to-teal-600"
        />
        <Card
          title="Earnings (Fiat)"
          value={`${new Intl.NumberFormat("en-IN").format(stats.earningsFiat)} INR`}
          icon="💰"
          color="from-indigo-600 to-blue-600"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          title="Earnings (ETH)"
          value={`${stats.earningsEth.toFixed(4)} ETH`}
          icon="⛓️"
          color="from-cyan-600 to-teal-600"
        />
      </div>

      <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Contracts</h2>
          <span className="text-xs text-gray-400">Last 5</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Escrow</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Deadline</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((r) => (
                <tr key={r._id || r.id} className="border-t border-gray-800/50">
                  <td className="py-2 pr-4 text-gray-200">{r.title}</td>
                  <td className="py-2 pr-4 text-gray-300">
                    {r.client?.username || r.client?.name || "—"}
                  </td>
                  <td className="py-2 pr-4 text-gray-300">
                    {formatAmount(r.amount, r.paymentType, r.currency)}
                  </td>
                  <td className="py-2 pr-4">
                    <EscrowBadge status={r.escrowStatus} />
                  </td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-2 pr-4 text-gray-400">
                    {r.deadline
                      ? new Date(r.deadline).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="py-2 pr-4">
                    <a
                      href={`/freelancer/contracts/${r._id || r.id}`}
                      className="px-3 py-1.5 text-xs rounded-lg bg-gray-700/80 hover:bg-gray-600"
                    >
                      View Contract
                    </a>
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
