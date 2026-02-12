import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { freelancerService } from "../services/api";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { LuBriefcase, LuMail, LuClock, LuCheckCircle } from "react-icons/lu";

export default function FreelancerDashboard() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data } = await freelancerService.myContracts();
      setContracts(Array.isArray(data) ? data : data?.contracts || []);
    } catch (err) {
      setError("Failed to load contracts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group contracts by status
  const invitations = contracts.filter((c) => c.status === "Assigned");
  const funded = contracts.filter((c) => c.status === "Funded");
  const submitted = contracts.filter((c) => c.status === "Submitted");
  const completed = contracts.filter((c) => c.status === "Paid");

  const stats = [
    {
      label: "New Invitations",
      count: invitations.length,
      color: "cyan",
      icon: <LuMail />,
    },
    {
      label: "Active (Funded)",
      count: funded.length,
      color: "green",
      icon: <LuBriefcase />,
    },
    {
      label: "Under Review",
      count: submitted.length,
      color: "yellow",
      icon: <LuClock />,
    },
    {
      label: "Completed",
      count: completed.length,
      color: "emerald",
      icon: <LuCheck />,
    },
  ];

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-600/20 text-red-200 border border-red-600/30">
          ⚠️ {error}
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Freelancer Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          Welcome back! Here's your activity overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br from-${stat.color}-600/20 to-${stat.color}-800/20 border border-${stat.color}-500/30 rounded-xl p-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-400 mt-1`}>
                  {stat.count}
                </p>
              </div>
              <div className={`text-${stat.color}-400 opacity-50`}>
                {stat.icon && <div className="text-4xl">{stat.icon}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Invitations Section */}
      {invitations.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <LuMail className="text-cyan-400" />
              New Contract Invitations
            </h2>
            <button
              onClick={() => navigate("/freelancer/contracts")}
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {invitations.slice(0, 3).map((contract) => (
              <div
                key={contract._id}
                onClick={() =>
                  navigate(`/freelancer/contracts/${contract._id}`)
                }
                className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-4 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">
                      {contract.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {contract.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        Client:{" "}
                        {contract.client?.username || contract.client?.name}
                      </span>
                      <span>Amount: {contract.amount} ETH</span>
                      <span>
                        Deadline:{" "}
                        {new Date(contract.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={contract.status} />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/freelancer/contracts/${contract._id}`);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Contracts Section */}
      {funded.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <LuBriefcase className="text-green-400" />
              Active Contracts (Ready to Work)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {funded.slice(0, 4).map((contract) => (
              <div
                key={contract._id}
                onClick={() =>
                  navigate(`/freelancer/contracts/${contract._id}`)
                }
                className="bg-gray-800/50 border border-green-500/30 rounded-lg p-4 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <h3 className="text-white font-semibold">{contract.title}</h3>
                <p className="text-gray-400 text-xs mt-1">
                  {contract.amount} ETH • Due:{" "}
                  {new Date(contract.deadline).toLocaleDateString()}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/freelancer/contracts/${contract._id}`);
                  }}
                  className="mt-3 w-full px-3 py-1.5 text-xs rounded-lg bg-green-600 hover:bg-green-500 text-white"
                >
                  Submit Work
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {contracts.length === 0 && (
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-12 text-center">
          <LuBriefcase className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No Contracts Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start by browsing the marketplace for available projects
          </p>
          <button
            onClick={() => navigate("/freelancer/marketplace")}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
          >
            Browse Marketplace
          </button>
        </div>
      )}
    </div>
  );
}
