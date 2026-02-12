import {
  LuCheck,
  LuClock,
  LuDollarSign,
  LuFileCheck,
  LuUserPlus,
  LuCircle,
} from "react-icons/lu";

export default function ActivityTimeline({ contract }) {
  const getActivitySteps = () => {
    const steps = [];

    // Created
    steps.push({
      status: "completed",
      icon: <LuCheck />,
      title: "Contract Created",
      date: contract.createdAt,
      color: "cyan",
    });

    // Freelancer Assigned/Invited
    if (contract.freelancer) {
      steps.push({
        status: ["Created", "Assigned"].includes(contract.status)
          ? "current"
          : "completed",
        icon: <LuUserPlus />,
        title:
          contract.status === "Assigned"
            ? "Freelancer Invited"
            : "Freelancer Assigned",
        date: contract.updatedAt,
        color: "blue",
      });
    }

    // Funded
    if (
      contract.escrowStatus === "Funded" ||
      ["Funded", "Submitted", "Approved", "Paid"].includes(contract.status)
    ) {
      steps.push({
        status: contract.status === "Funded" ? "current" : "completed",
        icon: <LuDollarSign />,
        title: "Contract Funded",
        date: contract.fundedAt,
        color: "green",
      });
    } else if (contract.status === "Assigned") {
      steps.push({
        status: "pending",
        icon: <LuDollarSign />,
        title: "Awaiting Funding",
        color: "gray",
      });
    }

    // Work Submitted
    if (["Submitted", "Approved", "Paid"].includes(contract.status)) {
      steps.push({
        status: contract.status === "Submitted" ? "current" : "completed",
        icon: <LuFileCheck />,
        title: "Work Submitted",
        date: contract.submittedAt,
        color: "purple",
      });
    } else if (contract.status === "Funded") {
      steps.push({
        status: "pending",
        icon: <LuFileCheck />,
        title: "Awaiting Submission",
        color: "gray",
      });
    }

    // Approved & Paid
    if (["Approved", "Paid"].includes(contract.status)) {
      steps.push({
        status: "completed",
        icon: <LuCheck />,
        title: "Work Approved & Paid",
        date: contract.paidAt || contract.approvedAt,
        color: "emerald",
      });
    } else if (contract.status === "Submitted") {
      steps.push({
        status: "pending",
        icon: <LuClock />,
        title: "Awaiting Approval",
        color: "gray",
      });
    }

    // Disputed
    if (contract.status === "Disputed") {
      steps.push({
        status: "current",
        icon: <LuCircle />,
        title: "Dispute Raised",
        color: "red",
      });
    }

    // Resolved
    if (contract.status === "Resolved") {
      steps.push({
        status: "completed",
        icon: <LuCheck />,
        title: "Dispute Resolved",
        color: "green",
      });
    }

    return steps;
  };

  const steps = getActivitySteps();

  const colorClasses = {
    cyan: "bg-cyan-500 border-cyan-400 text-cyan-400",
    blue: "bg-blue-500 border-blue-400 text-blue-400",
    green: "bg-green-500 border-green-400 text-green-400",
    emerald: "bg-emerald-500 border-emerald-400 text-emerald-400",
    purple: "bg-purple-500 border-purple-400 text-purple-400",
    red: "bg-red-500 border-red-400 text-red-400",
    yellow: "bg-yellow-500 border-yellow-400 text-yellow-400",
    gray: "bg-gray-600 border-gray-500 text-gray-400",
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <LuClock size={20} className="text-cyan-400" />
        Activity Timeline
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-3">
            {/* Icon Column */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  step.status === "completed"
                    ? colorClasses[step.color]
                    : step.status === "current"
                      ? `${colorClasses[step.color]} animate-pulse`
                      : "bg-gray-800 border-gray-700 text-gray-600"
                }`}
              >
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-10 mt-2 ${
                    step.status === "completed" ? "bg-gray-700" : "bg-gray-800"
                  }`}
                />
              )}
            </div>

            {/* Content Column */}
            <div className="flex-1 pb-2">
              <h4
                className={`font-medium ${
                  step.status === "pending"
                    ? "text-gray-500"
                    : step.status === "current"
                      ? "text-white"
                      : "text-gray-300"
                }`}
              >
                {step.title}
              </h4>
              {step.date && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(step.date)}
                </p>
              )}
              {step.status === "pending" && (
                <p className="text-xs text-gray-600 mt-1">Pending</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
