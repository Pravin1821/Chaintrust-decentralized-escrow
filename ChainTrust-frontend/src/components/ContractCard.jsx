import StatusBadge from "./StatusBadge.jsx";

function formatAmount(amount, paymentType, currency) {
  const amtNum = Number(amount) || 0;
  if (paymentType === "ETH") {
    const eth = amtNum.toFixed(4).replace(/\.0+$/, "");
    return `${eth} ETH`;
  }
  const cur = currency || "INR";
  try {
    // Use Indian locale grouping for INR
    const formatted = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(amtNum);
    return `${formatted} ${cur}`;
  } catch {
    return `${amtNum} ${cur}`;
  }
}

export default function ContractCard({
  item,
  onAssign,
  onFund,
  onApprove,
  onDispute,
  onView,
}) {
  const contract = item || {};
  const amountDisplay = formatAmount(
    contract.amount,
    contract.paymentType,
    contract.currency,
  );

  const hasFundPermission =
    !!onFund &&
    contract.status === "Assigned" &&
    contract.escrowStatus !== "Funded";
  const hasApprovePermission = !!onApprove && contract.status === "Submitted";
  const hasAssignPermission = !!onAssign && contract.status === "Created";

  const nextState = (() => {
    switch (contract.status) {
      case "Created":
        return "Assigned";
      case "Assigned":
        return "Funded";
      case "Funded":
        return "InProgress";
      case "Submitted":
        return "Approved";
      case "Approved":
        return "Paid";
      case "Paid":
        return "Complete";
      case "Disputed":
        return "Resolution";
      default:
        return "—";
    }
  })();

  const freelancer = contract.freelancer;
  const freelancerAssigned = freelancer && typeof freelancer === "object";
  const freelancerName = freelancerAssigned
    ? freelancer.name || freelancer.username || "Unnamed"
    : null;
  const freelancerEmail = freelancerAssigned ? freelancer.email : null;
  const timelineSteps = [
    { label: "Created", active: true },
    {
      label: "Assigned",
      active: [
        "Assigned",
        "Funded",
        "Submitted",
        "Approved",
        "Paid",
        "Disputed",
        "Resolved",
      ].includes(contract.status),
    },
    {
      label: "Funded",
      active: [
        "Funded",
        "Submitted",
        "Approved",
        "Paid",
        "Disputed",
        "Resolved",
      ].includes(contract.status),
    },
    {
      label: "Submitted",
      active: [
        "Submitted",
        "Approved",
        "Paid",
        "Disputed",
        "Resolved",
      ].includes(contract.status),
    },
    {
      label: "Approved",
      active: ["Approved", "Paid", "Disputed", "Resolved"].includes(
        contract.status,
      ),
    },
    { label: "Paid", active: ["Paid"].includes(contract.status) },
    { label: "Disputed", active: contract.status === "Disputed" },
  ];

  return (
    <div
      className={`p-3 md:p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl backdrop-blur-sm ${onView ? "cursor-pointer hover:border-cyan-500/50" : ""}`}
      onClick={() => onView && onView(contract)}
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-white truncate">
            {contract.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {contract.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={contract.status} />
            <span className="text-xs text-gray-400 whitespace-nowrap">
              Amount: {amountDisplay}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              Deadline: {contract.deadline}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              Next: {nextState}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right flex-shrink-0">
          <p className="text-xs text-gray-400">Freelancer</p>
          {freelancerAssigned ? (
            <div>
              <p className="text-sm text-gray-200 truncate max-w-[200px]">
                {freelancerName}
              </p>
              {freelancerEmail && (
                <p className="text-xs text-gray-400 truncate max-w-[200px]">
                  {freelancerEmail}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-200">Not Assigned</p>
          )}
        </div>
      </div>
      <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
        {hasAssignPermission && (
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600/80 hover:bg-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              onAssign(contract);
            }}
          >
            Assign
          </button>
        )}
        {hasFundPermission && (
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-cyan-600/80 hover:bg-cyan-500"
            onClick={(e) => {
              e.stopPropagation();
              onFund(contract);
            }}
          >
            Fund
          </button>
        )}
        {hasApprovePermission && (
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600/80 hover:bg-emerald-500"
            onClick={(e) => {
              e.stopPropagation();
              onApprove(contract);
            }}
          >
            Approve
          </button>
        )}
        {onDispute && (
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-red-600/80 hover:bg-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDispute(contract);
            }}
          >
            Dispute
          </button>
        )}
        {onView && (
          <button
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-700/80 hover:bg-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onView(contract);
            }}
          >
            Status
          </button>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
        {timelineSteps.map((step, idx) => (
          <div key={step.label} className="flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${step.active ? "bg-cyan-400" : "bg-gray-600"}`}
            />
            <span className={step.active ? "text-cyan-200" : "text-gray-500"}>
              {step.label}
            </span>
            {idx < timelineSteps.length - 1 && (
              <span className="mx-1 text-gray-600">·</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
