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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {error && (
        <div className="p-2.5 sm:p-3 rounded-lg bg-yellow-600/20 text-yellow-200 border border-yellow-600/30 text-xs sm:text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
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

      <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl backdrop-blur-sm p-2.5 sm:p-3 md:p-4">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold">
            Recent Contracts
          </h2>
          <span className="text-xs text-gray-400">Last 3</span>
        </div>
        <div className="overflow-x-auto -mx-2.5 sm:-mx-3 md:mx-0">
          <div className="inline-block min-w-full align-middle px-2.5 sm:px-3 md:px-0">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-2 px-2 md:px-3">Title</th>
                  <th className="py-2 px-2 md:px-3">Amount</th>
                  <th className="py-2 px-2 md:px-3">Status</th>
                  <th className="py-2 px-2 md:px-3 hidden sm:table-cell">
                    Deadline
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((r) => (
                  <tr key={r.id} className="border-t border-gray-800/50">
                    <td className="py-2 px-2 md:px-3 text-gray-200 max-w-[120px] md:max-w-none truncate">
                      {r.title}
                    </td>
                    <td className="py-2 px-2 md:px-3 text-gray-300 whitespace-nowrap">
                      {formatAmount(r.amount, r.paymentType, r.currency)}
                    </td>
                    <td className="py-2 px-2 md:px-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-2 px-2 md:px-3 text-gray-400 hidden sm:table-cell whitespace-nowrap">
                      {r.deadline}
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
