import React from "react";

export default function EscrowVaultCard({ contract }) {
  if (!contract || contract.status !== "Funded") return null;

  const amount = Number(contract?.escrow?.amount ?? contract.amount ?? 0) || 0;
  const currency = contract?.currency || "INR";
  const transactionId =
    contract?.escrow?.transactionId || contract.txHash || "Pending";
  const fundedAt = contract?.escrow?.fundedAt || contract.fundedAt;

  const amountLabel = (() => {
    try {
      return `${new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(amount)} ${currency}`;
    } catch {
      return `${amount} ${currency}`;
    }
  })();

  const fundedLabel = fundedAt
    ? new Date(fundedAt).toLocaleString()
    : "Not recorded";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-white/5 bg-clip-padding backdrop-blur-md shadow-lg shadow-cyan-900/30">
      <div
        className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10"
        aria-hidden
      />
      <div className="relative p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 text-xs font-semibold">
              <span className="lock-pulse">🔒</span>
              Escrow Secured
            </span>
          </div>
          <p className="text-xs text-gray-300">Funds locked</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/70">
            <p className="text-xs text-gray-400">Amount Locked</p>
            <p className="text-lg font-semibold text-white">{amountLabel}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/70">
            <p className="text-xs text-gray-400">Transaction ID</p>
            <p className="text-sm font-semibold text-cyan-200 truncate">
              {transactionId}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/70 text-sm text-gray-200 flex items-start gap-2">
          <span className="text-cyan-300">🗓️</span>
          <div>
            <p className="font-semibold text-white">Funded on</p>
            <p className="text-gray-300">{fundedLabel}</p>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-cyan-700/40 bg-cyan-900/10 text-sm text-cyan-50 flex items-start gap-2">
          <span className="text-cyan-300">🛡️</span>
          <p className="leading-snug">
            Funds are securely held until work approval.
          </p>
        </div>
      </div>

      <style>
        {`@keyframes lockPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
          .lock-pulse { display: inline-block; animation: lockPulse 1.8s ease-in-out infinite; }`}
      </style>
    </div>
  );
}
