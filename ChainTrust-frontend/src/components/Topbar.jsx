import { useEffect, useState } from "react";
import {
  connectWallet,
  shortenAddress,
  getNetworkName,
  getBalance,
} from "../services/web3";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState("Unknown");
  const [balance, setBalance] = useState(null);

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
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">Network:</span>
          <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {network}
          </span>
          <span className="text-sm text-gray-400">Wallet:</span>
          {address ? (
            <span className="px-2 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {shortenAddress(address)}
            </span>
          ) : (
            <button
              onClick={handleConnect}
              className="px-3 py-1.5 text-xs rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              Connect
            </button>
          )}
          {balance && (
            <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {balance} ETH
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700/60 flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs rounded-lg bg-red-600/80 hover:bg-red-500 text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
