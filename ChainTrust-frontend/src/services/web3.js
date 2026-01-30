// UI-only helpers for wallet connection and formatting
import { ethers } from "ethers";

let isConnecting = false;

export async function connectWallet({ silent = false } = {}) {
  const anyWindow = window;
  if (!anyWindow.ethereum) {
    if (!silent) alert("MetaMask not found. Please install it.");
    return null;
  }
  try {
    const provider = new ethers.BrowserProvider(anyWindow.ethereum);

    if (silent) {
      // Non-intrusive: check existing accounts without prompting the user
      const accounts = await anyWindow.ethereum.request({
        method: "eth_accounts",
      });
      if (!accounts || accounts.length === 0) return null;
      const signer = await provider.getSigner();
      const address = accounts[0] || (await signer.getAddress());
      const network = await provider.getNetwork();
      return { provider, signer, address, network };
    }

    if (isConnecting) return null;
    isConnecting = true;
    try {
      await anyWindow.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      return { provider, signer, address, network };
    } finally {
      isConnecting = false;
    }
  } catch (e) {
    if (!silent) alert(e.message || "Wallet connection failed");
    return null;
  }
}

export function shortenAddress(addr) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function getNetworkName(network) {
  if (!network) return "Unknown";
  const name = network?.name || "unknown";
  if (name.toLowerCase().includes("polygon")) return "Polygon";
  if (name.toLowerCase().includes("mainnet")) return "Ethereum";
  return name;
}

export async function getBalance(address) {
  try {
    const anyWindow = window;
    if (!anyWindow.ethereum) return null;
    const provider = new ethers.BrowserProvider(anyWindow.ethereum);
    const bal = await provider.getBalance(address);
    return Number(ethers.formatEther(bal)).toFixed(4);
  } catch {
    return null;
  }
}
