import { useEffect, useState } from "react";

export default function PaymentModal({ contract, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
  }, [contract]);

  if (!contract || !show) return null;

  const amountLabel = (() => {
    const amt = Number(contract.amount) || 0;
    const currency = contract.currency || "INR";
    try {
      return `${new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(amt)} ${currency}`;
    } catch {
      return `${amt} ${currency}`;
    }
  })();

  const handlePay = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess?.();
      setShow(false);
    }, 2000);
  };

  const clientName =
    contract.client?.username || contract.client?.name || "Client";
  const freelancerName =
    contract.freelancer?.username || contract.freelancer?.name || "Freelancer";

  const closeModal = () => {
    setShow(false);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-3 py-6"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700 shadow-2xl shadow-cyan-900/40 scale-100 animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex flex-col gap-4">
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-cyan-300/80">
                Contract
              </p>
              <h3 className="text-lg font-semibold text-white leading-snug">
                {contract.title || "Untitled"}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Amount</p>
              <p className="text-xl font-bold text-emerald-300">
                {amountLabel}
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/60">
              <p className="text-xs text-gray-400">Client</p>
              <p className="text-base text-white font-semibold truncate">
                {clientName}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/60">
              <p className="text-xs text-gray-400">Freelancer</p>
              <p className="text-base text-white font-semibold truncate">
                {freelancerName}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-cyan-700/50 bg-cyan-900/10 text-sm text-cyan-100 flex items-start gap-2">
            <span className="mt-0.5 text-cyan-300">🛡️</span>
            <div>
              <p className="font-semibold">
                Razorpay-style checkout (simulated)
              </p>
              <p className="text-cyan-100/80">
                Funds are locked in escrow after payment success.
              </p>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-semibold shadow-lg shadow-cyan-900/40 transition-transform duration-150 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Pay Now</span>
                <span className="text-sm">→</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>
        {`@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }`}
      </style>
    </div>
  );
}
