import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import {
  LuLayoutDashboard,
  LuFileText,
  LuTriangleAlert,
  LuUsers,
  LuShoppingCart,
  LuLogOut,
  LuShield,
  LuMenu,
  LuX,
  LuUser,
} from "react-icons/lu";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: LuLayoutDashboard,
    },
    {
      path: "/admin/disputes",
      label: "Disputes",
      icon: LuTriangleAlert,
      badge: "critical",
    },
    {
      path: "/admin/contracts",
      label: "Contracts",
      icon: LuFileText,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: LuUsers,
    },
    {
      path: "/admin/marketplace",
      label: "Marketplace",
      icon: LuShoppingCart,
    },
    {
      path: "/admin/profile",
      label: "Profile",
      icon: LuUser,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Mobile Menu Button (sidebar) */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 text-white shadow-lg"
        aria-label="Toggle admin navigation"
      >
        {isMobileMenuOpen ? <LuX size={22} /> : <LuMenu size={22} />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-screen w-72 bg-gray-900/80 backdrop-blur-2xl border-r border-gray-800 z-40 transform transition-transform duration-300 ${
            isMobileMenuOpen
              ? "translate-x-0 shadow-2xl"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo & Admin Badge */}
            <div className="p-6 border-b border-gray-800/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <LuShield size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    ChainTrust
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-200 border border-red-500/30 mt-1 uppercase">
                    <LuShield size={10} /> Admin
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                      {item.badge === "critical" && (
                        <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                      {isActive && (
                        <span className="ml-auto text-xs text-white/80">•</span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-gray-800/70 space-y-3 bg-gray-900/40">
              <div className="px-4 py-3 rounded-lg bg-gray-800/60 border border-gray-700/60">
                <p className="text-xs text-gray-400">Logged in as</p>
                <p className="text-white font-semibold truncate">
                  {user?.username || user?.email || "Admin"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:text-red-200 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-all duration-200"
              >
                <LuLogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:ml-72">
          <Topbar />
          <main className="p-3 sm:p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
