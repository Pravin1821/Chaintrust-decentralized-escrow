import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `flex items-center space-x-2 px-4 py-2 rounded-lg mb-1 transition-colors ${
    isActive
      ? "bg-cyan-500/20 text-cyan-300"
      : "text-gray-300 hover:text-cyan-200 hover:bg-gray-800/60"
  }`;

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={() => navigate("/client/profile")}
        className="w-full text-left px-4 py-3 mb-3 bg-gray-800/60 rounded-xl border border-gray-700/50 hover:border-cyan-500/40 hover:bg-gray-800/80 transition-colors"
        aria-label="Go to Profile"
      >
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300">
          ChainTrust
        </h1>
        <p className="text-xs text-gray-400">Decentralized Escrow</p>
      </button>

      <nav>
        <NavLink to="/client/dashboard" className={linkClass}>
          <span>📊</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/client/contracts" className={linkClass}>
          <span>📄</span>
          <span>My Contracts</span>
        </NavLink>
        <NavLink to="/client/create" className={linkClass}>
          <span>🛠️</span>
          <span>Create Contract</span>
        </NavLink>
        <NavLink to="/client/wallet" className={linkClass}>
          <span>👛</span>
          <span>Wallet & Escrow</span>
        </NavLink>
        <NavLink to="/client/disputes" className={linkClass}>
          <span>⚖️</span>
          <span>Disputes</span>
        </NavLink>
        <NavLink to="/client/profile" className={linkClass}>
          <span>👤</span>
          <span>Profile</span>
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-white transition-colors"
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  );
}
