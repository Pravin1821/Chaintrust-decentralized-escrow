import StatusBadge from "./StatusBadge.jsx";

export default function ContractCard({
  item,
  onAssign,
  onFund,
  onApprove,
  onDispute,
  onView,
}) {
  const contract = item || {};
  return (
    <div className="p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{contract.title}</h3>
          <p className="text-xs text-gray-400 mt-1">{contract.description}</p>
          <div className="mt-2 flex items-center space-x-2">
            <StatusBadge status={contract.status} />
            <span className="text-xs text-gray-400">
              Amount: {contract.amount} {contract.currency}
            </span>
            <span className="text-xs text-gray-400">
              Deadline: {contract.deadline}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Freelancer</p>
          <p className="text-sm text-gray-200">{contract.freelancer || "—"}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {onAssign && (
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600/80 hover:bg-blue-500"
            onClick={() => onAssign(contract)}
          >
            Assign
          </button>
        )}
        {onFund && (
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-cyan-600/80 hover:bg-cyan-500"
            onClick={() => onFund(contract)}
          >
            Fund
          </button>
        )}
        {onApprove && (
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600/80 hover:bg-emerald-500"
            onClick={() => onApprove(contract)}
          >
            Approve
          </button>
        )}
        {onDispute && (
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-red-600/80 hover:bg-red-500"
            onClick={() => onDispute(contract)}
          >
            Dispute
          </button>
        )}
        {onView && (
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-700/80 hover:bg-gray-600"
            onClick={() => onView(contract)}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
