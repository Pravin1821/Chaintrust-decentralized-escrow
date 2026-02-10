import { useEffect, useState } from "react";
import axios from "../../api/axios";
import {
  LuFileText,
  LuSearch,
  LuFilter,
  LuClock,
  LuTriangleAlert,
  LuEye,
  LuDollarSign,
  LuUser,
} from "react-icons/lu";
import Loader from "../../components/Loader";
import StatusBadge from "../../components/StatusBadge";

export default function AdminContracts() {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedContract, setSelectedContract] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [contracts, searchTerm, statusFilter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/contracts?admin=true");
      setContracts(response.data);
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterContracts = () => {
    let filtered = contracts;

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.clientId?.username
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          c.freelancerId?.username
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredContracts(filtered);
  };

  const getContractAge = (createdAt) => {
    const days = Math.floor(
      (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24),
    );
    return days;
  };

  const isContractStuck = (contract) => {
    const age = getContractAge(contract.createdAt);
    return contract.status === "Funded" && age > 14; // Stuck if funded for more than 14 days
  };

  const stuckContracts = contracts.filter(isContractStuck);
  const criticalContracts = contracts.filter(
    (c) => c.status === "Disputed" || isContractStuck(c),
  );

  const statuses = [
    "All",
    "Created",
    "Funded",
    "Submitted",
    "Completed",
    "Disputed",
    "Cancelled",
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <LuFileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Contract Monitoring
            </h1>
            <p className="text-gray-400">
              {contracts.length} total contracts, {criticalContracts.length}{" "}
              require attention
            </p>
          </div>
        </div>
      </div>

      {/* Critical Warnings */}
      {stuckContracts.length > 0 && (
        <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-xl border border-orange-500/50 p-4">
          <div className="flex items-center gap-3">
            <LuClock size={20} className="text-orange-400" />
            <p className="text-orange-200">
              <strong>Warning:</strong> {stuckContracts.length}{" "}
              {stuckContracts.length === 1 ? "contract has" : "contracts have"}{" "}
              been funded for more than 14 days without progress.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <LuSearch
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by title, client, or freelancer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <LuFilter
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Statuses" : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Contract
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Freelancer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Escrow
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Age
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No contracts found
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => {
                  const isStuck = isContractStuck(contract);
                  const age = getContractAge(contract.createdAt);

                  return (
                    <tr
                      key={contract._id}
                      className={`hover:bg-gray-800/50 transition-colors ${
                        isStuck ? "bg-orange-900/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isStuck && (
                            <LuTriangleAlert
                              size={16}
                              className="text-orange-400 shrink-0"
                            />
                          )}
                          <div>
                            <p className="text-white font-medium">
                              {contract.title}
                            </p>
                            <p className="text-gray-500 text-xs">
                              ID: {contract._id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {contract.clientId?.username?.[0]?.toUpperCase() ||
                              "?"}
                          </div>
                          <span className="text-gray-300 text-sm">
                            {contract.clientId?.username || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {contract.freelancerId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                              {contract.freelancerId?.username?.[0]?.toUpperCase() ||
                                "?"}
                            </div>
                            <span className="text-gray-300 text-sm">
                              {contract.freelancerId?.username}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={contract.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-400 font-medium">
                          ${contract.escrowAmount?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm ${age > 14 ? "text-orange-400" : "text-gray-400"}`}
                        >
                          {age} {age === 1 ? "day" : "days"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedContract(contract)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm font-medium transition-colors"
                        >
                          <LuEye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 max-w-3xl w-full p-6 space-y-4 my-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {selectedContract.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  Contract ID: {selectedContract._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LuEye size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase mb-2">Status</p>
                <StatusBadge status={selectedContract.status} />
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase mb-2">
                  Escrow Amount
                </p>
                <p className="text-xl font-bold text-green-400">
                  ${selectedContract.escrowAmount?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase mb-2">Client</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {selectedContract.clientId?.username?.[0]?.toUpperCase() ||
                      "?"}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {selectedContract.clientId?.username || "Unknown"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {selectedContract.clientId?.email || ""}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase mb-2">
                  Freelancer
                </p>
                {selectedContract.freelancerId ? (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {selectedContract.freelancerId?.username?.[0]?.toUpperCase() ||
                        "?"}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {selectedContract.freelancerId?.username}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {selectedContract.freelancerId?.email || ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Not assigned</p>
                )}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase mb-2">
                Description
              </p>
              <p className="text-gray-300">
                {selectedContract.description || "No description"}
              </p>
            </div>

            {selectedContract.workSubmitted && (
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase mb-2">
                  Submitted Work
                </p>
                <p className="text-gray-300">
                  {selectedContract.workSubmitted}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Created {new Date(selectedContract.createdAt).toLocaleString()}
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
