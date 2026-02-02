import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  connectWallet,
  shortenAddress,
  getNetworkName,
  getBalance,
} from "../services/web3";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState("Unknown");
  const [balance, setBalance] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Try to read existing connection silently
    (async () => {
      const info = await connectWallet({ silent: true });
      if (info?.address) {
        setAddress(info.address);
        setNetwork(getNetworkName(info.network));
        const bal = await getBalance(info.address);
        setBalance(bal);
      }
    })();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const handleConnect = async () => {
    const info = await connectWallet();
    if (info?.address) {
      setAddress(info.address);
      setNetwork(getNetworkName(info.network));
      const bal = await getBalance(info.address);
      setBalance(bal);
    }
  };

  const initials = (user?.username || user?.email || "U")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-gray-900/50 border-b border-gray-800/50">
      <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1">
          <button
            type="button"
            className="md:hidden flex-shrink-0 px-1.5 py-1 rounded-lg bg-gray-800/60 border border-gray-700/50 text-sm"
            aria-label="Open Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex items-center pr-2 sm:pr-3 mr-1 sm:mr-2 border-r border-gray-800/50 hover:opacity-90 flex-shrink-0"
            aria-label="Go to Profile"
            title="ChainTrust"
          >
            <span className="text-xs sm:text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300 whitespace-nowrap">
              ChainTrust
            </span>
          </button>
          <span className="hidden lg:inline text-sm text-gray-400 flex-shrink-0">
            Network:
          </span>
          <span className="hidden sm:inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap flex-shrink-0">
            {network}
          </span>
          <span className="hidden lg:inline text-sm text-gray-400 flex-shrink-0">
            Wallet:
          </span>
          {address ? (
            <span className="hidden md:inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 whitespace-nowrap flex-shrink-0">
              {shortenAddress(address)}
            </span>
          ) : (
            <button
              onClick={handleConnect}
              className="hidden sm:inline-flex px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white whitespace-nowrap flex-shrink-0"
            >
              Connect
            </button>
          )}
          {balance && (
            <span className="hidden lg:inline-flex px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap flex-shrink-0">
              {balance} ETH
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-800 border border-gray-700/60 flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <button
            onClick={logout}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg bg-red-600/80 hover:bg-red-500 text-white whitespace-nowrap flex-shrink-0"
          >
            Logout
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm">
          <div className="absolute top-16 left-0 right-0 px-4">
            <div className="rounded-xl bg-gray-900 border border-gray-800/60 p-3 shadow-xl">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {user?.role === "client" && (
                  <>
                    <MobileLink
                      to="/client/dashboard"
                      label="Dashboard"
                      onNavigate={() => setMenuOpen(false)}
                    />
                    <MobileLink
                      to="/client/contracts"
                      label="My Contracts"
                      onNavigate={() => setMenuOpen(false)}
                    />
                    <MobileLink
                      to="/client/create"
                      label="Create"
                      onNavigate={() => setMenuOpen(false)}
                    />
                    <MobileLink
                      to="/client/wallet"
                      label="Wallet"
                      onNavigate={() => setMenuOpen(false)}
                    />
                    <MobileLink
                      to="/client/disputes"
                      label="Disputes"
                      onNavigate={() => setMenuOpen(false)}
                    />
                    <MobileLink
                      to="/profile"
                      label="Profile"
                      onNavigate={() => setMenuOpen(false)}
                    />
                  </>
                )}
                {user?.role === "freelancer" && (
                  <>
                    <MobileLink
                      to="/freelancer/dashboard"
                      label="Dashboard"
                      onNavigate={() => setMenuOpen(false)}
                    />
                    <MobileLink
                      to="/freelancer/marketplace"
                      label="Marketplace"
                      onNavigate={() => setMenuOpen(false)}
                    />
                    <MobileLink
                      to="/freelancer/contracts"
                      label="My Contracts"
                      onNavigate={() => setMenuOpen(false)}
                    />
                    <MobileLink
                      to="/freelancer/earnings"
                      label="Earnings"
                      onNavigate={() => setMenuOpen(false)}
                    />
                    <MobileLink
                      to="/freelancer/profile"
                      label="Profile"
                      onNavigate={() => setMenuOpen(false)}
                    />
                  </>
                )}
                {user?.role === "admin" && (
                  <>
                    <MobileLink
                      to="/admin/dashboard"
                      label="Dashboard"
                      onNavigate={() => setMenuOpen(false)}
                    />
                    <MobileLink
                      to="/profile"
                      label="Profile"
                      onNavigate={() => setMenuOpen(false)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileLink({ to, label, onNavigate }) {
  const navigate = useNavigate();
  return (
    <button
      className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:bg-gray-800"
      onClick={() => {
        navigate(to);
        onNavigate?.();
      }}
    >
      {label}
    </button>
  );
}
