import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";
import {
  LuUsers,
  LuSearch,
  LuFilter,
  LuShield,
  LuUserX,
  LuUserCheck,
  LuCalendar,
  LuMail,
  LuActivity,
} from "react-icons/lu";
import Loader from "../../components/Loader";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);

  const normalizeRole = (role) => String(role || "").toLowerCase();
  const displayRole = (role) => {
    const r = normalizeRole(role);
    if (r === "admin") return "Admin";
    if (r === "freelancer") return "Freelancer";
    return "Client";
  };
  const isActiveStatus = (user) => user.isActive !== false;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/users");
      const normalized = response.data.map((u) => ({
        ...u,
        roleNormalized: normalizeRole(u.role),
        displayRole: displayRole(u.role),
      }));
      setUsers(normalized);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    const roleFilterValue = normalizeRole(roleFilter);
    // Role filter
    if (roleFilterValue !== "all") {
      filtered = filtered.filter(
        (u) => normalizeRole(u.role) === roleFilterValue,
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((u) =>
        statusFilter === "active" ? isActiveStatus(u) : !isActiveStatus(u),
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    // Prevent self-suspension
    if (userId === currentUser._id) {
      alert("You cannot change your own account status");
      return;
    }

    try {
      setUpdating(true);
      await axios.patch(`/users/${userId}/status`, {
        isActive: newStatus,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: newStatus } : u)),
      );

      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update user status:", error);
      alert("Failed to update user status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const roles = [
    { label: "All Roles", value: "all" },
    { label: "Admin", value: "admin" },
    { label: "Client", value: "client" },
    { label: "Freelancer", value: "freelancer" },
  ];
  const statuses = [
    { label: "All Statuses", value: "all" },
    { label: "Active", value: "active" },
    { label: "Suspended", value: "suspended" },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <LuUsers size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400">{users.length} total users</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Total Clients</p>
          <p className="text-2xl font-bold text-white mt-1">
            {users.filter((u) => u.roleNormalized === "client").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Total Freelancers</p>
          <p className="text-2xl font-bold text-white mt-1">
            {users.filter((u) => u.roleNormalized === "freelancer").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Suspended Users</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {users.filter((u) => u.isActive === false).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <LuSearch
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <LuFilter
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
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
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${
                            user.roleNormalized === "admin"
                              ? "from-red-500 to-pink-600"
                              : user.roleNormalized === "client"
                                ? "from-blue-500 to-cyan-600"
                                : "from-purple-500 to-pink-600"
                          } rounded-full flex items-center justify-center text-sm font-bold text-white`}
                        >
                          {user.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.username}
                          </p>
                          {user._id === currentUser._id && (
                            <span className="text-purple-400 text-xs">
                              (You)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          user.roleNormalized === "admin"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : user.roleNormalized === "client"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        <LuShield size={12} className="mr-1" />
                        {user.displayRole}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive === false
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-green-500/20 text-green-300 border border-green-500/30"
                        }`}
                      >
                        {user.isActive === false ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        disabled={user._id === currentUser._id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LuActivity size={14} />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${
                  selectedUser.role === "Admin"
                    ? "from-red-500 to-pink-600"
                    : selectedUser.role === "Client"
                      ? "from-blue-500 to-cyan-600"
                      : "from-purple-500 to-pink-600"
                } rounded-full flex items-center justify-center text-lg font-bold text-white`}
              >
                {selectedUser.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedUser.username}
                </h3>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Role</p>
                <p className="text-white font-medium">{selectedUser.role}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                <p
                  className={`font-medium ${
                    selectedUser.isActive === false
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {selectedUser.isActive === false ? "Suspended" : "Active"}
                </p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase mb-1">
                Member Since
              </p>
              <p className="text-white">
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-700 space-y-3">
              {selectedUser.isActive === false ? (
                <button
                  onClick={() => handleUpdateUserStatus(selectedUser._id, true)}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  <LuUserCheck size={18} />
                  {updating ? "Reactivating..." : "Reactivate User"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleUpdateUserStatus(selectedUser._id, false)
                  }
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  <LuUserX size={18} />
                  {updating ? "Suspending..." : "Suspend User"}
                </button>
              )}

              <button
                onClick={() => setSelectedUser(null)}
                disabled={updating}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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
