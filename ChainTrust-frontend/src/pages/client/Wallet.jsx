import { useEffect, useState } from "react";
import {
  connectWallet,
  shortenAddress,
  getNetworkName,
  getBalance,
} from "../../services/web3.js";

export default function Wallet() {
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState("Unknown");
  const [balance, setBalance] = useState(null);

  useEffect(() => {
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Wallet & Escrow</h1>
        <p className="text-sm text-gray-400">
          Connect MetaMask and view balances. UI-only.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Network" value={network} icon="🌐" />
        <Card
          title="Address"
          value={address ? shortenAddress(address) : "Not connected"}
          icon="👛"
        />
        <Card
          title="Balance"
          value={balance ? `${balance} ETH` : "—"}
          icon="💰"
        />
      </section>

      <div className="p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Escrow Summary</h2>
          <p className="text-sm text-gray-400">
            Locked: 42.5 ETH • Pending actions: 2
          </p>
        </div>
        <button
          onClick={handleConnect}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500"
        >
          {address ? "Reconnect" : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{title}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
