import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  LuUsers,
  LuFileText,
  LuDollarSign,
  LuTriangleAlert,
  LuTrendingUp,
  LuTrendingDown,
  LuClock,
  LuShield,
} from "react-icons/lu";
import Loader from "../../components/Loader";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalFreelancers: 0,
    activeContracts: 0,
    totalEscrowFunded: 0,
    openDisputes: 0,
    criticalContracts: 0,
    recentActivity: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [usersRes, contractsRes, disputesRes] = await Promise.all([
        axios.get("/users"),
        axios.get("/contracts?admin=true"),
        axios.get("/disputes"),
      ]);

      const users = usersRes.data;
      const contracts = contractsRes.data;
      const disputes = disputesRes.data;

      const normalizeRole = (role) => String(role || "").toLowerCase();
      const formatUserName = (user) =>
        user?.username || user?.name || user?.email || "Unknown";

      const totalClients = users.filter(
        (u) => normalizeRole(u.role) === "client",
      ).length;
      const totalFreelancers = users.filter(
        (u) => normalizeRole(u.role) === "freelancer",
      ).length;
      const activeContracts = contracts.filter((c) =>
        ["Funded", "Submitted", "InProgress"].includes(c.status),
      ).length;
      const totalEscrowFunded = contracts
        .filter((c) => c.status === "Funded" || c.status === "Submitted")
        .reduce((sum, c) => sum + (c.escrowAmount || 0), 0);
      const openDisputes = disputes.filter(
        (d) => d.status === "Disputed",
      ).length;
      const criticalContracts = contracts.filter(
        (c) => c.status === "Disputed" || c.status === "Funded",
      ).length;

      setStats({
        totalUsers: users.length,
        totalClients,
        totalFreelancers,
        activeContracts,
        totalEscrowFunded,
        openDisputes,
        criticalContracts,
        recentActivity: contracts.slice(0, 5).map((c) => ({
          ...c,
          clientDisplay: formatUserName(c.clientId || c.client),
          freelancerDisplay: formatUserName(c.freelancerId || c.freelancer),
        })),
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      subtitle: `${stats.totalClients} Clients, ${stats.totalFreelancers} Freelancers`,
      icon: LuUsers,
      color: "from-blue-500 to-cyan-600",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Active Contracts",
      value: stats.activeContracts,
      subtitle: "Currently in progress",
      icon: LuFileText,
      color: "from-purple-500 to-pink-600",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Escrow Funded",
      value: `$${stats.totalEscrowFunded.toLocaleString()}`,
      subtitle: "Total locked in escrow",
      icon: LuDollarSign,
      color: "from-green-500 to-emerald-600",
      trend: "+18%",
      trendUp: true,
    },
    {
      title: "Open Disputes",
      value: stats.openDisputes,
      subtitle: "Require immediate attention",
      icon: LuTriangleAlert,
      color: "from-red-500 to-orange-600",
      trend: stats.openDisputes > 0 ? "Action needed" : "All clear",
      trendUp: false,
      critical: stats.openDisputes > 0,
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
          <LuShield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Platform overview and critical metrics
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border ${
              metric.critical ? "border-red-500/50" : "border-gray-700/50"
            } p-6 hover:border-purple-500/40 transition-all duration-300 ${
              metric.critical ? "animate-pulse" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}
              >
                <metric.icon size={24} className="text-white" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  metric.trendUp
                    ? "text-green-400"
                    : metric.critical
                      ? "text-red-400"
                      : "text-gray-400"
                }`}
              >
                {metric.trendUp ? (
                  <LuTrendingUp size={14} />
                ) : metric.critical ? (
                  <LuTriangleAlert size={14} />
                ) : (
                  <LuTrendingDown size={14} />
                )}
                {metric.trend}
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium">
                {metric.title}
              </h3>
              <p className="text-3xl font-bold text-white mt-1">
                {metric.value}
              </p>
              <p className="text-gray-500 text-xs mt-1">{metric.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Alerts */}
      {stats.openDisputes > 0 && (
        <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-xl border border-red-500/50 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
              <LuTriangleAlert size={20} className="text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Critical Action Required
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </h3>
              <p className="text-red-200 mt-1">
                {stats.openDisputes}{" "}
                {stats.openDisputes === 1 ? "dispute" : "disputes"} awaiting
                resolution. Navigate to Disputes to review and resolve.
              </p>
              <button
                onClick={() => navigate("/admin/disputes")}
                className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Review Disputes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <LuClock size={20} />
            Recent Contract Activity
          </h2>
          <button
            onClick={() => navigate("/admin/contracts")}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {stats.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            stats.recentActivity.map((contract) => (
              <div
                key={contract._id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{contract.title}</p>
                  <p className="text-gray-400 text-sm">
                    {contract.clientDisplay || "Unknown"} → {""}
                    {contract.freelancerDisplay || "Not assigned"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      contract.status === "Disputed"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : contract.status === "Funded"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {contract.status}
                  </span>
                  <p className="text-gray-500 text-xs mt-1">
                    ${contract.escrowAmount?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
