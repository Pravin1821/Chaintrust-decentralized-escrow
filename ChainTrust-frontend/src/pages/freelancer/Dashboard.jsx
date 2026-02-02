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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {error && (
        <div className="p-2.5 sm:p-3 rounded-lg bg-yellow-600/20 text-yellow-200 border border-yellow-600/30 text-xs sm:text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
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
      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
        <Card
          title="Earnings (ETH)"
          value={`${stats.earningsEth.toFixed(4)} ETH`}
          icon="⛓️"
          color="from-cyan-600 to-teal-600"
        />
      </div>

      <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl backdrop-blur-sm p-2.5 sm:p-3 md:p-4">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold">
            Recent Contracts
          </h2>
          <span className="text-xs text-gray-400">Last 5</span>
        </div>
        <div className="overflow-x-auto -mx-2.5 sm:-mx-3 md:mx-0">
          <div className="inline-block min-w-full align-middle px-2.5 sm:px-3 md:px-0">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-2 px-2 md:px-3">Title</th>
                  <th className="py-2 px-2 md:px-3 hidden sm:table-cell">
                    Client
                  </th>
                  <th className="py-2 px-2 md:px-3">Amount</th>
                  <th className="py-2 px-2 md:px-3 hidden lg:table-cell">
                    Escrow
                  </th>
                  <th className="py-2 px-2 md:px-3">Status</th>
                  <th className="py-2 px-2 md:px-3 hidden md:table-cell">
                    Deadline
                  </th>
                  <th className="py-2 px-2 md:px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((r) => (
                  <tr
                    key={r._id || r.id}
                    className="border-t border-gray-800/50"
                  >
                    <td className="py-2 px-2 md:px-3 text-gray-200 max-w-[120px] md:max-w-none truncate">
                      {r.title}
                    </td>
                    <td className="py-2 px-2 md:px-3 text-gray-300 hidden sm:table-cell">
                      {r.client?.username || r.client?.name || "—"}
                    </td>
                    <td className="py-2 px-2 md:px-3 text-gray-300 whitespace-nowrap">
                      {formatAmount(r.amount, r.paymentType, r.currency)}
                    </td>
                    <td className="py-2 px-2 md:px-3 hidden lg:table-cell">
                      <EscrowBadge status={r.escrowStatus} />
                    </td>
                    <td className="py-2 px-2 md:px-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-2 px-2 md:px-3 text-gray-400 hidden md:table-cell whitespace-nowrap">
                      {r.deadline
                        ? new Date(r.deadline).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="py-2 px-2 md:px-3">
                      <a
                        href={`/freelancer/contracts/${r._id || r.id}`}
                        className="px-2 md:px-3 py-1 md:py-1.5 text-xs rounded-lg bg-gray-700/80 hover:bg-gray-600 whitespace-nowrap inline-block"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon, color }) {
  return (
    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-gray-900/60 border border-gray-800/60">
      <div
        className={`w-full h-0.5 sm:h-1 rounded-full bg-gradient-to-r ${color} mb-2 md:mb-3 opacity-70`}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs text-gray-400 truncate">
            {title}
          </p>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold truncate">
            {value}
          </p>
        </div>
        <span className="text-lg sm:text-xl md:text-2xl flex-shrink-0">
          {icon}
        </span>
      </div>
    </div>
  );
}
